export async function initializeEnvironmentVariables() {
    let reservedList = process.env.RESERVED_INVITE_CODE
    if (reservedList) {
        reservedList = JSON.parse(reservedList);
    }

    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is required for the starting the application.")
    }
    
}