import { jwtVerify, SignJWT } from "jose";
import crypto from "crypto";
import { envVars } from "../../config/env.js";

const HASH_SECRET = envVars.HASH_SECRET;
const secret = new TextEncoder().encode(envVars.JWT_SECRET);

export async function getAccessToken(userId: string) {
    const token = new SignJWT({
        sub: userId
    })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(envVars.ACCESS_TOKEN_EXPIRATION_TIME)
        .sign(secret);

    return token;
}

export function generateRefreshToken() {
    return crypto.randomBytes(64).toString()
}

export async function verifyAccessToken(token: string) {
    const { payload } = await jwtVerify(token, secret);
    return payload.sub as string;
}


export function hashString(str: string): string {
    return crypto
        .createHmac("sha256", HASH_SECRET)
        .update(str)
        .digest("hex");
}