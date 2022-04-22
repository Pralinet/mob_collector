import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

export interface IFrameContext {
    goodsIndex: number;
    setGoodsIndex: (index:number) => void;
    foodIndex: number;
    setFoodIndex: (index:number) => void;
}

const FrameContext = createContext({} as IFrameContext);

export function useFrameContext() {
    return useContext(FrameContext);
}

export function FrameProvider({ children }: any) {

    const[goodsIndex, setGoodsIndex] = useState(-1);
    const[foodIndex, setFoodIndex] = useState(-1);

    const value = {
        goodsIndex, setGoodsIndex, 
        foodIndex, setFoodIndex,
    };

    return (
        <FrameContext.Provider value={value}>
            {children}
        </FrameContext.Provider>
    );
}