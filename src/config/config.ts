import dotenv from 'dotenv'
dotenv.config()


const config = {
    MONGO_URI : process.env.MONGODB_URI,
    PORT : process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN:process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_ACCESS_TOKEN:process.env.GOOGLE_ACCESS_TOKEN,
    GOOGLE_USER:process.env.GOOGLE_USER
}

export default config