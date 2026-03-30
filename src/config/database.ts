import mongoose from "mongoose"
import config from "./config.ts"
import { error, log } from "node:console";


async function connectDB() {
    if (!config.MONGO_URI) {
        throw new Error('mongodb is defined but mongodb_uri is not defined in .env file');
    }
    if (!config.JWT_SECRET) {
        throw new Error('jwt secret is not deined in environmental files (.env)')
    } if (!config.GOOGLE_USER) {
        throw new Error('jwt secret is not deined in environmental files (.env)')
    }
    if (!config.GOOGLE_REFRESH_TOKEN) {
        throw new Error('jwt secret is not deined in environmental files (.env)')
    }
    if (!config.GOOGLE_CLIENT_SECRET) {
        throw new Error('jwt secret is not deined in environmental files (.env)')
    }
    if (!config.GOOGLE_CLIENT_ID) {
        throw new Error('jwt secret is not deined in environmental files (.env)')
    }
    if (!config.GOOGLE_ACCESS_TOKEN) {
        throw new Error('jwt secret is not deined in environmental files (.env)')
    }

    try {
        await mongoose.connect(
            config.MONGO_URI as string
        )
        console.log('db connected successfully');

    } catch (error) {
        console.log(error)
    }
}

export default connectDB;


