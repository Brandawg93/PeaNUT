import { renderHook } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { env } from 'next-runtime-env'
import { useNavigation } from '@/hooks/useNavigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('useNavigation', () => {
  const push = jest.fn()
  const replace = jest.fn()

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue({ push, replace })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('pushes a path without a base path', () => {
    ;(env as jest.Mock).mockReturnValue('')

    const { result } = renderHook(() => useNavigation())
    result.current.push('/device/ups')

    expect(push).toHaveBeenCalledWith('/device/ups')
  })

  it('prefixes the base path when pushing', () => {
    ;(env as jest.Mock).mockReturnValue('/nut')

    const { result } = renderHook(() => useNavigation())
    result.current.push('/device/ups')

    expect(push).toHaveBeenCalledWith('/nut/device/ups')
  })

  it('prefixes the base path when replacing', () => {
    ;(env as jest.Mock).mockReturnValue('/nut')

    const { result } = renderHook(() => useNavigation())
    result.current.replace('/login')

    expect(replace).toHaveBeenCalledWith('/nut/login')
  })

  it('exposes the resolved base path', () => {
    ;(env as jest.Mock).mockReturnValue('/nut')

    const { result } = renderHook(() => useNavigation())

    expect(result.current.basePath).toBe('/nut')
  })
})
