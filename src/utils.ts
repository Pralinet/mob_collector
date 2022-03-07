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
