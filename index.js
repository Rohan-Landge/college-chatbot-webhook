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
                    { text: "🎓 Courses Offered" },
                    { text: "📞 Contact Details" },
                    { text: "🎯 Placements" },
                    { text: "🎖️ Scholarships" }
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
      const response = await fetch("https://api.example.com/data");
      const data = await response.json();
      return res.json({
        fulfillmentText: `Here’s the latest update: ${data.message}`
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
