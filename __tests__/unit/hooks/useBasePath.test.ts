import { renderHook } from '@testing-library/react'
import { env } from 'next-runtime-env'
import { useBasePath } from '@/hooks/useBasePath'

describe('useBasePath', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns an empty string when no base path is configured', () => {
    ;(env as jest.Mock).mockReturnValue('')

    const { result } = renderHook(() => useBasePath())

    expect(result.current).toBe('')
  })

  it('adds a leading slash when the configured base path is missing one', () => {
    ;(env as jest.Mock).mockReturnValue('foo')

    const { result } = renderHook(() => useBasePath())

    expect(result.current).toBe('/foo')
  })

  it('leaves the base path untouched when it already has a leading slash', () => {
    ;(env as jest.Mock).mockReturnValue('/foo')

    const { result } = renderHook(() => useBasePath())

    expect(result.current).toBe('/foo')
  })
})
