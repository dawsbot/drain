import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { MoralisClient } from '../../../../src/moralis-client';
import { blacklistAddresses } from '../../../../src/token-lists';

// Validate environment variable
const MORALIS_API_KEY = z.string().parse(process.env.MORALIS_API_KEY);

// Initialize Moralis client (can be reused across requests)
const moralisClient = new MoralisClient(MORALIS_API_KEY);

// Fetch tokens using Moralis client
const fetchTokens = async (chainId: number, evmAddress: string) => {
  return moralisClient.fetchTokens(chainId, evmAddress, blacklistAddresses);
};

const positiveIntFromString = (value: string): number => {
  const intValue = parseInt(value, 10);

  if (isNaN(intValue) || intValue <= 0) {
    throw new Error('Value must be a positive integer');
  }

  return intValue;
};

const requestQuerySchema = z.object({
  chainId: z.string().transform(positiveIntFromString),
  evmAddress: z.string(),
});

// Define the API route handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { chainId, evmAddress } = requestQuerySchema.parse(req.query);

    // Validate that the chain is supported
    const supportedChains = MoralisClient.getSupportedChainIds();
    if (!supportedChains.includes(chainId)) {
      return res.status(400).json({
        success: false,
        error: `Chain ID ${chainId} is not supported. Supported chains: ${supportedChains.join(', ')}`,
      });
    }

    const response = await fetchTokens(chainId, evmAddress);

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error('Error processing the request:', error);

    // Return more detailed error message in development
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Server Error';

    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}
