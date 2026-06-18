import mongoose from "mongoose";
import { generateOtp } from "./otpGenerator.js";
import { DBModel, MAX_REGISTRATION_OTP_DIGIT } from "../../config/constants.js";

export interface IRegistrationToken {
    email: string;
    otp?: string;
    retryAttempt: number;
}

interface IRegistrationTokenMethods {
    createOtp(): Promise<void>;
}

type RegistrationTokenModelType = mongoose.Model<IRegistrationToken, {}, IRegistrationTokenMethods>;

const registrationTokenSchema = new mongoose.Schema<IRegistrationToken, RegistrationTokenModelType, IRegistrationTokenMethods>({
    email: {
        type: String,
        required: true
    },

    otp: {
        type: String
    },

    retryAttempt: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,

    methods: {
        async createOtp() {
            this.otp = generateOtp(true, MAX_REGISTRATION_OTP_DIGIT);
            await this.save();
        }
    },

    statics: {
        async findByEmail(email: string) {
            return this.findOne({email});
        }
    }
})

export const RegistrationTokenModel = mongoose.model(DBModel.RegistrationToken, registrationTokenSchema)