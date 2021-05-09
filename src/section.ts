import Decimal from "decimal.js";

export function getSectionCrossedPrices(priceBefore: Decimal, priceAfter: Decimal, diff: Decimal): Decimal[] {
    // 区切れとなる値段を横切った場合は横切った区切れの価格のリストを返却する
    // 区切れとなる値段 = diffの倍数
    const sectionBefore: Decimal = Decimal.floor(priceBefore.dividedBy(diff.toNumber()).toNumber())
    const sectionAfter: Decimal = Decimal.floor(priceAfter.dividedBy(diff.toNumber()).toNumber())
    if (sectionBefore == sectionAfter) {
        return []
    }

    let response: Decimal[] = []
    // 区画は [,) で考える。つまり、例えばdiffが5のとき、10≦x<15 のときその区間に居るとする。
    // 上がった
    if (sectionBefore < sectionAfter) {
        for (let i: Decimal = sectionBefore.add(1); i <= sectionAfter; i = i.add(1)) {
            response.push(new Decimal(i).times(diff.toNumber()))
        }
        // 下がった
    } else {
        for (let i: Decimal = sectionBefore; i > sectionAfter; i = i.minus(1)) {
            response.push(new Decimal(i).times(diff.toNumber()))
        }
    }

    return response
}
