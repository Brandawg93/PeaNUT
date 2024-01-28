import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import '@/app/globals.css'
import ThemeProvider from '@/client/context/theme'
import LanguageProvider from '@/client/context/language'
import QueryWrapper from '@/client/context/query-client'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PeaNUT',
  description: 'A dashboard for NUT servers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body className={inter.className}>
        <QueryWrapper>
          <ThemeProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </ThemeProvider>
        </QueryWrapper>
      </body>
    </html>
  )
}
