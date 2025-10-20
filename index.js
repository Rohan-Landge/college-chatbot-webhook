// --- index.js ---
// College Chatbot Webhook with Rule-based Tags + API support

import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const userMessage = req.body.queryResult.queryText;

  console.log(`🎯 Intent: ${intent}`);
  console.log(`💬 User: ${userMessage}`);

  // ✅ Intent 1: Fees info
  if (intent === "Get Fees Info") {
    return res.json({
      fulfillmentText: "The annual fee for B.Tech is around ₹95,000 per year."
    });
  }

  // ✅ Intent 2: Admission process
  if (intent === "Get Admission Process") {
    return res.json({
      fulfillmentText: "You can apply for admission through the DTE Maharashtra CAP process."
    });
  }

  // ✅ Intent 3: College contact info (example)
  if (intent === "Get College Contact") {
    return res.json({
      fulfillmentMessages: [
        { text: { text: ["You can contact the college using the information below:"] } },
        {
          payload: {
            richContent: [
              [
                {
                  type: "chips",
                  options: [
                    { text: "📞 Call College" },
                    { text: "🌐 Visit Website" },
                    { text: "📍 View Location" }
                  ]
                }
              ]
            ]
          }
        }
      ]
    });
  }

  // ✅ Fallback Intent: When Dialogflow cannot match an intent
  if (intent === "Default Fallback Intent") {
    // Instead of “I don't understand”, show popular tags/buttons
    return res.json({
      fulfillmentMessages: [
        {
          text: { text: ["I couldn’t understand that 😅. You can explore these popular topics 👇"] }
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
                    { text: "👨🏼‍💻 college erp website" },
                    { text: "🎯 college vission" }
                    { text: "🕓 college Timing" }
                  ]
                }
              ]
            ]
          }
        }
      ]
    });
  }

  // ✅ (Optional) Add future dynamic API (like Gemini or Database)
  if (intent === "Dynamic Info Intent") {
    try {
     const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // set this in Render environment

const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: userMessage }] }]
  })
});

const geminiData = await geminiResponse.json();
const aiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn’t find any information about that.";

return res.json({
  fulfillmentText: aiText
});

    } catch (err) {
      console.error("❌ API Error:", err);
      return res.json({
        fulfillmentText: "Sorry, I couldn’t fetch the information right now."
      });
    }
  }

  // ✅ Default catch-all
  return res.json({
    fulfillmentText: "Okay! Let me help you with that."
  });
});

// Start server
app.listen(3000, () => console.log("🚀 College Webhook running on port 3000"));
