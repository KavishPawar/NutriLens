import "dotenv/config";
import rating from "../services/rating.service.js"; 
import additiveData from "../config/additivesDB.js"; 

export async function normalization(product) {
  // 🔹 Rating
  const prodRating = await rating(product);

  // 🔹 Additives mapping (clean + safe)
  let additivesArr = [];

  if (product.additives_tags?.length) {
    additivesArr = product.additives_tags
      .map((ad) => {
        const code = ad.split(":")[1]?.toUpperCase();
        return additiveData.find((item) => item.code.toUpperCase() === code);
      })
      .filter(Boolean);
  }

  return {
    imgUrl: product.image_url || null,
    name: product.product_name || null,
    brand: product.brands || null,

    // 🔥 enforce correct type
    barcode: product.code ? String(product.code) : null,

    // 🔥 match schema directly
    processingLevel: product.nova_group
      ? product.nova_group === 4
        ? "ultra-processed"
        : "processed"
      : null,

    rating: prodRating
      ? {
          totalScore: prodRating.totalScore,
          stars: prodRating.stars,
          category: prodRating.category,
        }
      : {
          totalScore: null,
          stars: null,
          category: null,
        },

    // 🔥 match schema structure directly (no nested mismatch)
    nutrients: {
      energy_kcal: product.nutriments?.["energy-kcal_100g"] ?? null,
      sugar: product.nutriments?.sugars_100g ?? null,
      fat: product.nutriments?.fat_100g ?? null,
      saturated_fat: product.nutriments?.["saturated-fat_100g"] ?? null,
      sodium: product.nutriments?.sodium_100g ?? null,
      carbohydrates: product.nutriments?.carbohydrates_100g ?? null,
      protein: product.nutriments?.proteins_100g ?? null,
    },

    additives: additivesArr,
    
    last_updated: new Date(),
  };
}

export async function additives() {
  
} 
