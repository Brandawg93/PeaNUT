'use client'

import React, { useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  HiOutlineCheck,
  HiOutlineExclamationTriangle,
  HiExclamationCircle,
  HiOutlineExclamationCircle,
  HiOutlineArrowRightStartOnRectangle,
  HiOutlineEllipsisHorizontalCircle,
} from 'react-icons/hi2'
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
import { Toaster, toast } from 'sonner'
import { Button } from '@/client/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { MemoizedGrid } from '@/client/components/grid'
import { SUPPORTED_COMMANDS } from '@/common/constants'
import Gauge from '@/client/components/gauge'
import Kpi from '@/client/components/kpi'
import NavBar from '@/client/components/navbar'
import NavBarControls from '@/client/components/navbar-controls'
import Runtime from '@/client/components/runtime'
import Footer from '@/client/components/footer'
import Loader from '@/client/components/loader'
import ChartsContainer from '@/client/components/line-charts/charts-container'

import { LanguageContext } from '@/client/context/language'
import { useTheme } from 'next-themes'
import { upsStatus } from '@/common/constants'
import { DEVICE, DeviceData } from '@/common/types'

const getStatus = (status: keyof typeof upsStatus) => {
  if (status.startsWith('OL')) {
    return <HiOutlineCheck data-testid='check-icon' className='mb-1 inline-block h-6 w-6 stroke-[3px] text-green-400' />
  } else if (status.startsWith('OB')) {
    return (
      <HiOutlineExclamationTriangle
        data-testid='triangle-icon'
        className='mb-1 inline-block h-6 w-6 stroke-[3px] text-yellow-400'
      />
    )
  } else if (status.startsWith('LB')) {
    return (
      <HiOutlineExclamationCircle
        data-testid='exclamation-icon'
        className='mb-1 inline-block h-6 w-6 stroke-[3px] text-red-400'
      />
    )
  } else {
    return <></>
  }
}

const roundIfNeeded = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100

type Props = {
  getDevicesAction: () => Promise<DeviceData>
  checkSettingsAction: () => Promise<boolean>
  disconnectAction: () => Promise<void>
  getAllCommandsAction: (device: string) => Promise<Array<string>>
  runCommandAction: (device: string, command: string) => Promise<{ error: any }>
}

