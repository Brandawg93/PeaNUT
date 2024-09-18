import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Page from '@/app/page'

const queryClient = new QueryClient()

describe('Page', () => {
  it('renders a heading', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Page />
      </QueryClientProvider>
    )

    const wrapper = await screen.findByTestId('wrapper')
    expect(wrapper).toBeInTheDocument()
  })
})
