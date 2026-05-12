import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { genre, numPanels, prompt, model } = await req.json();

    const systemPrompt = `Expert Comic Writer. Generate a JSON script for a ${genre} story (${numPanels} panels).
    
    JSON Template:
    {
      "title": "...",
      "characters": [{"name": "...", "description": "...", "appearance": "physical look"}],
      "panels": [{"panelNumber": 1, "content": "visuals", "narration": "...", "dialogue": "...", "imagePrompt": "prompt"}]
    }
    
    RULES:
    1. Be ultra-concise.
    2. Respond ONLY with JSON.
    3. Ensure character appearance is consistent.`;

    const userMessage = `Story topic: ${prompt}`;

    try {
      console.log(`Requesting Ollama [${model || 'phi3:latest'}] - Timeout: 300s`);
      const response = await axios.post('http://localhost:11434/api/generate', {
        model: model || 'phi3:latest', 
        prompt: `${systemPrompt}\n\nTopic: ${userMessage}`,
        stream: false,
        format: 'json',
        options: {
          temperature: 0.6,
          num_predict: 1024, // Limit output to prevent runaway generation
        }
      }, {
        timeout: 300000 // 5 minutes
      });

      if (!response.data || !response.data.response) {
        throw new Error('Empty response from Ollama');
      }

      const storyData = JSON.parse(response.data.response);
      return NextResponse.json(storyData);
    } catch (err: any) {
      console.error('Ollama Request Failed:', err.message);
      if (err.code === 'ECONNREFUSED') {
        return NextResponse.json({ error: 'Ollama is not running. Please start Ollama and try again.' }, { status: 503 });
      }
      return NextResponse.json({ error: `Ollama error: ${err.message}. Make sure you have pulled the 'phi3' model using 'ollama pull phi3'.` }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API Route Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
