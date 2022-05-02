import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

export interface IFrameContext {
    goodsIndex: number;
    chooseGoods: (index:number) => void;
    foodIndex: number;
    chooseFood: (index:number) => void;
    toggleMenu: string;
    setToggleMenu: (select:string) => void;
}

const FrameContext = createContext({} as IFrameContext);

export function useFrameContext() {
    return useContext(FrameContext);
}

export function FrameProvider({ children }: any) {

    const[goodsIndex, setGoodsIndex] = useState(-1);
    const[foodIndex, setFoodIndex] = useState(-1);
    const[toggleMenu, setToggleMenu] = useState("menu");


    const chooseGoods = (index: number) => {
        setGoodsIndex(index);
        document.addEventListener("mousedown", handleOutsideClick);
    }

    const chooseFood = (index: number) => {
        setFoodIndex(index);
        document.addEventListener("mousedown", handleOutsideClick);
    }

    const handleOutsideClick = (e: any) => {
        if(!e.target.closest('.food-list-item') && !e.target.closest('.goods-list-item')) {
            setFoodIndex(-1);
            setGoodsIndex(-1);
        } else {
            //ここに内側をクリックしたときの処理
            
        }
        document.removeEventListener("mousedown", handleOutsideClick);
    };



    const value = {
        goodsIndex, chooseGoods, 
        foodIndex, chooseFood,
        toggleMenu, setToggleMenu,
    };

    return (
        <FrameContext.Provider value={value}>
            {children}
        </FrameContext.Provider>
    );
}