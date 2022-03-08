import React, { useState, useMemo } from "react";
import { Stage, Layer, Text, Rect, Image, Group } from 'react-konva';

import { useDataContext, getCropList, getOreList } from './DataContext';
import { calcLotPrice } from "./utils";

const cropList = getCropList();
const oreList = getOreList();

const toolImage = (() => {
    const image = new window.Image();
    image.src = `${process.env.PUBLIC_URL}/img/others/tools.png`;
    return image;
})()

const oreImage = (() => {
    const image = new window.Image();
    image.src = `${process.env.PUBLIC_URL}/img/others/ores.png`;
    return image;
})()

const cropImage = (() => {
    const image = new window.Image();
    image.src = `${process.env.PUBLIC_URL}/img/others/crops.png`;
    return image;
})()



const FarmMonitor = () => {
    const { 
        money, Buy, Sell,
        exp,
        ores, setOres,
        crops, setCrops
        } = useDataContext();

    const redstone_idx = 5; //ベタ打ちなので後で変える


    //ここから、後で隔離する場所
    const [timer, setTimer] = useState(null as any);

    const handleMouseDown = (event: any) => {
        //event.preventDefault();
        setTimer(setInterval(() => {
            handleMine();
        }, 600) ); //この600は道具をアップグレードすると変わる
        return false;
    };
    const handleMouseUp = (event: any) => {
        //event.preventDefault();
        clearInterval(timer);
        return false;
    };

    //ここまで

    const handleMine = () => {
        //鉱石の確率の処理きたないので後で変える
        setOres(ores => ores.map((item, i)=> {
            const r: Number = Math.random();
            const drop = Math.ceil(Math.random() * oreList[i].drop)
            return r < oreList[i].odds
            ? {...ores[i], stock: (ores[i].stock + drop)}
            : ores[i];
        }));
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

    const oreCounter = useMemo( () => ores.map((item, i) => {
        return (
            <Group>
                <Rect 
                    x={0} y={64+32*i}
                    width={32}
                    height={32}
                    fillPatternImage={oreImage}
                    fillPatternOffset={{x:32*i, y:0}}
                />
                <Text x={32} y={64+32*i} text={ores[i].stock.toString()} fontSize={15} />
                {
                    (() => {
                        if(oreList[i].sellable){
                            if(ores[i].stock < oreList[i].amount){
                                //売れない
                                return <Text x={64} y={64+32*i} text={oreList[i].amount.toString()} 
                                fill={"gray"} fontSize={15} />
                            }else{
                                return <Text x={64} y={64+32*i} text={oreList[i].amount.toString()} 
                                fill={"black"} onClick={() => handleSellOre(i)} fontSize={15} />
                            }
                        }
                        return null
                    })()
                }
            </Group>
        )
    }), [ores, money]);

    /*const cropRows = useMemo( () => crops.map((item, i_c) => {
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
        ) : null; clip={{width: 160, height: 64}}
    }), [crops, money]);*/
    const cropRows = useMemo( () => crops.map((item, i_c) => {

        const lotPrice = calcLotPrice(crops[i_c].lots.length);

        const Lots = (() =>{
            return (
            <Group x={80} >
                    {
                        money >= lotPrice
                        ? <Rect width={16} height={16} fill="black" onClick={() => handleBuyLot(i_c)} />
                        : <Rect width={16} height={16} fill="gray"/>
                    }
                    {
                        crops[i_c].lots.map((l: number, i_l) => {
                        return l >= cropList[i_c].max_age
                        ? (<Rect width={16} height={16} fill="yellow" x={ 16 + i_l * 16} onClick={() => Harvest(i_c, i_l)} />)
                        : (<Rect width={16} height={16} fill="green" x={ 16 + i_l * 16} />)
                        })
                    }
            </Group>
            )
        })();

        return crops[i_c].unlocked ? (
            <Group y={256}>
                <Rect 
                    x={0} y={64*i_c}
                    width={64}
                    height={64}
                    fillPatternImage={cropImage}
                    fillPatternOffset={{x:64*i_c, y:0}}
                />
                <Text x={64} y={64*i_c} text={crops[i_c].stock.toString()} fontSize={15} />
                {
                    (crops[i_c].stock < cropList[i_c].amount)
                    ? <Text fill={"gray"} x={64} y={16+64*i_c} text={cropList[i_c].amount.toString()}/>
                    : <Text fill={"black"} x={64} y={16+64*i_c} text={cropList[i_c].amount.toString()} onClick={() => handleSellCrop(i_c)} />
                }
                {
                    (ores[redstone_idx].stock<1 || crops[i_c].redstone >=crops[i_c].lots.length)
                    ? <Text fill={"gray"} x={64} y={32+64*i_c} text={crops[i_c].redstone + "/" + crops[i_c].lots.length}/>
                    : <Text fill={"black"} x={64} y={32+64*i_c} text={crops[i_c].redstone + "/" + crops[i_c].lots.length} onClick={() => buyAutoHarvest(i_c)}/>
                }
                
                {Lots}
            </Group>
        ): null
    }), [crops, money]);

    return(
        <div style={{display:"inline-block"}}>
            <Stage width={320} height={480}>
            <Layer>
                <Rect
                    x={64}
                    width={64}
                    height={64}
                    fillPatternImage={toolImage}
                    fillPatternOffset={{x:0, y:0}}
                    onMouseDown={handleMouseDown} 
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleMouseDown} 
                    onTouchEnd={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchMove={handleMouseUp}
                />
                {oreCounter}
                {cropRows}
            </Layer>
            </Stage>
        </div>
    );
};

export default FarmMonitor;