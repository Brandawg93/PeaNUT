import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import DayNightSwitch from '@/client/components/daynight'
import LanguageProvider from '@/client/context/language'

describe('Daynight', () => {
  let component: React.ReactElement
  beforeAll(() => {
    component = (
      <LanguageProvider>
        <DayNightSwitch />
      </LanguageProvider>
    )
  })

  it('renders', () => {
    const { getByTestId } = render(component)
    expect(getByTestId('daynight')).toBeInTheDocument()
  })

  it('displays the correct initial theme icon', () => {
    const { getByTitle } = render(component)
    expect(getByTitle('theme.title')).toBeInTheDocument()
  })

  it('changes theme on selection', () => {
    const { getByTitle, getByText } = render(component)
    fireEvent.click(getByTitle('theme.title'))
    fireEvent.click(getByText('theme.dark'))
    expect(getByText('theme.dark')).toHaveClass('self-center')
  })

  it('displays the correct icon for each theme', () => {
    const { getByTitle, getByText } = render(component)
    fireEvent.click(getByTitle('theme.title'))
    fireEvent.click(getByText('theme.light'))
    expect(getByText('theme.light')).toHaveClass('self-center')
    fireEvent.click(getByText('theme.system'))
    expect(getByText('theme.system')).toHaveClass('self-center')
  })
})
