class InvalidMoveError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidMoveError";
        // Restore prototype chain (needed for instanceof checks in TypeScript)
        Object.setPrototypeOf(this, InvalidMoveError.prototype);
    }
}