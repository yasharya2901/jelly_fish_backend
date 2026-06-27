import mongoose from "mongoose";
import { DBModel, MAX_OTP_RETRY_ATTEMPT } from "../../config/constants.js";
import type { Timestamps } from "../../shared/types/type.js";
import { required } from "zod/mini";

interface IRegistrationToken extends Timestamps {
    target: string
    type: "EMAIL" | "PHONE"
    inviteCode: string
    otpHash: string
    otpRequestedAt: Date
    expiresAt: Date
    deviceId?: string
    retryAttempt: number
    maxRetryAttempt: number
    resendCount: number
    maxResendCount: number
    lastSentAt: Date
    status: "PENDING" | "VERIFIED" | "EXPIRED"
    errorMessage?: string
}

const registrationTokenSchema = new mongoose.Schema<IRegistrationToken>({
    target: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ["EMAIL", "PHONE"],
        required: true
    },
    inviteCode: {
        type: String,
        required: true
    },
    otpHash: {
        type: String,
        required: true
    },
    otpRequestedAt: {
        type: Date,
        required: true
    },
    deviceId: {
        type: String,
        required: false
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
        default: MAX_OTP_RETRY_ATTEMPT
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


const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DBModel.User,
        required: true,
        index: true,
    },

    deviceId: {
        type: String,
        required: false,
        index: true,
    },

    familyId: {
        type: String,
        required: true,
        index: true,
    },

    tokenHash: {
        type: String,
        required: true,
        unique: true,
    },

    revokedAt: {
        type: Date,
    },

    expiresAt: {
        type: Date,
        required: true,
        index: {
            expires: 0, // This will make MongoDB automatically delete the document when it expires
        }
    }
}, {
    timestamps: true,
})

export const RegistrationTokenModel = mongoose.model<IRegistrationToken>(DBModel.RegistrationToken, registrationTokenSchema)
export const RefreshTokenModel = mongoose.model(DBModel.RefreshToken, refreshTokenSchema)