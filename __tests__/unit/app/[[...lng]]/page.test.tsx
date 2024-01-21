import { render } from '@testing-library/react'
import Page from '@/app/page'

describe('Page', () => {
  it('renders a heading', () => {
    const page = render(<Page />)

    expect(page).toBeDefined()
  })
})
