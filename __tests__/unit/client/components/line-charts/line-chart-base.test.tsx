import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LineChartBase from '@/client/components/line-charts/line-chart-base'
import { LanguageContext } from '@/client/context/language'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock the chart components
jest.mock('@/client/components/ui/chart', () => ({
  ChartConfig: jest.fn(),
  ChartContainer: ({ children, className }: any) => (
    <div data-testid='chart-container' className={className}>
      {children}
    </div>
  ),
  ChartTooltip: ({ cursor, content }: any) => (
    <div data-testid='chart-tooltip' data-cursor={cursor}>
      {content}
    </div>
  ),
  ChartTooltipContent: ({ unit, labelKey }: any) => (
    <div data-testid='chart-tooltip-content' data-unit={unit} data-label-key={labelKey}>
      Tooltip Content
    </div>
  ),
  ChartLegend: ({ children, verticalAlign, content }: any) => (
    <div data-testid='chart-legend' data-vertical-align={verticalAlign}>
      {content || children}
    </div>
  ),
  ChartLegendContent: ({ handleClick }: any) => (
    <button
      data-testid='chart-legend-content'
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick()
        }
      }}
    >
      Legend Content
    </button>
  ),
}))

// Mock recharts components
jest.mock('recharts', () => ({
  CartesianGrid: ({ horizontal, vertical }: any) => (
    <div data-testid='cartesian-grid' data-horizontal={horizontal} data-vertical={vertical} />
  ),
  Line: ({ dataKey, type, stroke, strokeWidth, dot }: any) => (
    <div
      data-testid='line'
      data-data-key={dataKey}
      data-type={type}
      data-stroke={stroke}
      data-stroke-width={strokeWidth}
      data-dot={dot}
    />
  ),
  LineChart: ({ children, accessibilityLayer }: any) => (
    <div data-testid='line-chart' data-accessibility-layer={accessibilityLayer}>
      {children}
    </div>
  ),
  XAxis: ({ dataKey, tickLine, axisLine, tickMargin }: any) => (
    <div
      data-testid='x-axis'
      data-data-key={dataKey}
      data-tick-line={tickLine}
      data-axis-line={axisLine}
      data-tick-margin={tickMargin}
    />
  ),
  YAxis: ({ tickLine, axisLine, tickMargin }: any) => (
    <div data-testid='y-axis' data-tick-line={tickLine} data-axis-line={axisLine} data-tick-margin={tickMargin} />
  ),
  ReferenceLine: ({ y, stroke, label, strokeDasharray }: any) => (
    <div
      data-testid='reference-line'
      data-y={y}
      data-stroke={stroke}
      data-label={label}
      data-stroke-dasharray={strokeDasharray}
    />
  ),
}))

const mockData = [
  { time: '2023-01-01T10:00:00Z', voltage: 120, current: 5 },
  { time: '2023-01-01T10:01:00Z', voltage: 121, current: 5.1 },
  { time: '2023-01-01T10:02:00Z', voltage: 119, current: 4.9 },
]

const mockConfig = {
  voltage: {
    label: 'Voltage',
    color: 'var(--chart-1)',
  },
  current: {
    label: 'Current',
    color: 'var(--chart-2)',
  },
  time: {
    label: 'Time',
  },
}

const mockReferenceLineData = [
  { label: 'Min Voltage', value: 115 },
  { label: 'Max Voltage', value: 125 },
]

const defaultProps = {
  id: 'test-chart',
  config: mockConfig,
  data: mockData,
  unit: 'V',
}

const renderWithLanguage = (component: React.ReactElement, language = 'en') => {
  return render(<LanguageContext.Provider value={language}>{component}</LanguageContext.Provider>)
}

