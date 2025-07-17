import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import DayNightSwitch from '@/client/components/daynight'
import LanguageProvider from '@/client/context/language'

describe('Daynight', () => {
  let component: React.ReactElement<any>
  beforeAll(() => {
    component = (
      <LanguageProvider>
        <DayNightSwitch />
      </LanguageProvider>
    )
  })

  it('displays the correct initial theme icon', () => {
    const { getByTitle } = render(component)
    expect(getByTitle('theme.title')).toBeInTheDocument()
  })

  it('changes theme on selection', async () => {
    const { getByTestId } = render(component)
    const select = getByTestId('daynight-trigger')
    fireEvent.pointerDown(select)
    const option = await screen.findByText('theme.dark')
    fireEvent.click(option)
    expect(option).toHaveClass('self-center')
  })

  it('displays the correct icon for each theme', async () => {
    const { getByTestId } = render(component)
    const select = getByTestId('daynight-trigger')
    fireEvent.pointerDown(select)
    const optionDark = await screen.findByText('theme.dark')
    const optionLight = await screen.findByText('theme.light')
    const optionSystem = await screen.findByText('theme.system')
    fireEvent.click(optionDark)
    expect(optionDark).toHaveClass('self-center')
    fireEvent.click(optionLight)
    expect(optionLight).toHaveClass('self-center')
    fireEvent.click(optionSystem)
    expect(optionSystem).toHaveClass('self-center')
  })
})
