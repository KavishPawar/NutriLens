import dotenv from 'dotenv'

dotenv.config()

if(!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Google-Client-Id is undefined. ")
}
if(!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google-Client-Secret is undefined. ")
}
if(!process.env.MONGO_URI) {
    throw new Error("Mongo-Uri is undefined. ")
}
if(!process.env.JWT_SECRET) {
    throw new Error("Jwt-secret is undefined. ")
}
if(!process.env.REDIS_HOST || !process.env.REDIS_PORT || !process.env.REDIS_PASSWORD){
    throw new Error("Redis-credentials are undefined. ")
}

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD
}