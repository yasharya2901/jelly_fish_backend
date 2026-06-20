export const DBModel = Object.freeze({
    User: "User",
    Friendship: "Friendship",
    FriendRequest: "FriendRequest",
    RegistrationToken: "RegistrationToken"
});


export const MAX_REGISTRATION_OTP_DIGIT = 8;
export const RESEND_COOLDOWN_MS = 60 * 1000;
export const OTP_TTL_MS = 3 * 60 * 1000;