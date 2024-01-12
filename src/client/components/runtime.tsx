import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageContext } from '@/client/context/language'
import Kpi from './kpi'

function secondsToDhms(seconds: number) {
  if (seconds <= 0) {
    return 'N/A'
  }

  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  const dDisplay = d > 0 ? d + (d === 1 ? ' day, ' : ' days, ') : ''
  const hDisplay = h > 0 ? h + (h === 1 ? ' hour, ' : ' hours, ') : ''
  const mDisplay = m > 0 ? m + (m === 1 ? ' minute, ' : ' minutes, ') : ''
  const sDisplay = s > 0 ? s + (s === 1 ? ' second' : ' seconds') : ''
  const result = dDisplay + hDisplay + mDisplay + sDisplay
  return result.replace(/,\s*$/, '')
}

type Props = {
  runtime: number
}

export default function Runtime(props: Props) {
  const { runtime } = props
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  return (
    <div className='text-3xl' data-testid='runtime'>
      <Kpi text={secondsToDhms(runtime)} description={t('batteryRuntime')} />
    </div>
  )
}
