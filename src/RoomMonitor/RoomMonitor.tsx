import React, { FC, useState, useMemo, useRef, useCallback } from "react";
import { Stage, Layer, Rect, Circle, Image, Group, Text, Shape } from 'react-konva';
import { IndexedAccessType } from "typescript";

import { useDataContext, getGoodsList, getRoomList, getMobList, getFoodList } from "../Contexts/DataContext";
import { useFrameContext } from "../Contexts/FrameContext";
import {MergedSpace, Room, Space, SpaceListIndex} from "../ts/SystemData"
import { UserRoomData, UserSpaceData } from "../ts/UserData";

import './RoomMonitor.css';

const goodsList = getGoodsList();
const roomList = getRoomList();
const foodList = getFoodList();
const mobList =getMobList();

const cellX:number = 64;
const cellY:number = 37;

const calcRoomXY = (room:Room) => {
    const {origin_x, origin_y} = room.stage;
    const x=room.stage.x;
    const y=room.stage.y;

    const posX = -origin_x + (x + y) * cellX;
    const posY = -origin_y + (y - x) * cellY;

    return {x: posX, y: posY};
}

const calcXY = (room:Room, space:Space) => {
    const {origin_x, origin_y} = room.stage;
    /*let x=room.stage.x;
    let y=room.stage.y;
    if(space){
        x = room.stage.x + space.x;
        y = room.stage.y + space.y;
    }*/
    const x = space.x;
    const y = space.y;

    const posX = origin_x + (x + y) * cellX;
    const posY = origin_y + (y - x) * cellY;

    return {x: posX, y: posY};
}

const stageImages = roomList.map((room) => {
    const image = new window.Image();
    image.src = `${process.env.PUBLIC_URL}/img/stage/${room.id}.png`;
    return image;
})
const goodsImages = goodsList.map((goods) => {
    const image = new window.Image();
    image.src = `${process.env.PUBLIC_URL}/img/goods/${goods.image.url}/default.png`;
    return image;
})
const goodsMobImages = goodsList.map((goods) => {
    return mobList.map((mob) => {
        const image = new window.Image();
        image.src = `${process.env.PUBLIC_URL}/img/goods/${goods.image.url}/${mob.id}.png`;
        return image;
    })
})
const foodsImage = (() => {
    const image = new window.Image();
    image.src = `${process.env.PUBLIC_URL}/img/others/food.png`;
    return image;
})()
const operationImage = (() => {
    const image = new window.Image();
    image.src = `${process.env.PUBLIC_URL}/img/system/operation.png`;
    return image;
})()
const signImage = (() => {
    const image = new window.Image();
    image.src = `${process.env.PUBLIC_URL}/img/system/sign2.png`;
    return image;
})()
const frameImage = (() => {
    const image = new window.Image();
    image.src = `${process.env.PUBLIC_URL}/img/system/item_frame_bg.png`;
    return image;
})()


type RoomProps = {
    dimensions: {
        height: number,
        width: number
    };
}

