import React, { useState, useMemo } from "react";
import { useDataContext, getGoodsList } from '../Contexts/DataContext';
import { useFrameContext } from "../Contexts/FrameContext";
import { CraftedListIndex } from "../ts/SystemData";
import DetailDisplay from "./DetailDisplay";

import './RightMenu.css';

const goodsList = getGoodsList();

const GoodsMenu = () => {
    const { 
        userData:{
            goods,
        },
    } = useDataContext();
    const { setGoodsIndex } = useFrameContext();
    const [selected, setSelected] = useState<CraftedListIndex>({list: "goods", index: -1});

    const goodsStatus = useMemo(() => {
        return (
            <div className="item-frame-container">
                {
                    goods.map((item, index) => {
                        //持ってる場合、表示＆選択したらroomに配置
                        if(item.stock) return (
                            <div className="goods-list-item" onClick={() => HandleChooseGoods(index) }>
                                <div className="goods-list-image"></div>
                                <p>{goodsList[index].name}</p>
                            </div>
                        )
                        //持ってなくてレシピがある場合、lockedと表示
                        else if(goodsList[index].craft)return (
                            <div className="goods-list-item locked" onClick={() => HandleChooseGoods(index) }>
                                <div className="goods-list-image"></div>
                                <p>{goodsList[index].name}</p>
                            </div>  
                        )
                    })
                }
            </div>
        )
    }, [goods])

    const handleOutsideClick = (e: any) => {
        if(!e.target.closest('.goods-list-item')) {
            //ここに外側をクリックしたときの処理
            setGoodsIndex(-1);
        } else {
            //ここに内側をクリックしたときの処理
        }
        document.removeEventListener("mousedown", handleOutsideClick);
    };

    const HandleChooseGoods = (index:number) => {
        setGoodsIndex(index);
        if(!goods[index].stock){
            const craftedListIndex: CraftedListIndex = {
                list: "goods",
                index: index
            }
            setSelected(craftedListIndex);
        }else{
            const craftedListIndex: CraftedListIndex = {
                list: "goods",
                index: -1
            }
            setSelected(craftedListIndex);
        }
        document.addEventListener("mousedown", handleOutsideClick);
    }

    return (
        <div className="right-menu-content">
            <div className="right-menu-title"><span>グッズ</span></div>
            {goodsStatus}
            <DetailDisplay selected={selected}></DetailDisplay>
        </div>
    );
}

export default GoodsMenu;