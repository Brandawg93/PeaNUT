import React, { useState, useContext } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/client/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
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
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'

type Props = Readonly<{
  device: string
  commands: string[]
  runCommandAction: (device: string, command: string) => Promise<{ error: any }>
}>

type CommandConfig = {
  command: string
  title: string
  description: string
  actionText: string
  successMessage: string
}

export default function Actions({ commands, runCommandAction, device }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [alertData, setAlertData] = useState<CommandConfig | null>(null)
  const { theme } = useTheme()
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const handleCommand = (command: string, successMessage: string) => {
    toast.promise(runCommandAction(device, command), {
      loading: t('loading'),
      success: successMessage,
      error: (error) => `Error: ${error}`,
    })
    setIsDialogOpen(false)
  }

  const getCommandConfigs = (): CommandConfig[] => [
    {
      command: SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_QUICK,
      title: t('actions.batteryTestQuick.title'),
      description: t('actions.batteryTestQuick.description'),
      actionText: t('actions.batteryTestQuick.actionText'),
      successMessage: t('actions.batteryTestQuick.successMessage'),
    },
    {
      command: SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_DEEP,
      title: t('actions.batteryTestDeep.title'),
      description: t('actions.batteryTestDeep.description'),
      actionText: t('actions.batteryTestDeep.actionText'),
      successMessage: t('actions.batteryTestDeep.successMessage'),
    },
    {
      command: SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_RETURN,
      title: t('actions.restart.title'),
      description: t('actions.restart.description'),
      actionText: t('actions.restart.actionText'),
      successMessage: t('actions.restart.successMessage'),
    },
    {
      command: SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_STAYOFF,
      title: t('actions.shutdown.title'),
      description: t('actions.shutdown.description'),
      actionText: t('actions.shutdown.actionText'),
      successMessage: t('actions.shutdown.successMessage'),
    },
    {
      command: SUPPORTED_COMMANDS.COMMAND_BEEPER_DISABLE,
      title: t('actions.beeperDisable.title'),
      description: t('actions.beeperDisable.description'),
      actionText: t('actions.beeperDisable.actionText'),
      successMessage: t('actions.beeperDisable.successMessage'),
    },
    {
      command: SUPPORTED_COMMANDS.COMMAND_BEEPER_ENABLE,
      title: t('actions.beeperEnable.title'),
      description: t('actions.beeperEnable.description'),
      actionText: t('actions.beeperEnable.actionText'),
      successMessage: t('actions.beeperEnable.successMessage'),
    },
    {
      command: SUPPORTED_COMMANDS.COMMAND_BEEPER_MUTE,
      title: t('actions.beeperMute.title'),
      description: t('actions.beeperMute.description'),
      actionText: t('actions.beeperMute.actionText'),
      successMessage: t('actions.beeperMute.successMessage'),
    },
  ]

  const handleDialogChange = (config: CommandConfig) => {
    setAlertData(config)
    setIsDialogOpen(true)
  }

  if (
    !commands.some((cmd) =>
      getCommandConfigs()
        .map((c) => c.command)
        .includes(cmd)
    )
  ) {
    return null
  }

  return (
    <>
      <Toaster position='top-center' theme={theme as 'light' | 'dark' | 'system'} richColors />
      <AlertDialog open={isDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertData?.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertData?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => alertData && handleCommand(alertData.command, alertData.successMessage)}>
              {t('continue')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild data-testid='daynight-trigger'>
          <Button size='icon' variant='ghost' title={t('actions.title')}>
            <HiOutlineEllipsisHorizontalCircle className='size-6!' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {getCommandConfigs()
            .filter((config) => commands.includes(config.command))
            .map((config) => (
              <DropdownMenuItem key={config.command} onClick={() => handleDialogChange(config)}>
                {config.actionText}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
