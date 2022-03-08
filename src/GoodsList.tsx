import React from "react";

import { useDataContext, getGoodsList } from './DataContext';

const goodsList = getGoodsList();

const GoodsList = () => {
    const { goods, money, Buy, exp } = useDataContext();

    const handleBuyGoods = (index: number) => {
        Buy("goods", index);
    }

    const goodsItems = goodsList.map((item, i) => {
        const disabled = goods[i].is_sold || (money < goodsList[i].price)
        return(
            <button disabled={disabled} onClick={() => handleBuyGoods(i)}>{goodsList[i].name}{goodsList[i].price}</button>
        )
    });

    return(
        <div>
            グッズ一覧
            <div>   
                {goodsItems}
            </div>
        </div>
    );
};

export default GoodsList;