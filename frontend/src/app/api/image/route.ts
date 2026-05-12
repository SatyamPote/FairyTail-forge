import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { prompt, negativePrompt } = await req.json();
    
    const cleanPrompt = String(prompt || 'A comic book panel');
    console.log(`Sending prompt to AI engine: "${cleanPrompt.substring(0, 50)}..."`);

    // Call our internal Python AI service
    const response = await axios.post('http://localhost:8000/generate-image', {
      prompt: cleanPrompt,
      negative_prompt: String(negativePrompt || "realistic, photo, blurry, low quality, extra fingers"),
      num_inference_steps: 15, // Faster for low-end hardware
      width: 512,
      height: 512
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Built-in AI Service Error:', error.response?.data || error.message);
    
    let errorMessage = 'Failed to connect to internal AI service.';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'The internal AI generator is not running. Please start scripts/start-ai.bat';
    } else if (error.response?.status === 422) {
      errorMessage = 'The AI engine rejected the request format. Check logs.';
    }

    return NextResponse.json({ 
      error: errorMessage, 
      details: error.response?.data || error.message 
    }, { status: 500 });
  }
}
