export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode = 50) {
        super(message);
        this.statusCode = statusCode;

        Error.captureStackTrace(this, this.constructor);
    }
}

