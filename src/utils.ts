import { ListIndex } from "./ts/CommonData";

//ロットの値段の計算
export function calcLotPrice(lotlen: number) {
    return Math.floor(Math.pow(1.1, (lotlen + 1)));
}

//idからインデックスを計算
export function getIndex(id: string, list: any[]) {
    return list.findIndex(item => item.id == id);
}


//idを含むインデックスを計算
export function getIndexes(id: string, list: any[], ) {
    var indexes: number[] = [];
    list.map(function(item, index, array) {
        if (item.goods.includes(id)) {
            indexes.push(index);
        }
    })
    return indexes;
}

//レベルから必要なEXPを計算
export function calcExp(lv: number) {
    const nextLv = lv + 1;
    if(nextLv < 16) return Math.floor(1.5 * Math.pow(nextLv,2) + 9*nextLv);
    else if(nextLv < 31) return 3 * Math.pow(nextLv,2) - 40*nextLv + 400;
    else return 5 * Math.pow(nextLv,2) - 160*nextLv + 2200;
}

//効率性の倍率の計算

//耐久値の倍率の計算

//