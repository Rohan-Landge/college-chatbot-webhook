import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 🧠 Gemini API Function (correct model + endpoint)
async function callGeminiAPI(query) {
  try {
    const response = await fetch(
      // ✅ Using v1 instead of v1beta + correct model name
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }],
        }),
      }
    );

    const data = await response.json();
    console.log("🔍 Gemini raw response:", JSON.stringify(data, null, 2));

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!aiText) {
      console.log("⚠️ Gemini returned no usable text.");
      return "I couldn’t find an answer 😅";
    }

    return aiText;
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    return "Sorry, something went wrong while fetching data.";
  }
}

// 🎯 Dialogflow Webhook
app.post("/webhook", async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const userMessage = req.body.queryResult.queryText;

  console.log(`🎯 Intent: ${intent}`);
  console.log(`💬 User Message: ${userMessage}`);

  try {
    // 🔸 Fallback Intent handled by Gemini
    if (intent === "Default Fallback Intent") {
      const geminiResponse = await callGeminiAPI(userMessage);
      console.log("🤖 Gemini Response:", geminiResponse);

      // ✅ Valid Gemini answer
      if (
        geminiResponse &&
        geminiResponse.trim().length > 0 &&
        !geminiResponse.includes("I couldn’t find an answer")
      ) {
        return res.json({
          fulfillmentMessages: [{ text: { text: [geminiResponse] } }],
        });
      }

      // ❌ No valid Gemini answer -> show popular topics
      return res.json({
        fulfillmentMessages: [
          {
            text: {
              text: [
                "I couldn’t find an answer for that 😅. You can explore these popular topics 👇",
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
    }

    // 🧩 Rule-based Intents
    if (intent === "Get Fees Info") {
      return res.json({
        fulfillmentText: "💰 The annual fee for B.Tech is around ₹95,000 per year.",
      });
    }

    if (intent === "Get College Contact") {
      return res.json({
        fulfillmentMessages: [
          { text: { text: ["📞 You can contact the college using the info below:"] } },
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

    // Default for unknown intents
    return res.json({
      fulfillmentText:
        "I’m not sure about that 🤔, but here are some topics you can explore 👇",
    });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    res.json({
      fulfillmentText: "Sorry, something went wrong with the AI service 😞",
    });
  }
});

// 🚀 Server setup
app.listen(10000, () => {
  console.log("🚀 Chatbot Webhook running on port 10000");
});
