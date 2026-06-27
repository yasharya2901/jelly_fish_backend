import z from "zod";
import { MAX_REGISTRATION_OTP_DIGIT } from "../../config/constants.js";

export const registerUserRequest = z.object({
    emailId: z.email(),
    inviteCode: z.string().max(8),
    deviceId: z.uuid().optional(),
})

export const verifyOtpRequest = z.object({
    token: z.string(),
    otp: z.string().length(MAX_REGISTRATION_OTP_DIGIT)
})

export const resendOtpRequest = z.object({
    token: z.string(),
})
