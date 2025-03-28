# Sir Croaksworth's Roast DApp

## Overview

Sir Croaksworth's Roast DApp is a humorous web application that roasts users' cryptocurrency transactions using AI-generated humor. Sir Croaksworth, the monocle-wearing frog banker, analyzes on-chain data and delivers savage financial roasts in stylized speech bubbles.

### Key Features

- **Wallet Analysis**: Users paste their wallet address to receive personalized roasts based on their transaction history
- **Multi-Chain Support**: Fetches and analyzes transaction data from multiple blockchain networks (Ethereum, Polygon, Arbitrum, Optimism, Base, etc.)
- **AI-Powered Roasts**: Uses Anura API (Lilypad Network) to generate humorous, customized roasts
- **Social Sharing**: Users can share their roasts on Twitter tagging @lilypad_tech #Roasted
- **Engaging UI**: Animated SVG character and speech bubbles optimize the experience for shareability

## Tech Stack

- **Frontend**: TypeScript + React (Next.js)
- **Backend**: TypeScript (Next.js API routes)
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Blockchain Data**: Multiple chain explorer APIs (Etherscan, Polygonscan, Arbiscan, etc.)
- **AI Integration**: Anura API (Lilypad Network)

## How It Works

1. **Wallet Input**: User enters their wallet address
2. **Multi-Chain Data Fetching**: App fetches transactions from multiple blockchain explorer APIs
3. **Data Processing**: Transactions are summarized into a structured format
4. **AI Roast Generation**: Transaction summary is sent to Anura API for roast generation
5. **Display**: Sir Croaksworth delivers the roast in an animated speech bubble
6. **Social Sharing**: User can share the roast on Twitter tagging @lilypad_tech #Roasted

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

1. Clone the repository:
   ```bash
   git clone https://github.com/JAlbertCode/roast-app.git
   cd roast-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env.local` file in the project root with your API keys (you can copy from the provided `.env.example` file):
   ```
   ANURA_API_KEY=your_key_here
   
   # Required blockchain API keys
   NEXT_PUBLIC_ETHERSCAN_API_KEY=your_key_here
   
   # Optional blockchain API keys
   NEXT_PUBLIC_POLYGONSCAN_API_KEY=optional
   NEXT_PUBLIC_ARBISCAN_API_KEY=optional
   NEXT_PUBLIC_OPTIMISM_API_KEY=optional
   NEXT_PUBLIC_BASESCAN_API_KEY=optional
   NEXT_PUBLIC_FTMSCAN_API_KEY=optional
   NEXT_PUBLIC_BSCSCAN_API_KEY=optional
   NEXT_PUBLIC_CRONOSCAN_API_KEY=optional
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open http://localhost:3000 in your browser

### Deployment

#### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Import the project to Vercel
3. Configure environment variables in Vercel dashboard
4. **Important**: Configure the following in your Vercel deployment settings:
   - Set the **Serverless Function Timeout** to at least 60 seconds to accommodate longer API response times (requires a Vercel Pro account)
   - Alternatively, modify the code to use a faster model (see "Customizing the AI Model" section)

#### Manual Deployment

To deploy to other services:

```bash
npm run build
# or
yarn build
```

Deploy the resulting build using your preferred hosting service.

## Customization Guide

Here are some ways you can repurpose this DApp for your own needs:

### 1. Change the Character

Replace Sir Croaksworth with your own character by:
- Creating a new SVG component in the `app/components/icons/` directory
- Updating the character implementation in `SirCroaksworth.tsx`
- Modifying the character description in the prompt to Anura API

### 2. Modify the Data Source

The app currently uses multiple blockchain explorer APIs, but you can adapt it to use any data source:

- Update `app/utils/chains/config.ts` to modify supported chains or add new ones
- Modify the data processing logic in `blockchainService.ts` to handle different data structures
- Update the prompt to Anura API to reference the new data

### 3. Change the AI Integration

You can replace or modify the Anura API integration:

- Update `anuraService.ts` to use your preferred AI service or model
- Try different available models (see "Anura API Integration" section below)
- Adjust the prompt format to match the requirements of your chosen API
- Update API key handling in the environment variables

### 4. Customize the UI/UX

- Modify the TailwindCSS theme in `tailwind.config.js`
- Update animations in Framer Motion components
- Redesign the speech bubble in `SpeechBubble.tsx`
- Change the sharing functionality in `ShareButton.tsx`

## Alternative DApp Ideas

Here are some ideas for repurposing this codebase:

1. **NFT Personality Analyzer**: Analyze a user's NFT collection and generate a personality profile
2. **Crypto Trading Coach**: Review trading history and provide personalized trading advice
3. **DeFi Strategy Recommender**: Analyze wallet activity and suggest optimal DeFi strategies
4. **Web3 Horoscope**: Generate humorous "horoscopes" based on on-chain activity
5. **Smart Contract Auditor**: Simplified interface for basic smart contract security checks with AI feedback

## Anura API Integration

The DApp uses Anura, Lilypad Network's official AI inference API, for generating roasts. Here's how the integration works:

```typescript
// Example API call to Anura (simplified version for demonstration)
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
      "options": {
        "temperature": 1.0
      }
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
};
```

**Note**: The actual implementation includes more complex handling for streaming responses, error handling, and fallback mechanisms that aren't shown in this simplified example.

The application uses `deepseek-r1:7b` model by default, but several other models are available:
- `deepscaler:1.5b` - Much smaller/faster model (recommended if you hit timeout issues)
- `llama3.1:8b` - Balanced performance with high quality
- `phi4:14b` - Larger model with potentially better roast quality
- `mistral:7b` - Alternative model with different response style
- `openthinker:7b` - Alternative model with different characteristics
- `llava:7b` - Another option with unique response patterns

You can check which models are available by calling the API endpoint:

```bash
curl GET "https://anura-testnet.lilypad.tech/api/v1/models" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_API_KEY"
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
