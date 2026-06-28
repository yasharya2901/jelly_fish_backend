import { envVars } from "./env.js";

export const DBModel = Object.freeze({
    User: "User",
    Friendship: "Friendship",
    FriendRequest: "FriendRequest",
    RegistrationToken: "RegistrationToken",
    RefreshToken: "RefreshToken",
});


/**
 * Maximum digit for otp registration.
 * 
 * Value = 8
 */
export const MAX_REGISTRATION_OTP_DIGIT = 8;

/**
 * Maximum attempt for retrying the otp.
 * 
 * Value = 4
 */
export const MAX_OTP_RETRY_ATTEMPT = 4;

/**
 * Minimum time a user must wait
 * before requesting a new OTP.
 * 
 * Value = 60 seconds
 */
export const RESEND_COOLDOWN_MS = 60 * 1000;

/**
 * Time to Live for OTP
 * 
 * Value = 3 minutes
 */
export const OTP_TTL_MS = 3 * 60 * 1000;

/**
 * Maximum number of registration attempts allowed within the sliding window.
 * An attempt is counted each time a user starts a new registration cycle
 * (initial registration or re-registration after OTP expiry).
 * 
 * Value = 3
 */
export const MAX_REGISTRATION_ATTEMPTS = 3;

/**
 * Sliding window duration for registration attempts.
 * Attempts older than this are pruned and no longer count toward the limit.
 * 
 * Configurable via REGISTRATION_WINDOW env var (e.g. "1h", "30m", "2h").
 * Defaults to 1 hour if not set.
 */
export const REGISTRATION_WINDOW_MS = envVars.REGISTRATION_WINDOW;

/**
 * Time to Live for Refresh Token
 * 
 * Value = Days specified in the environment variable REFRESH_TOKEN_EXPIRATION_TIME
 */
export const REFRESH_TOKEN_TTL_MS = envVars.REFRESH_TOKEN_EXPIRATION_TIME;