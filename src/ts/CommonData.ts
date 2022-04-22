export type CommonData = {
    goods: any[];
    ores: any[];
    crops: any[];
    rooms: any[];
    mobs: any[];
    items: any[];
    foods: any[];
};

export type ListIndex = {
    list:  keyof CommonData;
    index: number;
}

export type RoomIndex = {
    room: number,
    space: number
}