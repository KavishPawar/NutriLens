import dotenv from "dotenv";

dotenv.config();

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Google-Client-Id is undefined. ");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Google-Client-Secret is undefined. ");
}
if (!process.env.MONGO_URI) {
  throw new Error("Mongo-Uri is undefined. ");
}
if (!process.env.JWT_SECRET) {
  throw new Error("Jwt-secret is undefined. ");
}
if (
  !process.env.REDIS_HOST ||
  !process.env.REDIS_PORT ||
  !process.env.REDIS_PASSWORD
) {
  throw new Error("Redis-credentials are undefined. ");
}

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error("Imagekit credentials are undefined. ");
}

if (!process.env.MISTRAL_API_KEY) {
  throw new Error("Mistral-api-key is undefined. ");
}

const isProduction = process.env.NODE_ENV === "production";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || `${BACKEND_URL}/api/auth/google/callback`;

export const config = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  FRONTEND_URL,
  BACKEND_URL,
  GOOGLE_CALLBACK_URL,
  isProduction,
};
