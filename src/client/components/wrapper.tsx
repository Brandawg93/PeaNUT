'use client'

import React, { useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  HiOutlineCheck,
  HiOutlineExclamationTriangle,
  HiExclamationCircle,
  HiOutlineExclamationCircle,
  HiOutlineArrowRightStartOnRectangle,
} from 'react-icons/hi2'
import { Button } from '@material-tailwind/react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { MemoizedGrid } from '@/client/components/grid'
import Gauge from '@/client/components/gauge'
import Kpi from '@/client/components/kpi'
import NavBar from '@/client/components/navbar'
import Runtime from '@/client/components/runtime'
import Footer from '@/client/components/footer'
import Loader from '@/client/components/loader'
import ChartsContainer from '@/client/components/line-charts/charts-container'

import { LanguageContext } from '@/client/context/language'
import { ThemeContext } from '@/client/context/theme'
import { upsStatus } from '@/common/constants'
import { DEVICE, DeviceData } from '@/common/types'

const getStatus = (status: keyof typeof upsStatus) => {
  switch (status) {
    case 'OL':
      return <HiOutlineCheck className='mb-1 inline-block h-6 w-6 stroke-[3px] text-green-400' />
    case 'OB':
      return <HiOutlineExclamationTriangle className='mb-1 inline-block h-6 w-6 stroke-[3px] text-yellow-400' />
    case 'LB':
      return <HiOutlineExclamationCircle className='mb-1 inline-block h-6 w-6 stroke-[3px] text-red-400' />
    default:
      return <></>
  }
}

const roundIfNeeded = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100

type Props = {
  getDevicesAction: () => Promise<DeviceData>
  checkSettingsAction: () => Promise<boolean>
  disconnectAction: () => Promise<void>
}

export default function Wrapper({ getDevicesAction, checkSettingsAction, disconnectAction }: Props) {
  const [preferredDevice, setPreferredDevice] = useState<number>(0)
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false)
  const [wattsOrPercent, setWattsOrPercent] = useState<boolean>(
    typeof window !== 'undefined' ? localStorage.getItem('wattsOrPercent') === 'true' : false
  )
  const [wattHours, setwattHours] = useState<boolean>(
    typeof window !== 'undefined' ? localStorage.getItem('wattHours') === 'true' : false
  )
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const router = useRouter()
  const { theme } = useContext(ThemeContext)
  const materialTheme = createTheme({
    palette: {
      mode: theme,
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

  const handleDisconnect = async () => {
    await disconnectAction()
    router.replace('/login')
  }

  const loadingWrapper = (
    <div
      className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'
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
        className='absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'
        data-testid='wrapper'
      >
        <div>
          <HiExclamationCircle className='mb-4 text-8xl text-red-600' />
          <p>{error}</p>
        </div>
        <div>
          <Button
            variant='filled'
            title={t('sidebar.disconnect')}
            className='text-md float-right bg-red-400 text-black shadow-none dark:bg-red-800 dark:text-white'
            onClick={async () => await handleDisconnect()}
          >
            <HiOutlineArrowRightStartOnRectangle className='h-4 w-4 stroke-2 dark:text-white' />
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
        className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'
        data-testid='wrapper'
      >
        <div>
          <HiExclamationCircle className='mb-4 text-8xl text-red-600' />
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
      <div
        className='bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-900 dark:text-white'
        data-testid='wrapper'
      >
        <NavBar
          disableRefresh={isLoading}
          onRefreshClick={() => refetch()}
          onRefetch={() => refetch()}
          onDeviceChange={(name: string) =>
            data.devices && setPreferredDevice(data.devices.findIndex((d: DEVICE) => d.name === name))
          }
          onDisconnect={handleDisconnect}
          devices={data.devices}
        />
        <div className='flex justify-center pl-3 pr-3'>
          <div className='container'>
            <div className='flex flex-row justify-between'>
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
                  &nbsp;{upsStatus[vars['ups.status']?.value as keyof typeof upsStatus]}
                </p>
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
