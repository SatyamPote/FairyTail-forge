import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// GET /api/models - Fetch available Ollama models
router.get("/models", async (req: Request, res: Response) => {
  try {
    const response = await fetch("http://localhost:11434/api/tags");

    if (!response.ok) {
      res.status(503).json({ error: "Ollama not reachable" });
      return;
    }

    const data = (await response.json()) as { models?: Array<{ name: string; size: number; details: unknown }> };

    if (!data || !data.models) {
      res.json({ models: [] });
      return;
    }

    const models = data.models.map((m) => ({
      name: m.name,
      size: m.size,
      details: m.details,
    }));

    res.json({ models });
  } catch (error: unknown) {
    req.log.error({ err: error }, "Failed to fetch Ollama models");
    res.status(503).json({ error: "Ollama not reachable" });
  }
});

// POST /api/story - Generate a comic story using Ollama (streaming)
router.post("/story", async (req: Request, res: Response) => {
  try {
    const { genre, numPanels, prompt, model } = req.body as {
      genre: string;
      numPanels: number;
      prompt: string;
      model: string;
    };

    const systemPrompt = `Expert Ligne Claire Comic Writer. Generate a JSON script for a ${genre} story (${numPanels} panels).
    
    VISUAL STYLE: Ligne Claire (Clear Line). Minimalist, clean contour lines, flat cinematic colors, architectural perspective, balanced negative space. 
    Avoid clutter. Focus on iconic silhouettes and clear silhouettes.
    
    Response MUST be a valid JSON object.
    
    Structure:
    {
      "title": "...",
      "characters": [{"name": "...", "description": "Ligne Claire character bio...", "appearance": "clean line description..."}],
      "panels": [{"panelNumber": 1, "content": "cinematic composition...", "narration": "...", "dialogue": "...", "imagePrompt": "minimalist description with clear silhouettes..."}]
    }
    
    Rules: Be elegant and concise. No extra text. Only JSON.`;

    const userMessage = `Topic: ${prompt}`;

    req.log.info({ model: model || "phi3:latest" }, "Streaming from Ollama");

    const ollamaResponse = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model || "phi3:latest",
        prompt: `${systemPrompt}\n\n${userMessage}`,
        format: "json",
        stream: true,
        options: {
          temperature: 0.6,
        },
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      res.status(500).json({ error: `Ollama error: ${errorText}` });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (ollamaResponse.body) {
      const reader = ollamaResponse.body.getReader();
      const pump = async (): Promise<void> => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(value);
        return pump();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (error: unknown) {
    req.log.error({ err: error }, "API Route Error");
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

// POST /api/image - Generate a comic panel image via local Python AI service
router.post("/image", async (req: Request, res: Response) => {
  try {
    const { prompt, negativePrompt } = req.body as {
      prompt?: string;
      negativePrompt?: string;
    };

    const cleanPrompt = String(prompt || "A comic book panel");
    req.log.info({ promptSnippet: cleanPrompt.substring(0, 50) }, "Sending prompt to AI engine");

    const aiResponse = await fetch("http://localhost:8000/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: cleanPrompt,
        negative_prompt: String(negativePrompt || "realistic, photo, blurry, low quality, extra fingers"),
        num_inference_steps: 15,
        width: 512,
        height: 512,
      }),
    });

    if (!aiResponse.ok) {
      const errorData = (await aiResponse.json().catch(() => ({}))) as { detail?: string };
      req.log.error({ status: aiResponse.status, detail: errorData }, "AI service error");
      res.status(500).json({
        error: "Failed to connect to internal AI service.",
        details: errorData,
      });
      return;
    }

    const data = await aiResponse.json();
    res.json(data);
  } catch (error: unknown) {
    req.log.error({ err: error }, "Built-in AI Service Error");
    const isConnRefused =
      error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ECONNREFUSED";

    let errorMessage = "Failed to connect to internal AI service.";
    if (isConnRefused) {
      errorMessage = "The internal AI generator is not running. Please start scripts/start-ai.bat";
    }

    res.status(500).json({
      error: errorMessage,
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
