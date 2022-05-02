import { CommonData, ListIndex, RoomIndex } from "./CommonData";

export type SystemData = Omit<CommonData, keyof CommonData> & {
    goods: Goods[];
    ores: Ore[];
    crops: Crop[];
    rooms: Room[];
    mobs: Mob[];
    items: Item[];
    foods: Food[];
    pickaxes:Pickaxe[];
    enchants:{
        unbreaking: Enchant,
        efficiency: Enchant,
        fortune: Enchant,
        mending: Enchant
    }
};


export type CraftItemListIndex = ListIndex & {
    list: 'items'|'crops'|'ores';
}
export type CashItemListIndex = ListIndex & {
    list: 'crops'|'ores';
}
export type CraftedListIndex = ListIndex & {
    list: 'items'|'foods'|'goods';
}
export type MerchandiseListIndex = ListIndex & {
    list: 'items'|'foods'|'goods';
}
export type SpaceListIndex = Omit<ListIndex, keyof ListIndex> & {
    list: 'spaces'|'merged_spaces';
    index: RoomIndex;
}


export type CraftItem = {
    id: string,
    name: string,
}

export type CashItem = {
    id: string,
    name: string,
    requirement : number
}

export type Crafted = {
    id : string,
    name : string,
    craft: CraftData | null,
}

export type Merchandise = {
    id : string,
    name : string,
    shop: ShopData | null
}

export type Crop = CraftItem & CashItem & {
    max_age: number,
    drop: number,
    speed: number,
};

export type Ore = CraftItem & CashItem & {
    odds : number,
    drop : number,
    sellable: boolean,
    upgradable: number[],
    minable: number[]
};

export type Item = CraftItem & Crafted & Merchandise &{
    image: number[],
}

export type Goods = Crafted & Merchandise & {
    id: string;
    name: string;
    spaces: SpaceListIndex[]
    image: {
        url: string,
        origin_x: number,
        origin_y: number
    },
    removable: boolean;
};

export type Food = Crafted & Merchandise & {
    id: string,
    name: string,
    image: number[],
};

export type Room = {
    id: string,
    name: string,
    spaces: Space[],
    merged_spaces: MergedSpace[];
    food_space: FoodSpace;
    stage: {
        origin_x:number;
        origin_y:number;
        x: number;
        y: number;
    };
    unlock:{
        money: number;
        items: any[] //あとで変える
    }
};

export type Space = {
    id: string;
    x: number;
    y: number;
}

export type FoodSpace = Space & {
    foods: number[]
}

export type MergedSpace = Space & {
    spaces: number[];
}

export type Mob = {
    id: string;
    name: string;
    goods: {
        id: number,
        rating: number
    }[];
    foods: {
        id: number,
        rating: number
    }[];
    present: {
        id: CraftItemListIndex;
        threshold: number;
    }[];
    exp: number;
}

export type Pickaxe = {
    id: string,
    durability: number,
    time: number,
    image: number
}

export type CraftData = {
    materials: {
        item: CraftItemListIndex,
        requirement: number
    }[],
    number: number
}

export type ShopData = {
    money: number,
    items: {
        item: CraftItemListIndex,
        requirement: number
    }[],
    number: number
}

export type Enchant = {
    name: string,
    max_lv: number,
    effect: number[],
    cost: number[],
    price: number[]
}