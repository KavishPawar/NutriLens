import jwt from "jsonwebtoken";
import redis from "../config/cache.js";
import userModel from "../models/user.model.js";

async function identifyAdmin(req, res, next) {
  const token = req.cookies.token;

  const isTokenBlackListed = await redis.get(token);

  if (!token) {
    return res.status(401).json({
      message: "Token Not Provided. Unauthorized user.",
    });
  }

  if (isTokenBlackListed) {
    return res.status(401).json({
      message: " Invalid Token.",
      success: false,
    });
  }

  let decoded = null;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)
  } catch (err) {
    res.status(401).json({
      message: "User not authorized.",
      success: false,
    });
  }

  const user = await userModel.findById({ _id:decoded.id });

  if (user.role !== "admin") {
    return res.status(403).json({
      message: "Access Denied. Admins Only. -Middleware",
      success: false,
    });
  }


  req.user = decoded;
  next();
}

export default identifyAdmin;
