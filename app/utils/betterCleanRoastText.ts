/**
 * Enhanced cleaning function for roast text that aggressively extracts just the one-liner
 * and removes any explanations or thought process
 */
export function betterCleanRoastText(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove any preamble text that analyzes the data or explains thinking
  content = content.replace(/(?:Let(?:')?s|I(?:')?ll)\s+break\s+(?:it\s+)?down[\s\S]*?(?=Your|The|You[r']|This|That)/i, '');
  content = content.replace(/(?:Here(?:')?s|I(?:')?ve\s+crafted)\s+a\s+roast[\s\S]*?(?=Your|The|You[r']|This|That)/i, '');
  content = content.replace(/(?:Looking|Based)\s+at\s+(?:this|the)\s+wallet[\s\S]*?(?=Your|The|You[r']|This|That)/i, '');
  content = content.replace(/(?:For\s+this|This)\s+roast[\s\S]*?(?=Your|The|You[r']|This|That)/i, '');
  content = content.replace(/(?:First|Let(?:')?s|I(?:')?m)\s+(?:going\s+to|gonna)[\s\S]*?(?=Your|The|You[r']|This|That)/i, '');
  content = content.replace(/(?:First|Let(?:')?s)\s*,?\s+(?:the|we)\s+(?:user|I)[\s\S]*?(?=Your|The|You[r']|This|That)/i, '');

  // Function to extract the most likely roast sentence
  function extractBestRoastSentence(text: string): string {
    // Pre-filter any thinking patterns
    text = text.replace(/^Let me think about this[\s\S]*?(?=Your|The|You[r']|This|That)/i, '');
    text = text.replace(/^I need to focus on[\s\S]*?(?=Your|The|You[r']|This|That)/i, '');
    text = text.replace(/^I(?:')?ll create a roast[\s\S]*?(?=Your|The|You[r']|This|That)/i, '');
    text = text.replace(/^Based on the information[\s\S]*?(?=Your|The|You[r']|This|That)/i, '');
    text = text.replace(/^Looking at this wallet[\s\S]*?(?=Your|The|You[r']|This|That)/i, '');
    
    // Split into sentences (accounting for different end punctuation)
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    // First pass: look for sentences that start with "Your" and are a good length
    const yourSentences = sentences.filter(s => 
      s.trim().toLowerCase().startsWith('your') && 
      s.length > 10 && s.length < 200
    );
    
    if (yourSentences.length > 0) {
      return yourSentences[0].trim();
    }
    
    // Second pass: look for sentences with token names
    const tokens = ['ycn', 'pepe', 'pepec', 'shib', 'doge', 'uni', 'sushi', 'eth', 'btc', 'matic', 'cake', 'zoo', 'babycocoro', 'vusual', 'avax', 'ftm', 'bnb', 'cro', 'joe', 'spell', 'gmx', 'comp', 'mkr'];
    const tokenSentences = sentences.filter(s => 
      tokens.some(token => s.toLowerCase().includes(token)) &&
      s.length > 10 && s.length < 200
    );
    
    if (tokenSentences.length > 0) {
      return tokenSentences[0].trim();
    }
    
    // Third pass: look for sentences that seem like roasts
    const roastPatterns = [
      'wallet', 'trade', 'investment', 'transaction', 'strategy',
      'poor', 'bad', 'fail', 'loss', 'disaster', 'embarrass', 'crypto'
    ];
    
    const roastSentences = sentences.filter(s => 
      roastPatterns.some(pattern => s.toLowerCase().includes(pattern)) &&
      s.length > 10 && s.length < 200
    );
    
    if (roastSentences.length > 0) {
      return roastSentences[0].trim();
    }
    
    // Final fallback: just take the first reasonably sized sentence
    const reasonableSentence = sentences.find(s => s.length > 10 && s.length < 200);
    if (reasonableSentence) {
      return reasonableSentence.trim();
    }
    
    // If nothing else works, just return the first 150 chars
    return text.substring(0, Math.min(150, text.length)).trim();
  }

  // Get the original content and remove obvious thinking tags
  let cleanedText = content
    // Remove thinking tags
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/\\u003cthink\\u003e[\s\S]*?\\u003c\/think\\u003e/gi, '')
    // Remove common preambles and explanations
    .replace(/^Here(?:'s| is)(?: a)?(?: savage| brutal)? roast:?\s*/i, '')
    .replace(/^Roast:?\s+/i, '')
    .replace(/^Sir Croaksworth(?:'s)? roast:?\s*/i, '')
    .replace(/^One\s+liner:?\s*/i, '')
    .replace(/^The\s+roast:?\s*/i, '')
    .replace(/^\*\*Roast:\*\*\s*/i, '')
    .replace(/^I('ll| will) roast this\s+[\s\S]*?(?=Your|The|You[r']|This|That)/i, '')
    .trim();
  
  // Check if we have a response with explanation or extra text
  if (cleanedText.length > 200 || 
      cleanedText.includes('This roast') || 
      cleanedText.includes('specifically targets') ||
      cleanedText.includes('utiliz') ||
      cleanedText.includes('characters') ||
      cleanedText.includes('explanation') ||
      cleanedText.includes('approach') ||
      cleanedText.includes('focuses on') ||
      cleanedText.includes('ensure')) {
    
    console.log('Detected explanation or verbose response - extracting just the roast');
    
    // Extract the best sentence
    cleanedText = extractBestRoastSentence(cleanedText);
  }
  
  // Final cleaning to ensure consistent formatting
  cleanedText = cleanedText
    // Remove square brackets around tokens
    .replace(/\[([A-Za-z0-9]+)\]/g, '$1')
    
    // Remove any end-of-line backslashes that might indicate incomplete thoughts
    .replace(/\\+$/g, '')
    
    // Aggressively handle escaped newlines - replace with spaces
    .replace(/\\n/g, ' ')
    
    // Handle literal newlines
    .replace(/\n/g, ' ')
    
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    
    // Remove any quotes
    .replace(/["']/g, '')
    
    // Lowercase token names
    .replace(/\b(YCN|ETH|BTC|UNI|SUSHI|PEPE|SHIB|DOGE|FLOKI|BONK|CAKE|CRV|AAVE|MATIC|ARB|OP|LINK|DAI|USDC|USDT|AVAX|FTM|BNB|CRO|JOE|SPELL|GMX|COMP|MKR)\b/g, 
      match => match.toLowerCase())
    
    .trim();
  
  // Remove any remaining escape characters or backslashes that may appear incorrectly
  cleanedText = cleanedText
    .replace(/\\([^\\])/g, '$1') // Replace escaped characters with just the character
    .replace(/\\/g, '')          // Remove any remaining backslashes
    .trim();
    
  // Ensure proper sentence formatting
  if (cleanedText.length > 0) {
    // Capitalize first letter
    cleanedText = cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1);
    
    // Ensure there's ending punctuation
    if (!/[.!?]$/.test(cleanedText)) {
      cleanedText += '.';
    }
  }
  
  return cleanedText;
}
