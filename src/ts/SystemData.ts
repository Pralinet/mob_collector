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
    //spaces: string[]
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
    food: string[]
    stage: {
        origin_x:number;
        origin_y:number;
        x: number;
        y: number;
    }
};

export type Space = {
    id: string,
    x: number;
    y: number;
}
export type Mob = {
    id: string,
    name: string,
    //goods: string[]
    goods: number[]
    exp: number;
}