export default function Wrapper({
  getDevicesAction,
  checkSettingsAction,
  disconnectAction,
  getAllCommandsAction,
  runCommandAction,
}: Props) {
  const [preferredDevice, setPreferredDevice] = useState<number>(0)
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false)
  const [wattsOrPercent, setWattsOrPercent] = useState<boolean>(
    typeof window !== 'undefined' ? localStorage.getItem('wattsOrPercent') === 'true' : false
  )
  const [wattHours, setwattHours] = useState<boolean>(
    typeof window !== 'undefined' ? localStorage.getItem('wattHours') === 'true' : false
  )
  const [isTestDialogOpen, setIsTestDialogOpen] = useState<boolean>(false)
  const [canRunTests, setCanRunTests] = useState<boolean>(false)
  const [preferredTestCommand, setPreferredTestCommand] = useState<string>('')
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const router = useRouter()
  const { resolvedTheme, theme } = useTheme()
  const materialTheme = createTheme({
    palette: {
      mode: resolvedTheme as 'light' | 'dark',
    },
  })
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['devicesData'],
    queryFn: async () => await getDevicesAction(),
  })

  useEffect(() => {
    checkSettingsAction().then((res) => {
      setSettingsLoaded(true)
      if (!res) {
        router.replace('/login')
      }
    })
  }, [])

  useEffect(() => {
    if (data?.devices) {
      getAllCommandsAction(data.devices[preferredDevice].name).then((commands) => {
        const testCommands = [
          SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_QUICK,
          SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START,
          SUPPORTED_COMMANDS.COMMAND_TEST_BATTERY_START_DEEP,
        ]

        if (commands.some((command) => testCommands.includes(command))) {
          setCanRunTests(true)
          const preferredCommand = testCommands.find((command) => commands.includes(command))

          if (preferredCommand) {
            setPreferredTestCommand(preferredCommand)
          }
        }
      })
    }
  }, [data?.devices && data?.devices[preferredDevice].name])

  const handleDisconnect = async () => {
    await disconnectAction()
    router.replace('/login')
  }

  const handleTest = async () => {
    toast.promise(runCommandAction(ups.name, preferredTestCommand), {
      loading: t('batteryTest.loading'),
      success: t('batteryTest.started'),
      error: (error) => {
        return `Error: ${error}`
      },
    })
    setIsTestDialogOpen(false)
  }

  const loadingWrapper = (
    <div
      className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-background text-center'
      data-testid='loading-wrapper'
    >
      <Loader />
    </div>
  )

  if (data?.error) {
    let error = 'Internal Server Error'
    if (data?.error.includes('ECONNREFUSED')) {
      error = t('serverRefused')
    }
    if (data?.error.includes('ENOTFOUND')) {
      error = t('serverNotFound')
    }

    console.error(error)

    return (
      <div
        className='absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center bg-background text-center'
        data-testid='wrapper'
      >
        <div className='flex flex-col items-center'>
          <HiExclamationCircle className='mb-4 text-8xl text-destructive' />
          <p>{error}</p>
        </div>
        <div>
          <Button
            title={t('sidebar.disconnect')}
            className='bg-destructive shadow-none'
            onClick={async () => await handleDisconnect()}
          >
            <HiOutlineArrowRightStartOnRectangle className='!h-6 !w-6' />
          </Button>
        </div>
      </div>
    )
  }
  if (!settingsLoaded || !data || !data.devices) {
    return loadingWrapper
  }
  if (data.devices.length === 0) {
    return (
      <div
        className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-background text-center'
        data-testid='wrapper'
      >
        <div className='flex flex-col items-center'>
          <HiExclamationCircle className='mb-4 text-8xl text-destructive' />
          <p>{t('noDevicesError')}</p>
        </div>
      </div>
    )
  }

  const ups = data.devices[preferredDevice]
  const vars = ups.vars
  if (!vars) {
    return loadingWrapper
  }

  const toggleWattsOrPercent = () => {
    setWattsOrPercent((prev) => {
      localStorage.setItem('wattsOrPercent', (!prev).toString())
      return !prev
    })
  }

  const toggleWattHours = () => {
    setwattHours((prev) => {
      localStorage.setItem('wattHours', (!prev).toString())
      return !prev
    })
  }

  const currentLoad = () => {
    if (vars['ups.load']) {
      if (vars['ups.realpower.nominal'] && wattsOrPercent) {
        const currentWattage = (+vars['ups.load'].value / 100) * +vars['ups.realpower.nominal'].value
        return (
          <Kpi
            onClick={toggleWattsOrPercent}
            text={`${roundIfNeeded(currentWattage)}W`}
            description={`${t('currentLoad')} (W)`}
          />
        )
      }
      return (
        <Gauge
          onClick={toggleWattsOrPercent}
          percentage={+vars['ups.load'].value}
          title={`${t('currentLoad')} (%)`}
          invert
        />
      )
    }
    return <Kpi text='N/A' description={t('currentLoad')} />
  }

  const currentWh = () => {
    if (vars['battery.charge']) {
      if (vars['ups.load'] && vars['ups.realpower.nominal'] && wattHours) {
        const currentWattage = (+vars['ups.load'].value / 100) * +vars['ups.realpower.nominal'].value
        const capacity = (+vars['battery.runtime'].value / 3600) * currentWattage
        return (
          <Kpi
            onClick={toggleWattHours}
            text={`${roundIfNeeded(capacity)}Wh`}
            description={`${t('batteryCharge')} (Wh)`}
          />
        )
      }
      return (
        <Gauge
          onClick={toggleWattHours}
          percentage={+vars['battery.charge']?.value}
          title={`${t('batteryCharge')} (%)`}
        />
      )
    } else {
      return <Kpi text='N/A' description={t('batteryCharge')} />
    }
  }

  return (
    <ThemeProvider theme={materialTheme}>
      <CssBaseline />
      <Toaster position='top-center' theme={theme as 'light' | 'dark' | 'system'} richColors />
      <div data-testid='wrapper' className='bg-background'>
        <NavBar>
          <NavBarControls
            disableRefresh={isLoading}
            onRefreshClick={() => refetch()}
            onRefetch={() => refetch()}
            onDeviceChange={(name: string) =>
              data.devices && setPreferredDevice(data.devices.findIndex((d: DEVICE) => d.name === name))
            }
            onDisconnect={handleDisconnect}
            devices={data.devices}
          />
        </NavBar>
        <div className='flex justify-center pl-3 pr-3'>
          <div className='container'>
            <div className='mb-4 flex flex-row justify-between'>
              <div>
                {vars['ups.mfr']?.value || vars['ups.model']?.value ? (
                  <>
                    <p className='m-0'>
                      {t('manufacturer')}: {vars['ups.mfr']?.value}
                    </p>
                    <p className='m-0'>
                      {t('model')}: {vars['ups.model']?.value}
                    </p>
                  </>
                ) : (
                  <>
                    <p className='m-0'>
                      {t('device')}: {ups.description}
                    </p>
                  </>
                )}
                <p>
                  {t('serial')}: {vars['device.serial']?.value}
                </p>
              </div>
              <div>
                <p className='text-2xl font-semibold'>
                  {getStatus(vars['ups.status']?.value as keyof typeof upsStatus)}
                  &nbsp;{upsStatus[vars['ups.status']?.value as keyof typeof upsStatus] || vars['ups.status']?.value}
                </p>
                {canRunTests && (
                  <div className='flex justify-end'>
                    <AlertDialog open={isTestDialogOpen}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('batteryTest.title')}</AlertDialogTitle>
                          <AlertDialogDescription>{t('batteryTest.description')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setIsTestDialogOpen(false)}>
                            {t('batteryTest.cancel')}
                          </AlertDialogCancel>
                          <AlertDialogAction onClick={async () => await handleTest()}>
                            {t('batteryTest.continue')}
                          </AlertDialogAction>
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
                        <DropdownMenuItem onClick={() => setIsTestDialogOpen(!isTestDialogOpen)}>
                          {t('actions.performTest')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
            <div className='grid grid-flow-row grid-cols-1 gap-x-6 md:grid-cols-2 lg:grid-cols-3'>
              <div className='mb-4'>{currentLoad()}</div>
              <div className='mb-4'>{currentWh()}</div>
              <div className='mb-4'>
                <Runtime runtime={+vars['battery.runtime']?.value} />
              </div>
            </div>
            <ChartsContainer vars={vars} data={data} name={ups.name} />
            <div>
              <MemoizedGrid data={ups} />
            </div>
            <Footer updated={data.updated} />
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
