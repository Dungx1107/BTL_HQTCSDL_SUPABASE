import { NextResponse } from 'next/server';
import { pipeline } from '@xenova/transformers';

// Singleton to avoid loading the model multiple times
class PipelineSingleton {
  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: any = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
    }

    // Get the pipeline instance
    const extractor = await PipelineSingleton.getInstance();

    // Extract the embedding
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    
    // Convert Float32Array to standard JS Array
    const embedding = Array.from(output.data);

    return NextResponse.json({ embedding });
  } catch (error: any) {
    console.error("Embedding generation error:", error);
    return NextResponse.json({ error: error.message || 'Error generating embedding' }, { status: 500 });
  }
}
