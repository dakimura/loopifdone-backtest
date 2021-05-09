import Decimal from "decimal.js";
import {CurrencyPair, TradeMode} from "./input";


export class Output {
    // PairStatuses[5][3] = result of the 5th day of the currency Pair set at 3rd
    private readonly _pairStatuses: PairStatus[][]

    constructor(pairStatuses: PairStatus[][]) {
        this._pairStatuses = pairStatuses;
    }

    get pairStatuses(): PairStatus[][] {
        return this._pairStatuses;
    }
}

export class PairStatus {
    private _date: Date
    private _currentPrice: Decimal
    private _minPrice: Decimal
    private _maxPrice: Decimal
    private _earning: Decimal
    private _lastCrossedSection: Decimal
    private _unrealizedLoss: number

    constructor(date: Date, currentPrice: Decimal, minPrice: Decimal, maxPrice: Decimal, earning: Decimal, lastCrossedSection: Decimal,
                unrealizedLoss: number,
    ) {
        this._date = date;
        this._currentPrice = currentPrice;
        this._minPrice = minPrice;
        this._maxPrice = maxPrice;
        this._earning = earning;
        this._lastCrossedSection = lastCrossedSection;
        this._unrealizedLoss = unrealizedLoss
    }

    get date(): Date {
        return this._date;
    }

    get currentPrice(): Decimal {
        return this._currentPrice;
    }

    get minPrice(): Decimal {
        return this._minPrice;
    }

    get maxPrice(): Decimal {
        return this._maxPrice;
    }

    get earning(): Decimal {
        return this._earning;
    }

    get lastCrossedSection(): Decimal {
        return this._lastCrossedSection;
    }

    get unrealizedLoss(): number {
        return this._unrealizedLoss;
    }

    set date(value: Date) {
        this._date = value;
    }

    set currentPrice(value: Decimal) {
        this._currentPrice = value;
    }

    set minPrice(value: Decimal) {
        this._minPrice = value;
    }

    set maxPrice(value: Decimal) {
        this._maxPrice = value;
    }

    set earning(value: Decimal) {
        this._earning = value;
    }

    set lastCrossedSection(value: Decimal) {
        this._lastCrossedSection = value;
    }

    set unrealizedLoss(value: number) {
        this._unrealizedLoss = value;
    }

    public calculateUnrealizedLoss(mode: TradeMode, lot: Decimal, diff: Decimal): number {
        let unrealizedLoss: number = 0
        if (mode == TradeMode.Buy || mode == TradeMode.Cross) {
            const fluctuation: number = this.maxPrice.toNumber() - this.currentPrice.toNumber()
            unrealizedLoss = unrealizedLoss + lot.mul(fluctuation).mul(fluctuation).dividedBy(diff.mul(2)).toNumber() // 1/0.15 * 1000 * x * x / 2 ってよく脳内で計算してたやつ
        }

        if (mode == TradeMode.Sell || mode == TradeMode.Cross) {
            const fluctuation: number = this.currentPrice.minus(this.minPrice.toNumber()).toNumber()
            unrealizedLoss = unrealizedLoss + lot.mul(fluctuation).mul(fluctuation).dividedBy(diff.mul(2)).toNumber()
        }

        this._unrealizedLoss = unrealizedLoss
        return unrealizedLoss
    }
}