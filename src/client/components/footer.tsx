import React, { useState, useEffect } from 'react'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'

import pJson from '../../../package.json'
import DayNightSwitch from './daynight'

type Props = {
  updated: Date
  lng: string
}

export default function Footer({ updated, lng }: Props) {
  const [currentVersion, setcurrentVersion] = useState({ created: new Date(), version: null, url: '' })
  const [updateAvailable, setUpdateAvailable] = useState({ created: new Date(), version: null, url: '' })
  const { t } = useTranslation(lng)

  useEffect(() => {
    fetch('https://api.github.com/repos/brandawg93/peanut/releases').then((res) => {
      res.json().then((json) => {
        const version = json.find((r: any) => r.name === `v${pJson.version}`)
        if (!version) return
        const latest = json[0]
        const created = new Date(version.published_at)
        setcurrentVersion({ created, version: version.name, url: version.html_url })
        if (version.name !== latest.name) {
          setUpdateAvailable({ created: new Date(latest.published_at), version: latest.name, url: latest.html_url })
        }
      })
    })
  }, [])

  const updateAvailableWrapper = updateAvailable.version ? (
    <a
      className='text-neutral-500 no-underline-text m-0 text-sm'
      href={updateAvailable.url}
      target='_blank'
      rel='noreferrer'
    >
      &nbsp;
      <ExclamationCircleIcon className='inline-block h-4 w-4' />
      &nbsp;Update Available: {updateAvailable.version}
    </a>
  ) : (
    <></>
  )

  return (
    <>
      <DayNightSwitch />
      <div className='mb-3 grid grid-flow-row grid-cols-2 text-gray-600'>
        <div>
          <p className='text-neutral-500 m-0 text-sm no-underline'>
            {t('lastUpdated')}: {updated.toLocaleString(lng, { hour12: true })}
          </p>
        </div>
        <div className='text-right'>
          <a
            className='text-neutral-500 m-0 text-sm no-underline'
            href={currentVersion.url}
            target='_blank'
            rel='noreferrer'
          >
            {currentVersion.version}
            &nbsp;({currentVersion.created.toLocaleDateString()})
          </a>
          {updateAvailableWrapper}
        </div>
      </div>
    </>
  )
}
