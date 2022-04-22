import React, { useState, useMemo } from "react";
import { useDataContext, getCropList, getOreList, getItemList } from '../Contexts/DataContext';
import { CraftedListIndex } from "../ts/SystemData";
import DetailDisplay from "./DetailDisplay";

const itemList = getItemList();


const ItemMenu = () => {
    const { 
        userData:{
            items,
        },
        } = useDataContext();
    const [selected, setSelected] = useState<CraftedListIndex>({list: "items", index: -1});

    const itemStatus = useMemo(() => {
        return (
            <div className="item-frame-container">
                {
                    items.map((item, index) => {
                        return (
                            <div className="item-frame" onClick={() => HandleSelect(index)}>
                                <div className="item-image" 
                                    style={{backgroundPositionX : -32*itemList[index].image[0], backgroundPositionY : -32*itemList[index].image[1]}}
                                ></div>
                                <span className="item-image-stock" >{item.stock}</span>
                            </div>
                        )
                    })
                }
            </div>
        )
    }, [items])

    const HandleSelect = (index: number) => {
        const craftedListIndex: CraftedListIndex = {
            list: "items",
            index: index
        }
        setSelected(craftedListIndex);
    }


    return (
        <div className="right-menu-content">
            <div className="right-menu-title"><span>アイテム</span></div>
            {itemStatus}
            <DetailDisplay selected={selected}></DetailDisplay>
        </div>
    );
}

export default ItemMenu;