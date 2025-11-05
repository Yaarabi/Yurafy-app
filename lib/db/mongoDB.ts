

import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()



export  const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI as string)
        console.log('db connected successfuly');
    } catch (error: unknown) { 
        if (error instanceof Error) {
            console.log(error.message);
        } else {
            console.log("An unknown error occurred.");
        }
    }

}

/**
 * Get MongoDB client for transactions
 * Returns the mongoose connection which supports transactions
 */
export async function getMongoClient() {
    await connectDB();
    if (!mongoose.connection.db) {
        throw new Error("Database not connected");
    }
    return mongoose.connection.getClient();
}