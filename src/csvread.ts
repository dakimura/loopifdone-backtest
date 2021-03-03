import * as fs from "fs"
import csvSync = require("csv-parse/lib/sync")


export default class DataReader {
    static readCsv(inputFilePath: string):any {
        const data = fs.readFileSync(inputFilePath)
        return csvSync(data)
    }
}
