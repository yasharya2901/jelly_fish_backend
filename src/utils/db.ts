import mongoose from "mongoose";

const connectWithDb= async () => {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is required for the starting the application.")
    }
    await mongoose.connect(MONGO_URI);
} 


export default connectWithDb;