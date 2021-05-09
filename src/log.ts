import {PairStatus} from "./output";
import {PairSetting} from "./input";
import Decimal from "decimal.js";


export function logResult(date: Date, pairStatus: PairStatus, pairSetting: PairSetting, keyRate: number) {
    const unrealizedLoss: number = pairStatus.calculateUnrealizedLoss(pairSetting.mode, pairSetting.lot, pairSetting.diff)
    const dateStr = getStringFromDate(date)
    console.log(pairSetting.pair.str + ", " + dateStr + ", " + pairStatus.earning.mul(keyRate) + ", " + (pairStatus.earning.minus(unrealizedLoss)).mul(keyRate) + ", " + pairStatus.currentPrice)

}

export function getStringFromDate(date: Date): string {
    const year: string = String(date.getFullYear());
    const month: string = String(pad(date.getMonth() + 1, 2));
    const day: string = String(pad(date.getDate(), 2));

    let format_str: string = 'YYYY-MM-DD';
    format_str = format_str.replace(/YYYY/g, year);
    format_str = format_str.replace(/MM/g, month);
    format_str = format_str.replace(/DD/g, day);

    return format_str;
}

function pad(num: number, size: number): string {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}