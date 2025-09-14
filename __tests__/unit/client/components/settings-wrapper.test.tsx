import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SettingsWrapper from '@/client/components/settings-wrapper'
import { LanguageContext } from '@/client/context/language'
import { TEST_USERNAME, TEST_PASSWORD } from '../../../utils/test-constants'
// import { useRouter } from 'next/navigation'

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ name: '1.0.0' }]),
  })
) as jest.Mock

const mockCheckSettingsAction = jest.fn()
const mockGetSettingsAction = jest.fn()
const mockSetSettingsAction = jest.fn()
const mockExportSettingsAction = jest.fn()
const mockImportSettingsAction = jest.fn()
const mockDeleteSettingsAction = jest.fn()
const mockUpdateServersAction = jest.fn()
const mockTestConnectionAction = jest.fn().mockResolvedValue('success')
const mockTestInfluxConnectionAction = jest.fn()

const renderComponent = () =>
  render(
    <LanguageContext.Provider value='en'>
      <SettingsWrapper
        checkSettingsAction={mockCheckSettingsAction}
        getSettingsAction={mockGetSettingsAction}
        setSettingsAction={mockSetSettingsAction}
        exportSettingsAction={mockExportSettingsAction}
        importSettingsAction={mockImportSettingsAction}
        deleteSettingsAction={mockDeleteSettingsAction}
        updateServersAction={mockUpdateServersAction}
        testConnectionAction={mockTestConnectionAction}
        testInfluxConnectionAction={mockTestInfluxConnectionAction}
      />
    </LanguageContext.Provider>
  )

describe('SettingsWrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the settings wrapper component', async () => {
    mockCheckSettingsAction.mockResolvedValue(true)
    mockGetSettingsAction.mockResolvedValueOnce([{ server: { HOST: 'localhost', PORT: 8080 }, saved: true }])

    renderComponent()

    await waitFor(() => {
      expect(screen.getByTestId('settings-wrapper')).toBeInTheDocument()
    })
  })

  it('loads server settings if settings check passes', async () => {
    mockCheckSettingsAction.mockResolvedValue(true)
    mockGetSettingsAction.mockResolvedValueOnce([{ HOST: 'localhost', PORT: 8080, DISABLED: false }])

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('settings.manageServers')).toBeInTheDocument()
    })
  })

  it('handles server change correctly', async () => {
    mockCheckSettingsAction.mockResolvedValue(true)
    const servers = [
      { HOST: 'localhost', PORT: 8080, USERNAME: TEST_USERNAME, PASSWORD: TEST_PASSWORD, DISABLED: false },
    ]
    mockGetSettingsAction.mockResolvedValueOnce(servers)
    mockGetSettingsAction.mockResolvedValueOnce('influxHost')
    mockGetSettingsAction.mockResolvedValueOnce('influxToken')
    mockGetSettingsAction.mockResolvedValueOnce('influxOrg')
    mockGetSettingsAction.mockResolvedValueOnce('influxBucket')

    renderComponent()

    await waitFor(() => {
      expect(screen.getByTestId('server')).toBeInTheDocument()
    })

    const serverInput = screen.getByTestId('server')
    fireEvent.change(serverInput, { target: { value: 'newhost' } })

    await waitFor(() => {
      expect(screen.getByDisplayValue('newhost')).toBeInTheDocument()
    })
  })

  it('persists DISABLED flag when saving servers', async () => {
    mockCheckSettingsAction.mockResolvedValue(true)
    const servers = [
      { HOST: 'localhost', PORT: 8080, USERNAME: TEST_USERNAME, PASSWORD: TEST_PASSWORD, DISABLED: true },
    ]
    mockGetSettingsAction.mockResolvedValueOnce(servers)
    mockGetSettingsAction.mockResolvedValueOnce('influxHost')
    mockGetSettingsAction.mockResolvedValueOnce('influxToken')
    mockGetSettingsAction.mockResolvedValueOnce('influxOrg')
    mockGetSettingsAction.mockResolvedValueOnce('influxBucket')
    mockGetSettingsAction.mockResolvedValueOnce(10)
    mockGetSettingsAction.mockResolvedValueOnce('MM/DD/YYYY')
    mockGetSettingsAction.mockResolvedValueOnce('12-hour')
    mockGetSettingsAction.mockResolvedValueOnce([
      { key: 'KPIS', enabled: true },
      { key: 'CHARTS', enabled: true },
      { key: 'VARIABLES', enabled: true },
    ])
    mockGetSettingsAction.mockResolvedValueOnce(false)

    renderComponent()

    await waitFor(() => {
      expect(screen.getByTestId('settings-wrapper')).toBeInTheDocument()
    })

    // Click apply in servers tab
    const applyButtons = await screen.findAllByText('settings.apply')
    const serversApply = applyButtons[0]
    serversApply.click()

    await waitFor(() => {
      expect(mockUpdateServersAction).toHaveBeenCalledWith([
        { HOST: 'localhost', PORT: 8080, USERNAME: TEST_USERNAME, PASSWORD: TEST_PASSWORD, DISABLED: true },
      ])
    })
  })
})
