'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TimeRangeProvider } from './time-range'

const queryClient = new QueryClient()

export default function QueryWrapper({ children }: { readonly children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TimeRangeProvider>{children}</TimeRangeProvider>
    </QueryClientProvider>
  )
}
