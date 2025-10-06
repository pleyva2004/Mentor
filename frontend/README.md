This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cursor Prompting API

A Next.js API route is available at `POST /api/prompts/cursor`.

Request body:

```json
{
  "input": "string (required)",
  "context": { "any": "json" }
}
```

Response body:

```json
{
  "responseText": "string",
  "model": "string",
  "meta": { "usage": { "promptTokens": 0, "completionTokens": 0, "totalTokens": 0 } }
}
```

Environment variables (see `.env.local.example`):

- `OPENAI_API_KEY` – optional, enables real LLM; without it a mock response is returned.
- `OPENAI_API_MODEL` – optional model override.
- `PROMPT_RATE_LIMIT` and `PROMPT_RATE_INTERVAL_MS` – rate limiting controls.

