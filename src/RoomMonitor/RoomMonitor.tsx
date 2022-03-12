import * as Konva from "konva"
import React, { useState, useMemo, useRef } from "react";
import { Stage, Layer, Rect, Circle, Image, Group, Text, Shape } from 'react-konva';

import { useDataContext, getGoodsList, getRoomList, getMobList, getRecipeList } from "../DataContext";
import {Room, Space} from "../ts/SystemData"
import useImage from 'use-image';
import ChatLogs from "./ChatLogs";

const goodsList = getGoodsList();
const roomList = getRoomList();
const recipeList = getRecipeList();
const mobList =getMobList();

const cellX:number = 32;
const cellY:number = 18.5;

const calcXY = (room:Room, space:Space) => {
    const {origin_x, origin_y} = room.stage;
    const x = room.stage.x + space.x;
    const y = room.stage.y + space.y;

    const posX = origin_x + (x + y) * cellX;
    const posY = origin_y + (y - x) * cellY;

    return {x: posX, y: posY};
}

const stageImages = roomList.map((room) => {
    const image = new window.Image();
    image.src = `${process.env.PUBLIC_URL}/img/stage/${room.id}.png`;
    return image;
})

const RoomMonitor = () => {
    const {money, exp, goods, rooms, mobs, chooseGoods, possibleGoods, recipes} = useDataContext();
    const [menuSpace, setMenuSpace] = useState([-1, -1]);

    const handleGoodsChange = (i_r:number, i_s: number, i_g:number)=> {
        chooseGoods(i_r, i_s, i_g);
    }
    /*const handleFoodsChange = (i_r:number, i_s: number, i_g:number)=> {
        chooseGoods(i_r, i_s, i_g);
    }*/

    const SelectArea = (onClick:()=> void) =>{
        return(
            <Shape
                sceneFunc={(context, shape) => {
                    context.beginPath();
                    context.moveTo(-cellX * 2, 0);
                    context.lineTo(cellX, -cellY * 3);
                    context.lineTo(cellX * 4, 0);
                    context.lineTo(cellX, cellY * 3);
                    context.closePath();
                    // (!) Konva specific method, it is very important
                    context.fillStrokeShape(shape);
                }} 
                fill="green" opacity={0}
                onMouseOver={e => e.target.opacity(0.3)}
                onMouseOut={e => e.target.opacity(0)}
                onClick={() => onClick()}
            />
        )
    }
        

    const RoomImage = useMemo(() => {
        //あとでステージをクリックしたらスペースの丸が浮かび上がる感じにしたい
        return rooms.map((room,i_r) => {
            console.log("room")
            if(room.unlocked){
                return (
                    <Group>
                        <Image image={stageImages[i_r]} />
                        {
                            rooms[i_r].spaces.map((space, i_s) => {
                                return (
                                    <Group {...calcXY(roomList[i_r], roomList[i_r].spaces[i_s])}>
                                        {SelectArea(() => handleClickSpace(i_r, i_s))}
                                        {
                                            space.goods >= 0
                                            ? <Text text={goodsList[space.goods].name} />
                                            : null
                                        }
                                        {
                                            space.mob >= 0
                                            ? <Text y={16} text={mobList[space.mob].name} />
                                            : null
                                        }
                                    </Group>
                                )

                            })
                        }
                        {
                            <Group {...calcXY(roomList[i_r], roomList[i_r].food_space)}>
                                {SelectArea(() => handleClickSpace(i_r, -1))}
                            </Group>
                        }
                    </Group>
                )
            } else return null;
        })
    }, [rooms]);//あとでroomsの更新抑える

    const dropdownRef = useRef(null);
    const handleOutsideClick = (e: any) => {
        if (dropdownRef.current) {
            document.removeEventListener("mousedown", handleOutsideClick);
            setMenuSpace([-1, -1]);
        }
    };

    const handleClickSpace = (i_r:number, i_s:number) => {
        setMenuSpace([i_r, i_s]);
        document.addEventListener("mousedown", handleOutsideClick);
    }

    const SpaceDropdown = () => {
        const [i_r, i_s] = menuSpace
        if( menuSpace[0] < 0 ) return null; //どこもクリックしてないとき
        else if( menuSpace[1] < 0 ){
            //食べ物の設置
            return (
                <Group ref={dropdownRef} {...calcXY(roomList[i_r], roomList[i_r].food_space)}>
                    <Rect width={64} height={64} fill="gray"/>
                    <Text y={0}
                        //onMouseDown={() => handleGoodsChange(i_r, i_s, -1)} 
                        key={-1}
                        text="なし"
                    />
                    {roomList[i_r].food_space.foods.map((i_f, ind) => 
                        recipes[i_f].stock
                        ? <Text y={ind*32 + 32}
                        //onMouseDown={() => handleGoodsChange(i_r, i_s, i_g)} 
                            key={ind}
                            text={recipeList[i_f].name}
                        />
                        : null
                    )}
                </Group>
            )
        } else{
            //グッズの設置
            return (
                <Group ref={dropdownRef} {...calcXY(roomList[i_r], roomList[i_r].spaces[i_s])}>
                    <Rect width={64} height={64} fill="gray"/>
                    <Text y={0}
                        onMouseDown={() => handleGoodsChange(i_r, i_s, -1)} 
                        key={-1}
                        text="なし"
                    />
                    {possibleGoods[i_r][i_s].map((i_g, ind) => 
                        goods[i_g].is_sold
                        ? <Text y={ind*32 + 32}
                        onMouseDown={() => handleGoodsChange(i_r, i_s, i_g)} 
                            key={ind}
                            text={goodsList[i_g].name}
                        />
                        : null
                    )}
                </Group>
            )
        }
    };

    const FoodDropdown1 = () => {
        
    }

    return(
        <div style={{display:"inline-block"}}>
            <Stage width={640} height={480} >
                <Layer draggable={true}>
                    {RoomImage}
                    {SpaceDropdown()}
                </Layer>
                <Layer>
                    <Text y={448} text={"金:" + money + "exp:" + exp}/>
                </Layer>
                
            </Stage>
            <ChatLogs/>
        </div>
    );
};

export default RoomMonitor;