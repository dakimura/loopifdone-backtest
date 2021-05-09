import Decimal from "decimal.js";


class InputParam {
    private readonly _initialAsset: Decimal
    private readonly _startDate: Date
    private readonly _endDate: Date
    private readonly _pairSettings: PairSetting[]

    constructor(initialAsset: Decimal, startDate: Date, endDate: Date, pairSettings: PairSetting[]) {
        this._initialAsset = initialAsset;
        this._startDate = startDate;
        this._endDate = endDate;
        this._pairSettings = pairSettings;
    }

    get initialAsset(): Decimal {
        return this._initialAsset;
    }

    get startDate(): Date {
        return this._startDate;
    }

    get endDate(): Date {
        return this._endDate;
    }

    get pairSettings(): PairSetting[] {
        return this._pairSettings;
    }
}

export class PairSetting {
    private readonly _pair: CurrencyPair
    private readonly _diff: Decimal
    private readonly _spread: Decimal
    private readonly _lot: Decimal
    private readonly _mode: TradeMode

    constructor(pair: CurrencyPair, diff: Decimal, spread: Decimal, lot: Decimal, mode: TradeMode) {
        this._pair = pair;
        this._diff = diff;
        this._spread = spread;
        this._lot = lot;
        this._mode = mode;
    }

    get pair(): CurrencyPair {
        return this._pair;
    }

    get diff(): Decimal {
        return this._diff;
    }

    get spread(): Decimal {
        return this._spread;
    }

    get lot(): Decimal {
        return this._lot;
    }

    get mode(): TradeMode {
        return this._mode;
    }
}

export const CurrencyPair = {
    EURUSD: {str: "EURUSD", key: "USD"},
    USDJPY: {str: "USDJPY", key: "JPY"},
    EURJPY: {str: "EURJPY", key: "JPY"},
    GBPJPY: {str: "GBPJPY", key: "JPY"},
    AUDJPY: {str: "AUDJPY", key: "JPY"},
    GBPUSD: {str: "GBPUSD", key: "USD"},
    NZDJPY: {str: "NZDJPY", key: "JPY"},
    ZARJPY: {str: "ZARJPY", key: "JPY"},
    USDCHF: {str: "USDCHF", key: "CHF"},
    CHFJPY: {str: "CHFJPY", key: "JPY"},
    EURGBP: {str: "EURGBP", key: "GBP"},
    AUDUSD: {str: "AUDUSD", key: "USD"},
    NZDUSD: {str: "NZDUSD", key: "USD"},
    USDCAD: {str: "USDCAD", key: "CAD"},
    CADJPY: {str: "CADJPY", key: "JPY"},
    AUDCHF: {str: "AUDCHF", key: "CHF"},
    AUDNZD: {str: "AUDNZD", key: "NZD"},
    EURAUD: {str: "EURAUD", key: "AUD"},
    EURCAD: {str: "EURCAD", key: "CAD"},
    EURCHF: {str: "EURCHF", key: "CHF"},
    GBPAUD: {str: "GBPAUD", key: "AUD"},
    MXNJPY: {str: "MXNJPY", key: "JPY"},
} as const;
export type CurrencyPair = typeof CurrencyPair[keyof typeof CurrencyPair];

export const TradeMode = {
    Buy: {},
    Sell: {},
    Cross: {},
} as const;
export type TradeMode = typeof TradeMode[keyof typeof TradeMode];




