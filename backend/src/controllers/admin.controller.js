import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";
import { uploadFile } from "../services/storage.service.js";
import { normalization } from "../services/normalization.service.js";
import productRequestModel from "../models/productRequest.model.js";

// Products
export async function getAllProducts(req, res) {
  const products = await productModel.find();

  return res.status(200).json({
    message: "Products Fetched Successfully",
    success: true,
    products,
  });
}

export async function addProduct(req, res) {
  const {
    name,
    brand,
    barcode,
    nutrients: nutrientsRaw,
    additives: additivesRaw,
    rating: ratingRaw,
  } = req.body;

  const image = await uploadFile({
    buffer: req.file.buffer,
    fileName: req.file.originalname,
  });

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "Product name is required.",
      success: false,
    });
  }

  let nutrients = {};
  let additives = [];
  let rating = {
    totalScore: null,
    stars: null,
    category: null,
  };

  try {
    nutrients = nutrientsRaw ? JSON.parse(nutrientsRaw) : {};
  } catch (err) {
    nutrients = {};
  }

  try {
    const additiveCodes = additivesRaw ? JSON.parse(additivesRaw) : [];
    additives = Array.isArray(additiveCodes)
      ? additiveCodes.map((code) => ({ code }))
      : [];
  } catch (err) {
    additives = [];
  }

  try {
    const parsedRating = ratingRaw ? JSON.parse(ratingRaw) : {};
    rating.totalScore =
      parsedRating.totalScore !== undefined &&
      parsedRating.totalScore !== null &&
      parsedRating.totalScore !== ""
        ? Number(parsedRating.totalScore)
        : null;
    rating.stars =
      parsedRating.stars !== undefined &&
      parsedRating.stars !== null &&
      parsedRating.stars !== ""
        ? Number(parsedRating.stars)
        : null;
    rating.category = parsedRating.category
      ? String(parsedRating.category)
      : null;
  } catch (err) {
    rating = {
      totalScore: null,
      stars: null,
      category: null,
    };
  }

  // const rawProduct = {
  //   name: name.trim(),
  //   brand: brand?.trim() || "",
  //   barcode: barcode?.trim() || "",
  //   nutrients,
  //   additives,
  //   userId: req.user?.id || "admin",
  // };

  // const readyProduct = await normalization(rawProduct);
  // console.log(readyProduct)

  const product = await productModel.create({
    imgUrl: image.url,
    name: name.trim(),
    brand: brand?.trim() || "",
    barcode: barcode?.trim() || "",
    nutrients,
    additives,
    rating,
    userId: req.user?.id || "admin",
  });

  return res.status(201).json({
    message: "Product created successfully.",
    success: true,
    product,
  });
}

export async function updateProduct(req, res) {}

export async function deleteProduct(req, res) {
  const { productId } = req.params;

  const product = await productModel.findByIdAndDelete({ _id: productId });

  if (!product) {
    return res.status(404).json({
      message: "Product Not Found.",
      success: false,
    });
  }

  return res.status(200).json({
    message: "Product Deleted From DB.",
    success: true,
    product,
  });
}

// Users
export async function getAllUsers(req, res) {
  const users = await userModel.find();

  return res.status(200).json({
    message: "Users Fetched Successfully",
    success: true,
    users,
  });
}

export async function updateUser(req, res) {
  //   {username: 'test1fsdfsdf', email: 'test1@gmail.com', role: 'user'}
  const { userId } = req.params;

  const user = await userModel.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found", success: false });
  }

  const { username, role } = req.body;

  if (username !== undefined) user.username = username;
  if (role !== undefined) user.role = role;

  await user.save();

  return res.status(201).json({
    message: "User Updated Successfully.",
    success: true,
    user,
  });
}

export async function deleteUser(req, res) {
  const userId = req.params.userId;

  const user = await userModel.findByIdAndDelete({ _id: userId });

  if (!user) {
    return res.status(404).json({
      message: "User Not Found.",
      success: false,
    });
  }

  return res.status(200).json({
    message: "User Deleted Successfully",
    success: true,
    user,
  });
}

// Requests
export async function getPendingRequests(req, res) {
  const requests = await productRequestModel
    .find({ status: "pending" })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    message: "Pending requests fetched successfully.",
    success: true,
    requests,
  });
}

export async function approveRequest(req, res) {
  const { requestId } = req.params;

  const request = await productRequestModel.findById(requestId);
  if (!request) {
    return res.status(404).json({
      message: "Request not found.",
      success: false,
    });
  }

  request.status = "resolved";
  await request.save();

  return res.status(200).json({
    message: "Request marked as resolved.",
    success: true,
    request,
  });
}

export async function dismissRequest(req, res) {
  const { requestId } = req.params;

  const request = await productRequestModel.findById(requestId);
  if (!request) {
    return res.status(404).json({
      message: "Request not found.",
      success: false,
    });
  }

  request.status = "cleared";
  await request.save();

  return res.status(200).json({
    message: "Request cleared.",
    success: true,
    request,
  });
}
