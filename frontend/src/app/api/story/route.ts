import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { genre, numPanels, prompt, model } = await req.json();

    const systemPrompt = `Expert Comic Writer. Generate a JSON script for a ${genre} story (${numPanels} panels).
    Response MUST be a valid JSON object.
    
    Structure:
    {
      "title": "...",
      "characters": [{"name": "...", "description": "...", "appearance": "..."}],
      "panels": [{"panelNumber": 1, "content": "...", "narration": "...", "dialogue": "...", "imagePrompt": "..."}]
    }
    
    Rules: Be concise. No extra text. Only JSON.`;

    const userMessage = `Topic: ${prompt}`;

    console.log(`Streaming from Ollama [${model || 'phi3:latest'}]`);

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        model: model || 'phi3:latest',
        prompt: `${systemPrompt}\n\n${userMessage}`,
        format: 'json',
        stream: true,
        options: {
          temperature: 0.6,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Ollama error: ${errorText}` }, { status: 500 });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('API Route Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
