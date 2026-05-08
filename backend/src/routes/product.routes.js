import { Router } from "express";
import identifyUser from "../middleware/identifyUser.middleware.js";
import {
  createProductRequest,
  deleteHistory,
  fetchProduct,
  productHistory,
} from "../controllers/product.controller.js";

const router = Router();

/**
 * @route GET /api/product/fetch/:barcode
 * @desc Fetch new product
 * @access Private
 * @body { product-barcode }
 */
router.get('/fetch/:barcode', identifyUser, fetchProduct)

/**
 * @route GET /api/product/history
 * @desc GET scan history
 * @access Private
 * @body { - }
 */
/**
 * @route GET /api/product/history
 * @desc GET scan history
 * @access Private
 * @body { - }
*/
router.get('/history', identifyUser, productHistory)

/**
 * @route GET /api/product/history/delete/:userId
 * @desc DELETE history
 * @access Private
 * @body { - }
 */
router.delete('/history/delete/:userId', identifyUser, deleteHistory)

/**
 * @route POST /api/product/requests
 * @desc Create a missing-product request
 * @access Private
 * @body { productName }
 */
router.post("/requests", identifyUser, createProductRequest);

export default router
