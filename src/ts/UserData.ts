export type UserData = {
    player: {
        name: string,
        money: number,
        exp: number,
    },
    goods: UserGoodsData[];
    ores: UserOreData[];
    crops: UserCropData[];
    rooms: UserRoomData[];
    mobs: UserMobData[];
};

export type UserGoodsData = {
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
    goods: string,
    mob: string
};

export type UserMobData = {
    id: string,
    visit: number
};