class Game{
  private readonly board: Board;
  private readonly players: Player[];
  private readonly currentPlayerIndex: number;
  private _status : GameStatus;

  constructor(player1: PlaybackDirection, player2: PlaybackDirection, boardSize: number){
    this.board = new this.Board();
    this.players = [player1, player2];
    this.currentPlayerIndex = 0;
    this._status = GameStatus.IN_PROGRESS;
  }

  makeMove(row: number, col: number): void{
    // checking if game is already over
    if (this._status != GameStatus.IN_PROGRESS) {
        throw new Error(`Game alreday finished.`);
    }

   // validate the move
   if (!this.board.isCellEmpty(row, col)){
    throw new InvalidMoveError(
        `Cell ${row} ${col} already occupied.`
    )
   }
   
   const currentPlayer = this.players[this.currentPlayerIndex];
   this.board.placeSymbol(row, col, currentPlayer.symbol);
}

   private checkWin(row: number, col: number, symbol: Symbol): boolean {
    const board = this.board;
    const size = board.size;

    let win = true;

    // checking the row of the last move
    for (let c=0;c<size;c++){
        if (board.getCell(row, c).symbol !== symbol) {
            win = false;
            break;
        }
    }
        if (win) return true;
 
    // checking the column f the last move
   win = true;
   for (let r=0;r<size;r++){
    if (board.getCell(r, col).symbol !== symbol) {
        win= false;
        break;
    }
   }

   if (win) return true;
    
   // checking the first diagonal
   if (row === col) {
    win = true;

    for (let i=0;i<size;i++){
        if (board.get(i, i).symbol !== symbol) {
            win = false;
            break;
        }
    }
    if (win) return true;
   }
  
   //checking the anti-diagonal
   if (row + col == size -1) {
        win = true;

        for (let i=0;i<size;i++){
            if (board.get(i, size-i-1).symbol !== symbol) {
                return false;
                break;
            }
        }

        if (win) return true;
   }

   return false;

   }
   