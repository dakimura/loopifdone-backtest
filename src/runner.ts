import Decimal from "decimal.js";
import DataReader from "./csvread";
import OHLCV from "./model";
import {Output, PairStatus} from "./output";
import {getSectionCrossedPrices} from "./section";
import {CurrencyPair, PairSetting, TradeMode} from "./input";
import {Client, Column} from "jsmarketstore";
import {MarketstoreClient} from "./marketstore";
import * as log4js from 'log4js'
import {logResult} from "./log";

const logger = log4js.getLogger();
logger.level = 'debug';

// function parseCSVLine(line: string[]): OHLCV {
//     // line = e.g. [ '2012.04.11 12:04', '1.25715', '1.25725', '1.25710', '1.25715', '8' ]
//     return new OHLCV(new Decimal(Date.parse(line[0].replace(".", "-"))).dividedBy(1000), // epoch
//         new Decimal(line[1]), // open
//         new Decimal(line[2]), // high
//         new Decimal(line[3]), // low
//         new Decimal(line[4]), // close
//         new Decimal(line[5]), // volume
//     )
// }

/**
 * Loop-If-Done backtest
 * [input values]
 * - Period
 *      - Start date
 *      - End date
 * - PairSetting[]
 *      - Pair
 *      - Diff
 *      - Spread
 *      - Lot
 *      - Type(Buy,Sell, or Cross)
 *
 * [output values]
 * - Deposit Balance(=預託金残高) and Asset Valuation(=試算評価額) at the end of each day
 * 　　　- PairStatus[]
 *          - Last Section
 *          - Earning
 *          - Unrealized Loss
 */

// --- input
// const marketstoreBaseURL: string = 'http://localhost:5993/rpc'
// const startDate: Date = new Date('2015-01-01T00:00:00Z')
// const endDate: Date = new Date('2021-01-01T00:00:00Z')
// const pairSettings: PairSetting[] = [
//     // new PairSetting(CurrencyPair.USDJPY, new Decimal("0.15"), new Decimal("0.001"), new Decimal("4000"), TradeMode.Buy),
//     // new PairSetting(CurrencyPair.EURJPY, new Decimal("0.3"), new Decimal("0.005"), new Decimal("2000"), TradeMode.Sell),
//     // new PairSetting(CurrencyPair.GBPJPY, new Decimal("0.3"), new Decimal("0.01"), new Decimal("1000"), TradeMode.Buy),
//     // new PairSetting(CurrencyPair.AUDJPY, new Decimal("0.3"), new Decimal("0.004"), new Decimal("6000"), TradeMode.Buy),
//     // new PairSetting(CurrencyPair.NZDJPY, new Decimal("0.3"), new Decimal("0.009"), new Decimal("3000"), TradeMode.Buy),
//     // new PairSetting(CurrencyPair.CADJPY, new Decimal("0.3"), new Decimal("0.014"), new Decimal("3000"), TradeMode.Buy),
//     new PairSetting(CurrencyPair.AUDNZD, new Decimal("0.002"), new Decimal("0.000189"), new Decimal("8000"), TradeMode.Cross), // AUDNZDの1pipsは0.0001NZD
// ]

// Run(pairSettings, marketstoreBaseURL, startDate, endDate)


export async function Run(pairSettings: PairSetting[], marketstoreBaseURL: string, startDate: Date, endDate: Date): Promise<Output> {
    // initialize
    let pairStatusMap: Map<CurrencyPair, PairStatus[]> = new Map()
    logger.info("pair=" + pairSettings)
    const pairStatuses: PairStatus[][] = await RunBackTestFor(pairSettings, marketstoreBaseURL, startDate, endDate)

    return new Output(pairStatuses)
}

async function RunBackTestFor(pairSettings: PairSetting[], baseURL: string, startDate: Date, endDate: Date): Promise<PairStatus[][]> {
    // output[5][3] = result of the 5th day of the currency Pair set at 3rd
    let output: PairStatus[][] = Array(pairSettings.length)
    output.fill([])

    const msclient: MarketstoreClient = new MarketstoreClient(baseURL)

    // 結果をJPYベースで見たいので,基軸通貨がJPYじゃない場合(e.g. AUDNZD) は基軸通貨のレート(e.g. NZDJPY) を持っておく
    // 実際はこれも日々変わる値なので本当なら毎日データをとった方がいい。今は速度重視してサボってるだけ
    let keyRates: number[] = Array(pairSettings.length)
    keyRates.fill(1)
    let pairStatuses: PairStatus[] = []
    for (let i = 0; i < pairSettings.length; i++) {
        // initialize pairStatus
        pairStatuses.push(new PairStatus(new Date("1970-01-01"), new Decimal(0), new Decimal(9999999999), new Decimal(-9999999999), new Decimal(0), new Decimal(0), 0))

        // set keyRate
        if (pairSettings[i].pair.key != "JPY") {
            const records: Map<number, Column> = await msclient.query(pairSettings[i].pair.key + "JPY", "1Min", "OHLCV", new Date("2020-01-01"))
            keyRates[i] = records.entries().next().value[1].Open
        }

    }
    logger.debug("startDate:" + startDate)
    logger.debug("endDate:" + endDate)

    // for each day
    let idx = 0
    for (let date: Date = new Date(startDate.getTime()); date.getTime() < endDate.getTime(); date.setDate(date.getDate() + 1)) {
        output[idx] = Array(pairSettings.length)
        // for each currency pair
        for (let i = 0; i < pairSettings.length; i++) {
            // query records for one day
            const records: Map<number, Column> = await msclient.query(pairSettings[i].pair.str, "1Min", "OHLCV", date)

            // for each record
            let epochs: number[] = Array.from(records.keys());
            epochs = epochs.sort() // 1,2,3,...
            records.forEach((record: Column, key: number, map: Map<number, Column>) => {
                // console.log("key="+ key)
                pairStatuses[i] = processRecord(record, pairStatuses[i], pairSettings[i])
            })

            let unrealizedLoss: number = pairStatuses[i].calculateUnrealizedLoss(pairSettings[i].mode, pairSettings[i].lot, pairSettings[i].diff)


            //console.log(date.getUTCFullYear() + "-" + date.getUTCMonth() + "-" + date.getUTCDate() + ", " + pairStatus.earning + ", " + pairStatus.earning.minus(unrealizedLoss) + ", " + pairStatus.currentPrice)
            output[idx][i] = new PairStatus(
                new Date(date.toDateString()),
                pairStatuses[i].currentPrice,
                pairStatuses[i].minPrice,
                pairStatuses[i].maxPrice,
                pairStatuses[i].earning.mul(keyRates[i]),
                pairStatuses[i].lastCrossedSection,
                unrealizedLoss * keyRates[i],
            )

            //logResult(date, pairStatus, pairSetting, keyRate)
        }
        idx++
    }
    return output
}

