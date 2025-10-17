// --- index.js ---
// Rohan sir's college chatbot webhook server

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

  // Example: handle different intents manually
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

  // 🧠 Default fallback (calls Gemini for general questions)
if (intent === "Default Fallback Intent") {
  try {
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are a polite and helpful assistant for a college chatbot. 
                  If the question is not about the college, answer briefly and factually.\n
                  Question: ${userMessage}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await geminiResponse.json();
    const aiReply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I don’t have information on that.";

    return res.json({ fulfillmentText: aiReply });
  } catch (error) {
    console.error("❌ Error calling Gemini API:", error);
    return res.json({
      fulfillmentText: "I'm having trouble answering right now. Please try again later."
    });
  }
}


app.listen(3000, () => console.log("🚀 Webhook server running on port 3000"));
