import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// --- Helper function: clean long/markdown text ---
function cleanText(text) {
  if (!text) return "Sorry, I don’t have information on that.";
  
  // Remove markdown formatting
  text = text.replace(/\*\*/g, "").replace(/\*/g, "");
  
  // Limit length to ~1500 characters for Dialogflow display
  if (text.length > 1500) {
    text = text.slice(0, 1400) + "... (answer shortened)";
  }
  
  return text.trim();
}

// --- Webhook endpoint for Dialogflow ---
app.post("/webhook", async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const userMessage = req.body.queryResult.queryText;

  console.log(`🎯 Intent: ${intent}`);
  console.log(`💬 User: ${userMessage}`);

  // --- College-specific intents ---
  if (intent === "Get Fees Info") {
    return res.json({
      fulfillmentText: "The annual fee for B.Tech is around ₹95,000 per year."
    });
  }

  if (intent === "Get Admission Process") {
    return res.json({
      fulfillmentText:
        "You can apply for admission through the DTE Maharashtra CAP process."
    });
  }

  // --- Default Fallback Intent (calls Gemini API) ---
  if (intent === "Default Fallback Intent") {
    console.log("🚀 Fallback triggered, calling Gemini API...");

    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: userMessage }]
              }
            ]
          })
        }
      );

      console.log("Status:", geminiResponse.status);
      const data = await geminiResponse.json();
      console.log("💡 Gemini response:", data);

      let aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      aiReply = cleanText(aiReply);

      console.log("💬 Clean Reply:", aiReply);

      return res.json({
        fulfillmentText: aiReply
      });
    } catch (error) {
      console.error("❌ Error calling Gemini API:", error);
      return res.json({
        fulfillmentText:
          "I'm having trouble answering right now. Please try again later."
      });
    }
  }

  // --- Catch-all ---
  return res.json({
    fulfillmentText: "Sorry, I didn’t understand that."
  });
});

// --- Start server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 Webhook server running on port ${PORT}`)
);
