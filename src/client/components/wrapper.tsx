import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faCheck, faExclamation, faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'

import pJson from '../../../package.json'

import NutGrid from './grid'
import Gauge from './gauge'
import Kpi from './kpi'
import LineChart from './line-chart'
import NavBar from './navbar'
import Runtime from './runtime'
import WattsChart from './watts-chart'

import { query } from '@/client/lib/schema'
import { upsStatus } from '@/common/constants'
import { useTranslation } from '@/client/i18n'

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

export default function Wrapper({ lng }: { lng: string }) {
  const [refreshInterval, setRefreshInterval] = useState(0)
  const { data, error, refetch } = useQuery(query, {
    pollInterval: refreshInterval * 1000,
    fetchPolicy: 'no-cache',
  })
  const [preferredDevice, setPreferredDevice] = useState<number>(0)
  const [currentVersion, setcurrentVersion] = useState({ created: new Date(), version: null, url: '' })
  const [updateAvailable, setUpdateAvailable] = useState({ created: new Date(), version: null, url: '' })
  const { t } = useTranslation(lng)

  const loadingContainer = (
    <div className='absolute left-0 top-0 flex h-full w-full items-center justify-center text-8xl bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 dark:text-white'>
      <FontAwesomeIcon icon={faSpinner} spinPulse />
    </div>
  )

  useEffect(() => {
    setRefreshInterval(parseInt(localStorage.getItem('refreshInterval') || '0', 10))
    fetch('https://api.github.com/repos/brandawg93/peanut/releases').then((res) => {
      res.json().then((json) => {
        const version = json.find((r: any) => r.name === `v${pJson.version}`)
        const latest = json[0]
        const created = new Date(version.published_at)
        setcurrentVersion({ created, version: version.name, url: version.html_url })
        if (version.name !== latest.name) {
          setUpdateAvailable({ created: new Date(latest.published_at), version: latest.name, url: latest.html_url })
        }
      })
    })
  }, [])

  if (error) {
    if (error.message.includes('ECONNREFUSED')) {
      return (
        <div className='absolute left-0 top-0 flex h-full w-full items-center justify-center text-center bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 dark:text-white'>
          <div>
            <FontAwesomeIcon icon={faCircleExclamation} className='mb-4 text-8xl text-red-600' />
            <p>Connection refused. Is NUT server running?</p>
          </div>
        </div>
      )
    }
    // eslint-disable-next-line no-console
    console.error(error)
  }
  if (!data) {
    return loadingContainer
  }
  if (data.devices && data.devices.length === 0) {
    return (
      <div className='absolute left-0 top-0 flex h-full w-full items-center justify-center text-center bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 dark:text-white'>
        <div>
          <FontAwesomeIcon icon={faCircleExclamation} className='mb-4 text-8xl text-red-600' />
          <p>No devices found on this server.</p>
        </div>
      </div>
    )
  }

  const ups = data.devices[preferredDevice]
  const voltageWrapper = ups.input_voltage ? (
    <div className='mb-4'>
      <LineChart data={ups} />
    </div>
  ) : (
    <></>
  )
  const wattsWrapper = ups.ups_realpower ? (
    <div className='mb-4'>
      <WattsChart data={ups} />
    </div>
  ) : (
    <></>
  )

  const updateAvailableWrapper = updateAvailable.version ? (
    <a className='footer-text' href={updateAvailable.url} target='_blank' rel='noreferrer'>
      &nbsp;
      <FontAwesomeIcon icon={faCircleExclamation} />
      &nbsp;Update Available: {updateAvailable.version}
    </a>
  ) : (
    <></>
  )
  return (
    <div className='bg-gradient-to-b from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-900 dark:text-white'>
      <NavBar
        onRefreshClick={() => refetch()}
        onRefreshIntervalChange={(interval: number) => setRefreshInterval(interval)}
        onDeviceChange={(serial: string) =>
          setPreferredDevice(data.devices.findIndex((d: any) => d.device_serial === serial))
        }
        devices={data.devices}
      />
      <div className='flex justify-center'>
        <div className='container'>
          <div className='flex flex-row justify-between'>
            <div>
              <p className='m-0'>
                {t('manufacturer')}: {ups.ups_mfr}
              </p>
              <p className='m-0'>{t('model')}: {ups.ups_model}</p>
              <p>{t('serial')}: {ups.device_serial}</p>
            </div>
            <div>
              <p className='text-2xl font-semibold'>
                {getStatus(ups.ups_status)}
                &nbsp;{upsStatus[ups.ups_status as keyof typeof upsStatus]}
              </p>
            </div>
          </div>
          <div className='grid grid-flow-row grid-cols-1 gap-x-6 md:grid-cols-2 lg:grid-cols-3'>
            <div className='mb-4'>
              {ups.ups_load ? (
                <Gauge percentage={ups.ups_load} title={t('currentLoad')} invert />
              ) : (
                <Kpi text='N/A' description={t('currentLoad')} />
              )}
            </div>
            <div className='mb-4'>
              <Gauge percentage={ups.battery_charge} title={t('batteryCharge')} />
            </div>
            <div className='mb-4'>
              <Runtime runtime={ups.battery_runtime} lng={lng} />
            </div>
          </div>
          {voltageWrapper}
          {wattsWrapper}
          <div className='mb-4'>
            <NutGrid data={ups} lng={lng} />
          </div>
          <div className='mb-3 grid grid-flow-row grid-cols-2 text-gray-600'>
            <div>
              <p className='text-neutral-500 m-0 text-sm no-underline'>
              {t('lastUpdated')}: {new Date(data.updated * 1000).toLocaleString('en-US', { hour12: true })}
              </p>
            </div>
            <div className='text-right'>
              <a
                className='text-neutral-500 m-0 text-sm no-underline'
                href={currentVersion.url}
                target='_blank'
                rel='noreferrer'
              >
                <FontAwesomeIcon icon={faGithub} />
                &nbsp;{currentVersion.version}
                &nbsp;({currentVersion.created.toLocaleDateString()})
              </a>
              {updateAvailableWrapper}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
