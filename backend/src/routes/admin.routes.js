import { Router } from "express";
import multer from "multer";
import identifyAdmin from "../middleware/identifyAdmin.middleware.js";
import {
  getAllProducts,
  getAllUsers,
  getPendingRequests,
  addProduct,
  deleteProduct,
  updateProduct,
  dismissRequest,
  approveRequest,
  deleteUser,
  updateUser,
} from "../controllers/admin.controller.js";

const upload = multer();
const router = Router();

// Products
router.get("/products", identifyAdmin, getAllProducts); /*✅*/

router.post(
  "/products",
  identifyAdmin,
  upload.single("image"),
  addProduct,
); /*✅*/

router.put(
  "/products/:productId",
  identifyAdmin,
  upload.single("image"),
  updateProduct,
);

router.delete("/products/:productId", identifyAdmin, deleteProduct); /*✅*/

// Users
router.get("/users", identifyAdmin, getAllUsers); /*✅*/
router.put("/users/:userId", identifyAdmin, updateUser); /*✅*/
router.delete("/users/:userId", identifyAdmin, deleteUser); /*✅*/

// Requests
router.get("/requests", identifyAdmin, getPendingRequests);
router.put("/requests/:requestId/approve", identifyAdmin, approveRequest);
router.delete("/requests/:requestId", identifyAdmin, dismissRequest);

export default router;
