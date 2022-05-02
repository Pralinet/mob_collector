import classNames from "classnames";
import React, { useState, useMemo, useCallback } from "react";
import ReactTooltip from "react-tooltip";
import SimpleBar from "simplebar-react";
import { useDataContext, getCropList, getOreList, getItemList } from '../Contexts/DataContext';
import { CraftedListIndex, CraftItemListIndex } from "../ts/SystemData";
import DetailDisplay from "./DetailDisplay";

const itemList = getItemList();


const ItemMenu = () => {
    const { 
        userData:{
            items,
        },
        Craft,
        Craftable
        } = useDataContext();

    const HandleCraft = (index: number) => {
        
        const craftedListIndex: CraftedListIndex = {
            list: "items",
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
        return (
            <div className="craft-item-container">
                {
                    itemList[index].craft? (
                        itemList[index].craft?.materials.map((item) => {
                            
                            return (
                                <div className="craft-item-frame">
                                    {itemImage(item.item)}
                                    <span className="craft-item-image-stock" >{item.requirement}</span>
                                </div>
                            )
                        })
                    ) :null
                }
                <span className="craft-arrow"></span>
                <span className="craft-number">{itemList[index].craft.number}</span>
            </div>
        )
    },[]);

    const itemStatus = useMemo(() => {
        return (
            <div className="item-frame-container">
                {
                    items.map((item, index) => {
                        const craftable = Craftable(itemList[index])
                        return (
                            <div className="item-frame">
                                <div className="item-image" 
                                    style={{backgroundPositionX : -48*itemList[index].image[0], backgroundPositionY : -48*itemList[index].image[1]}}
                                ></div>
                                {
                                    itemList[index].craft?
                                    (<span className={classNames("item-image-craft button", (craftable)?"":"inactive")} 
                                    data-for='craft-tooltip' data-tip={index}
                                    onClick={(craftable)?() => HandleCraft(index):null}>+</span>)
                                    :null
                                }
                                <span className="item-image-stock" >{item.stock}</span>
                            </div>
                        )
                    })
                }
            </div>
        )
    }, [items])

    return (
        <SimpleBar className="right-menu-content">
            <div className="right-menu-title"><span>アイテム</span></div>
            {itemStatus}
            <ReactTooltip id='craft-tooltip' 
            getContent={(dataTip) =>  dataTip?craftItems(parseInt(dataTip)): null}
            ></ReactTooltip>
        </SimpleBar>
    );
}

export default ItemMenu;