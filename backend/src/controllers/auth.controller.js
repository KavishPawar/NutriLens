import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "../config/config.js";
import redis from "../config/cache.js";

const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req, res) {
  const { username, email, password, role } = req.body;

  const alreadyExist = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (alreadyExist) {
    return res.status(400).json({
      message: "User Already Exists.",
      success: false,
    });
  }

  const hashpwd = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hashpwd,
    role,
  });

  return res.status(201).json({
    message: "Registration Successful",
    success: true,
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}

export async function login(req, res) {
  const { username, email, password } = req.body;

  const user = await userModel
    .findOne({
      $or: [{ email }, { username }],
    })
    .select("+password");

  if (!user) {
    res.status(404).json({
      message: "User Not Found.",
      success: false,
    });
  }

  const hashpwd = await bcrypt.compare(password, user.password);

  if (!hashpwd) {
    return res.status(401).json({
      message: "Invalid password",
      success: false,
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2d" },
  );

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    message: "Login Successful",
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}

export async function logout(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized Access. ",
      success: false,
    });
  }

  res.clearCookie("token", {
    ...cookieOptions,
    expires: new Date(0),
  });

  await redis.set(token, Date.now().toString(), "EX", 60 * 60);

  res.status(200).json({
    message: "Logout Successful",
    success: true,
  });
}

export async function getUser(req, res) {
  const userInfo = req.user;
  console.log(userInfo);

  const user = await userModel.findById(req.user.id);
  if (!user) {
    return res.status(401).json({
      message: "User Unauthorized",
      success: false,
    });
  }

  res.status(200).json({
    message: "user data fetched.",
    success: true,
    user,
  });
}

export async function updateProfile(req, res) {
  const { username, email, goals, theme } = req.body;

  const user = await userModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      message: "User not found.",
      success: false,
    });
  }

  if (username !== undefined) user.username = username;
  if (email !== undefined) user.email = email;
  if (goals !== undefined) {
    if (Array.isArray(goals)) {
      user.goals = goals.length ? goals : null;
    } else {
      user.goals = goals ? [String(goals)] : null;
    }
  }
  if (theme !== undefined) {
    user.theme = theme || null;
  }

  await user.save();

  res.status(200).json({
    message: "Profile updated successfully.",
    success: true,
    user,
  });
}

export async function googleCallback(req, res) {
  const { id, displayName, emails, photos } = req.user;
  const email = emails[0].value;

  let user = await userModel.findOne({ email });

  // no user - create new
  if (!user) {
    user = await userModel.create({
      username: displayName,
      email,
      googleId: id,
    });
  }
  const token = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  res.cookie("token", token, cookieOptions);

  res.redirect(config.FRONTEND_URL);
}
