import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import '../globals.css'
import ThemeProvider from '@/client/context/theme'
import LanguageProvider from '@/client/context/language'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PeaNUT',
  description: 'A dashboard for NUT servers',
}

export default function RootLayout({ children, params }: { children: React.ReactNode; params: any }) {
  return (
    <html lang={params.lng || 'en'}>
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
