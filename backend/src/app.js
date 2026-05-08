import express from 'express'
import cookieParser from 'cookie-parser'
import cors from "cors";
import fs from "fs";
import path from "path";
import authRouter from "./routes/auth.routes.js"
import productRouter from "./routes/product.routes.js"
import adminRouter from "./routes/admin.routes.js"
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { config } from './config/config.js'
import morgan from 'morgan'
import { fileURLToPath } from "url";

const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");
const indexFile = path.join(publicDir, "index.html");


app.set("trust proxy", 1);

app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(morgan("dev"));
app.use(express.static("public"))

app.use(passport.initialize());
passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: config.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {  
    return done(null, profile);
}))

app.use('/api/auth', authRouter);
app.use('/api/product', productRouter);
app.use('/api/admin', adminRouter);

// Single-service deployment support:
// If frontend build is copied to backend/public, serve it from the same origin.
if (fs.existsSync(indexFile)) {
  app.use(express.static(publicDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(indexFile);
  });
}

export default app;
