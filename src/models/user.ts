import mongoose from "mongoose";
import { DBModel } from "../common/constants.js";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    
    methods: {
        isSuspended() {
            return this.suspended;
        },

        isEmailVerified() {
            return this.emailVerified;
        },

        isPhoneVerified() {
            return this.phoneVerified;
        },

        getCurrentInviteQuota() {
            return this.maxInviteQuota;
        },

        getAvatarUrl() {
            return this.avatarUrl;
        },

        async findReferredUsers() {
            return this.model(DBModel.User).find({ referredByUserId: this._id });
        }
    },

    statics: {
        findByEmail(email: string) {
            return this.findOne({email});
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

export type User = mongoose.InferSchemaType<typeof userSchema>

export const UserModel = mongoose.model(DBModel.User, userSchema);




