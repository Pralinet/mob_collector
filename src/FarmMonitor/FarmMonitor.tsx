import React, { useState, useMemo } from "react";

import { useDataContext, getCropList, getOreList, getPickaxeList } from '../Contexts/DataContext';
import { calcLotPrice } from "../utils";
import classNames from "classnames";

import './FarmMonitor.css';
import ReactTooltip from "react-tooltip";

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
                                ?<span className="ore-counter-upgrade" onClick={() => upGradePickaxe(ore.id)}
                                data-for='farm-tooltip' data-tip="グレードアップ" >↑</span>: null
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
            return crops[i_c].lots.length?(
            <div className="crop-meter">
                <div className="crop-meter-mature" style={{width: (cropCount/crops[i_c].lots.length*64)}}></div>
                <div className="crop-meter-redstone" style={{width: (crops[i_c].redstone/crops[i_c].lots.length*64)}}></div>
            </div>
            ): (
                <div className="crop-meter hidden"></div>
            )
        })();

        return crops[i_c].unlocked ? (
            <div className="crop-column">
                <div className="crop-space">
                    <div className={classNames("crop", cropCount>0?"clickable":"")} style={{backgroundPositionX:-64*i_c}}
                    onClick={() => Harvest(i_c)} 
                    data-for='farm-tooltip' data-tip="収穫"
                    ></div>
                    <span className="crop-text" >{crops[i_c].stock}</span>
                </div>
                {Lots}

                <div className="crop-counter-control">
                    <span className="crop-counter-item-wrapper">
                        {
                            money >= lotPrice
                            ? <span className="crop-counter-item crop-counter-hoe clickable" 
                            onClick={() => handleBuyLot(i_c)}
                            data-for='farm-tooltip' data-html={true}
                            data-tip={"耕地を増やす<br/><span class='emerald'></span>" + lotPrice}
                            ></span>
                            : <span className="crop-counter-item crop-counter-hoe disabled" 
                            data-for='farm-tooltip' data-html={true}
                            data-tip={"耕地を増やす<br/><span class='emerald'></span>" + lotPrice}
                            ></span>
                            
                        }
                        <span className="crop-counter-text">{crops[i_c].lots.length}</span>
                    </span>
                    <span className="crop-counter-item-wrapper">
                        {
                            (ores[redstone_idx].stock<1 || crops[i_c].redstone >=crops[i_c].lots.length)
                            ? <span className="crop-counter-item crop-counter-redstone disabled" 
                            data-for='farm-tooltip' data-tip="自動収穫"></span>
                            : <span className="crop-counter-item crop-counter-redstone clickable" 
                            onClick={() => buyAutoHarvest(i_c)}
                            data-for='farm-tooltip' data-tip="自動収穫"
                            ></span>
                        }
                        <span className="crop-counter-text">{crops[i_c].redstone}</span>
                    </span>
                </div>

            </div>
        ):(
            <div className="crop-column">
                <div className="crop-space">
                    <div className="crop locked" style={{backgroundPositionX:-64*i_c}}></div>
                    <span className="crop-text" >locked</span>
                </div>
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
                data-for='farm-tooltip' data-tip="採掘"
            ></div>
            <div className="durability-meter">
                <div className="durability-meter-content" style={{width: (pickaxe.durability/pickaxeList[pickaxe.material].durability*64)}}></div>
            </div>
            <div className="pickaxe-enchant-container">
                <span className="pickaxe-enchant">
                    <span className="pickaxe-enchant-image pickaxe-enchant-image-efficiency"
                        data-for='farm-tooltip' data-tip="効率強化"></span>
                    <span className="pickaxe-enchant-text">{pickaxe.enchant.efficiency}</span>
                </span>
                <span className="pickaxe-enchant">
                    <span className="pickaxe-enchant-image pickaxe-enchant-image-unbreaking"
                        data-for='farm-tooltip' data-tip="耐久力"></span>
                    <span className="pickaxe-enchant-text">{pickaxe.enchant.unbreaking}</span>
                </span>
                <span className="pickaxe-enchant">
                    <span className="pickaxe-enchant-image pickaxe-enchant-image-fortune"
                        data-for='farm-tooltip' data-tip="幸運"></span>
                    <span className="pickaxe-enchant-text">{pickaxe.enchant.fortune}</span>
                </span>
                <span className="pickaxe-enchant">
                    <span className="pickaxe-enchant-image pickaxe-enchant-image-mending"
                        data-for='farm-tooltip' data-tip="修繕"></span>
                    <span className="pickaxe-enchant-text">{pickaxe.enchant.mending}</span>
                </span>
            </div>
        </div>
        );
    }, [pickaxe, mining])

    return(
        <div className="farm-monitor">
            <div className="farm-monitor-inner">
                {cropColumns}
                {pickaxeContainer}
                {oreCounter}
                <ReactTooltip id='farm-tooltip' ></ReactTooltip>
            </div>
        </div>

);

}

export default FarmMonitor;