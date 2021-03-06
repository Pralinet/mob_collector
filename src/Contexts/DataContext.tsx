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
    spaces:{ //?????????????????????????????????????????????????????????????????????????????????
        room: number; 
        space: number;
        rating: number;
    }[],
    foods: number[]; //???????????????????????????????????????????????????max
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

    //?????????????????????
    React.useEffect(() => {
        //mob????????????????????????????????????
        //updatemobProbabilities(-1,-1);

        //1????????????????????????????????????
        const intervalId = setInterval(() => {
            setTime(time => time + 1);
        }, 1000);
        return () => {
            clearInterval(intervalId)
        };

    }, []);

    //1????????????????????????
    React.useEffect(() => {
        onTick(time); 
    }, [time]);
    const onTick = (time: number) => {
        //???????????????
        CropGrows();
        //30??????????????????mob??????????????????
        if(time % 15 === 3){
            MobVisits();
        }
        //60?????????????????????
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
    //????????????????????????
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

    //??????
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
        //visiting????????????mob??????????????????mob???????????????????????????????????????
        const newVisitingList = systemData.rooms.map(room => room.spaces.map(space => []))
        mobProbabilities.forEach((goals, i_m) => {
            if(!newMobs[i_m].visiting){
                //??????????????????
                if(newMobs[i_m].hunger < MAXHunger){
                    //????????????????????????????????????????????????
                    newMobs[i_m].hunger += 0.1;
                } else if(goals.spaces.length){
                    //???????????????????????????????????????????????????????????????
                    //????????????????????????????????????
                    const goalOddsSum = 
                        goals.spaces.reduce((prev, cur) => prev + cur.rating, 0) + 
                        goals.foods.reduce((prev, cur) => prev + cur, 0);
                    //????????????
                    if(goalOddsSum > Math.random()){
                        //mine???????????????????????????????????????(??????????????????????????????????????????????????????????????????)
                        const goalOddsList = goals.spaces.reduce((prev, cur) => {
                            //??????????????????????????????????????????
                            const rating = (userData.rooms[cur.room].spaces[cur.space].mob >= 0)? 0
                                : cur.rating + goals.foods[cur.room];
                            return [...prev, prev[prev.length-1] + rating]
                        }, [0])
                        //????????????????????????????????????
                        const r = Math.random();
                        const i_g = goalOddsList.findIndex( (odds: number) => r <= odds ) - 1;
                        //mob????????????????????????????????????
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
                    //??????????????????
                    //?????????????????????
                    newMobs[space.mob].stamina -= 1;
                    //?????????????????????
                    exp += 0.1; //??????????????????json???????????????
                    //exp += systemData.mobs[space.mob].exp;
                    //??????????????????
                    const i_g = systemData.mobs[space.mob].goods.findIndex(gd => gd.id === space.goods);
                    newMobs[space.mob].satisfaction += systemData.mobs[space.mob].goods[i_g].rating;

                    //??????????????????????????????
                    if(newMobs[space.mob].stamina < 0){
                        //???????????????????????????????????????
                        let canEat = -1;
                        //????????????0??????????????????????????????????????????
                        if(newMobs[space.mob].hunger > 0 && mobProbabilities[space.mob].foods[i_r] > 0){
                            //????????????????????????

                            //?????????????????????????????????
                            const foodOddsList = systemData.mobs[space.mob].foods.reduce((prev, cur) => {
                                //???????????????????????????????????????????????????
                                const roomFoodIndex = newRoomFoods.findIndex(food => food>=0 && food === cur.id )
                                const rating = (newRoomFoods[roomFoodIndex]>=0 && newFoods[room.foods[roomFoodIndex]].stock>0)? cur.rating : 0;
                                return [...prev, prev[prev.length-1] + rating]
                            }, [0])
                            const r = Math.random();
                            const i_f = foodOddsList.findIndex( (odds: number) => r <= odds ) - 1;
                            //?????????????????????????????????????????????

                            if(i_f >= 0){
                                canEat = i_f;
                            }

                        }
                        if(canEat >= 0){
                            newMobs[space.mob].hunger -= 1;//??????????????????????????????
                            newMobs[space.mob].stamina = MAXStamina * systemData.mobs[space.mob].foods[canEat].rating;//??????????????????
                            //?????????????????????????????????????????????
                            const roomFoodIndex = newRoomFoods.findIndex(food => food>=0 && food === systemData.mobs[space.mob].foods[canEat].id);
                            newFoods[newRoomFoods[roomFoodIndex]].stock -= 1;//???null????????????????????????????????????????????????
                            //?????????????????????????????????????????????????????????null????????????????????????????????????????????????
                            if(newFoods[roomFoodIndex].stock <= 0){
                                newRoomFoods[roomFoodIndex] = -1;
                                foodUpdateFlags[i_r] = true;
                            }
                        }else{
                            //????????????????????????????????????

                            //????????????????????????
                            const present = getMobPresent(space.mob);
                            if(present){
                                presents.push(present);
                                logs.push(systemData.mobs[space.mob].name + "???" + systemData[present.list][present.index].name + "?????????????????????");
                            }

                            //??????????????????
                            newMobs[space.mob].stamina = MAXStamina;
                            //????????????0???
                            newMobs[space.mob].satisfaction = 0;
                            //visiting???false???
                            newMobs[space.mob].visiting = false;

                            return {...space, mob:-1};
                        }
                    }
                }else if(newVisitingList[i_r][i_s].length) {
                    //?????????mob????????????????????????????????????????????????????????????????????????
                    const r = Math.floor(Math.random() * (newVisitingList[i_r][i_s].length));
                    const visitor = newVisitingList[i_r][i_s][r]
                    //visiting????????????
                    newMobs[visitor].visiting = true;
                    console.log(i_r,i_s,visitor)
                    logs.push(systemData.mobs[visitor].name + "???????????????");
                    return {...space, mob:visitor}           
                }
                return space;
            })
            return {...room, spaces: newSpaces, foods:newRoomFoods}
        })

        //???????????????
        //????????????????????????????????????
        const damage = systemData.pickaxes[userData.player.pickaxe.material].durability - userData.player.pickaxe.durability;
        //??????????????????
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
        //????????????????????????????????????????????????
        presents.forEach(listIndex => {
            newUserData[listIndex.list][listIndex.index].stock += 1;
            //???????????????????????????????????????????????????
            if(listIndex.list === "crops" && !userData.crops[listIndex.index].unlocked){
                newUserData.crops[listIndex.index].unlocked = true;
                addLog(systemData.crops[listIndex.index].name + "?????????????????????????????????");
            }
        })

        logs.forEach(log =>addLog(log));

        setUserData(newUserData);

        //??????????????????????????????????????????????????????
        foodUpdateFlags.forEach((flag, i_fl) => {
            if(flag) updateMobProbabilities(i_fl, -1);
        })
    }

    const MobLeave = (leaveIndex: RoomIndex) => {
        const leaveSpace = userData.rooms[leaveIndex.room].spaces[leaveIndex.space]
        //?????????????????????mob???????????????
        if(leaveSpace.mob >= 0){
            setUserData(userData => {
                const newMobs = [...userData.mobs];
                const newRooms = [...userData.rooms];
                //??????????????????
                newMobs[leaveSpace.mob].stamina = 10; //maxstamina
                //????????????0???
                newMobs[leaveSpace.mob].satisfaction = 0;
                //visiting???false???
                newMobs[leaveSpace.mob].visiting = false;
                //mob???-1???
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

    //mob???????????????????????????
    const getMobPresent = (mob_id: number) => {
        //mob??????????????????????????????????????????????????????????????????????????????
        const presents = systemData.mobs[mob_id].present.filter(present => present.threshold <= userData.mobs[mob_id].satisfaction)
        if(presents.length){
            //????????????????????????????????????????????????????????????
            const p = Math.floor(Math.random() * presents.length);
           return presents[p].id;
        }
        return null;
    }

    const Buy = (listIndex:MerchandiseListIndex) => {
        setUserData(userData => {
            //????????????
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
            //item?????????
            systemData[listIndex.list][listIndex.index].shop?.items.forEach(item => {
                newUserData[item.item.list][item.item.index] = {
                    ...newUserData[item.item.list][item.item.index], 
                    stock:newUserData[item.item.list][item.item.index].stock - item.requirement
                }
            });

            //???????????????
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
            //?????????1?????????
            const newUserData: UserData = {
                ...userData,
                player:{...userData.player, money: userData.player.money + 1},
                crops:[...userData.crops],
                ores:[...userData.ores],
            }
            const requirement = systemData[listIndex.list][listIndex.index].requirement;
            //????????????????????????
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
            //??????????????????
            newUserData[listIndex.list][listIndex.index] = {
                ...newUserData[listIndex.list][listIndex.index], 
                stock:(newUserData[listIndex.list][listIndex.index].stock + crafted.craft?.number)
            }

            //??????????????????
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
        //???????????????
        return (userData.player.money >= systemData.rooms[id_room].unlock.money) &&
        //???????????????????????????
        (systemData.rooms[id_room].unlock.items.every((item) => 
            userData.items[item].stock >= 1
        ) )
    }

    const Buyable_Enchant = (enchant: keyof SystemData["enchants"], lv:number) => {
        //???????????????
        return (userData.player.money >= systemData.enchants[enchant].price[lv]) &&
        //??????1????????????
        userData.items[bookId].stock >= 1 &&
        //?????????????????????
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
            //?????????mob????????????
            updateMobProbabilities(id_room, id_space);
            //mob??????????????????????????????
            MobLeave({room: id_room, space:id_space});
        }

        const{room:id_room, space:id_space} = spaceListIndex.index
        
        const newrooms = userData.rooms.map((room) => ({
            ...room, spaces:[...room.spaces], merged_spaces:[...room.merged_spaces]
        }))
        //merged_space?????????
        if(spaceListIndex.list==="merged_spaces"){
            //??????goods?????????????????????????????????merged??????????????????space??????goods?????????
            userData.rooms.forEach((room, i_r) => {
                room.merged_spaces.forEach((space, i_s) => {
                    //goods????????????????????????????????????????????????????????????????????????????????????
                    if(id_goods >= 0 && space.goods === id_goods){
                        newrooms[i_r].merged_spaces[i_s].goods = -1;
                        systemData.rooms[i_r].merged_spaces[id_space].spaces.forEach(space => {
                            newrooms[i_r].spaces[space].goods = -1;
                            mobUpdate(i_r, space);
                        })
                    }
                })
            })
            //merged?????????goods??????????????????
            newrooms[id_room].merged_spaces[id_space].goods = id_goods;
            //merged???????????????space??????????????????
            systemData.rooms[id_room].merged_spaces[id_space].spaces.forEach(space => {
                //??????goods???merged?????????????????????????????????????????????
                if(newrooms[id_room].spaces[space].goods >= 0){
                    //????????????space???????????????merged???space????????????merged?????????
                    const oldGoodsMSpace = newrooms[id_room].merged_spaces.findIndex((mSpace) => mSpace.goods===newrooms[id_room].spaces[space].goods);
                    if(oldGoodsMSpace >= 0){
                        systemData.rooms[id_room].merged_spaces[oldGoodsMSpace].spaces.forEach(s => {
                            newrooms[id_room].spaces[s].goods= -1;
                            mobUpdate(id_room, s);
                        });
                    }
                }

                //merged???????????????space??????????????????
                newrooms[id_room].spaces[space].goods = id_goods;
                mobUpdate(id_room, space);
            })
        }else{
            //??????goods?????????????????????????????????goods?????????
            userData.rooms.forEach((room, i_r) => {
                room.spaces.forEach((space, i_s) => {
                    //goods????????????????????????????????????????????????????????????????????????????????????
                    if(id_goods >= 0 && space.goods === id_goods){
                        newrooms[i_r].spaces[i_s].goods = -1;
                        mobUpdate(i_r, i_s);
                    }
                })
            })

            //??????goods???merged?????????????????????????????????????????????
            if(newrooms[id_room].spaces[id_space].goods >= 0){
                //????????????space???????????????merged???space????????????merged?????????
                const oldGoodsMSpace = newrooms[id_room].merged_spaces.findIndex((mSpace) => mSpace.goods===newrooms[id_room].spaces[id_space].goods);
                if(oldGoodsMSpace >= 0){
                    systemData.rooms[id_room].merged_spaces[oldGoodsMSpace].spaces.forEach(s => {
                        newrooms[id_room].spaces[s].goods= -1;
                        mobUpdate(id_room, s);
                    });
                }
            }
            //space?????????goods??????????????????
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
        //??????????????????????????????
        if(id_food !== id_food_old){
            newUserData.rooms[id_room].foods[id_roomFood] = id_food;
            setUserData(newUserData)
            //?????????mob???????????? -1???food
            updateMobProbabilities(id_room, -1);
        }
    }

    const updateMobProbabilities = (id_room:number, id_space: number) => {
        console.log("updatemobProbabilities")
        //console.log(userData.rooms);
        //space=-1???food?????????
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
            //???????????????space?????????
            setMobProbabilities(mobProbabilities => {
                const newPml = mobProbabilities.map((mobProbability, i_m) => {
                    const id_goods = userData.rooms[id_room].spaces[id_space].goods;
                    const newSpaces = mobProbability.spaces.filter((space) => (space.room !== id_room || space.space !== id_space));
                    if(id_goods >= 0){
                        const mobGoodsIndex = systemData.mobs[i_m].goods.findIndex(gz => gz.id === id_goods)
                        if(mobGoodsIndex >= 0){//???????????????Goods??????????????????
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
        //?????????????????????????????????
        const r: Number = Math.random() * oreOddsList[oreOddsList.length -1];
        const i_o = oreOddsList.findIndex( (odds: number) => r <= odds ) - 1;
        //??????????????????????????????????????????
        const fortuneRate = systemData.enchants.fortune.effect[userData.player.pickaxe.enchant.fortune]
        const drop = Math.ceil(Math.random() * systemData.ores[i_o].drop * fortuneRate);
        setUserData((userData: UserData) => {
            //???????????????????????????or?????????????????????????????????
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
            //??????????????????????????????
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
            //???????????????
            //??????1?????????
            //LV?????????
            newUserData.player.exp = {
                ...newUserData.player.exp,
                lv: newUserData.player.exp.lv - systemData.enchants[enchant].cost[newUserData.player.pickaxe.enchant[enchant]]
            }
            //????????????????????????????????????
            newUserData.player.pickaxe.enchant[enchant] += 1;
            //????????????????????????
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
        //???????????????????????????
        setUserData(userData => {
            const newUserData = {
                ...userData,
                items: [...userData.items],
                player: {...userData.player},
                rooms: [...userData.rooms]
            };
            //????????????
            newUserData.player.money -= systemData.rooms[id_room].unlock.money;

            //?????????????????????
            systemData.rooms[id_room].unlock.items.map((item_id) => {
                newUserData.items[item_id].stock -= 1;
            })

            //??????????????????????????????
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