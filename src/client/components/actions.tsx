import React, { useState, useContext, useMemo } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/client/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/client/components/ui/alert-dialog'
import { HiOutlineEllipsisHorizontalCircle } from 'react-icons/hi2'
import { Toaster, toast } from 'sonner'
import { SUPPORTED_COMMANDS } from '@/common/constants'
import { useTheme } from 'next-themes'
import { Button } from '@/client/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { Switch } from '@/client/components/ui/switch'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import { PowerIcon, RotateCcwIcon, Volume2Icon, VolumeXIcon, FlaskConicalIcon } from 'lucide-react'
import ConfirmButton from '@/client/components/confirm-button'
import type { VARS } from '@/common/types'

type Props = Readonly<{
  device: string
  commands: string[]
  runCommandAction: (device: string, command: string) => Promise<{ error: any }>
  vars?: VARS
}>

export default function Actions({ commands, runCommandAction, device, vars }: Props) {
  const [isTestingOpen, setIsTestingOpen] = useState(false)
  const [isPowerOpen, setIsPowerOpen] = useState(false)
  const [isBeeperOpen, setIsBeeperOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<'quick' | 'deep' | null>(null)
  const [beeperEnabled, setBeeperEnabled] = useState<boolean | null>(null)
  const { theme } = useTheme()
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const supports = useMemo(
    () => ({
      testQuick: commands.includes(SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_QUICK),
      testDeep: commands.includes(SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_DEEP),
      restart: commands.includes(SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_RETURN),
      shutdown: commands.includes(SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_STAYOFF),
      beeperEnable: commands.includes(SUPPORTED_COMMANDS.COMMAND_BEEPER_ENABLE),
      beeperDisable: commands.includes(SUPPORTED_COMMANDS.COMMAND_BEEPER_DISABLE),
      beeperMute: commands.includes(SUPPORTED_COMMANDS.COMMAND_BEEPER_MUTE),
    }),
    [commands]
  )

  const openAny =
    supports.testQuick ||
    supports.testDeep ||
    supports.restart ||
    supports.shutdown ||
    supports.beeperEnable ||
    supports.beeperDisable ||
    supports.beeperMute

  const deriveBeeperEnabled = (variables?: VARS): boolean | null => {
    if (!variables) return null
    const keys = ['beeper.status', 'ups.beeper.status']
    for (const key of keys) {
      const raw = variables[key]?.value
      if (raw !== undefined && raw !== null) {
        const val = String(raw).toLowerCase()
        if (val.includes('enable') || val === 'on' || val === '1' || val === 'true') return true
        if (val.includes('disable') || val === 'off' || val === '0' || val === 'false') return false
      }
    }
    return null
  }

  if (!openAny) {
    return null
  }

  return (
    <>
      <Toaster position='top-center' theme={theme as 'light' | 'dark' | 'system'} richColors />
      {/* Testing Dialog */}
      <AlertDialog open={isTestingOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.testing.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('actions.testing.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className='flex items-center gap-3'>
            <Select value={selectedTest ?? undefined} onValueChange={(v) => setSelectedTest(v as 'quick' | 'deep')}>
              <SelectTrigger className='min-w-40'>
                <SelectValue placeholder={t('actions.testing.selectPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {supports.testQuick && (
                  <SelectItem value='quick'>{t('actions.batteryTestQuick.actionText')}</SelectItem>
                )}
                {supports.testDeep && <SelectItem value='deep'>{t('actions.batteryTestDeep.actionText')}</SelectItem>}
              </SelectContent>
            </Select>
            <ConfirmButton
              defaultLabel={t('actions.testing.run')}
              confirmLabel={t('confirm')}
              defaultIcon={<FlaskConicalIcon className='size-5' />}
              disabled={!selectedTest}
              onConfirm={() => {
                const map: Record<string, string> = {
                  quick: SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_QUICK,
                  deep: SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_DEEP,
                }
                if (!selectedTest) return
                const cmd = map[selectedTest]
                const success =
                  selectedTest === 'quick'
                    ? t('actions.batteryTestQuick.successMessage')
                    : t('actions.batteryTestDeep.successMessage')
                const p = runCommandAction(device, cmd)
                toast.promise(p, {
                  loading: t('loading'),
                  success,
                  error: (error) => `Error: ${error}`,
                })
                return p.then(() => undefined)
              }}
              onSuccess={() => setIsTestingOpen(false)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsTestingOpen(false)}>{t('cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Power Controls Dialog */}
      <AlertDialog open={isPowerOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.power.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('actions.power.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className='flex items-center gap-4'>
            {supports.restart && (
              <ConfirmButton
                variant='default'
                title={t('actions.restart.actionText')}
                defaultLabel={t('actions.restart.actionText')}
                confirmLabel={t('confirm')}
                defaultIcon={<RotateCcwIcon className='size-5' />}
                onConfirm={() => {
                  const p = runCommandAction(device, SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_RETURN)
                  toast.promise(p, {
                    loading: t('loading'),
                    success: t('actions.restart.successMessage'),
                    error: (error) => `Error: ${error}`,
                  })
                  return p.then(() => undefined)
                }}
                onSuccess={() => setIsPowerOpen(false)}
                data-testid='power-restart'
              />
            )}
            {supports.shutdown && (
              <ConfirmButton
                variant='destructive'
                title={t('actions.shutdown.actionText')}
                defaultLabel={t('actions.shutdown.actionText')}
                confirmLabel={t('confirm')}
                defaultIcon={<PowerIcon className='size-5' />}
                onConfirm={() => {
                  const p = runCommandAction(device, SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_STAYOFF)
                  toast.promise(p, {
                    loading: t('loading'),
                    success: t('actions.shutdown.successMessage'),
                    error: (error) => `Error: ${error}`,
                  })
                  return p.then(() => undefined)
                }}
                onSuccess={() => setIsPowerOpen(false)}
                data-testid='power-shutdown'
              />
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsPowerOpen(false)
              }}
            >
              {t('close')}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Beeper Dialog */}
      <AlertDialog open={isBeeperOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.beeper.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('actions.beeper.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-2'>
              <Volume2Icon className='size-5 opacity-70' />
              <span>{t('actions.beeper.switchLabel')}</span>
            </div>
            <Switch
              checked={beeperEnabled ?? false}
              onCheckedChange={(checked) => {
                setBeeperEnabled(checked)
                const cmd = checked
                  ? SUPPORTED_COMMANDS.COMMAND_BEEPER_ENABLE
                  : SUPPORTED_COMMANDS.COMMAND_BEEPER_DISABLE
                const success = checked
                  ? t('actions.beeperEnable.successMessage')
                  : t('actions.beeperDisable.successMessage')
                if ((checked && supports.beeperEnable) || (!checked && supports.beeperDisable)) {
                  toast.promise(runCommandAction(device, cmd), {
                    loading: t('loading'),
                    success,
                    error: (error) => `Error: ${error}`,
                  })
                }
              }}
              disabled={!(supports.beeperEnable && supports.beeperDisable)}
            />
          </div>
          <div className='mt-3 flex items-center justify-between gap-4'>
            <div className='flex items-center gap-2'>
              <VolumeXIcon className='size-5 opacity-70' />
              <span>{t('actions.beeper.muteLabel')}</span>
            </div>
            <ConfirmButton
              variant='outline'
              defaultLabel={t('actions.beeper.muteButton')}
              confirmLabel={t('confirm')}
              defaultIcon={<VolumeXIcon className='size-5' />}
              disabled={!supports.beeperMute}
              onConfirm={() => {
                if (!supports.beeperMute) return
                const p = runCommandAction(device, SUPPORTED_COMMANDS.COMMAND_BEEPER_MUTE)
                toast.promise(p, {
                  loading: t('loading'),
                  success: t('actions.beeperMute.successMessage'),
                  error: (error) => `Error: ${error}`,
                })
                return p.then(() => undefined)
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsBeeperOpen(false)}>{t('cancel')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild data-testid='daynight-trigger'>
          <Button size='icon' variant='ghost' title={t('actions.title')} className='cursor-pointer'>
            <HiOutlineEllipsisHorizontalCircle className='size-6!' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {(supports.testQuick || supports.testDeep) && (
            <DropdownMenuItem
              onClick={() => {
                let next: 'quick' | 'deep' | null = null
                if (supports.testQuick) next = 'quick'
                else if (supports.testDeep) next = 'deep'
                setSelectedTest(next)
                setIsTestingOpen(true)
              }}
            >
              {t('actions.groups.testing')}
            </DropdownMenuItem>
          )}
          {(supports.restart || supports.shutdown) && (
            <DropdownMenuItem onClick={() => setIsPowerOpen(true)}>{t('actions.groups.power')}</DropdownMenuItem>
          )}
          {(supports.beeperEnable || supports.beeperDisable || supports.beeperMute) && (
            <DropdownMenuItem
              onClick={() => {
                setBeeperEnabled(deriveBeeperEnabled(vars))
                setIsBeeperOpen(true)
              }}
            >
              {t('actions.groups.beeper')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
