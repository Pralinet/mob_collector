import classNames from "classnames";
import React, { useState, useMemo } from "react";
import SimpleBar from "simplebar-react";

import { useDataContext, getGoodsList, getCropList, getOreList, getEnchants, getRoomList, getItemList, getFoodList } from '../Contexts/DataContext';
import { CashItemListIndex, CraftItemListIndex, Merchandise, MerchandiseListIndex, SystemData } from "../ts/SystemData";

import './ShopMenu.css'

const goodsList = getGoodsList();
const cropList = getCropList();
const oreList = getOreList();
const roomList = getRoomList();
const itemList = getItemList();
const foodList = getFoodList();
const enchants = getEnchants();

const bookIndex = itemList.findIndex(item => item.id==='book');

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
    const [buyableOnly, setBuyableOnly] = useState(false);

    const handleModeClick = (mode:string) => {
        setShopMode(mode);
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
                            <div className={classNames("shop-sell-item", sellable?"clickable":"disabled")} onClick={() => sellable? handleSellOre(index): null}>
                                <div className="shop-sell-image shop-ore-image"
                                style={{backgroundPositionX : -64*index}}
                                ></div>
                                <div className="shop-sell-stock">{ore.stock} / {oreList[index].requirement}</div>
                            </div>
                    ): null })
                }
                {
                    crops.map((crop, index) => {
                        const sellable = (crops[index].stock >= cropList[index].requirement);
                        return (
                        <div className={classNames("shop-sell-item", sellable?"clickable":"disabled")} onClick={() => sellable? handleSellCrop(index): null}>
                            <div className="shop-sell-image shop-crop-image"
                            style={{backgroundPositionX : -64*index}}
                            ></div>
                            <div className="shop-sell-stock">{crop.stock} / {cropList[index].requirement}</div>
                        </div>
                    )})
                }
            </div>
        )
    }, [ores, crops]);

    const ShopBuy = useMemo(() => {

        const rqImage = (listIndex :CraftItemListIndex) => {
            switch(listIndex.list){
                case 'crops':
                    return (
                        <span className="shop-requirement-image shop-requirement-crop"
                        style={{backgroundPositionX:-32*listIndex.index}}
                        ></span>
                    )
                case 'ores':
                    return (
                        <span className="shop-requirement-image shop-requirement-ore"
                        style={{backgroundPositionX:-32*listIndex.index}}
                        ></span>
                    )
                default:
                    return (
                        <span className="shop-requirement-image shop-requirement-item"
                        style={{backgroundPositionX : -32*itemList[listIndex.index].image[0], backgroundPositionY : -32*itemList[listIndex.index].image[1]}}
                        ></span>
                    )
            }
        }

        const merchandiseDisplay = (listIndex:MerchandiseListIndex) => {
            const merch:Merchandise = (() => {
                switch(listIndex.list){
                    case "foods":
                        return foodList[listIndex.index];
                    case "goods":
                        return goodsList[listIndex.index];
                    default:
                        return itemList[listIndex.index];
                }
            })()

            const merchImage = () => {
                switch(listIndex.list){
                    case "goods":
                        return (
                            <div className="goods-list-image"
                            style={{backgroundImage:`url(${process.env.PUBLIC_URL}/img/goods/thumbnail/${goodsList[listIndex.index].image.url}.png)`}}
                            ></div>
                        );
                    case "foods":
                        return(
                            <div className="goods-list-image goods-list-image-food" 
                            style={{backgroundPositionX : -64*foodList[listIndex.index].image[0], backgroundPositionY : -64*foodList[listIndex.index].image[1]}}
                            ></div>
                        )
                    default:
                        return(
                            <div className="goods-list-image goods-list-image-item" 
                            style={{backgroundPositionX : -48*itemList[listIndex.index].image[0], backgroundPositionY : -48*itemList[listIndex.index].image[1]}}
                            ></div>
                        )
                }
            }
            
            if(merch.shop){
                const buyable = Buyable(merch)
                return(
                    !(!buyable && buyableOnly) && !(listIndex.list==="goods" && goods[listIndex.index].stock)?
                    <div className={classNames("goods-list-item", (buyable)?"clickable":"disabled")} onClick={() => {if(buyable)handleBuyGoods(listIndex.list, listIndex.index);} }>
                        {merchImage()}
                        <p>{merch.name}</p>
                        <div className="shop-requirement-wrapper">
                            <div className="shop-requirement">
                                <span className="shop-requirement-image shop-requirement-money"></span>
                                <span className="shop-requirement-text">{merch.shop?.money}</span>
                            </div>
                            {
                                merch.shop?.items.map(item => {
                                    return (
                                        <div className="shop-requirement">
                                            {rqImage(item.item)}
                                            <span className="shop-requirement-text">{item.requirement}</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <p></p>
                    </div>:null
                )
            }
            return null;
        }

        return (
            <div className="goods-list">
                {
                    goodsList.map((_, i) => merchandiseDisplay({list:"goods", index:i}) )
                }
                {
                    itemList.map((_, i) => merchandiseDisplay({list:"items", index:i}) )
                }
                {
                    foodList.map((_, i) => merchandiseDisplay({list:"foods", index:i}) )
                }

                {
                    Object.keys(enchants).map((enchant: keyof SystemData["enchants"], i) => {
                        if(pickaxe.enchant[enchant] < enchants[enchant].max_lv){
                            const buyable = Buyable_Enchant(enchant, pickaxe.enchant[enchant])
                            console.log(buyable)
                            return(
                                !(!buyable && buyableOnly)?
                                <div className={classNames("goods-list-item", (buyable)?"clickable":"disabled")} onClick={() => {if(buyable)enchantPickaxe(enchant)} }>
                                    <div className="goods-list-image-enchant"></div>
                                    <p>{enchants[enchant].name + (pickaxe.enchant[enchant]+1)}</p>
                                    <div className="shop-requirement-wrapper">
                                        <div className="shop-requirement">
                                            <span className="shop-requirement-image shop-requirement-money"></span>
                                            <span className="shop-requirement-text">{enchants[enchant].price[pickaxe.enchant[enchant]]}</span>
                                        </div>
                                        <div className="shop-requirement">
                                            <span className="shop-requirement-image shop-requirement-item"
                                            style={{backgroundPositionX : -32*itemList[bookIndex].image[0], backgroundPositionY : -32*itemList[bookIndex].image[1]}}></span>
                                            <span className="shop-requirement-text">1</span>
                                        </div>
                                        <div className="shop-requirement">
                                            <span className="shop-requirement-image shop-requirement-lv"></span>
                                            <span className="shop-requirement-text">{enchants[enchant].price[pickaxe.enchant[enchant]]}</span>
                                        </div>
                                    </div>
                                </div>:null
                            )
                        }else return null;
                    })
                }

                {
                    roomList.map((room, i) => {
                        if(!rooms[i].unlocked){
                            const buyable = Buyable_Map(i) //金とアイテムがあるか？
                            return(
                                !(!buyable && buyableOnly)?
                                <div className={classNames("goods-list-item", (buyable)?"clickable":"disabled")} onClick={() => {if(buyable)BuyMap(i);} }>
                                    <div className="goods-list-image-map"></div>
                                    <p>{roomList[i].name}のマップ</p>
                                    <div className="shop-requirement-wrapper">
                                        <div className="shop-requirement">
                                            <span className="shop-requirement-image shop-requirement-money"></span>
                                            <span className="shop-requirement-text">{roomList[i].unlock.money}</span>
                                        </div>
                                        {
                                            roomList[i].unlock.items.map(item => {
                                                return (
                                                    <div className="shop-requirement">
                                                        {rqImage({list:"items", index:item})}
                                                        <span className="shop-requirement-text">{1}</span>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>:null
                            )
                        }
                        return null;
                    })
                }
            </div>
        )
    }, [goods, money, buyableOnly])

    return useMemo (() => (
        <div className={classNames("shop-menu", shopMode==="buy"?"buy":"sell" )}>
            <div className="shop-option">
                {
                    (shopMode === "buy")?
                    <div className="shop-option-content">
                        <div className="shop-option-title">
                            <span  className="shop-option-change button" onClick={() => handleModeClick("sell")}>切替</span>
                            商品を買う
                        </div>
                        <div className="toggle-buyable-wrapper" onClick={() => setBuyableOnly(!buyableOnly)}>
                            <span className={classNames("toggle-buyable clickable", buyableOnly?"buyable-only":"" )}></span>
                            <span >買えるものだけ</span>
                        </div>
                    </div>
                    : 
                    <div className="shop-option-content">
                        <div className="shop-option-title">
                            <span  className="shop-option-change button" onClick={() => handleModeClick("buy")}>切替</span>
                            持ち物を売る
                            </div>
                    </div>
                }
            </div>
            <SimpleBar className="shop-list-wrapper">
                {(shopMode === "buy")? ShopBuy: ShopSell}
            </SimpleBar>
        </div>
    ), [shopMode, goods, money, ores, crops]);
};

export default ShopMenu;