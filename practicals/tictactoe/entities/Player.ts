class Player {
    private readonly _name: string;
    private readonly _symbol: Symbol;

    constructor(name: string, symbol: Symbol){
       if (symbol === Symbol.EMPTY) {
            throw new Error("Player cannot have EMPTY symbol");
        }
        this._name = name;
        this._symbol = symbol;
    }

    getName(): string{
        return this._name;
    }

    getSymbol(): Symbol{
        return this._symbol;
    }

     toString(): string {
        return `${this._name} (${getDisplayChar(this._symbol)})`;
    }
}