// returns Crossed Section
function processRecord(record: Column, pairStatus: PairStatus, pairSetting: PairSetting): PairStatus {
    // TODO: consider not only Open but High, Low, and Close
    let priceAfter: Decimal = new Decimal(record.Open)
    let priceBefore: Decimal = pairStatus.currentPrice

    // first record
    if (priceBefore == null || priceBefore.equals(new Decimal(0)) || priceAfter.equals(new Decimal(0))) {
        pairStatus.maxPrice = priceAfter
        pairStatus.minPrice = priceAfter
        pairStatus.currentPrice = priceAfter
        pairStatus.lastCrossedSection = Decimal.floor(priceAfter.div(pairSetting.diff.toString()))
        return pairStatus
    }

    // update the max price
    if (priceAfter.greaterThan(pairStatus.maxPrice)) {
        pairStatus.maxPrice = priceAfter
    }

    // update the min price
    if (priceAfter.lessThan(pairStatus.minPrice)) {
        pairStatus.minPrice = priceAfter
    }

    // update the current price
    pairStatus.currentPrice = priceAfter

    let crossedPrices: Decimal[] = getSectionCrossedPrices(priceBefore, priceAfter, pairSetting.diff)
    let newCrossedSection: Decimal = new Decimal(0) // section ID = price/diff

    // crossed
    for (let i = 0; i < crossedPrices.length; i++) {
        if (crossedPrices[i] > priceAfter) {
            // price decreased
            newCrossedSection = Decimal.floor(priceBefore.dividedBy(pairSetting.diff.toString())) // 前に抜けたのとは違う区切り => 決済注文が約定してるはず

            // 利確を反映
            if ((pairSetting.mode == TradeMode.Sell || pairSetting.mode == TradeMode.Cross) && !pairStatus.lastCrossedSection.equals(newCrossedSection)) {
                pairStatus.earning = pairStatus.earning.add(pairSetting.diff.mul(pairSetting.lot.toString()).toString())
                //console.log("下に抜けた決済. priceBefore:" + priceBefore + ", priceAfter:" + priceAfter + ", newCrossedPrice=" + newCrossedSection.mul(pairSetting.diff) + ", lastCrossedPrice=" + pairStatus.lastCrossedSection.mul(pairSetting.diff))
            }
        } else {
            // price increased
            newCrossedSection = Decimal.floor(priceAfter.dividedBy(pairSetting.diff.toNumber()).toNumber()) // 前に抜けたのとは違う区切り => 決済注文が約定してるはず

            // 利確を反映
            if ((pairSetting.mode == TradeMode.Buy || pairSetting.mode == TradeMode.Cross) && !pairStatus.lastCrossedSection.equals(newCrossedSection)) {
                pairStatus.earning = pairStatus.earning.add(pairSetting.diff.mul(pairSetting.lot.toString()).toString())
                //console.log("上に抜けた決済. priceBefore:" + priceBefore + ", priceAfter:" + priceAfter + ", newCrossedPrice=" + newCrossedSection.mul(pairSetting.diff) + ", lastCrossedPrice=" + pairStatus.lastCrossedSection.mul(pairSetting.diff))
            }
        }
        pairStatus.lastCrossedSection = newCrossedSection
        //console.log("epochSec=" + priceAfter.epochSec + ", crossedPrices=" + crossedPrices + ", lastCrossedPrice=" + lastCrossedSection.mul(diff))

    }
    // console.log(priceAfter.open)
    priceBefore = priceAfter

    // console.log("pairStatus="+ pairStatus)
    // console.log("unrealizedLoss="+ pairStatus.calculateUnrealizedLoss(pairSetting.mode, pairSetting.lot, pairSetting.diff))

    return pairStatus
}
