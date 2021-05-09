
import Decimal from "decimal.js";
import {Run, PairSetting, CurrencyPair, TradeMode, Output} from "./index";

const marketStoreBaseURL: string = "http://localhost:5993/rpc"
const diff: Decimal = new Decimal("0.15")
const spread: Decimal = new Decimal("0.001")
const lot: Decimal = new Decimal("1000")
const ps: PairSetting[] = [new PairSetting(CurrencyPair.USDJPY, diff, spread, new Decimal("1000"), TradeMode.Buy)]
const startDate: Date = new Date("2020-01-01")
const endDate: Date = new Date("2021-01-01")

Run(ps, marketStoreBaseURL, startDate, endDate)
    .then((output: Output) => {
        console.log(output.pairStatuses)
    }).catch((reason: any) => {
    console.trace("failed to run backtest:" + reason)
})