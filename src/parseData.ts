import userinit from "./json/userinit.json";

import goods_data from "./json/goods.json";
import ores_data from "./json/ores.json";
import crops_data from "./json/crops.json";
import rooms_data from "./json/rooms.json";
import mobs_data from "./json/mobs.json";
import items_data from "./json/items.json";
import foods_data from "./json/foods.json";
import pickaxes_data from "./json/pickaxes.json"
import enchants_data from "./json/enchants.json";

import { UserData, UserGoodsData, UserOreData, UserCropData, 
    UserRoomData, UserSpaceData, UserMobData, UserItemData,
    UserFoodData } from "./ts/UserData";
import {CashItemListIndex, CraftedListIndex, CraftItemListIndex, Enchant, MerchandiseListIndex, Room, SpaceListIndex, SystemData} from "./ts/SystemData"
import { ListIndex } from "./ts/CommonData";


//idからインデックスを計算
function getIndex(id: string|null, list: any[]) {
    return list.findIndex(item => item.id === id);
}
//idからインデックスを計算
function getSpaceIndex(id: string, roomlist: any[]) {
    for(let id_room = 0 ; id_room < roomlist.length; id_room++){
        const id_space: number = roomlist[id_room].spaces.findIndex(space => space.id === id);
        if(id_space >= 0){
            return {room: id_room, space: id_space}
        }
    }
    return {room: -1, space: -1};
}

function getMergedSpaceIndex(id: string, roomlist: any[]) {
    for(let id_room = 0 ; id_room < roomlist.length; id_room++){
        const id_space: number = roomlist[id_room].merged_spaces.findIndex(space => space.id === id);
        if(id_space >= 0){
            return {room: id_room, space: id_space}
        }
    }
    return {room: -1, space: -1};
}

//ListIndexの生成
function getCraftItemListIndex(id: string, indexList:(CraftItemListIndex & {id:string})[]) {
    const index = indexList.findIndex(item => item.id === id);
    if(index >= 0)
    return {
        list: indexList[index].list,
        index: indexList[index].index
    } as CraftItemListIndex;
    else     return {
        list: "items",
        index: 0
    } as CraftItemListIndex;
}

function loadData(){
    const json = localStorage.getItem('mob_collector');
    if(!json) return null;
    try{
        const data = JSON.parse(json);
        const userData:UserData = data;
        return userData;
    }catch(e) {
        return null;
    }
}

export function saveData(userData: UserData){
    try{
        var json = JSON.stringify(userData);
        localStorage.setItem('mob_collector', json);
        console.log("autosaved");
    }catch(e){
        console.log("failed to save");
    }
}

