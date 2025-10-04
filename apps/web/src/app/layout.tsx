import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mentor - AI Assistant',
  description: 'Full-stack AI application powered by Mastra',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
