import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI-Selfie mit Emilia ✨',
  description: 'Erstelle realistische Selfies mit Emilia mithilfe von KI. 3 einfache Schritte zum perfekten Selfie.',
  keywords: ['AI', 'Selfie', 'KI', 'Emilia', 'Foto', 'Generator'],
  authors: [{ name: 'Emilia Selfie Generator' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#ec4899',
  openGraph: {
    title: 'AI-Selfie mit Emilia ✨',
    description: 'Erstelle realistische Selfies mit Emilia mithilfe von KI',
    type: 'website',
    locale: 'de_DE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Selfie mit Emilia ✨',
    description: 'Erstelle realistische Selfies mit Emilia mithilfe von KI',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        {children}
      </body>
    </html>
  )
}