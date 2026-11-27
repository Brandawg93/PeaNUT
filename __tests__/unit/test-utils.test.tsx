import React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { renderWithProviders } from '../utils/test-utils'

it('preserves the query cache when a test is rerendered', async () => {
  const CacheValue = () => {
    const queryClient = useQueryClient()
    return <span>{queryClient.getQueryData<string>(['value']) ?? 'empty'}</span>
  }

  const result = renderWithProviders(<CacheValue />)
  expect(result.getByText('empty')).toBeInTheDocument()

  const SetCacheValue = () => {
    useQueryClient().setQueryData(['value'], 'cached')
    return null
  }

  await result.rerender(<SetCacheValue />)
  await result.rerender(<CacheValue />)
  expect(result.getByText('cached')).toBeInTheDocument()
})
