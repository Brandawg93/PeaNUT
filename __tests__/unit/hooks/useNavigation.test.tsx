import { renderHook, act } from '@testing-library/react'
import { useNavigation } from '@/hooks/useNavigation'
import * as NextNavigation from 'next/navigation'
import { env } from 'next-runtime-env'

describe('useNavigation', () => {
  beforeEach(() => {
    ;(env as unknown as jest.Mock).mockReturnValue('')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('push/replace prefix with basePath when set', () => {
    const router = { push: jest.fn(), replace: jest.fn() }
    jest.spyOn(NextNavigation, 'useRouter').mockReturnValue(router as any)
    ;(env as unknown as jest.Mock).mockReturnValue('/base')
    const { result } = renderHook(() => useNavigation())

    act(() => {
      result.current.push('/devices')
      result.current.replace('/settings')
    })

    expect(router.push).toHaveBeenCalledWith('/base/devices')
    expect(router.replace).toHaveBeenCalledWith('/base/settings')
  })

  it('push/replace without basePath when not set', () => {
    const router = { push: jest.fn(), replace: jest.fn() }
    jest.spyOn(NextNavigation, 'useRouter').mockReturnValue(router as any)
    ;(env as unknown as jest.Mock).mockReturnValue('')
    const { result } = renderHook(() => useNavigation())

    act(() => {
      result.current.push('/devices')
      result.current.replace('/settings')
    })

    expect(router.push).toHaveBeenCalledWith('/devices')
    expect(router.replace).toHaveBeenCalledWith('/settings')
  })
})

