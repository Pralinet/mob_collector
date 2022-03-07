import React from "react";
import { useDataContext, getGoodsList, getRoomList, getMobList } from "./DataContext";

const goodsList = getGoodsList();
const roomList = getRoomList();
const mobList =getMobList();

//スペースごとに置けるグッズをリストアップ
const goodsBySpace = (function(){
    return roomList.map((room, i_r) => {
        return room.spaces.map((space, i_s) => [
            ...goodsList.flatMap((g, ind) => g.spaces.includes(space.id)? ind : [])
        ])
    })
})();

const RoomMonitor = () => {
    const {goods, rooms, mobs, chooseGoods} = useDataContext();

    const handleGoodsChange = (i_r:number, i_s: number, i_g:number)=> {
        chooseGoods(i_r, i_s, i_g);
    }

    return(
        <div>
            部屋モニタ
            <div>
                {
                    rooms.map((room,i_r) => {
                        return room.unlocked
                        ?  (
                            <div>
                                <div>{roomList[i_r].id}</div>
                                <div>
                                    {
                                        room.spaces.map ((space, i_s) => {
                                            return(
                                                <div>{space.id}:
                                                <select onChange={(e) => handleGoodsChange(i_r, i_s, Number(e.target.value))}>
                                                <option value={-1} key={-1}>なし</option>
                                                {goodsBySpace[i_r][i_s].map((i_g, ind) => 
                                                    goods[i_g].is_sold
                                                    ? <option value={i_g} key={ind}>{goodsList[i_g].name}</option>
                                                    : null
                                                )}
                                                </select>
                                                : {space.mob}</div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        )
                        : null;
                    })
                }
            </div>
        </div>
    );
};

export default RoomMonitor;