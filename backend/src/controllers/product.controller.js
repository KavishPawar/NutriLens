import axios from "axios";
import additiveData from "../config/additivesDB.js";
import { normalization } from "../services/normalization.service.js";
import rating from "../services/rating.service.js";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";

export async function fetchProduct(req, res) {
  // 6001065600048

  try {
    const barcode = Number(req.params.barcode);
    console.log(barcode);

    // Database Search. ////////////////////////////////////////////////////////////////////////////////////////////////////
    const dbSearch = await productModel.findOne({ barcode });

    if (dbSearch) {
      return res.status(200).json({
        message: "Product Fetched Successfully",
        success: true,
        productInfo: dbSearch,
      });
    }

    // API Search.///////////////////////////////////////////////////////////////////////////////////////////
    const response = await axios.get(
      `https://world.openfoodfacts.net/api/v2/product/${barcode}.json`,
    );

    if (response.data.status === 0) {
      return res.status(404).json({ message: "Product not found", response });
    }

    //  NORMALIZATION
    const normalisedData = await normalization(response.data.product);

      await productModel.create({
        imgUrl: normalisedData.imgUrl,
        name: normalisedData.name,
        brand: normalisedData.brand,
        barcode: normalisedData.barcode,
        processingLevel: normalisedData.processingLevel,
        rating: normalisedData.rating,
        nutrients: normalisedData.nutrients,
        additives: normalisedData.additives,
        userId: req.user.id,
      });
    
    return res.status(200).json({
      message: "Product Fetched Successfully",
      success: true,
      productInfo: normalisedData,
    });
  } catch (err) {
    console.log("AXIOS ERROR:", err);
  }
}

export async function productHistory(req, res) {
  const products = await productModel.find({ userId: req.user.id });

  if (!products) {
    return res.status(404).json({
      message: "No history found",
      success: false,
    });
  }

  res.status(200).json({
    message: "History Fetched Successfully",
    success: true,
    products,
  });
}

export async function deleteHistory(req, res) {
  const userSearch = await productModel.deleteMany({
    userId: req.params.userId,
  });

  return res.status(200).json({
    message: "History Deleted Successfully",
    success: true,
    userSearch,
  });
}

// { ------------------NORMALISED_DATA-------------------------------------------------------------------------------------
//         "imgUrl": "https://images.openfoodfacts.net/images/products/890/105/890/1542/front_en.3.400.jpg",
//         "name": "Maggie",
//         "brand": "Maggi",
//         "barcode": "8901058901542",
//         "processing_level": {
//             "value": "ultra-processed",
//             "source": "product.nova_group"
//         },
//         "additives": [
//             {
//                 "code": "E150d",
//                 "name": "Caramel Colour IV (Sulphite Ammonia Caramel)",
//                 "purpose": "Food colouring used to give dark brown colour to soft drinks, sauces, and processed foods"
//             },
//             {
//                 "code": "E330",
//                 "name": "Citric acid",
//                 "purpose": "Acidity regulator and preservative"
//             },
//             {
//                 "code": "E412",
//                 "name": "Guar gum",
//                 "purpose": "Thickener and stabilizer"
//             },
//             {
//                 "code": "E451",
//                 "name": "Triphosphates",
//                 "purpose": "Emulsifier and stabiliser used to retain moisture and improve texture in processed foods"
//             },
//             null,
//             {
//                 "code": "E500",
//                 "name": "Sodium carbonates",
//                 "purpose": "Raising agent and acidity regulator"
//             },
//             null,
//             {
//                 "code": "E501",
//                 "name": "Potassium Carbonates",
//                 "purpose": "Raising agent and acidity regulator in baked and cocoa-based products"
//             },
//             null,
//             {
//                 "code": "E635",
//                 "name": "Disodium 5′-Ribonucleotides",
//                 "purpose": "Flavour enhancer that intensifies umami taste, often used with MSG"
//             }
//         ],
//         "nutrients_per_100g": {
//             "energy_kcal": 389,
//             "fat": 13.5,
//             "saturated_fat": 8.2,
//             "carbohydrates": 59.6,
//             "sugars": 1.8,
//             "protein": 8.2,
//             "sodium": 1.0283
//         },
//         "rating": {
//             "totalScore": 48,
//             "stars": 2,
//             "category": "Poor"
//         }
//     }
