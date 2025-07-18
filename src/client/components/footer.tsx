'use client'

import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { LanguageContext } from '@/client/context/language'
import { HiOutlineExclamationCircle } from 'react-icons/hi2'
import { FaDonate, FaGithub } from 'react-icons/fa'
import pJson from '../../../package.json'
import { useSettings } from '../context/settings'

type Props = Readonly<{
  updated?: Date
}>

export default function Footer({ updated }: Props) {
  const [currentVersion, setCurrentVersion] = useState({ created: new Date(), version: null as string | null, url: '' })
  const [updateAvailable, setUpdateAvailable] = useState({
    created: new Date(),
    version: null as string | null,
    url: '',
  })
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { settings } = useSettings()
  const { DATE_FORMAT: dateFormat, TIME_FORMAT: timeFormat } = settings

  const formatDateTime = (date: Date) => {
    const formattedDate = formatDate(date)
    const time = date.toLocaleTimeString(lng, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: timeFormat === '12-hour',
    })
    return `${formattedDate} ${time}`
  }

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    if (!dateFormat) {
      return date.toLocaleDateString(lng)
    }

    return dateFormat
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day)
      .replace('Month', date.toLocaleString(lng, { month: 'long' }))
      .replace('D', date.getDate().toString())
  }

  useEffect(() => {
    // Skip version checking if disabled in localStorage
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('disableVersionCheck') === 'true') {
        return
      }
    } catch {
      // Silently fail if localStorage is not available
    }

    const checkVersions = async () => {
      const res = await fetch('https://api.github.com/repos/brandawg93/peanut/releases')
      const json = (await res.json()) as Array<{ name: string; published_at: string; html_url: string }>
      const version = json.find((r) => r.name === `v${pJson.version}`)
      if (!version) return
      const latest = json[0]
      const created = new Date(version.published_at)
      setCurrentVersion({ created, version: version.name, url: version.html_url })
      if (version.name !== latest.name) {
        setUpdateAvailable({ created: new Date(latest.published_at), version: latest.name, url: latest.html_url })
      }
    }
    checkVersions()
  }, [])

  const updateAvailableWrapper = updateAvailable.version ? (
    <Link
      className='no-underline-text text-muted-foreground m-0 text-sm'
      href={updateAvailable.url}
      target='_blank'
      rel='noreferrer'
    >
      &nbsp;
      <HiOutlineExclamationCircle className='inline-block size-4' />
      &nbsp;{t('updateAvailable')}: {updateAvailable.version}
    </Link>
  ) : (
    <></>
  )

  return (
    <div className='text-muted-foreground mt-4 mb-3 text-sm' data-testid='footer'>
      <div className='flex justify-between'>
        <div className='flex flex-col justify-end'>
          {updated && (
            <p className='m-0' title={t('toggleTime')}>
              {t('lastUpdated')}: {formatDateTime(new Date(updated))}
            </p>
          )}
        </div>
        <div className='flex flex-col items-end text-right'>
          <div className='flex items-center'>
            <Link
              className='no-underline-text text-muted-foreground ml-1'
              href='https://www.github.com/brandawg93/peanut'
              target='_blank'
              rel='noreferrer'
              aria-label='GitHub'
            >
              <FaGithub />
            </Link>
            <Link
              className='no-underline-text text-muted-foreground ml-1'
              href='https://www.github.com/sponsors/brandawg93'
              target='_blank'
              rel='noreferrer'
              aria-label='Sponsor'
            >
              <FaDonate />
            </Link>
          </div>
          <Link className='text-muted-foreground text-sm underline' href='/api/docs' target='_blank' rel='noreferrer'>
            {t('docs')}
          </Link>
          <p className='m-0 text-sm'>
            <Link
              href={currentVersion.url}
              target='_blank'
              rel='noreferrer'
              className='no-underline-text text-muted-foreground text-xs'
            >
              {currentVersion.version} ({formatDate(currentVersion.created)})
            </Link>
            {updateAvailableWrapper}
          </p>
        </div>
      </div>
    </div>
  )
}
