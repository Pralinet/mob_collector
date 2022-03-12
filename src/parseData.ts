import userinit from "./json/userinit.json";

import goods_data from "./json/goods.json";
import furniture_data from "./json/furniture.json";
import ores_data from "./json/ores.json";
import crops_data from "./json/crops.json";
import rooms_data from "./json/rooms.json";
import mobs_data from "./json/mobs.json";
import items_data from "./json/items.json";
import recipes_data from "./json/recipes.json";
import flags_data from "./json/flags.json";

import { UserData, UserGoodsData, UserFurnitureData, UserOreData, UserCropData, 
    UserRoomData, UserSpaceData, UserMobData, UserItemData,
    UserRecipeData, UserFlagData } from "./ts/UserData";
import {Goods, Ore, Crop, Room, Mob, Item, Recipe, Flag, Furniture} from "./ts/SystemData"


//idからインデックスを計算
function getIndex(id: string|null, list: any[]) {
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

    const getList = (type:string) => {
        switch(type){
            case "crop":
                return cropList;
            case "item":
                return itemList;
            case "recipe":
                return recipeList;
            case "furniture":
                return furnitureList;
            default:
                return [];
        }
    }

    
    //jsonの読み込み
    const oreList: Ore[] = ores_data;
    const cropList: Crop[] = crops_data;
    const itemList: Item[] = items_data;
    const recipeList: Recipe[] = recipes_data;
    //文字列のidで指定されている部分を全て数字のindexに変える
    const roomList: Room[] = rooms_data.map((item) => {
        const rooms =  {...item, 
            food_space: {... item.food_space,  foods:item.food_space.foods.map(food => getIndex(food, recipeList))}
        }
        return rooms;
    }); //foods -> index
    const goodsList: Goods[] = goods_data.map((item) => {
        const goods =  {...item, spaces: item.spaces.map(space => getSpaceIndex(space, roomList))}
        return goods;
    }); //space -> index
    const furnitureList: Furniture[] = furniture_data.map((item) => {
        const furniture =  {...item, space: getSpaceIndex(item.space, roomList)}
        return furniture;
    }); //space -> index
    const mobList: Mob[] = mobs_data.map((item) => {
        return {...item, 
            goods: item.goods.map(goodz => getIndex(goodz, goodsList)),
            //foods: item.goods.map(food => getIndex(goodz, goodsList),
            present: item.present.map(pre => {return {...pre, id:getIndex(pre.id, itemList)}})
            }
    }); //goods -> index;
    const flagList: Flag[] = flags_data.map((item) => {
        return {...item,
            conditions: item.conditions.map((condition) => {
                return {...condition, id:getIndex(condition.id, getList(condition.type))};
            }),
            unlocks: item.unlocks.map((unlock) => getIndex(unlock, getList(item.unlock_type))),
        }
    });
    


    const userData: UserData = {
        ...userinit, 
        goods: (function(){
            const df = userinit.goods.find(g => g.id === "default") ?? {} as UserGoodsData;
            return goodsList.map((g) => userinit.goods.find(u => u.id === g.id) ?? {...df, id:g.id})
        })(),
        furniture: (function(){
            const df = userinit.furniture.find(f => f.id === "default") ?? {} as UserFurnitureData;
            return furnitureList.map((f) => userinit.furniture.find(u => u.id === f.id) ?? {...df, id:f.id})
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
        items: (function(){
            const df = userinit.items.find(i => i.id === "default") ?? {} as UserItemData;
            return itemList.map((i) => userinit.items.find(u => u.id === i.id) ?? {...df, id:i.id})
        })(),
        recipes: (function(){
            const df = userinit.recipes.find(i => i.id === "default") ?? {} as UserRecipeData;
            return recipeList.map((i) => userinit.recipes.find(u => u.id === i.id) ?? {...df, id:i.id})
        })(),
        flags: (function(){
            const df = userinit.flags.find(i => i.id === "default") ?? {} as UserFlagData;
            return flagList.map((f) => userinit.flags.find(u => u.id === f.id) ?? {...df, id:f.id, conditions:f.conditions.map((c)=>false)})
        })(),
    };


    return {oreList, cropList, goodsList, furnitureList, roomList, mobList, itemList, recipeList, flagList, userData, getList }
}





