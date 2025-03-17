import { NextResponse } from 'next/server';
import { generateFrogPrompt, generateFrogImage, getFallbackImage } from '../../utils/image/imageGenerator';

// Load environment variables
const ANURA_API_KEY = process.env.ANURA_API_KEY || '';

export async function POST(request: Request) {
  try {
    // Extract data from request
    const { roast, walletCategory, summary } = await request.json();
    
    if (!roast) {
      return NextResponse.json(
        { error: 'Roast text is required' },
        { status: 400 }
      );
    }
    
    // Check if Anura API key is set
    if (!ANURA_API_KEY) {
      return NextResponse.json(
        { fallbackImage: getFallbackImage(walletCategory || 'average') },
        { status: 200 }
      );
    }
    
    // Generate the prompt for the image
    const prompt = generateFrogPrompt(summary, roast, walletCategory || 'average');
    console.log('Generating frog image with prompt:', prompt);
    
    // Generate the image
    const imageData = await generateFrogImage(prompt, ANURA_API_KEY);
    
    // If image generation failed, return fallback
    if (!imageData) {
      return NextResponse.json(
        { fallbackImage: getFallbackImage(walletCategory || 'average') },
        { status: 200 }
      );
    }
    
    // Return the image data
    return NextResponse.json({
      image: imageData
    });
    
  } catch (error) {
    console.error('Error generating image:', error);
    // Return a fallback image instead of an error
    return NextResponse.json(
      { fallbackImage: getFallbackImage('average') },
      { status: 200 }
    );
  }
}
