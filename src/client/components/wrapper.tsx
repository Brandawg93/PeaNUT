'use client'

import 'chart.js/auto'
import 'react-toastify/dist/ReactToastify.css'

import React, { useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CheckIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { ExclamationCircleIcon as ExclamationCircleIconSolid } from '@heroicons/react/24/solid'
import { Button } from '@material-tailwind/react'
import { useTranslation } from 'react-i18next'
import { Chart } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { helix } from 'ldrs'

import NutGrid from '@/client/components/grid'
import Gauge from '@/client/components/gauge'
import Kpi from '@/client/components/kpi'
import LineChart from '@/client/components/line-chart'
import NavBar from '@/client/components/navbar'
import Runtime from '@/client/components/runtime'
import WattsChart from '@/client/components/watts-chart'
import Footer from '@/client/components/footer'

import { LanguageContext } from '@/client/context/language'
import { upsStatus } from '@/common/constants'
import { DEVICE } from '@/common/types'
import { getDevices, checkSettings, disconnect } from '@/app/actions'
import Connect from './connect'

helix.register()
Chart.register(annotationPlugin)

const getStatus = (status: keyof typeof upsStatus) => {
  switch (status) {
    case 'OL':
      return <CheckIcon className='mb-1 inline-block h-6 w-6 stroke-[3px] text-green-400' />
    case 'OB':
      return <ExclamationTriangleIcon className='mb-1 inline-block h-6 w-6 stroke-[3px] text-yellow-400' />
    case 'LB':
      return <ExclamationCircleIcon className='mb-1 inline-block h-6 w-6 stroke-[3px] text-red-400' />
    default:
      return <></>
  }
}

export default function Wrapper() {
  const [preferredDevice, setPreferredDevice] = useState<number>(0)
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false)
  const [settingsError, setSettingsError] = useState<boolean>(false)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['devicesData'],
    queryFn: async () => await getDevices(),
  })

  useEffect(() => {
    checkSettings().then((res) => {
      setSettingsLoaded(true)
      setSettingsError(!res)
    })
  }, [])

  const handleConnect = async () => {
    await refetch()
    setSettingsLoaded(true)
    setSettingsError(false)
  }

  const handleDisconnect = async () => {
    await disconnect()
    setSettingsError(true)
  }

  const loadingWrapper = (
    <div
      className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'
      data-testid='wrapper'
    >
      <l-helix
        size={100}
        speed={2.5}
        color={window.matchMedia('(prefers-color-scheme: dark)').matches ? 'white' : 'black'}
      />
    </div>
  )

  if (settingsError) {
    return <Connect onConnect={handleConnect} />
  }

  if (data?.error) {
    let error = 'Internal Server Error'
    if (data?.error.message?.includes('ECONNREFUSED')) {
      error = 'Connection refused. Is NUT server running?'
    }
    if (data?.error.includes('ENOTFOUND')) {
      error = 'Host not found. Check your settings.'
    }

    console.error(error)

    return (
      <div
        className='absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'
        data-testid='wrapper'
      >
        <div>
          <ExclamationCircleIconSolid className='mb-4 text-8xl text-red-600' />
          <p>{error}</p>
        </div>
        <div>
          <Button
            variant='filled'
            title={t('sidebar.disconnect')}
            className='text-md float-right bg-red-400 text-black shadow-none dark:bg-red-800 dark:text-white'
            onClick={async () => await handleDisconnect()}
          >
            <ArrowRightStartOnRectangleIcon className='h-4 w-4 stroke-2 dark:text-white' />
          </Button>
        </div>
      </div>
    )
  }
  if (!settingsLoaded || !data || !data.devices) {
    return loadingWrapper
  }
  if (data.devices && data.devices.length === 0) {
    return (
      <div
        className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'
        data-testid='wrapper'
      >
        <div>
          <ExclamationCircleIconSolid className='mb-4 text-8xl text-red-600' />
          <p>No devices found on this server.</p>
        </div>
      </div>
    )
  }

  const ups = data.devices[preferredDevice]
  const vars = ups.vars
  if (!vars) {
    return loadingWrapper
  }
  const voltageWrapper = vars['input.voltage'] ? (
    <div className='mb-4'>
      <LineChart
        id={ups.name}
        inputVoltage={parseFloat(vars['input.voltage'].value.toString())}
        inputVoltageNominal={parseFloat(vars['input.voltage.nominal']?.value.toString())}
        outputVoltage={parseFloat(vars['output.voltage']?.value.toString())}
        updated={data.updated}
      />
    </div>
  ) : (
    <></>
  )
  const wattsWrapper = vars['ups.realpower'] ? (
    <div className='mb-4'>
      <WattsChart
        id={ups.name}
        realpower={parseFloat(vars['ups.realpower'].value.toString())}
        realpowerNominal={parseFloat(vars['ups.realpower.nominal']?.value.toString())}
        updated={data.updated}
      />
    </div>
  ) : (
    <></>
  )

  return (
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
      <div className='flex justify-center'>
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
            <div className='mb-4'>
              {vars['ups.load'] ? (
                <Gauge percentage={parseFloat(vars['ups.load'].value.toString())} title={t('currentLoad')} invert />
              ) : (
                <Kpi text='N/A' description={t('currentLoad')} />
              )}
            </div>
            <div className='mb-4'>
              <Gauge percentage={parseFloat(vars['battery.charge']?.value.toString())} title={t('batteryCharge')} />
            </div>
            <div className='mb-4'>
              <Runtime runtime={parseFloat(vars['battery.runtime']?.value.toString())} />
            </div>
          </div>
          {voltageWrapper}
          {wattsWrapper}
          <div className='mb-4'>
            <NutGrid data={ups} />
          </div>
          <Footer updated={data.updated} />
        </div>
      </div>
    </div>
  )
}
