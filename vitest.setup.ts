import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to load environment variables from multiple sources
const envFiles = ['.env.local', '.env'];

for (const envFile of envFiles) {
  const envPath = path.resolve(__dirname, envFile);
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from ${envFile}`);
    config({ path: envPath });
    break;
  }
}

// Verify MORALIS_API_KEY is loaded
if (!process.env.MORALIS_API_KEY) {
  console.warn(
    '⚠️  MORALIS_API_KEY not found in environment variables. Tests may fail.',
  );
  console.warn('   Please create .env.local or .env with MORALIS_API_KEY');
}
