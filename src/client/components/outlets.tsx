'use client'

import React, { useMemo } from 'react'
import { Button } from '@/client/components/ui/button'
import { Card } from '@/client/components/ui/card'
import { Switch } from '@/client/components/ui/switch'
import { useTranslation } from 'react-i18next'
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
          const isOn = String(vars[statusKey]?.value || '').toLowerCase() === 'on'
          const hasOn = commands.includes(onCmd)
          const hasOff = commands.includes(offCmd)
          const hasCycle = commands.includes(cycleCmd)
          const canToggle = switchable && hasOn && hasOff

          return (
            <div key={index} className='flex items-center justify-between rounded-md border p-3'>
              <div className='flex min-w-0 flex-col'>
                <span className='truncate font-medium'>{name}</span>
                <span className='text-muted-foreground text-sm'>{t('outlets.power')}</span>
              </div>
              <div className='flex items-center gap-3'>
                <Switch
                  disabled={!canToggle}
                  checked={!!isOn}
                  onCheckedChange={async (checked) => {
                    const cmd = checked ? onCmd : offCmd
                    await runCommandAction(device, cmd)
                    onRefetch?.()
                  }}
                  aria-label={`${name} ${t('outlets.power')}`}
                />
                <Button
                  variant='secondary'
                  size='sm'
                  disabled={!hasCycle}
                  onClick={async () => {
                    await runCommandAction(device, cycleCmd)
                    onRefetch?.()
                  }}
                >
                  {t('outlets.cycle')}
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
