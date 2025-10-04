import { mastra } from './mastra';

// Start the Mastra server
const port = Number(process.env.PORT) || 3000;

async function main() {
  console.log(`🚀 Starting Mastra API server on port ${port}...`);

  await mastra.start();

  console.log(`✅ Mastra API server running at http://localhost:${port}`);
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
