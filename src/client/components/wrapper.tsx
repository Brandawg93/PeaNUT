'use client'

import 'chart.js/auto'
import 'react-toastify/dist/ReactToastify.css'

import { useContext, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckIcon, ExclamationTriangleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { ExclamationCircleIcon as ExclamationCircleIconSolid } from '@heroicons/react/24/solid'
import { Spinner } from '@material-tailwind/react'
import { useTranslation } from 'react-i18next'
import { Chart } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'

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
import { getDevices } from '@/app/actions'

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
  const { isLoading, data, refetch } = useQuery({
    queryKey: ['devicesData'],
    queryFn: () => getDevices(),
  })

  const loadingWrapper = (
    <div
      className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'
      data-testid='wrapper'
    >
      <Spinner className='h-12 w-12' />
    </div>
  )

  if (data?.error) {
    let error = 'Internal Server Error'
    if (data?.error.message?.includes('ECONNREFUSED')) {
      error = 'Connection refused. Is NUT server running?'
    }

    console.error(error)

    return (
      <div
        className='absolute left-0 top-0 flex h-full w-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'
        data-testid='wrapper'
      >
        <div>
          <ExclamationCircleIconSolid className='mb-4 text-8xl text-red-600' />
          <p>{error}</p>
        </div>
      </div>
    )
  }
  if (!data || !data.devices) {
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
        serial={vars['device.serial']?.value}
        inputVoltage={parseFloat(vars['input.voltage'].value)}
        inputVoltageNominal={parseFloat(vars['input.voltage.nominal']?.value)}
        outputVoltage={parseFloat(vars['output.voltage']?.value)}
        updated={data.updated}
      />
    </div>
  ) : (
    <></>
  )
  const wattsWrapper = vars['ups.realpower'] ? (
    <div className='mb-4'>
      <WattsChart
        serial={vars['device.serial']?.value}
        realpower={parseFloat(vars['ups.realpower'].value)}
        realpowerNominal={parseFloat(vars['ups.realpower.nominal']?.value)}
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
        onDeviceChange={(serial: string) =>
          data.devices &&
          setPreferredDevice(data.devices.findIndex((d: DEVICE) => d.vars && d.vars['device.serial']?.value === serial))
        }
        devices={data.devices}
      />
      <div className='flex justify-center'>
        <div className='container'>
          <div className='flex flex-row justify-between'>
            <div>
              <p className='m-0'>
                {t('manufacturer')}: {vars['ups.mfr']?.value}
              </p>
              <p className='m-0'>
                {t('model')}: {vars['ups.model']?.value}
              </p>
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
                <Gauge percentage={parseFloat(vars['ups.load'].value)} title={t('currentLoad')} invert />
              ) : (
                <Kpi text='N/A' description={t('currentLoad')} />
              )}
            </div>
            <div className='mb-4'>
              <Gauge percentage={parseFloat(vars['battery.charge']?.value)} title={t('batteryCharge')} />
            </div>
            <div className='mb-4'>
              <Runtime runtime={parseFloat(vars['battery.runtime']?.value)} />
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
