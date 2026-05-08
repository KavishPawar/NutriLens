import { ChatMistralAI } from "@langchain/mistralai";
import { config } from "../config/config.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: config.MISTRAL_API_KEY,
});

export async function generateResponse({ productInfo, userGoals }) {
  const response = await mistralModel.invoke([
    new SystemMessage(`
You are a food analysis assistant.

Your job is to evaluate whether a user should consume a product based on the product data and user goals given.

Rules:
- Be direct and decisive. No vague language.
- Do NOT explain everything in detail unless necessary.
- Focus only on what matters for the user's goals.

[Verdict: (Good / Limit / Avoid)
Reason: (1-2 short lines explaining why)
Key Issues: (bullet points of main concerns)
Suggested Intake: (e.g., "Safe occasionally", "Max 1 serving/day", "Avoid completely")]

Output format :
{
  advice: "<1 short human-like sentence combining verdict + reason + key issues>",
  intake: "<1 short sentence suggesting how much/how often to consume>"
}

Rules:
- Response MUST be a valid object with 2 fields advice and intake(no extra text)
- "advice" should sound natural, like a human recommendation
- Combine verdict, reason, and key issues into ONE sentence
- Keep each field under 20 words
- Be direct and practical


Decision logic:
- If multiple harmful factors → Avoid
- If moderate concerns → Limit
- If mostly safe → Good
    `),

    new HumanMessage(`
Evaluate the following product strictly based on the given data and user goals.

USER GOALS:
${Array.isArray(userGoals) ? userGoals.join(", ") : "No goals provided"}

PRODUCT INFORMATION:
${JSON.stringify(productInfo, null, 2)}

Instructions:
- Only use the data provided above. Do NOT assume missing values.
- If any important data is missing, mention it in "Key Issues".
- Prioritize evaluation based on USER GOALS.
- Focus on nutrients (sugar, sodium, fats, cholesterol) and additives/preservatives.

Now generate the response in the required format.
`),
  ]);

  const rawText = String(response?.text ?? "").trim();
  let aiResponse = null;

  try {
    aiResponse = JSON.parse(rawText);
  } catch (parseError) {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        aiResponse = JSON.parse(match[0]);
      } catch {
        aiResponse = null;
      }
    }
  }

  if (
    aiResponse &&
    typeof aiResponse === "object" &&
    aiResponse.advice &&
    aiResponse.intake
  ) {
    return {
      advice: String(aiResponse.advice).trim(),
      intake: String(aiResponse.intake).trim(),
    };
  }

  return {
    advice: rawText || "No advice available.",
    intake: aiResponse?.intake ? String(aiResponse.intake).trim() : "",
  };
}
