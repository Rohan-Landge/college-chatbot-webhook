import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 🧠 Gemini API Function (using gemini-pro for better general Q&A)
async function callGeminiAPI(query) {
  try {
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

    // Debug log for Gemini response
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
    // 🔸 Fallback intent handled by Gemini
    if (intent === "Default Fallback Intent") {
      const geminiResponse = await callGeminiAPI(userMessage);
      console.log("🤖 Gemini Response:", geminiResponse);

      // If Gemini provides a valid answer
      if (
        geminiResponse &&
        geminiResponse.trim().length > 0 &&
        !geminiResponse.includes("No answer found")
      ) {
        return res.json({
          fulfillmentMessages: [{ text: { text: [geminiResponse] } }],
        });
      }

      // Show fallback buttons if Gemini has no valid answer
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

    // 🧩 Manual intent responses
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
