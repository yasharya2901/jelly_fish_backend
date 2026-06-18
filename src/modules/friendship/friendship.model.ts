import mongoose from "mongoose";
import { DBModel } from "../common/constants.js";

const friendshipSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DBModel.User
    },
    friendsUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DBModel.User
    }
}, {
    timestamps: true
});

export type Friendship = mongoose.InferSchemaType<typeof friendshipSchema>;

export const FriendshipModel = mongoose.model(DBModel.Friendship, friendshipSchema);
