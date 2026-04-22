 async function rating(product) {
  let totalScore = 0;
 
  // ---------- 1. Ecoscore (40%) ----------
  if (product.ecoscore_score) {
    totalScore += (product.ecoscore_score / 100) * 40;
  }

  // ---------- 2. Processing Level (25%) ----------
  if (product.nova_group === 1) totalScore += 25;
  else if (product.nova_group === 2) totalScore += 20;
  else if (product.nova_group === 3) totalScore += 15;
  else if (product.nova_group === 4) totalScore += 5; // ultra processed

  // ---------- 3. Additives (20%) ----------
  const additiveCount = product.additives?.length || 0;
  const additiveScore = Math.max(0, 20 - additiveCount * 3);
  totalScore += additiveScore;

  // ---------- 4. Nutrition Grade (15%) ----------
  const nutritionMap = {
    a: 15,
    b: 12,
    c: 9,
    d: 6,
    e: 3,
  };

  if (product.nutrition_grade) {
    totalScore += nutritionMap[product.nutrition_grade.toLowerCase()] || 0;
  }

  // ---------- Convert to Stars ----------
  const stars = Math.max(1, Math.round(totalScore / 20));

  // ---------- Classification ----------
  let category;

  if (stars < 3) {
    category = "Poor";
  } else if (stars < 4.5) {
    category = "Okay";
  } else {
    category = "Good";
  }

  return {
    totalScore: Math.round(totalScore),
    stars,
    category,
  };
}

export default rating;