import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { ThemeProvider } from '@/client/context/theme-provider'
import LanguageProvider from '@/client/context/language'
import i18next from 'i18next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PeaNUT',
  description: 'A dashboard for NUT servers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang={i18next.language}>
      <body className={`${inter.className} bg-background`}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
