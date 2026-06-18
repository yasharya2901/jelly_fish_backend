export async function initializeEnvironmentVariables() {
    let reservedList = process.env.RESERVED_INVITE_CODE
    if (reservedList) {
        reservedList = JSON.parse(reservedList);
    }

    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is required for starting the application.");
    }

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

    if (!EMAIL_USER || !EMAIL_PASSWORD) {
        throw new Error("EMAIL_USER or EMAIL_PASSWORD is missing.");
    }

    const HASH_SECRET = process.env.HASH_SECRET;

    if (!HASH_SECRET) {
        throw new Error("HASH_SECRET is required for starting the application.")
    }
    
}