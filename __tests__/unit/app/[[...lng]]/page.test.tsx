import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Page from '@/app/page'

const queryClient = new QueryClient()

describe('Page', () => {
  it('renders a heading', () => {
    const page = render(
      <QueryClientProvider client={queryClient}>
        <Page />
      </QueryClientProvider>
    )

    expect(page).toBeDefined()
  })
})
