import userinit from "./json/userinit.json";

import goods_data from "./json/goods.json";
import ores_data from "./json/ores.json";
import crops_data from "./json/crops.json";
import rooms_data from "./json/rooms.json";
import mobs_data from "./json/mobs.json";

import { UserData, UserGoodsData, UserOreData, UserCropData, UserRoomData, UserSpaceData, UserMobData } from "./ts/UserData";
import {Goods, Ore, Crop, Room, Mob} from "./ts/SystemData"

import { calcLotPrice, getIndexes } from "./utils";


//idからインデックスを計算
function getIndex(id: string, list: any[]) {
    return list.findIndex(item => item.id === id);
}
//idからインデックスを計算
function getSpaceIndex(id: string, roomlist: Room[]) {
    for(let id_room = 0 ; id_room < roomlist.length; id_room++){
        const id_space = roomlist[id_room].spaces.findIndex(space => space.id === id);
        if(id_space >= 0){
            return {room: id_room, space: id_space}
        }
    }
    return {room: -1, space: -1};
}


export const initData = () => {
    //jsonの読み込み
    const oreList: Ore[] = ores_data;
    const cropList: Crop[] = crops_data;
    const roomList: Room[] = rooms_data;
    //文字列のidで指定されている部分を全て数字のindexに変える
    const goodsList: Goods[] = goods_data.map((item) => {
        const goods =  {...item, spaces: item.spaces.map(space => getSpaceIndex(space, roomList))}
        return goods;
    }); //space -> index
    const mobList: Mob[] = mobs_data.map((item) => {
        return {...item, goods: item.goods.map(goodz => getIndex(goodz, goodsList))}
    }); //goods -> index;


    const userData: UserData = {
        ...userinit, 
        goods: (function(){
            const df = userinit.goods.find(g => g.id === "default") ?? {} as UserGoodsData;
            return goodsList.map((g) => userinit.goods.find(u => u.id === g.id) ?? {...df, id:g.id})
        })(),
        ores: (function(){
            const df = userinit.ores.find(o => o.id === "default")?? {} as UserOreData;
            return oreList.map((o) => userinit.ores.find(u => u.id === o.id) ?? {...df, id:o.id} as UserOreData)
        })(),
        crops: (function(){
            const df = userinit.crops.find(c => c.id === "default")?? {} as UserCropData;
            return cropList.map((c) => userinit.crops.find(u => u.id === c.id) ?? {...df, id:c.id, lots:[...df.lots]} as UserCropData)
        })(),
        rooms: (function(){
            const df_r = userinit.rooms.find(r => r.id === "default")?? {} as UserRoomData;
            const df_s = userinit.spaces.find(s => s.id === "default")?? {};
            return roomList.map((r) => {
                const room = {
                    ...(userinit.rooms.find(u => u.id === r.id) ?? {...df_r, id:r.id}),
                    spaces: r.spaces.map((s) => {
                        //spaceのデータを読み込み
                        const userSpaceData = userinit.spaces.find(u => u.id === s.id);
                        return userSpaceData
                        ? {...userSpaceData, mob:getIndex(userSpaceData.mob, mobList), goods: getIndex(userSpaceData.goods, goodsList)} as UserSpaceData
                        : {...df_s, id:s.id, mob:-1, goods:-1} as UserSpaceData;
                    })
                } 
                return room;
            })
        })(),
        mobs: (function(){
            const df = userinit.mobs.find(m => m.id === "default")?? {} as UserMobData;
            return mobList.map((m) => userinit.mobs.find(u => u.id === m.id) ?? {...df, id:m.id} as UserMobData)
        })(),
    };


    return {oreList, cropList, goodsList, roomList, mobList, userData}
}





