import { renderHook } from '@testing-library/react'
import { env } from 'next-runtime-env'
import { useBasePath } from '@/hooks/useBasePath'

describe('useBasePath', () => {
  afterEach(() => {
    (env as unknown as jest.Mock).mockReset()
  })

  it('returns empty string when NEXT_PUBLIC_BASE_PATH is empty', () => {
    ;(env as unknown as jest.Mock).mockReturnValue('')
    const { result } = renderHook(() => useBasePath())
    expect(result.current).toBe('')
  })

  it('normalizes base path without leading slash', () => {
    ;(env as unknown as jest.Mock).mockReturnValue('dashboard')
    const { result } = renderHook(() => useBasePath())
    expect(result.current).toBe('/dashboard')
  })

  it('keeps base path with leading slash', () => {
    ;(env as unknown as jest.Mock).mockReturnValue('/dashboard')
    const { result } = renderHook(() => useBasePath())
    expect(result.current).toBe('/dashboard')
  })
})