export const initData = () => {

    //jsonの読み込み
    //まずは複合リストから
    const combinedLists = {
        craftItems: ([] as (CraftItemListIndex & {id:string})[]).concat(
            items_data.map( (d, index) => ({
                list:"items", index:index, id:d.id
            })),
            crops_data.map( (d, index) => ({
                list:"crops", index:index, id:d.id
            })),
            ores_data.map( (d, index) => ({
                list:"ores", index:index, id:d.id
            }))
        ),
        cashItems: ([] as any[]).concat(
            crops_data.map( (d, index) => ({
                list:"crops", index:index, id:d.id
            })),
            ores_data.map( (d, index) => ({
                list:"ores", index:index, id:d.id
            }))
        ),
        crafted: ([] as any[]).concat(
            items_data.map( (d, index) => ({
                list:"items", index:index, id:d.id
            })),
            goods_data.map( (d, index) => ({
                list:"goods", index:index, id:d.id
            })),
            foods_data.map( (d, index) => ({
                list:"foods", index:index, id:d.id
            }))
        ),
        merchandise: ([] as any[]).concat(
            items_data.map( (d, index) => ({
                list:"items", index:index, id:d.id
            })),
            goods_data.map( (d, index) => ({
                list:"goods", index:index, id:d.id
            }))
        )
    }
    //個別のリスト
    const systemData: SystemData = {
        //combinedLists:combinedLists,
        pickaxes: pickaxes_data,
        crops: crops_data,
        items: items_data.map((item) => {
            const items =  {...item, 
                craft: item.craft?{...item.craft, materials:item.craft.materials.map(material => ({...material, item:getCraftItemListIndex(material.item, combinedLists.craftItems)}) )} :null,
                shop: item.shop?{...item.shop, items:[] } :null, //仮
            }
            return items;
        }),
        foods: foods_data.map((item) => {
            const foods =  {...item, 
                craft: item.craft?{...item.craft, materials:item.craft.materials.map(material => ({...material, item:getCraftItemListIndex(material.item, combinedLists.craftItems)}) )} :null,
                shop: item.shop?{...item.shop, items:[] } :null, //仮
            }
            return foods;
        }),
        //文字列のidで指定されている部分を全て数字のindexに変える
        ores: ores_data.map((item) => {
            const ores =  {...item, 
                minable: item.minable.map(pickaxe => getIndex(pickaxe, pickaxes_data)),
                upgradable: item.upgradable.map(pickaxe => getIndex(pickaxe, pickaxes_data)),
            }
            return ores;
        }), //foods -> index
        rooms: rooms_data.map((item) => {
            const rooms =  {...item, 
                merged_spaces: item.merged_spaces.map(mSpace => {
                    return {...mSpace, spaces:mSpace.spaces.map(space => getSpaceIndex(space, rooms_data).space)}
                }),
                food_space: {... item.food_space,  foods:item.food_space.foods.map(food => getIndex(food, foods_data))},
                unlock: {...item.unlock, items:item.unlock.items.map(it => getIndex(it, items_data))}
            }
            return rooms;
        }), //foods -> index
        goods: goods_data.map((item) => {
            const goods =  {...item, 
                spaces: item.spaces.map(space => {
                    const spaceIndex = getSpaceIndex(space, rooms_data);
                    if(spaceIndex.space >= 0) return {list: "spaces", index: spaceIndex} as SpaceListIndex;
                    else return {list: "merged_spaces", index: getMergedSpaceIndex(space, rooms_data)} as SpaceListIndex;
                }),
                craft: item.craft?{...item.craft, materials:item.craft.materials.map(material => ({...material, item:getCraftItemListIndex(material.item, combinedLists.craftItems)}) )} :null,
                shop: item.shop?{...item.shop, items:item.shop.items.map(material => ({...material, item:getCraftItemListIndex(material.item, combinedLists.craftItems)}) )} :null,
            }
            return goods;
        }), //space -> index
        mobs: mobs_data.map((item) => {
            return {...item, 
                goods: item.goods.map(goodz => ({...goodz, id:getIndex(goodz.id, goods_data)})),
                foods: item.foods.map(food => ({...food, id:getIndex(food.id, foods_data)})),
                present: item.present.map(pre => {return {...pre, id:getCraftItemListIndex(pre.id, combinedLists.craftItems)}})
                }
        }), //goods -> index;
        enchants: enchants_data,
    }

    const createUserData = () => {
        const userData: UserData = {
            ...userinit, 
            goods: (function(){
                const df = userinit.goods.find(g => g.id === "default") ?? {} as UserGoodsData;
                return systemData.goods.map((g) => userinit.goods.find(u => u.id === g.id) ?? {...df, id:g.id})
            })(),
            ores: (function(){
                const df = userinit.ores.find(o => o.id === "default")?? {} as UserOreData;
                return systemData.ores.map((o) => userinit.ores.find(u => u.id === o.id) ?? {...df, id:o.id} as UserOreData)
            })(),
            crops: (function(){
                const df = userinit.crops.find(c => c.id === "default")?? {} as UserCropData;
                return systemData.crops.map((c) => userinit.crops.find(u => u.id === c.id) ?? {...df, id:c.id, lots:[...df.lots]} as UserCropData)
            })(),
            rooms: (function(){
                const df_r = userinit.rooms.find(r => r.id === "default")?? {} as UserRoomData;
                const df_s = userinit.spaces.find(s => s.id === "default")?? {};
                return systemData.rooms.map((r) => {
                    const room = {
                        ...(userinit.rooms.find(u => u.id === r.id) ?? {...df_r, id:r.id}),
                        spaces: r.spaces.map((s) => {
                            //spaceのデータを読み込み
                            const userSpaceData = userinit.spaces.find(u => u.id === s.id);
                            return userSpaceData
                            ? {...userSpaceData, mob:getIndex(userSpaceData.mob, systemData.mobs), goods: getIndex(userSpaceData.goods, systemData.goods)} as UserSpaceData
                            : {...df_s, id:s.id, mob:-1, goods:-1} as UserSpaceData;
                        }),
                    } 
                    return room;
                })
            })(),
            mobs: (function(){
                const df = userinit.mobs.find(m => m.id === "default")?? {} as UserMobData;
                return systemData.mobs.map((m) => userinit.mobs.find(u => u.id === m.id) ?? {...df, id:m.id} as UserMobData)
            })(),
            items: (function(){
                const df = userinit.items.find(i => i.id === "default") ?? {} as UserItemData;
                return systemData.items.map((i) => userinit.items.find(u => u.id === i.id) ?? {...df, id:i.id})
            })(),
            foods: (function(){
                const df = userinit.foods.find(i => i.id === "default") ?? {} as UserFoodData;
                return systemData.foods.map((i) => userinit.foods.find(u => u.id === i.id) ?? {...df, id:i.id})
            })(),
        };
        return userData;
    }

    let userData = loadData()
    if(!userData) userData = createUserData();

    return {systemData, userData }
}





