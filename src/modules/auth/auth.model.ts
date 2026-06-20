import mongoose from "mongoose";
import { DBModel } from "../../config/constants.js";
import type { Timestamps } from "../../shared/types/type.js";

interface IRegistrationToken extends Timestamps {
    email: string
    otpHash: string
    otpRequestedAt: Date
    expiresAt: Date
    retryAttempt: number
    maxRetryAttempt: number
    resendCount: number
    maxResendCount: number
    lastSentAt: Date
    status: "PENDING" | "VERIFIED" | "EXPIRED"
    errorMessage?: string
}

const registrationTokenSchema = new mongoose.Schema<IRegistrationToken>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    otpHash: {
        type: String,
        required: true
    },
    otpRequestedAt: {
        type: Date,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    retryAttempt: {
        type: Number,
        default: 0,
        required: true
    },
    maxRetryAttempt: {
        type: Number,
        required: true,
        default: 5
    },
    resendCount: {
        type: Number,
        default: 0,
        required: true
    },
    maxResendCount: {
        type: Number,
        required: true,
        default: 5
    },
    lastSentAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "VERIFIED", "EXPIRED"],
        default: "PENDING",
        required: true
    },
    errorMessage: {
        type: String
    }
}, {
    timestamps: true,
})

export const RegistrationTokenModel = mongoose.model<IRegistrationToken>(DBModel.RegistrationToken, registrationTokenSchema)