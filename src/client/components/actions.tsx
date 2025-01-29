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

type Props = {
  device: string
  commands: string[]
  runCommandAction: (device: string, command: string) => Promise<{ error: any }>
}

export default function Actions({ commands, runCommandAction, device }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [alertData, setAlertData] = useState<{
    title: string
    description: string
    action: () => Promise<void>
  } | null>(null)
  const { theme } = useTheme()
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const handleTest = async (type: 'quick' | 'deep' | 'standard') => {
    let preferredTestCommand = ''
    if (type === 'quick' && commands.includes(SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_QUICK)) {
      preferredTestCommand = SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_QUICK
    } else if (type === 'deep' && commands.includes(SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_DEEP)) {
      preferredTestCommand = SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_DEEP
    } else if (commands.includes(SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START)) {
      preferredTestCommand = SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START
    }

    toast.promise(runCommandAction(device, preferredTestCommand), {
      loading: t('batteryTest.loading'),
      success: t('batteryTest.started'),
      error: (error) => {
        return `Error: ${error}`
      },
    })
    setIsDialogOpen(false)
  }

  const handleShutdown = async (type: 'restart' | 'off') => {
    let preferredShutdownCommand = ''
    if (type === 'restart' && commands.includes(SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_RETURN)) {
      preferredShutdownCommand = SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_RETURN
    } else if (type === 'off' && commands.includes(SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_STAYOFF)) {
      preferredShutdownCommand = SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_STAYOFF
    }

    toast.promise(runCommandAction(device, preferredShutdownCommand), {
      loading: t('batteryTest.loading'),
      success: t('shutdown.started'),
      error: (error) => {
        return `Error: ${error}`
      },
    })
    setIsDialogOpen(false)
  }

  const handleDialogChange = (title: string, description: string, action: () => Promise<void>) => {
    setAlertData({ title, description, action })
    setIsDialogOpen(!isDialogOpen)
  }

  if (
    !commands.includes(SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_QUICK) &&
    !commands.includes(SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_DEEP) &&
    !commands.includes(SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_RETURN) &&
    !commands.includes(SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_STAYOFF)
  ) {
    return <></>
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
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>{t('batteryTest.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={alertData?.action}>{t('batteryTest.continue')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild data-testid='daynight-trigger'>
          <Button size='lg' variant='ghost' title={t('actions.title')} className='px-3'>
            <HiOutlineEllipsisHorizontalCircle className='!h-6 !w-6' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {commands.includes(SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_QUICK) && (
            <DropdownMenuItem
              onClick={() =>
                handleDialogChange(
                  t('batteryTest.titleQuick'),
                  t('batteryTest.descriptionQuick'),
                  async () => await handleTest('quick')
                )
              }
            >
              {t('actions.performTestQuick')}
            </DropdownMenuItem>
          )}
          {commands.includes(SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_DEEP) && (
            <DropdownMenuItem
              onClick={() =>
                handleDialogChange(
                  t('batteryTest.titleDeepDeep'),
                  t('batteryTest.descriptionDeep'),
                  async () => await handleTest('deep')
                )
              }
            >
              {t('actions.performTestDeep')}
            </DropdownMenuItem>
          )}
          {commands.includes(SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_RETURN) && (
            <DropdownMenuItem
              onClick={() =>
                handleDialogChange(
                  t('shutdown.titleRestart'),
                  t('shutdown.descriptionRestart'),
                  async () => await handleShutdown('restart')
                )
              }
            >
              {t('actions.restart')}
            </DropdownMenuItem>
          )}
          {commands.includes(SUPPORTED_COMMANDS.COMMAND_SHUTDOWN_STAYOFF) && (
            <DropdownMenuItem
              onClick={() =>
                handleDialogChange(
                  t('shutdown.titleOff'),
                  t('shutdown.descriptionOff'),
                  async () => await handleShutdown('off')
                )
              }
            >
              {t('actions.shutdown')}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
