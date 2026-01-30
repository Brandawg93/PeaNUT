import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NutGrid from '@/client/components/grid'
import { DEVICE } from '@/common/types'
import { saveVar } from '@/app/actions'
import PromiseSocket from '@/server/promise-socket'

jest.mock('@/app/actions', () => ({
  saveVar: jest.fn(),
}))

const queryClient = new QueryClient()

const device: DEVICE = {
  id: 'localhost:3493/test',
  name: 'test',
  server: 'localhost:3493',
  vars: {
    'input.voltage': {
      value: '120',
    },
    'device.serial': {
      value: 'ABC123',
    },
    'input.voltage.nominal': {
      value: '120',
    },
    'output.voltage': {
      value: '120',
    },
    'battery.charge': {
      value: '85',
    },
    'ups.status': {
      value: 'OL',
    },
  },
  rwVars: ['input.voltage'],
  commands: [],
  description: 'test',
  clients: [],
}

describe('Grid', () => {
  beforeAll(() => {
    jest.spyOn(PromiseSocket.prototype, 'connect').mockResolvedValue()
    jest.spyOn(PromiseSocket.prototype, 'close').mockResolvedValue()
    jest.spyOn(PromiseSocket.prototype, 'write').mockResolvedValue()
  })

  const renderGrid = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <NutGrid data={device} onRefetchAction={jest.fn()} />
      </QueryClientProvider>
    )
  }

  it('renders', () => {
    const { getByTestId } = renderGrid()
    expect(getByTestId('grid')).toBeInTheDocument()
  })

  describe('Filter functionality', () => {
    it('shows filter button with outline icon when no filter is applied', () => {
      renderGrid()

      const filterButton = screen.getByLabelText('grid.filter.placeholder')
      expect(filterButton).toBeInTheDocument()
      expect(filterButton).toHaveClass('hover:bg-accent') // ghost variant

      // Should show outline filter icon
      const filterIcon = filterButton.querySelector('svg')
      expect(filterIcon).toBeInTheDocument()
    })

    it('opens filter dropdown when filter button is clicked', () => {
      renderGrid()

      const filterButton = screen.getByLabelText('grid.filter.placeholder')
      fireEvent.click(filterButton)

      // Should show the popover content
      expect(screen.getByPlaceholderText('grid.filter.placeholder')).toBeInTheDocument()
      expect(screen.getByLabelText('grid.filter.apply')).toBeInTheDocument()
      expect(screen.getByLabelText('grid.filter.clear')).toBeInTheDocument()
    })

    it('applies filter when checkmark button is clicked', async () => {
      renderGrid()

      // Open filter dropdown
      const filterButton = screen.getByLabelText('grid.filter.placeholder')
      fireEvent.click(filterButton)

      // Type in filter input
      const filterInput = screen.getByPlaceholderText('grid.filter.placeholder')
      fireEvent.change(filterInput, { target: { value: 'voltage' } })

      // Click apply button
      const applyButton = screen.getByLabelText('grid.filter.apply')
      fireEvent.click(applyButton)

      // Filter should be applied - check that only voltage-related rows are shown
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        // Should have header + filtered rows (only voltage-related)
        expect(rows.length).toBeLessThan(7) // Less than all 6 vars + header
      })
    })

    it('clears filter when X button is clicked', async () => {
      renderGrid()

      // Open filter dropdown
      const filterButton = screen.getByLabelText('grid.filter.placeholder')
      fireEvent.click(filterButton)

      // Type in filter input
      const filterInput = screen.getByPlaceholderText('grid.filter.placeholder')
      fireEvent.change(filterInput, { target: { value: 'voltage' } })

      // Click clear button directly (without applying first)
      const clearButton = screen.getByLabelText('grid.filter.clear')
      fireEvent.click(clearButton)

      // Input should be cleared and dropdown should close
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('grid.filter.placeholder')).not.toBeInTheDocument()
      })
    })

    it('applies filter when Enter key is pressed in input', async () => {
      renderGrid()

      // Open filter dropdown
      const filterButton = screen.getByLabelText('grid.filter.placeholder')
      fireEvent.click(filterButton)

      // Type in filter input and press Enter
      const filterInput = screen.getByPlaceholderText('grid.filter.placeholder')
      fireEvent.change(filterInput, { target: { value: 'battery' } })
      fireEvent.keyDown(filterInput, { key: 'Enter', code: 'Enter' })

      // Filter should be applied
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        expect(rows.length).toBeLessThan(7) // Less than all rows
      })
    })

    it('closes filter dropdown when Escape key is pressed', async () => {
      renderGrid()

      // Open filter dropdown
      const filterButton = screen.getByLabelText('grid.filter.placeholder')
      fireEvent.click(filterButton)

      // Should show filter input
      expect(screen.getByPlaceholderText('grid.filter.placeholder')).toBeInTheDocument()

      // Press Escape
      const filterInput = screen.getByPlaceholderText('grid.filter.placeholder')
      fireEvent.keyDown(filterInput, { key: 'Escape', code: 'Escape' })

      // Filter dropdown should be closed
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('grid.filter.placeholder')).not.toBeInTheDocument()
      })
    })

    it('shows filled filter icon and blue dot when filter is active', async () => {
      renderGrid()

      // Open filter dropdown
      const filterButton = screen.getByLabelText('grid.filter.placeholder')
      fireEvent.click(filterButton)

      // Apply a filter
      const filterInput = screen.getByPlaceholderText('grid.filter.placeholder')
      fireEvent.change(filterInput, { target: { value: 'voltage' } })
      const applyButton = screen.getByLabelText('grid.filter.apply')
      fireEvent.click(applyButton)

      // Check that filter button shows active state
      await waitFor(() => {
        const activeFilterButton = screen.getByLabelText('grid.filter.placeholder')
        expect(activeFilterButton).toHaveClass('bg-secondary') // secondary variant

        // Should have blue dot indicator
        const blueDot = activeFilterButton.querySelector('.bg-blue-500')
        expect(blueDot).toBeInTheDocument()
      })
    })

    it('filters rows correctly with includes matching', async () => {
      renderGrid()

      // Open filter dropdown
      const filterButton = screen.getByLabelText('grid.filter.placeholder')
      fireEvent.click(filterButton)

      // Apply filter for 'voltage'
      const filterInput = screen.getByPlaceholderText('grid.filter.placeholder')
      fireEvent.change(filterInput, { target: { value: 'voltage' } })
      const applyButton = screen.getByLabelText('grid.filter.apply')
      fireEvent.click(applyButton)

      // Should only show voltage-related rows
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        const dataRows = rows.slice(1) // Skip header row

        // All visible rows should contain 'voltage' in their key
        for (const row of dataRows) {
          const keyCell = row.querySelector('td:first-child')
          expect((keyCell?.textContent || '').toLowerCase()).toContain('voltage')
        }
      })
    })

    it('works with both flat and tree view modes', async () => {
      renderGrid()

      // Test flat view first
      const filterButton = screen.getByLabelText('grid.filter.placeholder')
      fireEvent.click(filterButton)

      const filterInput = screen.getByPlaceholderText('grid.filter.placeholder')
      fireEvent.change(filterInput, { target: { value: 'input' } })
      const applyButton = screen.getByLabelText('grid.filter.apply')
      fireEvent.click(applyButton)

      // Switch to tree view - find the toggle button by looking for the list icon
      const treeToggleButtons = screen.getAllByRole('button')
      const treeToggleButton = treeToggleButtons.find(
        (button) => button.querySelector('svg') && button.dataset.slot === 'button'
      )
      expect(treeToggleButton).toBeDefined()
      fireEvent.click(treeToggleButton!)

      // Filter should still work in tree view
      await waitFor(() => {
        const rows = screen.getAllByRole('row')
        expect(rows.length).toBeLessThan(7) // Should still be filtered
      })
    })
  })

  describe('Edit functionality', () => {
    it('saves the correct value when edited', async () => {
      ;(saveVar as jest.Mock).mockResolvedValue({ error: undefined })

      const { getAllByRole, getByLabelText } = renderGrid()

      // Find the row with 'input.voltage' (which is in rwVars)
      const rows = getAllByRole('row')
      const voltageRow = rows.find((row) => row.textContent?.includes('input.voltage'))
      expect(voltageRow).toBeDefined()

      // Click the edit button
      const editButton = getByLabelText('Edit variable')
      fireEvent.click(editButton)

      // Find the input field (it should be in the document now)
      const input = screen.getByDisplayValue('120')
      fireEvent.change(input, { target: { value: '230' } })

      // Click the save button
      const saveButton = getByLabelText('Save changes')
      fireEvent.click(saveButton)

      // Verify saveVar was called with the new value
      await waitFor(() => {
        expect(saveVar).toHaveBeenCalledWith(device.id, 'input.voltage', '230')
      })
    })

    it('cancels editing when cancel button is clicked', async () => {
      const { getByLabelText, queryByLabelText, getByDisplayValue } = renderGrid()

      // Click the edit button
      const editButton = getByLabelText('Edit variable')
      fireEvent.click(editButton)

      // Change input
      const input = getByDisplayValue('120')
      fireEvent.change(input, { target: { value: '230' } })

      // Click cancel
      const cancelButton = getByLabelText('Cancel edit')
      fireEvent.click(cancelButton)

      // Input should be gone, and saveVar should NOT have been called
      await waitFor(() => {
        expect(queryByLabelText('Save changes')).not.toBeInTheDocument()
      })
      expect(saveVar).not.toHaveBeenCalled()
    })
  })
})
