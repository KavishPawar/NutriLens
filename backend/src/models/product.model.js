import mongoose, { mongo } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    imgUrl: String,
    name: String,
    barcode: String,
    processingLevel: String,
    rating: {
      totalScore: { type: Number, default: null },
      stars: { type: Number, default: null },
      category: { type: String, default: null },
    },

    nutrients: {
      energy_kcal: { type: Number, default: null },
      sugar: { type: Number, default: null },
      fat: { type: Number, default: null },
      saturated_fat: { type: Number, default: null },
      sodium: { type: Number, default: null },
      carbohydrates: { type: Number, default: null },
      protein: { type: Number, default: null },
    },
    additives: [
      {
        code: String,
        name: String,
        purpose: String,
      },
    ],
    last_updated: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: String,
      required: true
    }
  },
  { timestamps: true },
);

const productModel = mongoose.model("products", productSchema);

export default productModel;

// {
//   barcode: "8901234567890",

//   name: "Maggi Noodles",
//   brand: "Nestle",
//   image: "...",

//   processing_level: "ultra-processed",

//   nutrients: {
//     energy: 459,
//     sugar: 2.5,
//     fat: 17,
//     saturated_fat: 8,
//     sodium: 1500,
//     carbs: 60,
//     protein: 10
//   },

//   additives: ["E621", "E627"],

//   health_score: 42,

//   last_updated: Date
// }
