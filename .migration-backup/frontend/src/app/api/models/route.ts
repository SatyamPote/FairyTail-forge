import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const response = await axios.get('http://localhost:11434/api/tags');
    
    if (!response.data || !response.data.models) {
      return NextResponse.json({ models: [] });
    }

    // Map to a simpler format
    const models = response.data.models.map((m: any) => ({
      name: m.name,
      size: m.size,
      details: m.details
    }));

    return NextResponse.json({ models });
  } catch (error: any) {
    console.error('Failed to fetch Ollama models:', error.message);
    return NextResponse.json({ error: 'Ollama not reachable' }, { status: 503 });
  }
}
