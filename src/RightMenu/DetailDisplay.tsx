import React, { useState, useMemo } from "react";
import { useDataContext, getFoodList, getItemList, getGoodsList } from '../Contexts/DataContext';
import { Crafted, CraftedListIndex, CraftItemListIndex } from "../ts/SystemData";

import './RightMenu.css';

const crafteds = {
    items: getItemList(),
    foods: getFoodList(),
    goods: getGoodsList()
}

const DetailDisplay = (props:{selected:CraftedListIndex}) => {
    const { 
        userData:{
            ores, crops, items
        },
        Craftable,
        Craft
        } = useDataContext();

    const crafted:(Crafted|null) = useMemo(() =>
        props.selected.index >= 0 ? crafteds[props.selected.list][props.selected.index]: null
    , [props.selected]);

    const HandleCraft = () => {
        Craft(props.selected);
    }


    const craftButton = useMemo(() => {
        //console.log(crafted, Craftable(crafted))
        return crafted && (Craftable(crafted))?
        (<div onClick={() => HandleCraft()}>craft</div>):
        null;
    },[ores, crops, items, crafted])

    return useMemo(() => {

        const itemImage = (listIndex: CraftItemListIndex) => {
            {
                switch(listIndex.list){
                    case "items":
                        const item = crafteds.items[listIndex.index]; //便宜的に
                        return(
                            <div className="item-image item-image-items" 
                                style={{backgroundPositionX : -32*item.image[0], backgroundPositionY : -32*item.image[1]}}
                            ></div>
                        );
                    case "crops":
                        return(
                            <div className="item-image item-image-crops" 
                                style={{backgroundPositionX : -32*listIndex.index}}
                            ></div>
                        );
                    case "ores":
                        return(
                            <div className="item-image item-image-ores" 
                                style={{backgroundPositionX : -32*listIndex.index}}
                            ></div>
                        );
                    default:
                        return null;
                }
            }
        }
        
        return (
            <div className="details-container">
                <div className="details-desc">説明文</div>
                {
                    crafted && crafted.craft? (
                        crafted.craft?.materials.map((item) => {
                            
                            return (
                                <div className="item-frame">
                                    {itemImage(item.item)}
                                    <span className="item-image-stock" >{item.requirement}</span>
                                </div>
                            )
                        })
                    ) :null
                }
                {craftButton}
            </div>
        )
    },[crafted]);

}

export default DetailDisplay;