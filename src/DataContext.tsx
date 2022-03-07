import React, { createContext, useState, useContext } from 'react';

import { UserData, UserGoodsData, UserOreData, UserCropData, UserRoomData, UserSpaceData, UserMobData } from "./ts/UserData";
import { calcLotPrice, getIndexes } from "./utils";
import { initData } from "./parseData";

const {oreList, cropList, goodsList, roomList, mobList, userData} = initData();

export const getGoodsList = () => {
    return goodsList;
}
export const getOreList = () => {
    return oreList;
}
export const getCropList = () => {
    return cropList;
}
export const getRoomList = () => {
    return roomList;
}
export const getMobList = () => {
    return mobList;
}

export interface IDataContext {
    money: number;
    Buy: (type: string, index: number) => void;
    Sell: (type: string, index: number) => void;
    exp: number;

    goods: UserGoodsData[];
    setGoods: React.Dispatch<React.SetStateAction<UserGoodsData[]>>;
    ores: UserOreData[];
    setOres: React.Dispatch<React.SetStateAction<UserOreData[]>>;
    crops: UserCropData[];
    setCrops: React.Dispatch<React.SetStateAction<UserCropData[]>>;
    rooms: UserRoomData[];
    chooseGoods: (id_room:number, id_space: number, id_goods:number) => void;
    mobs: UserMobData[];
    setMobs: React.Dispatch<React.SetStateAction<UserMobData[]>>;

    possibleGoods: number[][][];
}

const DataContext = createContext({} as IDataContext);

export function useDataContext() {
    return useContext(DataContext);
}

export function DataProvider({ children }: any) {
    const [time, setTime] = useState(0);
    React.useEffect(() => {
        const intervalId = setInterval(() => {
            // 定期実行する関数
            setTime(time => time + 1);
            //onTick();
        }, 1000);
        return () => {
            clearInterval(intervalId)
        };
    }, []);


    const [money, setMoney] = useState(userData.player.money);
    const [exp, setExp] = useState(userData.player.exp);
    const [goods, setGoods] = useState(userData.goods);
    const [ores, setOres] = useState(userData.ores);
    const [crops, setCrops] = useState(userData.crops);
    const [rooms, setRooms] = useState(userData.rooms);
    const [mobs, setMobs] = useState(userData.mobs);
    const [possibleMobs, setPossibleMobs] = useState(roomList.map(r => r.spaces.map(s => [] as number[]) ));
    const [possibleGoods, setPossibleGoods] = useState(roomList.map(r => r.spaces.map(s => [] as number[]) ));

    React.useEffect(() => {
        onTick(time); 
    }, [time]);

    const onTick = (time: number) => {
        CropGrows();
        //30秒に一回判定
        if(time % 5 === 3){
            MobVisits();
        }
    }

    const CropGrows = () => {
        setCrops(crops => crops.map((item, i_c) => {
            let autoharvest = 0;
            const lots = crops[i_c].lots.map((age, i_l) => {
                const newage = (Math.random() < cropList[i_c].speed) ? age + 1: age;
                if(newage >= cropList[i_c].max_age){
                    if(i_l < crops[i_c].redstone){
                        autoharvest++;
                        return 0;
                    }
                    return cropList[i_c].max_age;
                }else return newage;
            });
            return {...item, lots: lots, stock:(crops[i_c].stock+ autoharvest)}
        }));
    }

    const MobVisits = () => {
        //実際に来るかどうか決めて更新
        setRooms(rooms => rooms.map((room,i_r) => {
            return {...room, spaces:room.spaces.map((space, i_s) => {
                //来られるmobのリスト
                const pml = possibleMobs[i_r][i_s]
                if(space.mob >= 0){
                    //既にいる場合
                    if(Math.random() < 0.9){
                        //console.log("続投");
                        return space;
                    }else{
                        //一定確率で退場
                        //console.log("またきてね");
                        return {...space, mob:-1};
                    }
                }else if(pml.length) {
                    //いない場合、一定確率で選ばれる
                    const r = Math.floor(Math.random() * (pml.length + 5));
                    if(r < pml.length){
                        //経験値を貰う
                        //console.log("いらっしゃい");
                        setExp(exp => exp + mobList[pml[r]].exp);
                        return {...space, mob:pml[r]}           
                    }
                    //console.log("だれもこない");
                }
                return space;
            })}
        })
        );
    }

    const Buy = (type: string, index: number) => {
        switch (type) {
            case 'goods':
                setMoney(money - goodsList[index].price);
                const newGoods = goods.map((item, i)=> {
                    return i === index
                    ? {...item, is_sold: true}
                    : item;
                })
                setGoods(newGoods);
                //使えるグッズのリストを更新
                updatePossibleGoods(index);
                break;
            case 'crop':
                setMoney(money - calcLotPrice(crops[index].lots.length));
                const newCrops = crops.map((item, i)=> {
                    return i === index
                    ? {...item, lots: [...item.lots, 0]}
                    : item;
                })
                setCrops(newCrops);
                break;
            default:
              console.log(`type error`);
        }
    };

    const Sell = (type: string, index: number) => {
        switch (type) {
            case 'ore':{
                setMoney(money + 1);
                const newOres = ores.map((item, i)=> {
                    return i === index
                    ? {...item, stock: (item.stock - oreList[i].amount)}
                    : item;
                })
                setOres(newOres);
                break;
            }
            case 'crop':{
                setMoney(money + 1);
                const newCrops = crops.map((item, i)=> {
                    return i === index
                    ? {...item, stock: (item.stock - cropList[i].amount)}
                    : item;
                })
                setCrops(newCrops);
                break;
            }
            default:
              console.log(`type error`);
        }
    };

    const chooseGoods = (id_room:number, id_space: number, id_goods:number) => {
        console.log(id_goods)
        const newrooms = rooms.map((room,i_r) => {
            return id_room === i_r 
            ? {...room, spaces:room.spaces.map((space, i_s) => {
                return id_space === i_s 
                ? {...space, goods:(id_goods)}
                : space;})
            }
            : room;
        })
        updatePossibleMobs(id_room, id_space, id_goods);
        setRooms(newrooms);
    }

    const updatePossibleMobs = (id_room:number, id_space: number, id_goods:number) => {
        console.log("updatePossibleMobs")
        const newPml = possibleMobs.map((room, i_r) => {
            return id_room === i_r 
            ? room.map((space, i_s) => {
                return id_space === i_s 
                ? (id_goods >= 0 ? mobList.flatMap((mob, index) => mob.goods.includes(id_goods) ? index : []): [])
                : space;
            })
            : room;
        })
        setPossibleMobs(newPml);
    }

    const updatePossibleGoods = (id_goods: number) => {
        //スペースごとに置けるグッズをリストアップ
        console.log(goodsList[id_goods].spaces)
        const newPgl = possibleGoods.map((room, i_r) => {
            return room.map((space, i_s) => {
                return goodsList[id_goods].spaces.some( (nums => nums.room === i_r&&nums.space === i_s) )
                ? [...space, id_goods]
                : space ;
            })
        })
        console.log(newPgl);
        setPossibleGoods(newPgl);
    } 
    
    const value = {
        money,
        Buy,
        Sell,
        exp,

        goods,
        setGoods,
        ores,
        setOres,
        crops,
        setCrops,
        rooms,
        chooseGoods,
        mobs,
        setMobs,

        possibleGoods,
    };
    
    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}