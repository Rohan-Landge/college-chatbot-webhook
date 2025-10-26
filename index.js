import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/webhook", async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const userMessage = req.body.queryResult.queryText;

  console.log(`🎯 Intent: ${intent}`);
  console.log(`💬 User Message: ${userMessage}`);

  try {
    // Handle Gemini only for Fallback or unknown queries
    if (intent === "Default Fallback Intent") {
      const geminiResponse = await callGeminiAPI(userMessage);
      console.log("🤖 Gemini Response:", geminiResponse);

      return res.json({
        fulfillmentMessages: [
          {
            text: { text: [geminiResponse] },
          },
        ],
      });
    }

    // For other intents (college info, etc.)
    res.json({
      fulfillmentMessages: [
        {
          text: {
            text: [
              "I couldn’t find an answer for that 😅. You can explore these topics 👇",
            ],
          },
        },
        {
          payload: {
            richContent: [
              [
                {
                  type: "chips",
                  options: [
                    { text: "🏫 College Info" },
                    { text: "💰 Fee Structure" },
                    { text: "📍 College Location" },
                    { text: "📞 Contact Details" },
                    { text: "👨🏼‍💻 College ERP" },
                    { text: "🎯 College Vision" },
                    { text: "🕓 College Timing" },
                  ],
                },
              ],
            ],
          },
        },
      ],
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.json({
      fulfillmentText: "Sorry, something went wrong with the AI service 😞",
    });
  }
});

async function callGeminiAPI(query) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }],
      }),
    }
  );

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No answer found 😅";
}

app.listen(10000, () => {
  console.log("🚀 Chatbot Webhook running on port 10000");
});
