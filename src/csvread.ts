import * as fs from "fs"
import csvSync = require("csv-parse/lib/sync")
import * as csv from 'fast-csv'
import OHLCV from "./model";
import Decimal from "decimal.js";

let results = [];


export default class DataReader {
    static readCsv(inputFilePath: string): any {
        const data: Buffer = fs.readFileSync(inputFilePath)
        return csvSync(data)
    }

    static readCSVLines(inputFilePath: string, onRead: (ohlcv: OHLCV) => void): any {

        let parser = csv.parseFile(inputFilePath, { headers: ["date", "open", "high", "close", "low", "volume"] })
            .on("data", function (record) {
                const ohlcv: OHLCV = new OHLCV(new Decimal(Date.parse(record["date"].replace(".", "-"))).dividedBy(1000), // epoch
                    new Decimal(record["open"]), // open
                    new Decimal(record["high"]), // high
                    new Decimal(record["close"]), // low
                    new Decimal(record["low"]), // close
                    new Decimal(record["volume"]), // volume
                )
                // do synchronously
                parser.pause()
                onRead(ohlcv)
                parser.resume()
            })
            .on("end", function () {
                console.log('end of the csv file');
            });

    }
}
