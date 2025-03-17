// Image generation service using Anura API

import { TransactionSummary } from '../etherscanService';

/**
 * Generates a prompt for creating a frog image based on wallet data and roast
 */
export const generateFrogPrompt = (
  summary: TransactionSummary,
  roast: string,
  walletCategory: 'poor' | 'average' | 'wealthy'
): string => {
  // Base Sir Croaksworth appearance
  let basePrompt = "A cartoon frog banker wearing a monocle and bowtie";
  
  // Add specifics based on wallet category
  if (walletCategory === 'wealthy') {
    basePrompt += ", wearing a luxurious top hat, holding money bags, laughing with a smug expression";
  } else if (walletCategory === 'poor') {
    basePrompt += ", looking judgemental, holding an empty wallet, shaking head in disappointment";
  } else {
    basePrompt += ", holding a calculator, looking skeptical with raised eyebrow";
  }
  
  // Add roast context (simplified to avoid AI filter issues)
  const simplifiedRoast = roast
    .replace(/wallet/gi, "financial decisions")
    .replace(/0x[a-fA-F0-9]+/g, "")
    .replace(/\$\d+/g, "money")
    .slice(0, 100); // Take only first portion to avoid making prompt too complex
  
  // Complete the prompt
  return `${basePrompt}. The frog is saying something about ${simplifiedRoast}. Cartoon style, green background, financial theme, high quality, detailed.`;
};

/**
 * Generates a frog image using Anura API
 */
export const generateFrogImage = async (
  prompt: string,
  apiKey: string
): Promise<string | null> => {
  try {
    // Make request to image generation endpoint
    const response = await fetch("https://anura-testnet.lilypad.tech/api/v1/diffusion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        width: 512,
        height: 512,
        num_inference_steps: 20,
        guidance_scale: 7.5,
        model: "stabilityai/stable-diffusion-2-1", // Use a supported SD model
      })
    });
    
    if (!response.ok) {
      console.error(`Image API Error: ${response.status} ${response.statusText}`);
      return null;
    }
    
    // Parse the response
    const data = await response.json();
    
    // Extract image URL or base64 data based on API response format
    if (data && data.images && data.images.length > 0) {
      return data.images[0]; // This might be base64 or a URL depending on the API
    } else {
      console.error("Unexpected image response format:", data);
      return null;
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};

// Fallback images for when API fails
export const getFallbackImage = (walletCategory: 'poor' | 'average' | 'wealthy'): string => {
  // Return predefined fallback image URLs based on wallet category
  if (walletCategory === 'wealthy') {
    return '/img/wealthy-frog.svg';
  } else if (walletCategory === 'poor') {
    return '/img/poor-frog.svg';
  } else {
    return '/img/average-frog.svg';
  }
};