const RoomMonitor= (props:RoomProps) => {
    const {
        userData:{
            goods,
            rooms,
            mobs,
            foods
        },
        chooseGoods,
        chooseFood
    } = useDataContext();
    const { goodsIndex: selectedGoods, foodIndex: selectedFood,
    } = useFrameContext();

    const [scale, setScale] = useState(0.25);
    const stageRef = useRef(null as any);
    const layerRef = useRef(null as any);
    const[foodWindow, setFoodWindow] = useState(-1);

    const SelectArea = useCallback((spaceListIndex: SpaceListIndex) => {
        let operation = -1;
        const goodsNow = rooms[spaceListIndex.index.room][spaceListIndex.list][spaceListIndex.index.space].goods;

        if(goodsNow >= 0){
            if(goodsNow == selectedGoods) operation = 2; //撤去
            else operation = 1; //交換
        } else operation = 0; //設置

        const handleClick = () => {
            switch(operation){
                case 0:
                case 1:
                    chooseGoods(spaceListIndex, selectedGoods);
                    break;
                case 2:
                    chooseGoods(spaceListIndex, -1)
                    break;
                default:
                    break;
            }
        }
        
        return(
            //選択中のgoodsを置けるスペースならば表示
            isPlaceable({list:spaceListIndex.list, index:spaceListIndex.index})?
            <Group className="select-area" onMouseDown={() => handleClick()}>
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
                    fill="green" opacity={0.3}
                />
                <Rect 
                    fillPatternImage={operationImage} width={64} height={64}
                    fillPatternOffset={{x:64*operation, y:0}} x={cellX*0.5} y={-cellY}
                    
                ></Rect>
            </Group>:null
        )
    },[selectedGoods, goods])

    const FoodsWindow = useCallback((i_r: number) => {

        const handleClick = (id_rf: number, operation:number) => {
            console.log(rooms[i_r].foods)
            switch(operation){
                case 0:
                case 1:
                    //既に置いてある場所があれば、そこを撤去する
                    rooms[i_r].foods.forEach((food, id_rf2) => {
                        if(food>=0 && food === selectedFood){
                            chooseFood(i_r, id_rf2, -1);
                        }
                    })
                    //選択した場所に食べ物を置く
                    chooseFood(i_r, id_rf, selectedFood);
                    break;
                case 2:
                    chooseFood(i_r, id_rf, -1);
                    break;
                default:
                    break;
            }
        }

        const FoodWindowItem = (id_rf: number) => {
            const roomFood = rooms[i_r].foods[id_rf];
            console.log(foodList[roomFood]);
            let operation = -1;
            if(roomFood >= 0){
                if(roomFood === selectedFood) operation = 2; //撤去
                else operation = 1; //交換
            } else operation = 0; //設置

            return (
                <Group x={108*(id_rf-1)} onMouseDown={() => {handleClick(id_rf, operation);}}
                onMouseOver={( ) => setFoodWindow(i_r)} onMouseOut={( ) => setFoodWindow(-1)}
                >
                    <Image image={frameImage}/>
                    {
                        //食べ物が配置されてる時だけ表示
                        roomFood >= 0?
                        <Rect 
                        width={64} height={64} x={16} y={16}
                        fillPatternImage={foodsImage}
                        fillPatternOffset={{x:64*foodList[roomFood].image[0], y:64*foodList[roomFood].image[1]}}
                        ></Rect>
                        :null
                    }
                    <Rect 
                        fillPatternImage={operationImage} width={64} height={64}
                        fillPatternOffset={{x:64*operation, y:0}} x={16} y={16}
                    ></Rect>
                </Group>
            )
        }
        

        return(
            isPlaceableFood(i_r) || (foodWindow === i_r) ?
            <Group x={-48} y={-128}  className="select-area">
                <Image image={signImage} x={-144} y={-24}/>
                {
                    rooms[i_r].foods.map((_, id_rf) => {
                        return FoodWindowItem(id_rf)
                    })
                }
            </Group>: null
        )
    },[selectedFood, foodWindow, rooms])
    
    const isPlaceable = useCallback((spaceListIndex: SpaceListIndex) => {
        const placeable = (
            selectedGoods>=0 && 
            goodsList[selectedGoods].spaces.some((place)=>(
                place.list === spaceListIndex.list &&
                place.index.room === spaceListIndex.index.room &&
                place.index.space === spaceListIndex.index.space
            ))
        )
        return placeable
    }, [selectedGoods])

    const isPlaceableFood = useCallback((i_r:number) => {
        const placeable = (
            selectedFood>=0 && 
            roomList[i_r].food_space.foods.some((id_food)=> id_food == selectedFood ) 
        )
        return placeable
    }, [selectedFood])

    const RoomImage = useMemo(() => {
        return rooms.map((room:UserRoomData,i_r) => {
            //console.log("room")
            if(room.unlocked){
                //spacesのうち、merged_spaceのグッズが占めてるものを除外する
                const occupiedSpaceList: number[] = []
                roomList[i_r].merged_spaces.forEach((mSpace, i_ms) => {
                    //console.log(mSpace.spaces[0], room.spaces)
                    if(room.merged_spaces[i_ms].goods >= 0){
                        mSpace.spaces.forEach(space => {occupiedSpaceList.push(space)})
                    }
                })
                return (
                    <Group {...calcRoomXY(roomList[i_r])}>
                        <Image image={stageImages[i_r]} perfectDrawEnabled={false} hitStrokeWidth={1} />
                        {
                            roomList[i_r].merged_spaces.map((mSpace:MergedSpace, i_ms) => {
                                const mSpaceGoods = room.merged_spaces[i_ms].goods;
                                return (
                                    <Group {...calcXY(roomList[i_r], roomList[i_r].merged_spaces[i_ms])}>
                                        {
                                            SelectArea({list:"merged_spaces", index:{room:i_r, space:i_ms}})
                                        }
                                        {
                                            (mSpaceGoods >= 0)
                                            ? <Image image={goodsImages[mSpaceGoods]} 
                                            x={-goodsList[mSpaceGoods].image.origin_x} y={-goodsList[mSpaceGoods].image.origin_y} />
                                            : null
                                        }
                                    </Group>
                                )
                            })
                        }
                        {
                            room.spaces.map((space:UserSpaceData, i_s) => {
                                return (
                                    <Group {...calcXY(roomList[i_r], roomList[i_r].spaces[i_s])}  >
                                        {
                                            (space.goods >= 0 && !occupiedSpaceList.includes(i_s))
                                            ? (
                                                space.mob >= 0?
                                                <Image image={goodsMobImages[space.goods][space.mob]} 
                                                x={-goodsList[space.goods].image.origin_x} y={-goodsList[space.goods].image.origin_y} />:
                                                <Image image={goodsImages[space.goods]} 
                                                x={-goodsList[space.goods].image.origin_x} y={-goodsList[space.goods].image.origin_y} />
                                            )
                                            : null
                                        }
                                        { 
                                            SelectArea({list:"spaces", index:{room:i_r, space:i_s}})
                                        }
                                    </Group>
                                )

                            })
                        }
                        {
                            <Group {...calcXY(roomList[i_r], roomList[i_r].food_space)}>
                                {
                                    FoodsWindow(i_r)
                                }
                            </Group>
                        }
                    </Group>
                )
            } else return (
                <Text x={-roomList[i_r].stage.origin_x} y={-roomList[i_r].stage.origin_y} text="locked" ></Text>
            );
        })
    }, [rooms, selectedGoods, selectedFood]);//あとでroomsの更新抑える


    const zoomStage = (event:any) => {
        const newScale = event.evt.deltaY < 0 ? scale * 2 : scale / 2;
        const newScale2 =  Math.min(Math.max(newScale, 0.125), 1)
        if (layerRef.current !== null && stageRef.current !== null) {
            const layer = layerRef.current;
            const stage = stageRef.current;
            const { x: pointerX, y: pointerY } = stage.getPointerPosition();
            const newPos = {
                x: layer.x() + (pointerX - layer.x()) * (scale - newScale2)/scale,
                y: layer.y() + (pointerY - layer.y()) * (scale - newScale2)/scale,
            }
            layer.position(newPos);
        }
        setScale(newScale2);
    }

    return useMemo(() => (
        <div className="room-monitor">
            <div className="stage-wrapper">
                <div className="stage-background"></div>
                <Stage width={props.dimensions.width - 320 - 16} height={props.dimensions.height - 96 - 16} onWheel={zoomStage} ref={stageRef}>
                    <Layer draggable={true} scaleX={scale} scaleY={scale} ref={layerRef} x={100} y={400}>
                        {RoomImage}
                    </Layer>
                </Stage>
            </div>
        </div>
    ), [props.dimensions, scale, rooms, selectedGoods, selectedFood]);
};

export default RoomMonitor;