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
