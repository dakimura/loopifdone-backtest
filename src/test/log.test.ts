import Decimal from "decimal.js";
import {getSectionCrossedPrices} from "../section";
import {getStringFromDate} from "../log";

// const table = [
//     {
//         before: new Decimal(70.3),
//         after: new Decimal(70.48),
//         diff: new Decimal(0.15),
//         crossedPrices: [new Decimal(70.35)],
//     },
//     {
//         before: new Decimal(70.48),
//         after: new Decimal(70.3),
//         diff: new Decimal(0.15),
//         crossedPrices: [new Decimal(70.35)],
//     },
//     {
//         before: new Decimal(70.3),
//         after: new Decimal(70.9),
//         diff: new Decimal(0.15),
//         crossedPrices: [new Decimal(70.35), new Decimal(70.5), new Decimal(70.65), new Decimal(70.8)]
//     },
//     {
//         before: new Decimal(70.9),
//         after: new Decimal(70.3),
//         diff: new Decimal(0.15),
//         crossedPrices: [new Decimal(70.8), new Decimal(70.65), new Decimal(70.5), new Decimal(70.35)]
//     },
//     {
//         before: new Decimal(70.35),
//         after: new Decimal(70.35),
//         diff: new Decimal(0.15),
//         crossedPrices: []
//     },
//     {
//         before: new Decimal(70.35),
//         after: new Decimal(70.36),
//         diff: new Decimal(0.15),
//         crossedPrices: []
//     },
//     {
//         before: new Decimal(70.35),
//         after: new Decimal(70.34),
//         diff: new Decimal(0.15),
//         crossedPrices: [new Decimal(70.35)]
//     },
// ]
// test("getSectionCrossed", () => {
//     for (const {before, after, diff, crossedPrices} of table) {
//         expect(getSectionCrossedPrices(before, after, diff)).toStrictEqual(crossedPrices)
//     }
// })

const table = [
    {
        input: "2021-2-1",
        output: "2021-02-01"
    },
    {
        input: "1992-12-10",
        output: "1992-12-10"
    }
]
test("getStringFromDate", () => {
    for (const {input, output} of table) {
        expect(getStringFromDate(new Date(input))).toBe(output)
    }
})