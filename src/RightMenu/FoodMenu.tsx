import React, { useState, useMemo } from "react";
import { useDataContext, getFoodList } from '../Contexts/DataContext';
import { useFrameContext } from "../Contexts/FrameContext";
import { CraftedListIndex } from "../ts/SystemData";
import DetailDisplay from "./DetailDisplay";

import './RightMenu.css';

const foodList = getFoodList();

const FoodMenu = () => {
    const { 
        userData:{
            foods,
            },
        } = useDataContext();
    const { setFoodIndex } = useFrameContext();
    const [selected, setSelected] = useState<CraftedListIndex>({list: "foods", index: -1});

    const itemStatus = useMemo(() => {
        return foods.map((food, index) => {
            return (
                <div className="food-list-item" onClick={() => HandleChooseFood(index) }>
                    <div className="food-list-item-image"
                    style={{backgroundPositionX : -64*foodList[index].image[0], backgroundPositionY : -64*foodList[index].image[1]}}
                    ></div>
                    <div className="food-list-item-stock">{food.stock}</div>
                </div>
            )
        })
    }, [foods])

    const handleOutsideClick = (e: any) => {
        if(!e.target.closest('.food-list-item')) {
            //ここに外側をクリックしたときの処理
            setFoodIndex(-1);
        } else {
            //ここに内側をクリックしたときの処理
        }
        document.removeEventListener("mousedown", handleOutsideClick);
    };

    const HandleChooseFood = (index:number) => {
        setFoodIndex(index);
        const craftedListIndex: CraftedListIndex = {
            list: "foods",
            index: index
        }
        setSelected(craftedListIndex);
        document.addEventListener("mousedown", handleOutsideClick);
    }



    return (
    <div className="right-menu-content">
        <div className="right-menu-title"><span>料理</span></div>
        {itemStatus}
        <DetailDisplay selected={selected}></DetailDisplay>
    </div>
    );
}

export default FoodMenu;