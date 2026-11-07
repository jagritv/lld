enum Symbol {
    X = "X",
    O = "O",
    EMPTY = "_",
}

const DISPLAY_CHARS: Record<Symbol, string> = {
    [Symbol.X]: "X",
    [Symbol.O]: "O",
    [Symbol.EMPTY]: "_",
};

function getDisplayChar(symbol: Symbol): string {
    return DISPLAY_CHARS[symbol];
}