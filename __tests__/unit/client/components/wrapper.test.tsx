import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Wrapper from '@/client/components/wrapper'

const queryClient = new QueryClient()

describe('Wrapper', () => {
  it('renders', () => {
    const { getByTestId } = render(
      <QueryClientProvider client={queryClient}>
        <Wrapper />
      </QueryClientProvider>
    )

    expect(getByTestId('wrapper')).toBeInTheDocument()
  })
})
