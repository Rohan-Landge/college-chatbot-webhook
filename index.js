import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // Load .env file locally or from Render environment

const app = express();
app.use(bodyParser.json());

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
      fulfillmentText: "You can apply for admission through the DTE Maharashtra CAP process."
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
            prompt: {
              text: `You are a polite college assistant chatbot. Answer this question: ${userMessage}`
            },
            temperature: 0.2,
            maxOutputTokens: 200
          })
        }
      );

      console.log("Status:", geminiResponse.status);
      const data = await geminiResponse.json();
      console.log("💡 Gemini response:", data);

      const aiReply =
        data?.candidates?.[0]?.output?.content?.[0]?.text ||
        "Sorry, I don’t have information on that.";

      return res.json({ fulfillmentText: aiReply });
    } catch (error) {
      console.error("❌ Error calling Gemini API:", error);
      return res.json({
        fulfillmentText:
          "I'm having trouble answering right now. Please try again later."
      });
    }
  }

  // --- Catch-all for unknown intents ---
  return res.json({
    fulfillmentText: "Sorry, I didn’t understand that."
  });
});

// --- Start server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Webhook server running on port ${PORT}`));
