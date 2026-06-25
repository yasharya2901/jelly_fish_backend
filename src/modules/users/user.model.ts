import mongoose from "mongoose";
import { DBModel } from "../../config/constants.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    phoneNumber: {
        type: String,
        unique: true
    },
    emailId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    inviteCode: {
        type: String,
        unique: true
    },
    maxInviteQuota: {
        type: Number,
        default: 10
    },
    referredByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DBModel.User,
        index: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    suspended: {
        type: Boolean,
        default: false
    },
    avatarUrl: {
        type: String
    }
}, {
    timestamps: true,

    statics: {
        findByEmail(email: string) {
            return this.findOne({emailId: email});
        },

        findByUsername(username: string) {
            return this.findOne({username});
        },

        findByPhoneNumber(phoneNumber: string) {
            return this.findOne({phoneNumber});
        },

        findByInviteCode(inviteCode: string) {
            return this.findOne({inviteCode});
        }
    }
})

export const UserModel = mongoose.model(DBModel.User, userSchema);


