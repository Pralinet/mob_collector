import { url } from "inspector";
import React, { useState, useMemo, useCallback } from "react";
import SimpleBar from "simplebar-react";
import { useDataContext, getGoodsList, getItemList } from '../Contexts/DataContext';
import { useFrameContext } from "../Contexts/FrameContext";
import { CraftedListIndex, CraftItemListIndex } from "../ts/SystemData";
import DetailDisplay from "./DetailDisplay";

import './RightMenu.css';

const goodsList = getGoodsList();
const itemList = getItemList();

const GoodsMenu = () => {
    const { 
        userData:{
            goods,
        },
        Craft,
        Craftable
    } = useDataContext();
    const { chooseGoods, goodsIndex } = useFrameContext();
    const [selected, setSelected] = useState<CraftedListIndex>({list: "goods", index: -1});


    const HandleCraft = (index: number) => {
        const craftedListIndex: CraftedListIndex = {
            list: "goods",
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
            <div className="craft-item-container goods">
                {
                    goodsList[index].craft? (
                        goodsList[index].craft?.materials.map((item) => {
                            
                            return (
                                <div className="craft-item-frame">
                                    {itemImage(item.item)}
                                    <span className="craft-item-image-stock" >{item.requirement}</span>
                                </div>
                            )
                        })
                    ) :null
                }
            </div>
        )
    },[]);

    const goodsStatus = useMemo(() => {
        return (
            <div className="item-frame-container">
                {
                    goods.map((item, index) => {
                        //持ってる場合、表示＆選択したらroomに配置
                        if(item.stock) return (
                            <div className="goods-list-item clickable" onClick={() => chooseGoods(index) }>
                                <p>{goodsList[index].name}</p>
                                <div className="goods-list-image"
                                style={{backgroundImage:`url(${process.env.PUBLIC_URL}/img/goods/thumbnail/${goodsList[index].image.url}.png)`}}
                                ></div>
                                
                            </div>
                        )
                        //持ってなくてレシピがある場合、lockedと表示
                        else if(goodsList[index].craft){
                            const craftable = Craftable(goodsList[index]);
                            return (
                                <div className="goods-list-item locked" onClick={(craftable)?() => HandleCraft(index):null }>
                                    <p>{goodsList[index].name}</p>
                                    <div className="goods-list-image"></div>
                                    
                                    {craftItems(index)}
                                </div>  
                            )
                        }
                    })
                }
            </div>
        )
    }, [goods, goodsIndex])


    return (
        <SimpleBar className="right-menu-content" >
            <div className="right-menu-title"><span>グッズ</span></div>
            {goodsStatus}
        </SimpleBar>
    );
}

export default GoodsMenu;