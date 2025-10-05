import type { Metadata } from 'next'
import '@/index.css'

export const metadata: Metadata = {
  title: 'resume-helper',
  description: 'Resume Helper Application',
  icons: {
    icon: '/vite.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
