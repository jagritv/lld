class Board {
    private readonly grid: Cell[][];
    private readonly _size: number;

    constructor(size: number) {
        this._size = size;
        this.grid = [];
        this.initializeBoard();
    }

    private initializeBoard(): void {
        for (let i = 0; i < this._size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this._size; j++) {
                this.grid[i][j] = new Cell();
            }
        }
    }

    placeSymbol(row: number, col: number, symbol: Symbol): void {
        this.validatePosition(row, col);
        this.grid[row][col].symbol = symbol;
    }

    isCellEmpty(row: number, col: number): boolean {
        this.validatePosition(row, col);
        return this.grid[row][col].isEmpty();
    }

    isFull(): boolean {
        for (let i = 0; i < this._size; i++) {
            for (let j = 0; j < this._size; j++) {
                if (this.grid[i][j].isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    getCell(row: number, col: number): Cell {
        this.validatePosition(row, col);
        return this.grid[row][col];
    }

    get size(): number {
        return this._size;
    }

    private validatePosition(row: number, col: number): void {
        if (row < 0 || row >= this._size || col < 0 || col >= this._size) {
            throw new InvalidMoveError(
                `Position (${row}, ${col}) is out of bounds`
            );
        }
    }

    printBoard(): void {
        console.log();
        for (let i = 0; i < this._size; i++) {
            const row: string[] = [];
            for (let j = 0; j < this._size; j++) {
                row.push(` ${getDisplayChar(this.grid[i][j].symbol)} `);
            }
            console.log(row.join("|"));
            if (i < this._size - 1) {
                console.log("-".repeat(this._size * 4 - 1));
            }
        }
        console.log();
    }
}