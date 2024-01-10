'use client'

import 'chart.js/auto'

import React, { useContext, useState } from 'react'
import { CheckIcon, ExclamationTriangleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { ExclamationCircleIcon as ExclamationCircleIconSolid } from '@heroicons/react/24/solid'
import { Spinner } from '@material-tailwind/react'
import { useTranslation } from 'react-i18next'
import { Chart } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'

import NutGrid from './grid'
import Gauge from './gauge'
import Kpi from './kpi'
import LineChart from './line-chart'
import NavBar from './navbar'
import Runtime from './runtime'
import WattsChart from './watts-chart'
import Footer from './footer'

import { LanguageContext } from '@/client/context/language'
import { upsStatus } from '@/common/constants'
import useFetch from '@/client/hooks/usefetch'
import { DEVICE } from '@/common/types'

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
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { data, refetch, loading, error } = useFetch()

  if (error) {
    if (error.message.includes('ECONNREFUSED')) {
      return (
        <div
          className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'
          data-testid='wrapper'
        >
          <div>
            <ExclamationCircleIconSolid className='mb-4 text-8xl text-red-600' />
            <p>Connection refused. Is NUT server running?</p>
          </div>
        </div>
      )
    }

    console.error(error)
  }
  if (!data.devices) {
    return (
      <div
        className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-8xl dark:from-gray-900 dark:to-gray-800 dark:text-white'
        data-testid='wrapper'
      >
        <Spinner className='h-12 w-12' />
      </div>
    )
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
  const voltageWrapper = ups['input.voltage'] ? (
    <div className='mb-4'>
      <LineChart data={ups} />
    </div>
  ) : (
    <></>
  )
  const wattsWrapper = ups['ups.realpower'] ? (
    <div className='mb-4'>
      <WattsChart data={ups} />
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
        disableRefresh={loading || typeof loading === 'undefined'}
        onRefreshClick={() => refetch()}
        onRefetch={() => refetch()}
        onDeviceChange={(serial: string) =>
          data.devices && setPreferredDevice(data.devices.findIndex((d: DEVICE) => d['device.serial'] === serial))
        }
        devices={data.devices}
      />
      <div className='flex justify-center'>
        <div className='container'>
          <div className='flex flex-row justify-between'>
            <div>
              <p className='m-0'>
                {t('manufacturer')}: {ups['ups.mfr']}
              </p>
              <p className='m-0'>
                {t('model')}: {ups['ups.model']}
              </p>
              <p>
                {t('serial')}: {ups['device.serial']}
              </p>
            </div>
            <div>
              <p className='text-2xl font-semibold'>
                {getStatus(ups['ups.status'])}
                &nbsp;{upsStatus[ups['ups.status'] as keyof typeof upsStatus]}
              </p>
            </div>
          </div>
          <div className='grid grid-flow-row grid-cols-1 gap-x-6 md:grid-cols-2 lg:grid-cols-3'>
            <div className='mb-4'>
              {ups['ups.load'] ? (
                <Gauge percentage={ups['ups.load']} title={t('currentLoad')} invert />
              ) : (
                <Kpi text='N/A' description={t('currentLoad')} />
              )}
            </div>
            <div className='mb-4'>
              <Gauge percentage={ups['battery.charge']} title={t('batteryCharge')} />
            </div>
            <div className='mb-4'>
              <Runtime runtime={ups['battery.runtime']} />
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
