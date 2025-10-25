// --- index.js ---
// College Chatbot Webhook with Rule-based Intents + Gemini API + Fallback Buttons
// Developed by Rohan Sir 💡

import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

// ✅ Root Route (to verify Render deployment)
app.get("/", (req, res) => {
  res.send("🚀 College Chatbot Webhook Running Successfully!");
});

// ✅ Webhook Route
app.post("/webhook", async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const userMessage = req.body.queryResult.queryText;

  console.log(`🎯 Intent: ${intent}`);
  console.log(`💬 User Message: ${userMessage}`);

  // 🎓 1️⃣ Rule-based replies
  if (intent === "Get Fees Info") {
    return res.json({
      fulfillmentText: "💰 The annual fee for B.Tech is around ₹95,000 per year."
    });
  }

  if (intent === "Get Admission Process") {
    return res.json({
      fulfillmentText:
        "📝 You can apply for admission through the DTE Maharashtra CAP process. Visit the official DTE site for details."
    });
  }

  if (intent === "Get College Contact") {
    return res.json({
      fulfillmentMessages: [
        {
          text: { text: ["📞 You can contact the college using the information below:"] }
        },
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

  // 🧠 2️⃣ Out-of-the-box questions handled via Gemini API + Buttons
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      console.error("🚨 Missing GEMINI_API_KEY in environment variables.");
      return res.json({
        fulfillmentText: "⚠️ Gemini API key not set. Please contact admin."
      });
    }

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMessage }] }]
        })
      }
    );

    const geminiData = await geminiResponse.json();
    const aiText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn’t find an answer for that 😅. You can explore these topics 👇";

    // ✅ Respond with Gemini text + buttons
    return res.json({
      fulfillmentMessages: [
        { text: { text: [aiText] } },
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
                    { text: "🕓 College Timing" }
                  ]
                }
              ]
            ]
          }
        }
      ]
    });
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    return res.json({
      fulfillmentMessages: [
        {
          text: { text: ["Sorry 😔, I’m having trouble responding right now. Please try again later."] }
        },
        {
          payload: {
            richContent: [
              [
                {
                  type: "chips",
                  options: [
                    { text: "💰 Fees Info" },
                    { text: "📍 Location" },
                    { text: "📞 Contact Us" },
                    { text: "🎓 Admission Process" }
                  ]
                }
              ]
            ]
          }
        }
      ]
    });
  }
});

// ✅ Start server (Render automatically sets PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Chatbot Webhook running on port ${PORT}`));
