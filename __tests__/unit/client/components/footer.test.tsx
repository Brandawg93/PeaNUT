import React from 'react'
import { render } from '@testing-library/react'
import Footer from '@/client/components/footer'

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        {
          name: 'v1.0.0',
          published_at: '2021-01-01T00:00:00Z',
          html_url: '',
        },
      ]),
  })
) as jest.Mock

describe('Footer', () => {
  it('renders', () => {
    const { getByTestId } = render(<Footer updated={new Date()} />)

    expect(getByTestId('footer')).toBeInTheDocument()
  })
})
