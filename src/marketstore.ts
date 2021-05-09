import {Client, Column, DataType, ListSymbolsFormat, Params} from "jsmarketstore";
import OHLCV from "./model";
import * as csv from "fast-csv";
import Decimal from "decimal.js";


export class MarketstoreClient {
    private readonly _client: Client


    constructor(baseURL: string) {
        this._client = new Client(baseURL)
    }

    loadCSV(inputFilePath: string, symbol: string, timeframe: string): any {
        const client: Client = this._client
        const tbk: string = symbol + "/" + timeframe + "/OHLCV"
        let cnt: number = 0
        let bulkRecords: number[][] = []

        let parser = csv.parseFile(inputFilePath, {headers: ["date", "open", "high", "close", "low", "volume"]})
            .on("data", function (record) {
                const ohlcv: OHLCV = new OHLCV(new Decimal(Date.parse(record["date"].replace(".", "-"))).dividedBy(1000),
                    new Decimal(record["open"]), // open
                    new Decimal(record["high"]), // high
                    new Decimal(record["close"]), // low
                    new Decimal(record["low"]), // close
                    new Decimal(record["volume"]), // volume
                )
                parser.pause()
                cnt++
                // push a record
                bulkRecords.push(
                    [
                        ohlcv.epochSec.toNumber(),
                        ohlcv.open.toNumber(),
                        ohlcv.high.toNumber(),
                        ohlcv.low.toNumber(),
                        ohlcv.close.toNumber(),
                        ohlcv.volume.toNumber(),
                    ]
                )

                // write
                if (cnt % 1000 == 0) {
                    // do synchronously
                    client.write(
                        [
                            ['Epoch', DataType.INT64],
                            ['Open', DataType.FLOAT32],
                            ['High', DataType.FLOAT32],
                            ['Low', DataType.FLOAT32],
                            ['Close', DataType.FLOAT32],
                            ['Volume', DataType.INT64],

                        ],
                        bulkRecords,
                        tbk,
                        false,
                    ).catch((reason: any) => {
                        console.log("failed to write data:" + reason)
                    }).then(() => {
                        console.log('write data to ' + tbk + '. cnt=' + cnt)
                        bulkRecords = []
                        parser.resume()
                    })
                } else {
                    parser.resume()
                }
            })
            .on("end", function () {
                console.log('end of the csv file');
            });
    }

    query(symbol: string, timeframe: string, attributeGroup: string, date: Date): Promise<Map<number, Column>> {
        const dayStartEpochSec: number = date.getTime() / 1000
        const dayEndEpochSec: number = dayStartEpochSec + 24 * 60 * 60 - 1

        const params: Params = new Params(symbol, timeframe, attributeGroup, dayStartEpochSec, dayEndEpochSec)
        return this._client.query(params)
    }

    write(symbol: string, timeframe: string, ohlcv: OHLCV): Promise<void> {
        const tbk: string = symbol + "/" + timeframe + "/OHLCV"
        return this._client.write(
            [
                ['Epoch', DataType.INT64],
                ['Open', DataType.FLOAT32],
                ['High', DataType.FLOAT32],
                ['Low', DataType.FLOAT32],
                ['Close', DataType.FLOAT32],
                ['Volume', DataType.INT64],

            ],
            [
                [ohlcv.epochSec.toNumber(), ohlcv.open.toNumber(), ohlcv.high.toNumber(), ohlcv.low.toNumber(), ohlcv.close.toNumber(), ohlcv.volume.toNumber()],
            ],
            tbk,
            false,
        )
        // .catch((reason: any) => {
        //     console.log("failed to write data:" + reason)
        // })
        // .then(() => {
        //     console.log('write data to ' + tbk + '.')
        //     return cli.listSymbols(ListSymbolsFormat.Symbol)
        // })
    }

}