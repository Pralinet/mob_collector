import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

import { UserRoomData, UserPickaxeData, UserSpaceData, UserExpData } from "../ts/UserData";
import { calcExp, calcLotPrice } from "../utils";
import { initData, saveData, deleteData } from "../parseData";
import { CashItemListIndex, Crafted, CraftedListIndex, CraftItemListIndex, Merchandise, MerchandiseListIndex, Space, SpaceListIndex, SystemData } from '../ts/SystemData';
import { UserData } from '../ts/UserData';
import { ListIndex, RoomIndex } from '../ts/CommonData';

const {systemData, userData:userData_init} = initData();

export const getGoodsList = () => {
    return systemData.goods;
}
export const getOreList = () => {
    return systemData.ores;
}
export const getCropList = () => {
    return systemData.crops;
}
export const getRoomList = () => {
    return systemData.rooms;
}
export const getMobList = () => {
    return systemData.mobs;
}
export const getItemList = () => {
    return systemData.items;
}
export const getFoodList = () => {
    return systemData.foods;
}
export const getPickaxeList = () => {
    return systemData.pickaxes;
}
export const getEnchants = () => {
    return systemData.enchants;
}

export interface IDataContext {
    userData: UserData;
    Buy: (listIndex:MerchandiseListIndex) => void;
    Sell: (listIndex: CashItemListIndex) => void;
    BuyCropLot: (index: number) => void;
    Craft: (listIndex: CraftedListIndex) => void;
    Buyable: (merchandise: Merchandise) => boolean;
    Buyable_Map: (id_room: number) => boolean;
    Buyable_Enchant: (enchant: keyof SystemData["enchants"], lv:number) => boolean;
    Craftable: (crafted: Crafted) => boolean;

    Mine: () => void;
    upGradePickaxe: (ore_id: string) => void;
    Harvest: (crop_id: number) => void;
    buyAutoHarvest: (crop_id: number) => void;
    enchantPickaxe: (enchant: keyof SystemData["enchants"]) => void;
    BuyMap: (id_room: number) => void;

    resetData: () => void;
    manualSave: () => void;

    chooseGoods: (spaceListIndex:SpaceListIndex, id_goods:number) => void;
    chooseFood: (id_room:number, id_roomFood: number, id_food:number) => void;
    logs: string[];

}

const DataContext = createContext({} as IDataContext);

type MobProbability = {
    spaces:{ //行く可能性あるスペースのインデックスと、そこに来る確率
        room: number; 
        space: number;
        rating: number;
    }[],
    foods: number[]; //部屋ごとにそこの料理に行く可能性のmax
};


export function useDataContext() {
    return useContext(DataContext);
}