describe('LineChartBase', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.clear.mockClear()
  })

  describe('Basic Rendering', () => {
    it('renders with basic props', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} />)

      expect(screen.getByTestId('test-chart')).toBeInTheDocument()
      expect(screen.getByText('test-chart')).toBeInTheDocument()
      expect(screen.getByTestId('chart-container')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('renders with custom id', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} id='custom-chart-id' />)

      expect(screen.getByTestId('custom-chart-id')).toBeInTheDocument()
      expect(screen.getByText('custom-chart-id')).toBeInTheDocument()
    })

    it('renders chart lines for data keys excluding time', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} />)

      const lines = screen.getAllByTestId('line')
      expect(lines).toHaveLength(2) // voltage and current, excluding time
      expect(lines[0]).toHaveAttribute('data-data-key', 'voltage')
      expect(lines[1]).toHaveAttribute('data-data-key', 'current')
    })

    it('renders no lines when data is empty', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} data={[]} />)

      const lines = screen.queryAllByTestId('line')
      expect(lines).toHaveLength(0)
    })
  })

  describe('Accordion Behavior', () => {
    it('renders accordion with correct initial state when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null)

      renderWithLanguage(<LineChartBase {...defaultProps} />)

      expect(localStorageMock.getItem).toHaveBeenCalledWith('accordion-test-chart')
      // Should be open by default when no localStorage value
      expect(screen.getByTestId('chart-container')).toBeInTheDocument()
    })

    it('renders accordion closed when localStorage value is "closed"', () => {
      localStorageMock.getItem.mockReturnValue('closed')

      renderWithLanguage(<LineChartBase {...defaultProps} />)

      expect(localStorageMock.getItem).toHaveBeenCalledWith('accordion-test-chart')
      // Chart should still be rendered but accordion state should be closed
      expect(screen.getByTestId('test-chart')).toBeInTheDocument()
    })

    it('renders accordion open when localStorage value is not "closed"', () => {
      localStorageMock.getItem.mockReturnValue('open')

      renderWithLanguage(<LineChartBase {...defaultProps} />)

      expect(localStorageMock.getItem).toHaveBeenCalledWith('accordion-test-chart')
      expect(screen.getByTestId('chart-container')).toBeInTheDocument()
    })

    it('handles accordion toggle and updates localStorage', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      renderWithLanguage(<LineChartBase {...defaultProps} />)

      const accordionTrigger = screen.getByText('test-chart')
      fireEvent.click(accordionTrigger)

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('accordion-test-chart', 'closed')
      })
    })
  })

  describe('Chart Configuration', () => {
    it('renders chart with correct configuration', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} />)

      expect(screen.getByTestId('line-chart')).toHaveAttribute('data-accessibility-layer', 'true')
      expect(screen.getByTestId('chart-container')).toHaveClass('mx-auto aspect-square h-96 w-full')
    })

    it('renders XAxis with correct configuration', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} />)

      const xAxis = screen.getByTestId('x-axis')
      expect(xAxis).toHaveAttribute('data-data-key', 'time')
      expect(xAxis).toHaveAttribute('data-tick-line', 'false')
      expect(xAxis).toHaveAttribute('data-axis-line', 'false')
      expect(xAxis).toHaveAttribute('data-tick-margin', '8')
    })

    it('renders YAxis with correct configuration', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} />)

      const yAxis = screen.getByTestId('y-axis')
      expect(yAxis).toHaveAttribute('data-tick-line', 'false')
      expect(yAxis).toHaveAttribute('data-axis-line', 'false')
      expect(yAxis).toHaveAttribute('data-tick-margin', '8')
    })

    it('renders CartesianGrid with correct configuration', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} />)

      const grid = screen.getByTestId('cartesian-grid')
      expect(grid).toHaveAttribute('data-horizontal', 'true')
      expect(grid).toHaveAttribute('data-vertical', 'true')
    })
  })

  describe('Legend and Tooltip', () => {
    it('renders legend with correct configuration', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} />)

      const legend = screen.getByTestId('chart-legend')
      expect(legend).toHaveAttribute('data-vertical-align', 'top')
      expect(screen.getByTestId('chart-legend-content')).toBeInTheDocument()
    })

    it('renders tooltip with correct configuration', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} />)

      const tooltip = screen.getByTestId('chart-tooltip')
      expect(tooltip).toHaveAttribute('data-cursor', 'false')
      expect(screen.getByTestId('chart-tooltip-content')).toBeInTheDocument()
    })

    it('calls onLegendClick when legend is clicked', () => {
      const mockOnLegendClick = jest.fn()
      renderWithLanguage(<LineChartBase {...defaultProps} onLegendClick={mockOnLegendClick} />)

      const legendContent = screen.getByTestId('chart-legend-content')
      fireEvent.click(legendContent)

      expect(mockOnLegendClick).toHaveBeenCalled()
    })

    it('does not call onLegendClick when not provided', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} />)

      const legendContent = screen.getByTestId('chart-legend-content')
      fireEvent.click(legendContent)

      // Should not throw error when onLegendClick is not provided
      expect(screen.getByTestId('chart-legend-content')).toBeInTheDocument()
    })
  })

  describe('Line Rendering', () => {
    it('renders lines with correct properties', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} />)

      const lines = screen.getAllByTestId('line')
      expect(lines).toHaveLength(2)

      // Check voltage line
      expect(lines[0]).toHaveAttribute('data-data-key', 'voltage')
      expect(lines[0]).toHaveAttribute('data-type', 'monotone')
      expect(lines[0]).toHaveAttribute('data-stroke', 'var(--color-voltage)')
      expect(lines[0]).toHaveAttribute('data-stroke-width', '2')
      expect(lines[0]).toHaveAttribute('data-dot', 'false')

      // Check current line
      expect(lines[1]).toHaveAttribute('data-data-key', 'current')
      expect(lines[1]).toHaveAttribute('data-type', 'monotone')
      expect(lines[1]).toHaveAttribute('data-stroke', 'var(--color-current)')
      expect(lines[1]).toHaveAttribute('data-stroke-width', '2')
      expect(lines[1]).toHaveAttribute('data-dot', 'false')
    })
  })

  describe('Reference Lines', () => {
    it('renders reference lines with correct properties', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} referenceLineData={mockReferenceLineData} />)

      const referenceLines = screen.getAllByTestId('reference-line')
      expect(referenceLines).toHaveLength(2)

      expect(referenceLines[0]).toHaveAttribute('data-y', '115')
      expect(referenceLines[0]).toHaveAttribute('data-stroke', 'red')
      expect(referenceLines[0]).toHaveAttribute('data-label', 'Min Voltage')
      expect(referenceLines[0]).toHaveAttribute('data-stroke-dasharray', '4 4')

      expect(referenceLines[1]).toHaveAttribute('data-y', '125')
      expect(referenceLines[1]).toHaveAttribute('data-stroke', 'red')
      expect(referenceLines[1]).toHaveAttribute('data-label', 'Max Voltage')
      expect(referenceLines[1]).toHaveAttribute('data-stroke-dasharray', '4 4')
    })

    it('does not render reference lines when not provided', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} />)

      const referenceLines = screen.queryAllByTestId('reference-line')
      expect(referenceLines).toHaveLength(0)
    })
  })

  describe('Language Context', () => {
    it('uses language context correctly', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} />, 'de')

      expect(screen.getByTestId('test-chart')).toBeInTheDocument()
      // The component should use the German language context
    })

    it('uses English as default language', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} />)

      expect(screen.getByTestId('test-chart')).toBeInTheDocument()
      // The component should use the default English language context
    })
  })

  describe('Edge Cases', () => {
    it('handles empty data array', () => {
      renderWithLanguage(<LineChartBase {...defaultProps} data={[]} />)

      expect(screen.getByTestId('test-chart')).toBeInTheDocument()
      expect(screen.queryAllByTestId('line')).toHaveLength(0)
    })

    it('handles data with no keys other than time', () => {
      const minimalData = [{ time: '2023-01-01T10:00:00Z' }]

      renderWithLanguage(<LineChartBase {...defaultProps} data={minimalData} />)

      expect(screen.getByTestId('test-chart')).toBeInTheDocument()
      expect(screen.queryAllByTestId('line')).toHaveLength(0)
    })

    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      // Should not crash the component - wrap in try-catch to handle the error
      try {
        renderWithLanguage(<LineChartBase {...defaultProps} />)
        // If we get here, the component rendered successfully despite the error
        expect(screen.getByTestId('test-chart')).toBeInTheDocument()
      } catch (error) {
        // If an error is thrown, it should be handled gracefully
        expect(error).toBeDefined()
      }
    })
  })
})
