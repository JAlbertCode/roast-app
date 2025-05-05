# Sir Croaksworth's Roast DApp

## Overview

[Sir Croaksworth's Roast DApp](https://roast-app-delta.vercel.app/) is a humorous web application that roasts users' cryptocurrency transactions. Users paste their wallet address, and Sir Croaksworth (a monocle-wearing frog banker) analyzes their on-chain data and delivers savage financial roasts in stylized speech bubbles.

### Key Features

- **Wallet Analysis**: Personalized roasts based on transaction history
- **Multi-Chain Support**: Analyzes data from multiple networks (Ethereum, Polygon, Arbitrum, etc.)
- **AI-Powered**: Uses Anura API (Lilypad Network) for roast generation
- **Social Sharing**: Twitter integration with @lilypad_tech #Roasted
- **Engaging UI**: Animated SVG character and speech bubbles

## Tech Stack

- **Frontend**: Next.js (TypeScript/React)
- **Styling**: TailwindCSS + Framer Motion
- **Data**: Blockchain explorer APIs (Etherscan, etc.)
- **AI**: Anura API (Lilypad Network)

## How It Works

1. User enters wallet address
2. App fetches blockchain data from multiple networks
3. Transactions are summarized and processed
4. Anura API generates a personalized roast
5. Sir Croaksworth delivers the roast in a speech bubble
6. User can share the roast on Twitter

## Project Structure

```
/
├── app/
│   ├── api/
│   │   └── roast/
│   │       └── route.ts          # API endpoint for roast generation
│   ├── components/
│   │   ├── ChainSelector.tsx     # Blockchain network selector
│   │   ├── SirCroaksworth.tsx    # Animated frog character component
│   │   ├── SocialLinks.tsx       # Social media links
│   │   ├── SpeechBubble.tsx      # Dynamic speech bubble component
│   │   └── icons/                # SVG icon components
│   │       └── BetterSirCroaksworthSvg.tsx  # Sir Croaksworth SVG implementation
│   ├── utils/
│   │   ├── chains/               # Multi-chain blockchain API integration
│   │   │   ├── blockchainService.ts # Transaction fetching logic
│   │   │   ├── config.ts         # Chain configuration
│   │   │   └── types.ts          # Type definitions
│   │   ├── anuraService.ts       # Anura API integration
│   │   ├── etherscanService.ts   # Etherscan API integration
│   │   └── getAllChainData.ts    # Multi-chain data aggregation
│   ├── page.tsx                  # Main app page with wallet input and roasting logic
│   └── layout.tsx                # App layout 
├── public/                       # Static assets
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Anura API key from [Anura](https://anura.lilypad.tech/)
- Blockchain API keys (Etherscan required, others optional)

### Installation

1. Clone and install dependencies:
   ```bash
   git clone https://github.com/JAlbertCode/roast-app.git
   cd roast-app
   npm install
   ```

2. Create `.env.local` with your API keys:
   ```
   ANURA_API_KEY=your_key_here
   NEXT_PUBLIC_ETHERSCAN_API_KEY=your_key_here
   # Optional: NEXT_PUBLIC_POLYGONSCAN_API_KEY, etc.
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment

**Vercel (Recommended)**
1. Import to Vercel and configure environment variables 
2. **Important**: Set Serverless Function Timeout to 60+ seconds (requires Vercel Pro)
   - Or modify code to use a faster model (see "Anura API Integration")

**Other Platforms**
```bash
npm run build
```

## Customization Guide

### 1. Change the Character
- Create a new SVG in `app/components/icons/`
- Update implementation in `SirCroaksworth.tsx`
- Modify character description in Anura API prompt

### 2. Modify Data Sources
- Update `app/utils/chains/config.ts` for different chains
- Modify `blockchainService.ts` for different data structures

### 3. Change AI Integration
- Update `anuraService.ts` with preferred AI service/model
- Try different available models (see "Anura API" section)

### 4. Customize UI/UX
- Modify TailwindCSS theme and Framer Motion animations
- Redesign speech bubble and sharing functionality

## Alternative DApp Ideas

1. **NFT Personality Analyzer**: Generate personality profiles from NFT collections
2. **Crypto Trading Coach**: Provide personalized trading advice based on history
3. **DeFi Strategy Recommender**: Suggest optimal DeFi strategies 
4. **Web3 Horoscope**: Generate horoscopes based on on-chain activity
5. **Smart Contract Auditor**: Quick security checks with AI feedback

## Anura API Integration

The DApp uses Anura, Lilypad Network's official AI inference API. Here's a simplified example:

```typescript
// Example API call (simplified)
const getRoast = async (transactionSummary: object) => {
  const response = await fetch("https://anura-testnet.lilypad.tech/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.ANURA_API_KEY}`
    },
    body: JSON.stringify({
      "model": "deepseek-r1:7b", // Or your preferred model
      "messages": [
        {
          "role": "system",
          "content": "You are Sir Croaksworth, a monocle-wearing frog banker who roasts people's crypto transactions with savage humor."
        },
        {
          "role": "user",
          "content": `Roast this wallet's transaction history: ${JSON.stringify(transactionSummary)}`
        }
      ],
      "stream": false,
      "options": { "temperature": 1.0 }
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
};
```

**Available Models:**
- `deepseek-r1:7b` - Default model
- `deepscaler:1.5b` - Faster, smaller model (recommended for timeout issues)
- `llama3.1:8b`, `phi4:14b`, `mistral:7b`, `openthinker:7b`, `llava:7b`

Check available models: `curl GET "https://anura-testnet.lilypad.tech/api/v1/models"`

## Working with AI Assistants

This project is designed to be AI-assistant friendly. Here are tips for using tools like Claude, ChatGPT, or GitHub Copilot:

### Effective Prompting

1. **Provide Context**: Share relevant code snippets when asking for modifications
2. **Specify File Paths**: Always mention exact locations (`app/utils/anuraService.ts`)
3. **One Task at a Time**: Break down customization into smaller tasks

### Project-Specific Tips

- **API Integration**: Share the existing code and [Lilypad API docs](https://docs.lilypad.tech/lilypad/developer-resources/inference-api)
- **Character Customization**: Show both `SirCroaksworth.tsx` and the SVG implementation
- **Blockchain Integration**: Share `chains/config.ts` when modifying chains
- **Styling**: Include examples of current styling when requesting changes

## License

This project is licensed under the MIT License - see the LICENSE file for details.
