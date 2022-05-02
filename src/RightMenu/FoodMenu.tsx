import classNames from "classnames";
import React, { useState, useMemo, useCallback } from "react";
import SimpleBar from "simplebar-react";
import { useDataContext, getFoodList, getItemList, getGoodsList } from '../Contexts/DataContext';
import { useFrameContext } from "../Contexts/FrameContext";
import { CraftedListIndex, CraftItemListIndex } from "../ts/SystemData";

import './RightMenu.css';

const foodList = getFoodList();
const itemList = getItemList();

const FoodMenu = () => {
    const { 
        userData:{
            foods,
            },
        Craft,
        Craftable
        } = useDataContext();
    const { chooseFood, foodIndex } = useFrameContext();
    const [selected, setSelected] = useState<CraftedListIndex>({list: "foods", index: -1});

    const HandleCraft = (index: number) => {
        const craftedListIndex: CraftedListIndex = {
            list: "foods",
            index: index
        }
        Craft(craftedListIndex);
    }

    const craftItems = useCallback((index:number) => {
        const itemImage = (listIndex: CraftItemListIndex) => {
            {
                switch(listIndex.list){
                    case "items":
                        const item = itemList[listIndex.index]; //便宜的に
                        return(
                            <div className="craft-item-image item-image-items" 
                                style={{backgroundPositionX : -32*item.image[0], backgroundPositionY : -32*item.image[1]}}
                            ></div>
                        );
                    case "crops":
                        return(
                            <div className="craft-item-image item-image-crops" 
                                style={{backgroundPositionX : -32*listIndex.index}}
                            ></div>
                        );
                    case "ores":
                        return(
                            <div className="craft-item-image item-image-ores" 
                                style={{backgroundPositionX : -32*listIndex.index}}
                            ></div>
                        );
                    default:
                        return null;
                }
            }
        }

        const craftable = Craftable(foodList[index])
        
        return (
            foodList[index].craft?
            <div className="craft-item-container">
                {
                    foodList[index].craft?.materials.map((item) => {
                        
                        return (
                            <div className="craft-item-frame">
                                {itemImage(item.item)}
                                <span className="craft-item-image-stock" >{item.requirement}</span>
                            </div>
                        )
                    })
                }
                <span className="craft-arrow"></span>
                <span className="craft-number">{foodList[index].craft.number}</span>
                <span className={classNames("craft-item-image-craft button", craftable?"":"inactive")} onClick={craftable?(event) => {event.stopPropagation(); HandleCraft(index)}:null}>+</span>
            </div>
            :null
        )
    },[]);

    const itemStatus = useMemo(() => {
        return foods.map((food, index) => {
            return (
                <div className={classNames("food-list-item", index===foodIndex?"selected":(food.stock>0?"clickable":""))}
                 onClick={() => {if(food.stock>0) chooseFood(index)} }>
                    <div className="food-list-item-image"
                    style={{backgroundPositionX : -64*foodList[index].image[0], backgroundPositionY : -64*foodList[index].image[1]}}
                    ></div>
                    <div className="food-info" >
                        <p className="food-info-title">{foodList[index].name}</p>
                        {craftItems(index)}
                    </div>
                    <div className="food-list-item-stock">{food.stock}</div>
                </div>
            )
        })
    }, [foods, foodIndex])


    return (
    <SimpleBar className="right-menu-content">
        <div className="right-menu-title"><span>料理</span></div>
        <div className="item-frame-container">
            {itemStatus}
        </div>
    </SimpleBar>
    );
}

export default FoodMenu;