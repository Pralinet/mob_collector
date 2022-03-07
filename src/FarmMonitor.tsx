import React from "react";

import { useDataContext, getCropList, getOreList } from './DataContext';
import { calcLotPrice } from "./utils";

const cropList = getCropList();
const oreList = getOreList();

const FarmMonitor = () => {
    const { 
        money, Buy, Sell,
        exp,
        ores, setOres,
        crops, setCrops
        } = useDataContext();

    const redstone_idx = 5; //ベタ打ちなので後で変える

    const handleMine = () => {
        const newOreList = ores.map((item, i)=> {
            const r: Number = Math.random();
            const drop = Math.ceil(Math.random() * oreList[i].drop)
            return r < oreList[i].odds
            ? {...ores[i], stock: (ores[i].stock + drop)}
            : ores[i];
        })
        setOres(newOreList);
    };

    const handleSellOre = (index: number) => {
        Sell("ore", index);
    }
    const handleSellCrop = (index: number) => {
        Sell("crop", index);
    }

    const handleBuyLot = (index: number) => {
        Buy("crop", index);
    }

    const Harvest = (cropIdx:number, lotIdx:number) => {
        const newCrops = crops.map((item, i_c) => {
            return (i_c === cropIdx)
            ? { ...item, lots: item.lots.map((l, i_l) => i_l==lotIdx? 0: l ), stock: (item.stock+1) }
            : item;
        });
        setCrops(newCrops);
    }

    const buyAutoHarvest = (cropIdx:number) => {
        const newCrops = crops.map((item, i_c) => {
            return (i_c === cropIdx)
            ? { ...item, redstone:  item.redstone + 1}
            : item;
        });
        setCrops(newCrops);

        const newOres = ores.map((item, i)=> {
            return i === redstone_idx
            ? {...item, stock: (item.stock - 1)}
            : item;
        })
        setOres(newOres);
    }

    const oreCounter = ores.map((item, i) => {
        return oreList[i].sellable
        ? (
            <div key={oreList[i].id}>
                {oreList[i].name} : {ores[i].stock}個 : 売却単位:{oreList[i].amount}個
                <button onClick={() => handleSellOre(i)} disabled={(ores[i].stock < oreList[i].amount)}>売る</button>
            </div>
        )
        : (
            <div key={oreList[i].id}>
                {oreList[i].name} : {ores[i].stock}個
            </div>
        )
    });

    const cropRows = crops.map((item, i_c) => {
        const Lots = crops[i_c].lots.map((l: number, i_l) => {
            return l === cropList[i_c].max_age
            ? (<button onClick={() => Harvest(i_c, i_l)} >●</button>)
            : l;
        });

        const lotPrice = calcLotPrice(crops[i_c].lots.length);

        return crops[i_c].unlocked ? (
            <div key={cropList[i_c].id}>
                <div>
                    {cropList[i_c].name} : {crops[i_c].stock}個 : 土地{crops[i_c].lots.length}マス : {lotPrice}エメ
                    :売却単位{cropList[i_c].amount}個
                    <button onClick={() => handleSellCrop(i_c)} disabled={(crops[i_c].stock < cropList[i_c].amount)}>売る</button><br/>
                    自動収穫{crops[i_c].redstone}/{crops[i_c].lots.length}
                    <button disabled={ores[redstone_idx].stock<1 || crops[i_c].redstone >=crops[i_c].lots.length} onClick={() => buyAutoHarvest(i_c)}>+</button>
                </div>
                <div>
                    {Lots}
                    <button disabled={money < lotPrice} onClick={() => handleBuyLot(i_c)}>+</button>
                </div>
            </div>
        ) : null;
    });

    return(
        <div>
            作業モニタ
            <div>所持金:{money}</div>
            <div>経験値:{exp}</div>
            <div>
                <button onClick={handleMine}>採掘</button>
                {oreCounter}
            </div>
            <div>
                {cropRows}
            </div>
        </div>
    );
};

export default FarmMonitor;