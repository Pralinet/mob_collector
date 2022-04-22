import { CommonData } from "./CommonData";

export type UserData = Omit<CommonData, keyof CommonData> & {
    player: {
        name: string,
        money: number,
        exp: UserExpData,
        pickaxe: UserPickaxeData
    },
    goods: UserGoodsData[];
    ores: UserOreData[];
    crops: UserCropData[];
    rooms: UserRoomData[];
    mobs: UserMobData[];
    items: UserItemData[];
    foods: UserFoodData[];
};
/*
type UserDataKey = keyof UserData;
type NotCombinedLists<T> = T extends "combinedLists" ? never : T;

export type ListIndex = {
    list:  NotCombinedLists<SystemDataKey>;
    index: number;
}
*/
export type UserExpData = {
    exp:  number,
    lv: number,
    nextExp: number
};

export type UserPickaxeData = {
    material: number,
    durability: number,
    time: number,
    enchant: {
        unbreaking: number,
        efficiency: number,
        fortune: number,
        mending: number
    }
};

export type UserGoodsData = {
    id: string,
    stock: number;
};

export type UserItemData = {
    id: string,
    stock: number
};

export type UserOreData = {
    id: string,
    stock: number
};

export type UserCropData = {
    id: string,
    stock: number
    unlocked: boolean,
    lots: number[],
    redstone: number
};

export type UserRoomData = {
    id: string,
    unlocked: boolean
    spaces: UserSpaceData[];
    foods: RoomFood[]
};

export type RoomFood = {
    id: number,
    stock: number
} | null

export type UserSpaceData = {
    id: string,
    goods: number,
    mob: number,
};

export type UserMobData = {
    id: string,
    stamina: number,
    hunger: number,
    visiting:boolean,
    satisfaction: number,
};

export type UserFoodData = {
    id: string,
    unlocked: boolean,
    stock: number
};
