import React, { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageContext } from '@/client/context/language'
import Kpi from '@/client/components/kpi'

const TIME_CONSTANTS = {
  DAY: 3600 * 24,
  HOUR: 3600,
  MINUTE: 60,
} as const

function secondsToDhms(seconds: number): string {
  if (seconds <= 0) {
    return 'N/A'
  }

  const d = Math.floor(seconds / TIME_CONSTANTS.DAY)
  const h = Math.floor((seconds % TIME_CONSTANTS.DAY) / TIME_CONSTANTS.HOUR)
  const m = Math.floor((seconds % TIME_CONSTANTS.HOUR) / TIME_CONSTANTS.MINUTE)
  const s = Math.floor(seconds % TIME_CONSTANTS.MINUTE)

  const parts = [
    d > 0 && `${d} ${d === 1 ? 'day' : 'days'}`,
    h > 0 && `${h} ${h === 1 ? 'hour' : 'hours'}`,
    m > 0 && `${m} ${m === 1 ? 'minute' : 'minutes'}`,
    s > 0 && `${s} ${s === 1 ? 'second' : 'seconds'}`,
  ].filter(Boolean)

  return parts.join(', ')
}

type Props = {
  runtime: number
}

export default function Runtime({ runtime }: Props) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const formattedTime = useMemo(() => secondsToDhms(runtime), [runtime])

  return (
    <div className='text-3xl' data-testid='runtime'>
      <Kpi text={formattedTime} description={t('batteryRuntime')} />
    </div>
  )
}
