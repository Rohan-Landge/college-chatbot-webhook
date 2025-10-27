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
    // Handle fallback or unknown queries with Gemini
    if (intent === "Default Fallback Intent") {
      const geminiResponse = await callGeminiAPI(userMessage);
      console.log("🤖 Gemini Response:", geminiResponse);

      if (geminiResponse && geminiResponse.trim().length > 0 && geminiResponse !== "No answer found 😅") {
        // ✅ Gemini gave an answer
        return res.json({
          fulfillmentMessages: [{ text: { text: [geminiResponse] } }],
        });
      } else {
        // ❌ Gemini returned nothing -> show popular tags
        return res.json({
          fulfillmentMessages: [
            {
              text: { text: ["I couldn’t find an answer for that 😅. You can explore these popular topics 👇"] },
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
      }
    }

    // 🧩 Handle other intents manually (rule-based)
    if (intent === "Get Fees Info") {
      return res.json({
        fulfillmentText: "💰 The annual fee for B.Tech is around ₹95,000 per year.",
      });
    }

    if (intent === "Get College Contact") {
      return res.json({
        fulfillmentMessages: [
          { text: { text: ["📞 You can contact the college using the information below:"] } },
          {
            payload: {
              richContent: [
                [
                  {
                    type: "chips",
                    options: [
                      { text: "📞 Call College" },
                      { text: "🌐 Visit Website" },
                      { text: "📍 View Location" },
                    ],
                  },
                ],
              ],
            },
          },
        ],
      });
    }

    // Default response for unknown intents
    return res.json({
      fulfillmentText: "I’m not sure about that 🤔, but here are some topics you can explore 👇",
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.json({
      fulfillmentText: "Sorry, something went wrong with the AI service 😞",
    });
  }
});

// 🔹 Gemini API Function (fixed model + error-safe)
async function callGeminiAPI(query) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }],
        }),
      }
    );

    const data = await response.json();

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return aiText || "No answer found 😅";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "No answer found 😅";
  }
}

app.listen(10000, () => {
  console.log("🚀 Chatbot Webhook running on port 10000");
});
