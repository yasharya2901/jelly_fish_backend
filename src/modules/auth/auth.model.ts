import mongoose from "mongoose";
import { DBModel } from "../../config/constants.js";
import type { Timestamps } from "../../shared/types/type.js";

interface IRegistrationToken extends Timestamps {
    email: string;
    otpHash: string;
    otpRequestedAt: Date;
    retryAttempt: number;
    errorMessage?: string;
}

const registrationTokenSchema = new mongoose.Schema<IRegistrationToken>({
    email: {
        type: String,
        required: true,
        unique: true
    },

    otpHash: {
        type: String
    },

    otpRequestedAt: {
        type: Date
    },

    retryAttempt: {
        type: Number,
        default: 0
    },

    errorMessage: {
        type: String
    }
}, {
    timestamps: true,
})

export const RegistrationTokenModel = mongoose.model<IRegistrationToken>(DBModel.RegistrationToken, registrationTokenSchema)