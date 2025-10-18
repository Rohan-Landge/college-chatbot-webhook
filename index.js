import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(bodyParser.json());

// --- Helper function: clean long/markdown text ---
function cleanText(text) {
  if (!text) return "Sorry, I don’t have information on that.";
  
  // Remove markdown formatting
  text = text.replace(/\*\*/g, "").replace(/\*/g, "");
  
  // Limit length to ~1500 characters for Dialogflow display
  if (text.length > 1500) {
    text = text.slice(0, 1400) + "... (answer shortened)";
  }
  
  return text.trim();
}

// --- Webhook endpoint for Dialogflow ---
app.post("/webhook", async (req, res) => {
  const queryText = req.body.queryResult.queryText;
  console.log("💬 User:", queryText);

  try {
    // Call Gemini
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: queryText }] }]
      })
    });

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure about that.";

    console.log("💡 Gemini Reply:", reply);

    // ✨ Split long replies safely to fit Dialogflow limit
    const safeChunks = [];
    for (let i = 0; i < reply.length; i += 1500) {
      safeChunks.push(reply.substring(i, i + 1500));
    }

    // Send as multiple messages (Dialogflow can handle array)
    res.json({
      fulfillmentMessages: safeChunks.map(chunk => ({
        text: { text: [chunk] }
      }))
    });

  } catch (err) {
    console.error("❌ Error calling Gemini:", err);
    res.json({
      fulfillmentText: "Sorry, something went wrong while fetching that information."
    });
  }
});


  // --- Catch-all ---
  return res.json({
    fulfillmentText: "Sorry, I didn’t understand that."
  });
});

// --- Start server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 Webhook server running on port ${PORT}`)
);
