import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { prompt, negativePrompt, panelId } = await req.json();

    const response = await axios.post('http://localhost:8000/generate-image', {
      prompt,
      negative_prompt: negativePrompt || "bad quality, blurry, distorted, low resolution, watermark",
      num_inference_steps: 12,
      width: 512,
      height: 512
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('TinySD Error:', error.message);
    return NextResponse.json({ error: 'Failed to generate image. Make sure the AI service is running.' }, { status: 500 });
  }
}
