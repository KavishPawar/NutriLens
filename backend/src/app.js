import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRouter from "./routes/auth.routes.js"
import productRouter from "./routes/product.routes.js"
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { config } from './config/config.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.use(passport.initialize());
passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback" 
}, (accessToken, refreshToken, profile, done) => {  
    return done(null, profile);
}))

app.use('/api/auth', authRouter);
app.use('/api/product', productRouter);

export default app;