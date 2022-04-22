import React, { useState, useMemo } from "react";

import { useDataContext, getGoodsList, getCropList, getOreList, getEnchants, getRoomList, getItemList, getFoodList } from '../Contexts/DataContext';
import { CashItemListIndex, MerchandiseListIndex, SystemData } from "../ts/SystemData";

import './ShopMenu.css'

const goodsList = getGoodsList();
const cropList = getCropList();
const oreList = getOreList();
const roomList = getRoomList();
const itemList = getItemList();
const foodList = getFoodList();
const enchants = getEnchants();

const ShopMenu = () => {
    const { 
        userData:{
            player:{money, pickaxe},
            goods,
            ores,
            crops,
            rooms,
        },
        Buy, Sell,Buyable, Buyable_Map, Buyable_Enchant,
        enchantPickaxe,
        BuyMap,
    } = useDataContext();
    const [shopMode, setShopMode] = useState("buy");

    const handleModeClick = (select: string) => {
        setShopMode(select);
      }

    const handleBuyGoods = (list: "goods" | "items" | "foods", index: number) => {
        const merchandiseListIndex: MerchandiseListIndex = {
            list: list,
            index: index
        }
        Buy(merchandiseListIndex);
    }
    const handleSellOre = (index: number) => {
        const cashItemListIndex: CashItemListIndex = {
            list: "ores",
            index: index
        }
        Sell(cashItemListIndex);
    }
    const handleSellCrop = (index: number) => {
        const cashItemListIndex: CashItemListIndex = {
            list: "crops",
            index: index
        }
        Sell(cashItemListIndex);
    }

    const ShopSell = useMemo(() => {
        return (
            <div className="goods-list">
                {
                    ores.map((ore, index) => { 
                        const sellable = (ores[index].stock >= oreList[index].requirement);
                        return (oreList[index].sellable)?(
                            <div className="shop-sell-item" onClick={() => sellable? handleSellOre(index): null}>
                                <div className="shop-ore-image"
                                style={{backgroundPositionX : -32*index}}
                                ></div>
                                <div className="shop-sell-stock">{ore.stock} / {oreList[index].requirement}</div>
                            </div>
                    ): null })
                }
                {
                    crops.map((crop, index) => {
                        const sellable = (crops[index].stock >= cropList[index].requirement);
                        return (
                        <div className="shop-sell-item" onClick={() => sellable? handleSellCrop(index): null}>
                            <div className="shop-crop-image"
                            style={{backgroundPositionX : -32*index}}
                            ></div>
                            <div className="shop-sell-stock">{crop.stock} / {cropList[index].requirement}</div>
                        </div>
                    )})
                }
            </div>
        )
    }, [ores, crops]);

    const ShopBuy = useMemo(() => {
        return (
            <div className="goods-list">
                {
                    goodsList.map((item, i) => {
                        if(goodsList[i].shop){
                            const disabled = goods[i].stock || !Buyable(goodsList[i])
                            return(
                                <div className="goods-list-item" onClick={() => {if(!disabled)handleBuyGoods("goods", i);} }>
                                    <div className="goods-list-image"></div>
                                    <p>{goodsList[i].name}</p>
                                    <p>{goodsList[i].shop?.money}</p>
                                </div>
                            )
                        }
                        return null;
                    })
                }
                {
                    itemList.map((item, i) => {
                        if(itemList[i].shop){
                            const disabled = !Buyable(itemList[i])
                            return(
                                <div className="goods-list-item" onClick={() => {if(!disabled)handleBuyGoods("items",i);} }>
                                    <div className="goods-list-image"></div>
                                    <p>{itemList[i].name}</p>
                                    <p>{itemList[i].shop?.money}</p>
                                </div>
                            )
                        }
                        return null;
                    })
                }
                {
                    foodList.map((item, i) => {
                        if(foodList[i].shop){
                            const disabled = !Buyable(foodList[i])
                            return(
                                <div className="goods-list-item" onClick={() => {if(!disabled)handleBuyGoods("foods",i);} }>
                                    <div className="goods-list-image"></div>
                                    <p>{foodList[i].name}</p>
                                    <p>{foodList[i].shop?.money}</p>
                                </div>
                            )
                        }
                        return null;
                    })
                }

                {
                    Object.keys(enchants).map((enchant: keyof SystemData["enchants"], i) => {
                        if(pickaxe.enchant[enchant] < enchants[enchant].max_lv){
                            const disabled = Buyable_Enchant(enchant, pickaxe.enchant[enchant])
                            return(
                                <div className="goods-list-item" onClick={() => {if(!disabled)enchantPickaxe(enchant)} }>
                                    <div className="goods-list-image-enchant"></div>
                                    <p>{enchants[enchant].name + (pickaxe.enchant[enchant]+1)}</p>
                                    <p>値段:{enchants[enchant].price[pickaxe.enchant[enchant]]}</p>
                                    <p>必要レベル:{enchants[enchant].cost[pickaxe.enchant[enchant]]}</p>
                                </div>
                            )
                        }else return null;
                    })
                }

                {
                    roomList.map((room, i) => {
                        if(!rooms[i].unlocked){
                            const disabled = Buyable_Map(i) //金とアイテムがあるか？
                            return(
                                <div className="goods-list-item" onClick={() => {if(!disabled)BuyMap(i);} }>
                                    <div className="goods-list-image-map"></div>
                                    <p>{roomList[i].name}のマップ</p>
                                    <p>{roomList[i].unlock.money}</p>
                                </div>
                            )
                        }
                        return null;
                    })
                }
            </div>
        )
    }, [goods, money])

    return useMemo (() => (
        <div className="shop-menu">
            <div className="shop-option">
                <span onClick={() => handleModeClick("sell")}>売る</span>
                <span onClick={() => handleModeClick("buy")}>買う</span>
            </div>
            {(shopMode === "buy")? ShopBuy: ShopSell}
        </div>
    ), [shopMode, goods, money, ores, crops]);
};

export default ShopMenu;