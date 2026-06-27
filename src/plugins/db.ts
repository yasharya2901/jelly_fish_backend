import mongoose from "mongoose";
import { envVars } from "../config/env.js";
import { UserModel } from "../modules/users/user.model.js";
import { createLogger } from "../shared/utils/logger.js";

const logger = createLogger(import.meta.url);

const connectWithDb= async () => {
    const MONGO_URI = envVars.MONGO_URI;
    await mongoose.connect(MONGO_URI);
    await seedUserIfNotExists();
} 


const seedUserIfNotExists = async () => {
    // check if the user collection is empty
    const userCount = await UserModel.countDocuments();
    if (userCount != 0) {
        // check if any user has any invite code
        const userWithInviteCode = await UserModel.findOne({ inviteCode: { $exists: true, $ne: null } });
        if (userWithInviteCode) {
            return;
        }
    }

    // create a new user with a random alphanumeric invite code of length 8
    const randomInviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const newUser = new UserModel({
        emailId: "test@example.com",
        username: "testuser",
        name: "Initial User",
        inviteCode: randomInviteCode,
        emailVerified: true,
        phoneVerified: true
    });

    logger.info(`Seeding user with email: ${newUser.emailId}, username: ${newUser.username}, inviteCode: ${newUser.inviteCode}`);

    await newUser.save();
}


export default connectWithDb;