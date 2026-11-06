class Cell {
    private _symbol: Symbol;

    constructor() {
        this._symbol = Symbol.EMPTY;
    }

    get symbol(): Symbol {
        return this._symbol;
    }

    set symbol(value: Symbol) {
        this._symbol = value;
    }

    isEmpty(): boolean {
        return this._symbol === Symbol.EMPTY;
    }
}