import mongoose from "mongoose";
import { DBModel } from "../common/constants.js";

const friendRequestSchema = new mongoose.Schema({
    senderUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DBModel.User
    },
    receiverUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DBModel.User
    },
    status: {
        type: String
    }
}, {
    timestamps: true
})

export const FriendRequestModel = mongoose.model(DBModel.FriendRequest, friendRequestSchema);