export function DataProvider({ children }: any) {

    const [userData, setUserData] = useState(userData_init);
    const [mobProbabilities, setMobProbabilities] = useState<MobProbability[]>(
        systemData.mobs.map(mob => {
            const spaces = []
            const foods = []
            userData.rooms.forEach((room, id_room)=>{
                room.spaces.forEach((space, id_space) => {
                    if(space.goods >= 0){
                        const mobGoodsIndex = mob.goods.findIndex((gz) => gz.id === space.goods);
                        if(mobGoodsIndex >= 0)
                            spaces.push({room:id_room, space:id_space, rating:mob.goods[mobGoodsIndex].rating})
                    }
                })
                //foods
                let foodRate = 0;
                room.foods.forEach((food) => {
                    if(food){
                        const mobFoodIndex = mob.foods.findIndex((mFood) => {return mFood.id === food});
                        if(mobFoodIndex >= 0)foodRate += mob.foods[mobFoodIndex].rating;
                    }
                })
                foods.push(foodRate);
            });
            return {spaces, foods};
        })
    )
    const [logs, setLogs] = useState([] as string[]);
    const [time, setTime] = useState(0);
    const bookId = userData.items.findIndex(item => item.id = "book");

    //最初にやること
    React.useEffect(() => {
        //mobのリストを最初に計算する
        //updatemobProbabilities(-1,-1);

        //1秒ごとに進む時計をセット
        const intervalId = setInterval(() => {
            setTime(time => time + 1);
        }, 1000);
        return () => {
            clearInterval(intervalId)
        };

    }, []);

    //1秒ごとにやること
    React.useEffect(() => {
        onTick(time); 
    }, [time]);
    const onTick = (time: number) => {
        //穀物が育つ
        CropGrows();
        //30秒に一回判定mobが来るか判定
        if(time % 15 === 3){
            MobVisits();
        }
        //60秒に一回セーブ
        if(time % 60 === 59){
            /*const save = {
                ...userData,
                player:{
                    ...userData.player,
                    money: userData.player.money,
                    exp: userData.player.exp,
                    pickaxe: userData.player.pickaxe
                },
            }
            saveData(save);*/
            saveData(userData);
        }
    }
    //データのリセット
    const resetData = () => {
        deleteData();
        const {systemData:_systemData, userData:userData_init} = initData();
        setUserData(userData_init);
        setMobProbabilities(systemData.mobs.map(_ => ({spaces:[], foods:[]}) ))
        setLogs([]);
    }

    const manualSave = () => {
        saveData(userData);
    }

    //ログ
    const addLog = (log: string) => {
        console.log(log)
        setLogs(logs => [...logs, log]);
    }

    const CropGrows = () => {
        setUserData(userData => ({
            ...userData,
            crops: userData.crops.map((crop, i_c) => {
            let autoHarvest = 0;
            const lots = crop.lots.map((age:number, i_l:number) => {
                const newAge = (Math.random() < systemData.crops[i_c].speed) ? age + 1: age;
                if(newAge >= systemData.crops[i_c].max_age){
                    if(i_l < crop.redstone){
                        autoHarvest++;
                        return 0;
                    }
                    return systemData.crops[i_c].max_age;
                }else return newAge;
            });
            if(autoHarvest) console.log(autoHarvest)
            return {...crop, lots: lots, stock:(crop.stock+ autoHarvest)}
        })
    }));
    }

    const MobVisits = () => {
        const MAXStamina = 10;
        const MAXHunger = 3;

        let presents: CraftItemListIndex[] = []
        let exp = 0;
        let logs = []
        const newMobs = [...userData.mobs]
        const newFoods = [...userData.foods]

        console.log( mobProbabilities)
        //visitingじゃないmobが行く場所をmobごとに決め、場所ごとに集計
        const newVisitingList = systemData.rooms.map(room => room.spaces.map(space => []))
        mobProbabilities.forEach((goals, i_m) => {
            if(!newMobs[i_m].visiting){
                //空腹度で分岐
                if(newMobs[i_m].hunger < MAXHunger){
                    //空腹度が回復してなければ回復さす
                    newMobs[i_m].hunger += 0.1;
                } else if(goals.spaces.length){
                    //十分空腹になっている、かつ行きたい所がある
                    //行くか行かないかを決める
                    const goalOddsSum = 
                        goals.spaces.reduce((prev, cur) => prev + cur.rating, 0) + 
                        goals.foods.reduce((prev, cur) => prev + cur, 0);
                    //行く場合
                    if(goalOddsSum > Math.random()){
                        //mineと同じ決め方でレートを産出(各スペースの確率には各部屋の料理の確率を加算)
                        const goalOddsList = goals.spaces.reduce((prev, cur) => {
                            //スペースが埋まっていなければ
                            const rating = (userData.rooms[cur.room].spaces[cur.space].mob >= 0)? 0
                                : cur.rating + goals.foods[cur.room];
                            return [...prev, prev[prev.length-1] + rating]
                        }, [0])
                        //どこへ行くか乱数で決める
                        const r = Math.random();
                        const i_g = goalOddsList.findIndex( (odds: number) => r <= odds ) - 1;
                        //mobが行くと決めた場所に格納
                        if(i_g >= 0) newVisitingList[goals.spaces[i_g].room][goals.spaces[i_g].space].push(i_m);
                    }
                }
            }
        })
        

        const foodUpdateFlags = userData.rooms.map((room) => false)
        const newRooms = userData.rooms.map((room,i_r) => {
            if(!room.unlocked) return room;

            const newRoomFoods = [...room.foods]
            const newSpaces = room.spaces.map((space:UserSpaceData, i_s:number) => {
                if(space.mob >= 0){
                    //console.log(newMobs[space.mob])
                    //既にいる場合
                    //スタミナを消費
                    newMobs[space.mob].stamina -= 1;
                    //経験値をくれる
                    exp += 0.1; //ここはあとでjsonに基づいて
                    //exp += systemData.mobs[space.mob].exp;
                    //満足度を加算
                    const i_g = systemData.mobs[space.mob].goods.findIndex(gd => gd.id === space.goods);
                    newMobs[space.mob].satisfaction += systemData.mobs[space.mob].goods[i_g].rating;

                    //スタミナなくなったら
                    if(newMobs[space.mob].stamina < 0){
                        //料理を食べるかどうか決める
                        let canEat = -1;
                        //空腹度が0より大きく、食べる料理がある
                        if(newMobs[space.mob].hunger > 0 && mobProbabilities[space.mob].foods[i_r] > 0){
                            //料理を食べる場合

                            //何を食べるか決める処理
                            const foodOddsList = systemData.mobs[space.mob].foods.reduce((prev, cur) => {
                                //ちゃんとその料理があれば確率を計算
                                const roomFoodIndex = newRoomFoods.findIndex(food => food>=0 && food === cur.id )
                                const rating = (newRoomFoods[roomFoodIndex]>=0 && newFoods[room.foods[roomFoodIndex]].stock>0)? cur.rating : 0;
                                return [...prev, prev[prev.length-1] + rating]
                            }, [0])
                            const r = Math.random();
                            const i_f = foodOddsList.findIndex( (odds: number) => r <= odds ) - 1;
                            //何を食べるか決める処理ここまで

                            if(i_f >= 0){
                                canEat = i_f;
                            }

                        }
                        if(canEat >= 0){
                            newMobs[space.mob].hunger -= 1;//空腹度をひとつ減らす
                            newMobs[space.mob].stamina = MAXStamina * systemData.mobs[space.mob].foods[canEat].rating;//スタミナ回復
                            //その部屋のその料理を一つ減らす
                            const roomFoodIndex = newRoomFoods.findIndex(food => food>=0 && food === systemData.mobs[space.mob].foods[canEat].id);
                            newFoods[newRoomFoods[roomFoodIndex]].stock -= 1;//※nullを考慮してないけど大丈夫か？？？
                            //もし食べ物なくなってたら、その食べ物をnullにして食べ物更新のフラグをたてる
                            if(newFoods[roomFoodIndex].stock <= 0){
                                newRoomFoods[roomFoodIndex] = -1;
                                foodUpdateFlags[i_r] = true;
                            }
                        }else{
                            //料理を食べない場合、帰る

                            //プレゼントの処理
                            const present = getMobPresent(space.mob);
                            if(present){
                                presents.push(present);
                                logs.push(systemData.mobs[space.mob].name + "に" + systemData[present.list][present.index].name + "をもらいました");
                            }

                            //回復しておく
                            newMobs[space.mob].stamina = MAXStamina;
                            //満足度を0に
                            newMobs[space.mob].satisfaction = 0;
                            //visitingをfalseに
                            newMobs[space.mob].visiting = false;

                            return {...space, mob:-1};
                        }
                    }
                }else if(newVisitingList[i_r][i_s].length) {
                    //ここにmobがいない、かつ候補がいる場合ランダムでひとり選ぶ
                    const r = Math.floor(Math.random() * (newVisitingList[i_r][i_s].length));
                    const visitor = newVisitingList[i_r][i_s][r]
                    //visitingをつける
                    newMobs[visitor].visiting = true;
                    console.log(i_r,i_s,visitor)
                    logs.push(systemData.mobs[visitor].name + "が来ました");
                    return {...space, mob:visitor}           
                }
                return space;
            })
            return {...room, spaces: newSpaces, foods:newRoomFoods}
        })

        //修繕の処理
        //ピッケルのダメージを計算
        const damage = systemData.pickaxes[userData.player.pickaxe.material].durability - userData.player.pickaxe.durability;
        //修復量を計算
        const mending = Math.min(damage, exp) * userData.player.pickaxe.enchant.mending;

        const newUserData = {
            ...userData,
            player:{
                ...userData.player,
                pickaxe:{
                    ...userData.player.pickaxe,
                    durability: userData.player.pickaxe.durability + mending
                },
                exp: getNewExp(userData.player.exp, exp - mending)
            },
            crops:[...userData.crops],
            ores:[...userData.ores],
            items:[...userData.items],
            rooms: newRooms,
            mobs: newMobs,
            foods: newFoods,
        };
        //プレゼントの分、アイテムを増やす
        presents.forEach(listIndex => {
            newUserData[listIndex.list][listIndex.index].stock += 1;
            //もし中身が穀物なら、アンロックする
            if(listIndex.list === "crops" && !userData.crops[listIndex.index].unlocked){
                newUserData.crops[listIndex.index].unlocked = true;
                addLog(systemData.crops[listIndex.index].name + "がアンロックされました");
            }
        })

        logs.forEach(log =>addLog(log));

        setUserData(newUserData);

        //食べ物が変化したかもしれないので更新
        foodUpdateFlags.forEach((flag, i_fl) => {
            if(flag) updateMobProbabilities(i_fl, -1);
        })
    }

    const MobLeave = (leaveIndex: RoomIndex) => {
        const leaveSpace = userData.rooms[leaveIndex.room].spaces[leaveIndex.space]
        //そのスペースにmobがいるなら
        if(leaveSpace.mob >= 0){
            setUserData(userData => {
                const newMobs = [...userData.mobs];
                const newRooms = [...userData.rooms];
                //回復しておく
                newMobs[leaveSpace.mob].stamina = 10; //maxstamina
                //満足度を0に
                newMobs[leaveSpace.mob].satisfaction = 0;
                //visitingをfalseに
                newMobs[leaveSpace.mob].visiting = false;
                //mobを-1に
                /*newRooms[leaveIndex.room]={
                    ...newRooms[leaveIndex.room],
                    spaces: [...newRooms[leaveIndex.room].spaces]
                }*/
                newRooms[leaveIndex.room].spaces[leaveIndex.space] = {...newRooms[leaveIndex.room].spaces[leaveIndex.space], mob:-1}
                return {...userData,
                    mobs: newMobs,
                    newRooms: newRooms
                }
            })
        }
    }

    const getNewExp = (exp: UserExpData, gain: number) => {
        let newExp = exp.exp + gain;
        if(newExp >= exp.nextExp){
            //LevelUP
            return {exp: newExp-exp.nextExp, lv:exp.lv + 1, nextExp:calcExp(exp.lv + 1), }
        } else{
            return {...exp, exp:exp.exp + gain}
        }
    }

    //mobがアイテムをくれる
    const getMobPresent = (mob_id: number) => {
        //mobの満足度がアイテムの閾値を超えているものだけを集める
        const presents = systemData.mobs[mob_id].present.filter(present => present.threshold <= userData.mobs[mob_id].satisfaction)
        if(presents.length){
            //閾値超えてるものの中から、ランダムで選ぶ
            const p = Math.floor(Math.random() * presents.length);
           return presents[p].id;
        }
        return null;
    }

    const Buy = (listIndex:MerchandiseListIndex) => {
        setUserData(userData => {
            //金を引く
            const newUserData = {
                ...userData,
                player: {...userData.player, 
                    money: userData.player.money - (systemData[listIndex.list][listIndex.index].shop?.money?? 0),
                    items:[...userData.items],
                    crops:[...userData.crops],
                    ores:[...userData.ores],
                    //foods:[...userData.foods],
                    goods:[...userData.goods],
                }
            }
            //itemを引く
            systemData[listIndex.list][listIndex.index].shop?.items.forEach(item => {
                newUserData[item.item.list][item.item.index] = {
                    ...newUserData[item.item.list][item.item.index], 
                    stock:newUserData[item.item.list][item.item.index].stock - item.requirement
                }
            });

            //商品を追加
            newUserData[listIndex.list][listIndex.index] = {
                ...newUserData[listIndex.list][listIndex.index],
                stock: newUserData[listIndex.list][listIndex.index].stock +
                systemData[listIndex.list][listIndex.index].shop.number
            }
            return newUserData;
        })
    };

    const BuyCropLot = (index: number) => {
        setUserData(userData => ({
            ...userData,
            player: {...userData.player, 
                money: userData.player.money - calcLotPrice(userData.crops[index].lots.length)
            },
            crops:userData.crops.map((item, i)=> {
                return i === index
                ? {...item, lots: [...item.lots, 0]}
                : item;
            })
        }));
    }

    const Sell = (listIndex:CashItemListIndex) => {
        setUserData( userData => {
            //お金を1増やす
            const newUserData: UserData = {
                ...userData,
                player:{...userData.player, money: userData.player.money + 1},
                crops:[...userData.crops],
                ores:[...userData.ores],
            }
            const requirement = systemData[listIndex.list][listIndex.index].requirement;
            //売った量を減らす
            newUserData[listIndex.list][listIndex.index] = {
                ...newUserData[listIndex.list][listIndex.index], 
                stock:(newUserData[listIndex.list][listIndex.index].stock - requirement)
            };
            return newUserData;
        })
    };

    const Craft = (listIndex:CraftedListIndex) => {
        setUserData(userData => {
            const crafted: Crafted = systemData[listIndex.list][listIndex.index];
            const newUserData = {...userData,
                items:[...userData.items],
                crops:[...userData.crops],
                ores:[...userData.ores],
                foods:[...userData.foods],
                goods:[...userData.goods],
            };
            //結果を増やす
            newUserData[listIndex.list][listIndex.index] = {
                ...newUserData[listIndex.list][listIndex.index], 
                stock:(newUserData[listIndex.list][listIndex.index].stock + crafted.craft?.number)
            }

            //材料を減らす
            crafted.craft?.materials.forEach(mate => {
                //mate.item
                newUserData[mate.item.list][mate.item.index] = {
                    ...newUserData[mate.item.list][mate.item.index],
                    stock: newUserData[mate.item.list][mate.item.index].stock - mate.requirement
                }
            });
            return newUserData;
        });
    }

    const Buyable = (merchandise: Merchandise) => {
        if(merchandise.shop){
            return (userData.player.money >= merchandise.shop.money) &&
            (merchandise.shop.items.every((item) => 
                item.requirement <= userData[item.item.list][item.item.index].stock
            ) )
        }
        return false;
    }

    const Buyable_Map = (id_room: number) => {
        //金があるか
        return (userData.player.money >= systemData.rooms[id_room].unlock.money) &&
        //各アイテムがあるか
        (systemData.rooms[id_room].unlock.items.every((item) => 
            userData.items[item].stock >= 1
        ) )
    }

    const Buyable_Enchant = (enchant: keyof SystemData["enchants"], lv:number) => {
        //金があるか
        return (userData.player.money >= systemData.enchants[enchant].price[lv]) &&
        //本が1個あるか
        userData.items[bookId].stock >= 1 &&
        //経験値があるか
        userData.player.exp.lv >= systemData.enchants[enchant].cost[lv]
    }

    const Craftable = (instance: Crafted) => {
        if(instance.craft){
            return (instance.craft.materials.every((mate) => 
                {
                    //console.log(userData[mate.item.list][mate.item.index], mate.item)
                    return mate.requirement <= userData[mate.item.list][mate.item.index].stock
                }
            ) )
        }
        return false;
    }

    const chooseGoods = (spaceListIndex:SpaceListIndex, id_goods:number) => {
        const mobUpdate = (id_room:number, id_space:number) => {
            //来れるmobをアプデ
            updateMobProbabilities(id_room, id_space);
            //mobがいた場合、帰らせる
            MobLeave({room: id_room, space:id_space});
        }

        const{room:id_room, space:id_space} = spaceListIndex.index
        
        const newrooms = userData.rooms.map((room) => ({
            ...room, spaces:[...room.spaces], merged_spaces:[...room.merged_spaces]
        }))
        //merged_spaceの処理
        if(spaceListIndex.list==="merged_spaces"){
            //そのgoodsがもともとあった場所→mergedとその全てのspaceからgoodsを撤去
            userData.rooms.forEach((room, i_r) => {
                room.merged_spaces.forEach((space, i_s) => {
                    //goodsの実体があり、既に置いてある場所があれば、そこを撤去する
                    if(id_goods >= 0 && space.goods === id_goods){
                        newrooms[i_r].merged_spaces[i_s].goods = -1;
                        systemData.rooms[i_r].merged_spaces[id_space].spaces.forEach(space => {
                            newrooms[i_r].spaces[space].goods = -1;
                            mobUpdate(i_r, space);
                        })
                    }
                })
            })
            //mergedをそのgoodsに変化させる
            newrooms[id_room].merged_spaces[id_space].goods = id_goods;
            //mergedに含まれるspaceを変化させる
            systemData.rooms[id_room].merged_spaces[id_space].spaces.forEach(space => {
                //前のgoodsがmergedに置かれていたのをどかせた場合
                if(newrooms[id_room].spaces[space].goods >= 0){
                    //変化したspaceが含まれるmergedのspaceを撤去　mergedも撤去
                    const oldGoodsMSpace = newrooms[id_room].merged_spaces.findIndex((mSpace) => mSpace.goods===newrooms[id_room].spaces[space].goods);
                    if(oldGoodsMSpace >= 0){
                        systemData.rooms[id_room].merged_spaces[oldGoodsMSpace].spaces.forEach(s => {
                            newrooms[id_room].spaces[s].goods= -1;
                            mobUpdate(id_room, s);
                        });
                    }
                }

                //mergedに含まれるspaceを変化させる
                newrooms[id_room].spaces[space].goods = id_goods;
                mobUpdate(id_room, space);
            })
        }else{
            //そのgoodsがもともとあった場所→goodsを撤去
            userData.rooms.forEach((room, i_r) => {
                room.spaces.forEach((space, i_s) => {
                    //goodsの実体があり、既に置いてある場所があれば、そこを撤去する
                    if(id_goods >= 0 && space.goods === id_goods){
                        newrooms[i_r].spaces[i_s].goods = -1;
                        mobUpdate(i_r, i_s);
                    }
                })
            })

            //前のgoodsがmergedに置かれていたのをどかせた場合
            if(newrooms[id_room].spaces[id_space].goods >= 0){
                //変化したspaceが含まれるmergedのspaceを撤去　mergedも撤去
                const oldGoodsMSpace = newrooms[id_room].merged_spaces.findIndex((mSpace) => mSpace.goods===newrooms[id_room].spaces[id_space].goods);
                if(oldGoodsMSpace >= 0){
                    systemData.rooms[id_room].merged_spaces[oldGoodsMSpace].spaces.forEach(s => {
                        newrooms[id_room].spaces[s].goods= -1;
                        mobUpdate(id_room, s);
                    });
                }
            }
            //spaceをそのgoodsに変化させる
            newrooms[id_room].spaces[id_space].goods = id_goods;
            mobUpdate(id_room, id_space);
        }

        setUserData({...userData, rooms:newrooms})

    }

    const chooseFood = (id_room:number, id_roomFood:number, id_food:number) => {
        const id_food_old = userData.rooms[id_room].foods[id_roomFood];
        const newUserData = {
            ...userData,
            rooms: [...userData.rooms],
            foods: [...userData.foods],
        }
        //食べ物が変わってたら
        if(id_food !== id_food_old){
            newUserData.rooms[id_room].foods[id_roomFood] = id_food;
            setUserData(newUserData)
            //来れるmobをアプデ -1でfood
            updateMobProbabilities(id_room, -1);
        }
    }

    const updateMobProbabilities = (id_room:number, id_space: number) => {
        console.log("updatemobProbabilities")
        //console.log(userData.rooms);
        //space=-1でfoodの更新
        if(id_space === -1){
            setMobProbabilities(mobProbabilities => {
                const newPml = mobProbabilities.map((mobProbability, i_m) => {
                    let foodRate = 0;
                    userData.rooms[id_room].foods.forEach((food) => {
                        if(food >= 0){
                            const mobFoodIndex = systemData.mobs[i_m].foods.findIndex((gz) => gz.id === food);
                            if(mobFoodIndex >= 0)foodRate += systemData.mobs[i_m].foods[mobFoodIndex].rating;
                        }
                    })
                    mobProbability.foods[id_room] = foodRate;
                    return {spaces:mobProbability.spaces, foods:mobProbability.foods}
                })
                return newPml
            });

        }else{
            //それ以外でspaceの更新
            setMobProbabilities(mobProbabilities => {
                const newPml = mobProbabilities.map((mobProbability, i_m) => {
                    const id_goods = userData.rooms[id_room].spaces[id_space].goods;
                    const newSpaces = mobProbability.spaces.filter((space) => (space.room !== id_room || space.space !== id_space));
                    if(id_goods >= 0){
                        const mobGoodsIndex = systemData.mobs[i_m].goods.findIndex(gz => gz.id === id_goods)
                        if(mobGoodsIndex >= 0){//ここあとでGoodsの形式かえる
                            newSpaces.push({room: id_room, space: id_space, rating:systemData.mobs[i_m].goods[mobGoodsIndex].rating})
                        }
                    }
                    return {spaces:newSpaces, foods:mobProbability.foods}
                })
                return newPml
            });
        }
    }


    const oreOddsList = useMemo(() => {
        return systemData.ores.reduce((prev, cur) => {
            const odds = (cur.minable.includes(userData.player.pickaxe.material))? cur.odds: 0;
            return [...prev, prev[prev.length-1] + odds]
        }, [0])
    }, [userData.player.pickaxe.material]);

    const Mine = () => {
        //何を掘りあてるか決める
        const r: Number = Math.random() * oreOddsList[oreOddsList.length -1];
        const i_o = oreOddsList.findIndex( (odds: number) => r <= odds ) - 1;
        //ドロップ数の計算　幸運を含む
        const fortuneRate = systemData.enchants.fortune.effect[userData.player.pickaxe.enchant.fortune]
        const drop = Math.ceil(Math.random() * systemData.ores[i_o].drop * fortuneRate);
        setUserData((userData: UserData) => {
            //ツルハシの耐久削るor新調する　耐久力を含む
            const unbreakingRate = systemData.enchants.unbreaking.effect[userData.player.pickaxe.enchant.unbreaking]
            const consumed = (Math.floor(Math.random() * unbreakingRate) === 0);
            let newPickaxe = userData.player.pickaxe
            if(consumed){
                newPickaxe = userData.player.pickaxe.durability? 
                { ...userData.player.pickaxe, durability:Math.max(userData.player.pickaxe.durability - 1, -1) }:
                {
                    material: 0,
                    durability: systemData.pickaxes[0].durability,
                    time: systemData.pickaxes[0].time,
                    enchant: {
                        unbreaking: 0,
                        efficiency: 0,
                        fortune: 0,
                        mending: 0
                    }
                };
            }

            const newUserData = {
                ...userData,
                player:{...userData.player, pickaxe:newPickaxe},
                ores:[...userData.ores],
            }
            //鉱石のドロップを追加
            newUserData.ores[i_o] = {...newUserData.ores[i_o], stock: (newUserData.ores[i_o].stock + drop)}
            return newUserData;
        })
    }

    const upGradePickaxe = (ore_id: string) => {
        const pickaxe_index = systemData.pickaxes.findIndex((pa) => pa.id === ore_id  );
        const newPickaxe = systemData.pickaxes[pickaxe_index]
        setUserData(userData => ({
            ...userData,
            player :{
                ...userData.player,
                pickaxe:{
                    material: pickaxe_index,
                    durability: newPickaxe.durability,
                    time: newPickaxe.time,
                    enchant: {
                        unbreaking: 0,
                        efficiency: 0,
                        fortune: 0,
                        mending: 0
                    }
                }
            }
        }));
    }

    const enchantPickaxe = (enchant: keyof SystemData["enchants"]) => {
        setUserData(userData => {
            const newUserData = {
                ...userData,
                player :{
                    ...userData.player,
                    pickaxe:{
                        ...userData.player.pickaxe,
                        enchant: {
                            ...userData.player.pickaxe.enchant
                        }
                    }
                }
            };
            //金を減らす
            //本を1個消費
            //LVを消費
            newUserData.player.exp = {
                ...newUserData.player.exp,
                lv: newUserData.player.exp.lv - systemData.enchants[enchant].cost[newUserData.player.pickaxe.enchant[enchant]]
            }
            //エンチャントレベルあげる
            newUserData.player.pickaxe.enchant[enchant] += 1;
            //採掘時間をセット
            newUserData.player.pickaxe.time = systemData.pickaxes[newUserData.player.pickaxe.material].time / (1 + newUserData.player.pickaxe.enchant.efficiency)
            return newUserData;
        });
    }

    const Harvest = (cropIdx:number) => {
        setUserData(userData => {
            const newUserData = {
                ...userData,
                crops: [...userData.crops]
            };
            const lotIdx = userData.crops[cropIdx].lots.findIndex( (age) => age >= systemData.crops[cropIdx].max_age)
            if(lotIdx >= 0){
                newUserData.crops[cropIdx] = {
                    ...newUserData.crops[cropIdx], 
                    lots: newUserData.crops[cropIdx].lots.map((l, i_l) => i_l==lotIdx? 0: l ), 
                    stock: (newUserData.crops[cropIdx].stock+1)
                }
            }
            return newUserData;
        })
    }

    const buyAutoHarvest = (cropIdx:number) => {
        setUserData(userData => ({
            ...userData,
            crops: userData.crops.map((item, i_c) => {
                return (i_c === cropIdx)
                ? { ...item, redstone: item.redstone + 1}
                : item;
            }),
            ores: userData.ores.map((item)=> {
                return item.id === "redstone"
                ? {...item, stock: (item.stock - 1)}
                : item;
            })
        }))
    }

    const BuyMap = (id_room: number) => {
        //金とアイテムを取る
        setUserData(userData => {
            const newUserData = {
                ...userData,
                items: [...userData.items],
                player: {...userData.player},
                rooms: [...userData.rooms]
            };
            //金を取る
            newUserData.player.money -= systemData.rooms[id_room].unlock.money;

            //アイテムを取る
            systemData.rooms[id_room].unlock.items.map((item_id) => {
                newUserData.items[item_id].stock -= 1;
            })

            //部屋をアンロックする
            newUserData.rooms[id_room].unlocked = true;

            return newUserData;
        });
    }
    
    const value = {
        userData,
        Buy,
        BuyCropLot,

        Mine,
        upGradePickaxe,
        Harvest,
        buyAutoHarvest,
        enchantPickaxe,
        BuyMap,

        Sell,
        Craft,
        Buyable,
        Buyable_Map,
        Buyable_Enchant,
        Craftable,
        chooseGoods,
        chooseFood,

        resetData,
        manualSave,

        logs,
    };
    
    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}