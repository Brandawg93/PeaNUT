'use client'

import '@fortawesome/fontawesome-svg-core/styles.css'
import 'chart.js/auto'

import React, { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck, faExclamation, faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
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

import { upsStatus } from '@/common/constants'
import { getDevices } from '@/app/actions'
import { DEVICE } from '@/common/types'
import { getOptions, languages, resources } from '@/client/i18n'

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
      return <FontAwesomeIcon icon={faCheck} className='text-green-400' />
    case 'OB':
      return <FontAwesomeIcon icon={faExclamation} className='text-yellow-400' />
    case 'LB':
      return <FontAwesomeIcon icon={faCircleExclamation} className='text-red-400' />
    default:
      return <></>
  }
}

const useFetch = () => {
  const [loading, setLoading] = useState<boolean>()
  const [error, setError] = useState<any>(null)
  const [data, setData] = useState<{ devices: Array<DEVICE> | undefined; updated: number }>({
    devices: undefined,
    updated: new Date().getTime(),
  })

  const refetch = useCallback(() => {
    setLoading(true)
    getDevices()
      .then((devices) => {
        setData({ devices: devices, updated: new Date().getTime() })
        setLoading(false)
      })
      .catch((error: any) => {
        setError(error)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, refetch, loading, error }
}

export default function Wrapper({ lng }: { lng: string }) {
  const [refreshInterval, setRefreshInterval] = useState(0)
  const [preferredDevice, setPreferredDevice] = useState<number>(0)
  const { t } = useTranslation(lng)

  const { data, refetch, loading, error } = useFetch()

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => refetch(), refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [refreshInterval, refetch])

  useEffect(() => {
    setRefreshInterval(parseInt(localStorage.getItem('refreshInterval') || '0', 10))
  }, [])

  if (error) {
    if (error.message.includes('ECONNREFUSED')) {
      return (
        <div className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'>
          <div>
            <FontAwesomeIcon icon={faCircleExclamation} className='mb-4 text-8xl text-red-600' />
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
        <FontAwesomeIcon icon={faSpinner} spinPulse />
      </div>
    )
  }
  if (data.devices && data.devices.length === 0) {
    return (
      <div className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'>
        <div>
          <FontAwesomeIcon icon={faCircleExclamation} className='mb-4 text-8xl text-red-600' />
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
    <div className='bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-900 dark:text-white'>
      <NavBar
        disableRefresh={loading || typeof loading === 'undefined'}
        onRefreshClick={() => refetch()}
        onRefreshIntervalChange={(interval: number) => setRefreshInterval(interval)}
        onDeviceChange={(serial: string) =>
          data.devices && setPreferredDevice(data.devices.findIndex((d: any) => d['device.serial'] === serial))
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
  )
}
