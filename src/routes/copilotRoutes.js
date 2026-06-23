import express from "express";
import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";

const router = express.Router();

const runtime = new CopilotRuntime({
  adapter: new OpenAIAdapter({
    apiKey: process.env.OPENAI_API_KEY,
  }),
});

router.post("/", async (req, res) => {
  try {
    const response = await runtime.handleRequest(req);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Copilot error" });
  }
});

export default router;