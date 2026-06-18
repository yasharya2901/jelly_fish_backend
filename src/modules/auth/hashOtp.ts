import crypto from "crypto";

const HASH_SECRET = process.env.HASH_SECRET!!;

export function hashOtp(str: string): string {
    return crypto
        .createHmac("sha256", HASH_SECRET)
        .update(str)
        .digest("hex");
}

