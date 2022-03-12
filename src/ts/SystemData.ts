export type Crop = {
    id: string;
    name: string;
    max_age: number,
    tool: string,
    drop: number,
    speed: number,
    amount: number,
};

export type Goods = {
    id: string;
    name: string;
    price: number;
    spaces: {room:number, space:number}[]
};

export type Ore = {
    id : string,
    name : string,
    odds : number,
    drop : number,
    amount : number,
    sellable: boolean
};

export type Room = {
    id: string,
    name: string,
    spaces: Space[],
    food_space: FoodSpace;
    stage: {
        origin_x:number;
        origin_y:number;
        x: number;
        y: number;
    };
};

export type Space = {
    id: string;
    x: number;
    y: number;
}

export type FoodSpace = Space & {
    foods: number[]
}

export type Mob = {
    id: string;
    name: string;
    goods: number[];
//    foods: number[];
    present: {
        id: number;
        times: number;
    }[];
    exp: number;
}

export type Furniture = {
    id: string,
    name: string,
    space: {room:number, space:number};
}

export type Recipe = {
    id: string,
    name: string,
    price: number
}

export type Flag = {
    id: string,
    conditions: {
        id: number
        type: string,
    }[],
    unlock_type: string,
    unlocks: number[]
}

export type Item = {
    id: string,
    name: string
}