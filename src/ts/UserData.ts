export type UserData = {
    player: {
        name: string,
        money: number,
        exp: number,
    },
    goods: UserGoodsData[];
    furniture: UserFurnitureData[];
    ores: UserOreData[];
    crops: UserCropData[];
    rooms: UserRoomData[];
    mobs: UserMobData[];
    items: UserItemData[];
    recipes: UserRecipeData[];
    flags:UserFlagData[];
};

export type UserGoodsData = {
    id: string,
    is_sold: boolean
};

export type UserFurnitureData = {
    id: string,
    is_sold: boolean
};

export type UserOreData = {
    id: string,
    stock: number
};

export type UserCropData = {
    id: string,
    unlocked: boolean,
    stock: number,
    lots: number[],
    redstone: number
};

export type UserRoomData = {
    id: string,
    unlocked: boolean
    spaces: UserSpaceData[];
};

export type UserSpaceData = {
    id: string,
    //goods: string,
    //mob: string
    goods: number,
    mob: number
};

export type UserMobData = {
    id: string,
    visit: number
};

export type UserItemData = {
    id: string,
    stock: number
};

export type UserRecipeData = {
    id: string,
    unlocked: boolean,
    stock: number
};

export type UserFlagData = {
    id: string,
    conditions:boolean[],
    unlocked: boolean
};