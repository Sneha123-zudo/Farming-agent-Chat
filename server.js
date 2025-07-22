import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public")); // Optional if you serve HTML

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Load memory from file or create a new object
const memoryFile = "memory.json";
let memory = fs.existsSync(memoryFile)
  ? JSON.parse(fs.readFileSync(memoryFile))
  : {};

function saveMemory() {
  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
}

app.post("/chat", async (req, res) => {
  const userInput = req.body.message;

  // Name capture
  const nameMatch = userInput.match(/i am (\w+)/i);
  if (nameMatch) {
    const name = nameMatch[1];
    memory.name = name;
    saveMemory();
    return res.json({ response: `Nice to meet you, ${name}!` });
  }

  if (/who am i/i.test(userInput)) {
    return res.json({
      response: memory.name
        ? `You are ${memory.name}.`
        : `I don't know your name yet. Tell me by saying "I am <your name>".`
    });
  }

  try {
    // ✅ Use correct model name and latest version
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(userInput);
    const responseText = result.response.text();

    memory.lastQuery = userInput;
    memory.lastResponse = responseText;
    saveMemory();

    res.json({ response: responseText });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ response: "Something went wrong. Please try again later." });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
