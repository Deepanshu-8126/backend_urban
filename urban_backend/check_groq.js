const { Groq } = require("groq-sdk");
require('dotenv').config();

async function checkGroq() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log("❌ GROQ_API_KEY is missing");
    return;
  }
  
  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say 'Hello' if you are working." }],
      model: "llama-3.3-70b-versatile",
    });
    console.log("✅ GROQ_API_KEY is working. Response:", completion.choices[0]?.message?.content);
  } catch (error) {
    console.error("❌ GROQ_API_KEY failed:", error.message);
  }
}

checkGroq();
