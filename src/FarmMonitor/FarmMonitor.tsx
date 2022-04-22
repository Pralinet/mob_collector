import React, { useState, useMemo } from "react";
import { Stage, Layer, Text, Rect, Image, Group } from 'react-konva';

import { useDataContext, getCropList, getOreList, getPickaxeList } from '../Contexts/DataContext';
import { calcLotPrice } from "../utils";
import classNames from "classnames";

import './FarmMonitor.css';

const cropList = getCropList();
const oreList = getOreList();
const pickaxeList = getPickaxeList();

const FarmMonitor = () => {
    const { 
        userData:{
            player:{pickaxe, money},
            ores,
            crops
        },
        BuyCropLot,
        Mine, upGradePickaxe, Harvest, buyAutoHarvest
        } = useDataContext();

    const redstone_idx = 5; //ベタ打ちなので後で変える
    const [mining, setMining] = useState(false);


    //ここから、後で隔離する場所
    const [timer, setTimer] = useState(null as any);

    const handleMouseDown = (event: any) => {
        //event.preventDefault();
        setTimer(setInterval(() => {
            handleMine();
        }, pickaxe.time) );
        setMining(true);
        return false;
    };
    const handleMouseUp = (event: any) => {
        //event.preventDefault();
        clearInterval(timer);
        setMining(false);
        return false;
    };

    const handleMine = () => {
        Mine()
    };

    const handleBuyLot = (index: number) => {
        BuyCropLot(index);;
    }

    const handleUpGrade = (ore_id: string) => {
        upGradePickaxe(ore_id);
    }

    const handleHarvest = (cropIdx: number) => {
        Harvest(cropIdx);
    }

    const handleBuyHarvest = (cropIdx:number) => {
        buyAutoHarvest(cropIdx);
    }

    const oreCounter = useMemo( () =>  {
        return (
            <div className="ore-counter-container">
                {
                    ores.map((ore, i) =>
                        <div className="ore-counter-item-wrapper" >
                            <div className="ore-counter-item" style={{backgroundPositionX:-32*i}}></div>
                            <br/>
                            <span className="ore-counter-counter">{ore.stock.toString()}</span>
                            {
                                (oreList[i].upgradable.includes(pickaxe.material) && ore.stock >= 3)
                                ?<span className="ore-counter-upgrade" onClick={() => upGradePickaxe(ore.id)} >↑</span>: null
                            }
                        </div>
                    )
                }
            </div>
        )
    }, [ores, pickaxe.material]);

    const cropColumns = useMemo( () => crops.map((item, i_c) => {

        const lotPrice = calcLotPrice(crops[i_c].lots.length);

        let cropCount = crops[i_c].lots.reduce((prev, item) => {
            return prev + (item >= cropList[i_c].max_age ? 1 : 0) 
        }, 0)

        const Lots = (() =>{
            return (
            <div className="crop-lot">
                {cropCount} / {crops[i_c].lots.length}
            </div>
            )
        })();

        return crops[i_c].unlocked ? (
            <div className="crop-column">
                <div className="crop" style={{backgroundPositionX:-64*i_c}}
                onClick={() => Harvest(i_c)} ></div>
                {Lots}

                <div className="crop-counter-control">
                        {
                            money >= lotPrice
                            ? <span onClick={() => handleBuyLot(i_c)} >+</span>
                            : <span>+</span>
                        }
                        {
                            (ores[redstone_idx].stock<1 || crops[i_c].redstone >=crops[i_c].lots.length)
                            ? <span>r</span>
                            : <span onClick={() => buyAutoHarvest(i_c)}>r</span>
                        }
                </div>

            </div>
        ):(
            <div className="crop-column">
                <div className="crop locked" style={{backgroundPositionX:-64*i_c}}></div>
                <span>locked</span>
            </div>
        )
    }), [crops, money]);

    const pickaxeContainer = useMemo( () => {
        return (
            <div className="pickaxe-container">
            <div className={classNames("pickaxe", mining?"mining":"" )}
                style={{backgroundPositionX:-64*pickaxe.material}}
                onMouseDown={handleMouseDown} 
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown} 
                onTouchEnd={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleMouseUp}
            ></div>
            <div className="durability-meter">
                <div className="durability-meter-content" style={{width: (pickaxe.durability/pickaxeList[pickaxe.material].durability*64)}}></div>
            </div>
            <div>
                <span>{pickaxe.enchant.efficiency}</span>
                <span>{pickaxe.enchant.unbreaking}</span>
                <span>{pickaxe.enchant.fortune}</span>
                <span>{pickaxe.enchant.mending}</span>
            </div>
        </div>
        );
    }, [pickaxe, mining])

    return(
        <div className="farm-monitor">
            {cropColumns}
            {pickaxeContainer}
            {oreCounter}
        </div>

);

}

export default FarmMonitor;