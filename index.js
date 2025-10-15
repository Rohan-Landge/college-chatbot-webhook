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

  // 🧠 Default fallback (calls GPT or Gemini if you want dynamic response)
  if (intent === "Default Fallback Intent") {
    try {
      const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer YOUR_OPENAI_API_KEY`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a polite college assistant. Keep answers short and relevant to college context." },
            { role: "user", content: userMessage }
          ]
        })
      });

      const data = await openaiResponse.json();
      const aiReply = data.choices?.[0]?.message?.content || "Sorry, I don’t have information on that.";

      return res.json({
        fulfillmentText: aiReply
      });

    } catch (error) {
      console.error("❌ Error calling OpenAI:", error);
      return res.json({
        fulfillmentText: "I'm having trouble answering right now. Please try again later."
      });
    }
  }

  // Default response if no matching intent
  return res.json({
    fulfillmentText: "Okay, got it!"
  });
});

app.listen(3000, () => console.log("🚀 Webhook server running on port 3000"));
