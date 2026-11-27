'use client'

import React, { useMemo } from 'react'
import { Button } from '@/client/components/ui/button'
import { Card } from '@/client/components/ui/card'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { PowerIcon, RotateCcwIcon } from 'lucide-react'
import ConfirmButton from '@/client/components/confirm-button'
import { VARS } from '@/common/types'

type OutletsProps = Readonly<{
  device: string
  vars: VARS
  commands: string[]
  runCommandAction: (device: string, command: string) => Promise<{ error: any }>
  onRefetch?: () => void
}>

export default function Outlets({ device, vars, commands, runCommandAction, onRefetch }: OutletsProps) {
  const { t } = useTranslation()

  const executeCommand = async (command: string, successMessage: string) => {
    const promise = runCommandAction(device, command).then((result) => {
      if (result.error) throw new Error(result.error)
      onRefetch?.()
      return result
    })

    toast.promise(promise, {
      loading: t('loading'),
      success: successMessage,
      error: (error) => `Error: ${error instanceof Error ? error.message : String(error)}`,
    })
    await promise
  }

  const outlets = useMemo(() => {
    // Try explicit count first
    const explicitCount = Number(vars['outlet.count']?.value || 0)

    const items = new Map<number, { index: number; name: string; switchable: boolean; statusKey: string }>()

    if (explicitCount && !isNaN(explicitCount)) {
      for (let i = 1; i <= explicitCount; i++) {
        const index = i
        const name =
          (vars[`outlet.${i}.name`]?.value as string) || (vars[`outlet.${i}.desc`]?.value as string) || String(i)
        const switchable = String(vars[`outlet.${i}.switchable`]?.value || '').toLowerCase() === 'yes'
        items.set(index, { index, name, switchable, statusKey: `outlet.${i}.status` })
      }
    } else {
      // Infer indices from keys like outlet.X.status or outlet.X.switchable
      Object.keys(vars).forEach((key) => {
        const match = key.match(/^outlet\.(\d+)\./)
        if (!match) return
        const i = Number(match[1])
        if (!i || isNaN(i)) return
        if (!items.has(i)) {
          const name =
            (vars[`outlet.${i}.name`]?.value as string) || (vars[`outlet.${i}.desc`]?.value as string) || String(i)
          const switchable = String(vars[`outlet.${i}.switchable`]?.value || '').toLowerCase() === 'yes'
          items.set(i, { index: i, name, switchable, statusKey: `outlet.${i}.status` })
        }
      })
    }

    return Array.from(items.values()).sort((a, b) => a.index - b.index)
  }, [vars])

  if (!outlets.length) return null

  return (
    <Card className='p-4 shadow-none'>
      <h2 className='mb-4 text-xl font-bold'>{t('outlets.title')}</h2>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
        {outlets.map(({ index, name, switchable, statusKey }) => {
          const onCmd = `outlet.${index}.load.on`
          const offCmd = `outlet.${index}.load.off`
          const cycleCmd = `outlet.${index}.load.cycle`
          const statusValue = vars[statusKey]?.value
          const normalizedStatus = statusValue == null ? '' : String(statusValue).trim().toLowerCase()
          const isOn = normalizedStatus === 'on'
          const isOff = normalizedStatus === 'off'
          const hasKnownStatus = isOn || isOff
          const hasOn = commands.includes(onCmd)
          const hasOff = commands.includes(offCmd)
          const hasCycle = commands.includes(cycleCmd)
          const canToggle = switchable && hasKnownStatus && ((isOn && hasOff) || (isOff && hasOn))

          return (
            <div key={index} className='flex items-center justify-between rounded-md border p-3'>
              <div className='flex min-w-0 flex-col'>
                <span className='truncate font-medium'>{name}</span>
                <span className='text-muted-foreground text-sm'>
                  {hasKnownStatus ? t('outlets.power') : t('outlets.unknown')}
                </span>
              </div>
              <div className='flex items-center gap-3'>
                {isOn ? (
                  <ConfirmButton
                    variant='destructive'
                    title={`${name} ${t('outlets.power')}`}
                    defaultLabel={t('outlets.off')}
                    confirmLabel={t('confirm')}
                    defaultIcon={<PowerIcon className='size-4' />}
                    disabled={!canToggle}
                    onConfirm={() => executeCommand(offCmd, t('outlets.offSuccess'))}
                  />
                ) : (
                  <Button
                    variant='secondary'
                    size='sm'
                    disabled={!canToggle || !hasOn}
                    onClick={() => executeCommand(onCmd, t('outlets.onSuccess'))}
                    aria-label={`${name} ${t('outlets.on')}`}
                  >
                    <PowerIcon className='mr-1 size-4' />
                    {t('outlets.on')}
                  </Button>
                )}
                {hasCycle ? (
                  <ConfirmButton
                    variant='secondary'
                    title={`${name} ${t('outlets.cycle')}`}
                    defaultLabel={t('outlets.cycle')}
                    confirmLabel={t('confirm')}
                    defaultIcon={<RotateCcwIcon className='size-4' />}
                    onConfirm={() => executeCommand(cycleCmd, t('outlets.cycleSuccess'))}
                  />
                ) : (
                  <Button variant='secondary' size='sm' disabled>
                    {t('outlets.cycle')}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
