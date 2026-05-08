import { Router } from "express";
import {
  registerValidator,
  loginValidator,
} from "../validators/auth.validators.js";
import {
  register,
  login,
  getUser,
  updateProfile,
  googleCallback,
  logout,
} from "../controllers/auth.controller.js";
import identifyUser from "../middleware/identifyUser.middleware.js";
import passport from "passport";
import { config } from "../config/config.js";

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
router.post("/register", registerValidator, register);

/**
 * @route POST /api/auth/login
 * @desc Login a new user
 * @access Public
 * @body { username, email, password }
 */
router.post("/login", loginValidator, login);

router.get("/logout", logout);

router.get("/get-user", identifyUser, getUser);
router.put("/update-user", identifyUser, updateProfile);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${config.FRONTEND_URL}/login`,
  }),
  googleCallback,
);

export default router;
