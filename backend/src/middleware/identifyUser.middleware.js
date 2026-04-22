import jwt from "jsonwebtoken"
import redis from "../config/cache.js";

async function identifyUser(req, res, next) {
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
  } catch (err) {
    res.status(401).json({
      message: "User not authorized.",
      success: false
    });
  }

  req.user = decoded;
  next();
}

export default identifyUser;
