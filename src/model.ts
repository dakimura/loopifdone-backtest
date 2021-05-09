import Decimal from "decimal.js";


export default class OHLCV {
    private readonly _epochSec: Decimal
    private readonly _open: Decimal
    private readonly _low: Decimal
    private readonly _high: Decimal
    private readonly _close: Decimal
    private readonly _volume: Decimal

    constructor(epochSec: Decimal, open: Decimal, high: Decimal, low: Decimal, close: Decimal, volume: Decimal) {
        this._epochSec = epochSec;
        this._open = open;
        this._high = high;
        this._low = low;
        this._close = close;
        this._volume = volume;
    }

    get epochSec(): Decimal {
        return this._epochSec;
    }

    get open(): Decimal {
        return this._open;
    }

    get low(): Decimal {
        return this._low;
    }

    get high(): Decimal {
        return this._high;
    }

    get close(): Decimal {
        return this._close;
    }

    get volume(): Decimal {
        return this._volume;
    }
}