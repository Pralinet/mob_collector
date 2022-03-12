import React, { useState, useMemo } from "react";
import { useDataContext, getCropList, getOreList, getItemList } from '../DataContext';

const itemList = getItemList();


const ItemMenu = () => {
    const { 
        items
        } = useDataContext();

    const itemStatus = () => {
        return items.map((item, index) => {
            return <div>{itemList[index].name}:{item.stock}</div>
        })
    }

    return (
    <div>
        {itemStatus()}
    </div>
    );
}

export default ItemMenu;