'use client'

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

import NutGrid from '@/client/components/grid'
import Gauge from '@/client/components/gauge'
import Kpi from '@/client/components/kpi'
import NavBar from '@/client/components/navbar'
import Runtime from '@/client/components/runtime'
import Footer from '@/client/components/footer'
import Loader from '@/client/components/loader'
import Connect from '@/client/components/connect'
import ChartsContainer from '@/client/components/charts-container'

import { LanguageContext } from '@/client/context/language'
import { upsStatus } from '@/common/constants'
import { DEVICE } from '@/common/types'

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

type Props = {
  getDevicesAction: () => Promise<
    | {
        devices: DEVICE[]
        updated: Date
        error: undefined
      }
    | {
        devices: undefined
        updated: Date
        error: any
      }
  >
  checkSettingsAction: () => Promise<boolean>
  disconnectAction: () => Promise<void>
}

export default function Wrapper({ getDevicesAction, checkSettingsAction, disconnectAction }: Props) {
  const [preferredDevice, setPreferredDevice] = useState<number>(0)
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false)
  const [settingsError, setSettingsError] = useState<boolean>(false)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['devicesData'],
    queryFn: async () => await getDevicesAction(),
  })

  useEffect(() => {
    checkSettingsAction().then((res) => {
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
    await disconnectAction()
    setSettingsError(true)
  }

  const loadingWrapper = (
    <div
      className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'
      data-testid='wrapper'
    >
      <Loader />
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
  if (data.devices.length === 0) {
    return (
      <div
        className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'
        data-testid='wrapper'
      >
        <div>
          <ExclamationCircleIconSolid className='mb-4 text-8xl text-red-600' />
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
            <div className='mb-4'>
              {vars['ups.load'] ? (
                <Gauge percentage={+vars['ups.load'].value} title={t('currentLoad')} invert />
              ) : (
                <Kpi text='N/A' description={t('currentLoad')} />
              )}
            </div>
            <div className='mb-4'>
              <Gauge percentage={+vars['battery.charge']?.value} title={t('batteryCharge')} />
            </div>
            <div className='mb-4'>
              <Runtime runtime={+vars['battery.runtime']?.value} />
            </div>
          </div>
          <ChartsContainer vars={vars} data={data} name={ups.name} />
          <div className='mb-4'>
            <NutGrid data={ups} />
          </div>
          <Footer updated={data.updated} />
        </div>
      </div>
    </div>
  )
}
