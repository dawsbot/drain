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

// Live Moralis suites are opt-in so the default test run stays deterministic.
if (!process.env.MORALIS_API_KEY) {
  console.warn(
    'MORALIS_API_KEY not found. Live Moralis tests will be skipped.',
  );
  console.warn('Add it to .env.local to run the live integration suites.');
}
