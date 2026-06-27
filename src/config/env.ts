import ms, { type StringValue } from "ms";

interface EnvVars {
    MONGO_URI: string;
    EMAIL_USER: string;
    EMAIL_PASSWORD: string;
    HASH_SECRET: string;
    JWT_SECRET: string;
    ACCESS_TOKEN_EXPIRATION_TIME: string;
    RESERVED_INVITE_CODE: Record<string, string> | undefined;
    REFRESH_TOKEN_EXPIRATION_TIME: number; // in milliseconds
}

export let envVars: EnvVars;

export async function initializeEnvironmentVariables() {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("MONGO_URI is required.");

    const EMAIL_USER = process.env.EMAIL_USER;
    if (!EMAIL_USER) throw new Error("EMAIL_USER is required.");

    const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
    if (!EMAIL_PASSWORD) throw new Error("EMAIL_PASSWORD is required.");

    const HASH_SECRET = process.env.HASH_SECRET;
    if (!HASH_SECRET) throw new Error("HASH_SECRET is required.");

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error("JWT_SECRET is required.");

    const ACCESS_TOKEN_EXPIRATION_TIME = process.env.ACCESS_TOKEN_EXPIRATION_TIME;
    if (!ACCESS_TOKEN_EXPIRATION_TIME) throw new Error("ACCESS_TOKEN_EXPIRATION_TIME is required.");

    let REFRESH_TOKEN_EXPIRATION_TIME = process.env.REFRESH_TOKEN_EXPIRATION_TIME;
    if (!REFRESH_TOKEN_EXPIRATION_TIME) throw new Error("REFRESH_TOKEN_EXPIRATION_TIME is required.");

    const refreshInMillis = ms(REFRESH_TOKEN_EXPIRATION_TIME as StringValue);
    if (!refreshInMillis || typeof refreshInMillis !== "number") {
        throw new Error("REFRESH_TOKEN_EXPIRATION_TIME must be a valid duration string.");
    }


    let RESERVED_INVITE_CODE: Record<string, string> | undefined;
    const reservedRaw = process.env.RESERVED_INVITE_CODE;
    if (reservedRaw) {
        try {
            const parsed = JSON.parse(reservedRaw);
            if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
                throw new Error();
            }
            RESERVED_INVITE_CODE = parsed as Record<string, string>;
        } catch {
            throw new Error("RESERVED_INVITE_CODE must be a valid JSON object string.");
        }
    }

    envVars = {
        MONGO_URI,
        EMAIL_USER,
        EMAIL_PASSWORD,
        HASH_SECRET,
        JWT_SECRET,
        ACCESS_TOKEN_EXPIRATION_TIME,
        RESERVED_INVITE_CODE,
        REFRESH_TOKEN_EXPIRATION_TIME: refreshInMillis,
    };
}
