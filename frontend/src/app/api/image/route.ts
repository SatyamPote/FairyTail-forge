import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { prompt, negativePrompt } = await req.json();

    // Call our internal Python AI service
    const response = await axios.post('http://localhost:8000/generate-image', {
      prompt,
      negative_prompt: negativePrompt || "realistic, photo, blurry, low quality, extra fingers",
      num_inference_steps: 15, // Faster for low-end hardware
      width: 512,
      height: 512
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Built-in AI Service Error:', error.message);
    
    let errorMessage = 'Failed to connect to internal AI service.';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'The internal AI generator is not running. Please start scripts/start-ai.bat';
    }

    return NextResponse.json({ 
      error: errorMessage, 
      details: error.message 
    }, { status: 500 });
  }
}
