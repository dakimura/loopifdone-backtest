import {loadAsync} from 'jszip';
import * as JSZip from "jszip";
import {readFileSync} from "fs";
import {MarketstoreClient} from "../marketstore";
import DataReader from "../csvread";
import OHLCV from "../model";


const baseURL: string = 'http://localhost:5993/rpc'
const pairs: string[] = ["AUDCHF", "AUDJPY", "AUDNZD", "AUDUSD", "CADJPY", "CHFJPY", "EURAUD", "EURCAD", "EURCHF", "EURGBP", "EURJPY", "EURUSD", "GBPAUD", "GBPJPY", "GBPUSD", "MXNJPY", "NZDJPY", "NZDUSD", "USDCAD", "USDCHF", "USDJPY", "ZARJPY"]
const cli: MarketstoreClient = new MarketstoreClient(baseURL)

for (let i: number = 0; i < pairs.length; i++) {
    const pair: string = pairs[i]
    console.log("pair=" + pair)
    cli.loadCSV("./src/tools/data/" + pair + "_M1.csv", pair, "1Min")
}
//
// DataReader.readCSVLines("./src/tools/data/" + pair + "_M1.csv", (ohlcv: OHLCV) => {
//     cli.write(pair, "1Min", ohlcv)
//         .catch((reason: any) => {
//             console.log("failed to write data:" + reason)
//         })
//         .then(() => {
//             console.log(ohlcv)
//         })
// })
