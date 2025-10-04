import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Welcome to Mentor
        </h1>
        <p className="text-center mb-8">
          Full-stack AI application powered by Mastra
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/chat"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Chat with AI
          </Link>
          <Link
            href="/workflows"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Run Workflows
          </Link>
        </div>
      </div>
    </main>
  );
}
