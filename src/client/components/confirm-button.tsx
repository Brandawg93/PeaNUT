import React, { useEffect, useState } from 'react'
import { Button } from '@/client/components/ui/button'
import { CheckIcon } from 'lucide-react'

type Props = Readonly<{
  title?: string
  defaultLabel: string
  confirmLabel: string
  defaultIcon: React.ReactNode
  confirmIcon?: React.ReactNode
  onConfirm: () => Promise<void> | void
  onSuccess?: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  className?: string
  'data-testid'?: string
  disabled?: boolean
  timeoutMs?: number
}>

export default function ConfirmButton({
  title,
  defaultLabel,
  confirmLabel,
  defaultIcon,
  confirmIcon,
  onConfirm,
  onSuccess,
  variant = 'default',
  className,
  disabled,
  timeoutMs = 3000,
  ...rest
}: Props) {
  const [armed, setArmed] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), timeoutMs)
    return () => clearTimeout(timer)
  }, [armed, timeoutMs])

  const handleClick = async () => {
    if (disabled || isRunning) return
    if (!armed) {
      setArmed(true)
      return
    }
    setIsRunning(true)
    try {
      await onConfirm()
      onSuccess?.()
    } finally {
      setIsRunning(false)
      setArmed(false)
    }
  }

  return (
    <Button
      variant={variant}
      title={title}
      onClick={handleClick}
      className={`flex min-w-36 items-center justify-between ${className ?? ''}`}
      disabled={disabled || isRunning}
      {...rest}
    >
      <span>{armed ? confirmLabel : defaultLabel}</span>
      {armed ? (confirmIcon ?? <CheckIcon className='size-5' />) : defaultIcon}
    </Button>
  )
}
