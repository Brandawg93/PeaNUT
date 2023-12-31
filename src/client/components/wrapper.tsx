'use client'

import 'chart.js/auto'

import React, { useEffect, useState } from 'react'
import { CheckIcon, ExclamationTriangleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { ExclamationCircleIcon as ExclamationCircleIconSolid } from '@heroicons/react/24/solid'
import { Spinner } from '@material-tailwind/react'
import { useTranslation, initReactI18next } from 'react-i18next'
import { Chart } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import NutGrid from './grid'
import Gauge from './gauge'
import Kpi from './kpi'
import LineChart from './line-chart'
import NavBar from './navbar'
import Runtime from './runtime'
import WattsChart from './watts-chart'
import Footer from './footer'
import { ThemeContext } from './themecontext'

import { upsStatus } from '@/common/constants'
import useFetch from '@/client/hooks/usefetch'
import { getOptions, languages, resources } from '@/client/i18n'
import { DEVICE } from '@/common/types'

const runsOnServerSide = typeof window === 'undefined'

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resources)
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
    preload: runsOnServerSide ? languages : [],
  })

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

type Props = {
  lng: string
}

export default function Wrapper({ lng }: Props) {
  const [preferredDevice, setPreferredDevice] = useState<number>(0)
  const { t } = useTranslation(lng)
  const { data, refetch, loading, error } = useFetch()
  const [theme, setTheme] = useState('system')

  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (localStorage.theme === 'dark') setTheme('dark')
    else if (localStorage.theme === 'light') setTheme('light')
    else setTheme('system')
  }, [setTheme])

  if (error) {
    if (error.message.includes('ECONNREFUSED')) {
      return (
        <div className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'>
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
      <div className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-8xl dark:from-gray-900 dark:to-gray-800 dark:text-white'>
        <Spinner className='h-12 w-12' />
      </div>
    )
  }
  if (data.devices && data.devices.length === 0) {
    return (
      <div className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'>
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
      <LineChart data={ups} lng={lng} />
    </div>
  ) : (
    <></>
  )
  const wattsWrapper = ups['ups.realpower'] ? (
    <div className='mb-4'>
      <WattsChart data={ups} lng={lng} />
    </div>
  ) : (
    <></>
  )

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className='bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-900 dark:text-white'>
        <NavBar
          disableRefresh={loading || typeof loading === 'undefined'}
          onRefreshClick={() => refetch()}
          onRefetch={() => refetch()}
          onDeviceChange={(serial: string) =>
            data.devices && setPreferredDevice(data.devices.findIndex((d: DEVICE) => d['device.serial'] === serial))
          }
          devices={data.devices}
          lng={lng}
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
                <Runtime runtime={ups['battery.runtime']} lng={lng} />
              </div>
            </div>
            {voltageWrapper}
            {wattsWrapper}
            <div className='mb-4'>
              <NutGrid data={ups} lng={lng} />
            </div>
            <Footer updated={data.updated} lng={lng} />
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  )
}
