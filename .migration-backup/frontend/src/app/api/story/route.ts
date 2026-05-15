import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { genre, numPanels, prompt, model } = await req.json();

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

    console.log(`Streaming from Ollama [${model || 'phi3:latest'}]`);

    const response = await fetch('http://127.0.0.1:11434/api/generate', {
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
