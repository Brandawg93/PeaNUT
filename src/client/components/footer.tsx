'use client'

import React, { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import { HiOutlineExclamationCircle } from 'react-icons/hi2'
import { useTranslation } from 'react-i18next'

import { LanguageContext } from '@/client/context/language'
import pJson from '../../../package.json'

type Props = {
  updated?: Date
}

export default function Footer({ updated }: Props) {
  const [currentVersion, setcurrentVersion] = useState({ created: new Date(), version: null, url: '' })
  const [updateAvailable, setUpdateAvailable] = useState({ created: new Date(), version: null, url: '' })
  const lng = useContext<string>(LanguageContext)
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
    <Link
      className='text-neutral-500 no-underline-text m-0 text-sm hover:text-gray-800 dark:hover:text-gray-400'
      href={updateAvailable.url}
      target='_blank'
      rel='noreferrer'
    >
      &nbsp;
      <HiOutlineExclamationCircle className='inline-block h-4 w-4' />
      &nbsp;{t('updateAvailable')}: {updateAvailable.version}
    </Link>
  ) : (
    <></>
  )

  return (
    <div>
      <div className='grid grid-flow-row grid-cols-2' data-testid='footer'>
        <div />
        <div className='mt-6 text-right text-gray-600'>
          <Link
            className='text-sm underline hover:text-gray-800 dark:hover:text-gray-400'
            href='/api/docs'
            target='_blank'
            rel='noreferrer'
          >
            {t('docs')}
          </Link>
        </div>
      </div>
      <div className='mb-3 grid grid-flow-row grid-cols-2 text-gray-600'>
        <div>
          {updated ? (
            <p className='m-0 text-sm no-underline'>
              {t('lastUpdated')}: {updated.toLocaleString(lng, { hour12: true })}
            </p>
          ) : (
            <></>
          )}
        </div>
        <div className='text-right'>
          <Link
            className='m-0 text-sm no-underline hover:text-gray-800 dark:hover:text-gray-400'
            href={currentVersion.url}
            target='_blank'
            rel='noreferrer'
          >
            {currentVersion.version}
            &nbsp;({currentVersion.created.toLocaleDateString()})
          </Link>
          {updateAvailableWrapper}
        </div>
      </div>
    </div>
  )
}
