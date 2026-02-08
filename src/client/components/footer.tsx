'use client'

import React, { useContext, useEffect, useState, startTransition } from 'react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { LanguageContext } from '@/client/context/language'
import { HiOutlineExclamationCircle } from 'react-icons/hi2'
import { FaDonate, FaGithub } from 'react-icons/fa'
import pJson from '../../../package.json'
import { useVersionCheck, useFormatDateTime, useFormatDate } from '../context/settings'
import { useBasePath } from '@/hooks/useBasePath'

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
  const disableVersionCheck = useVersionCheck()
  const formatDateTime = useFormatDateTime()
  const formatDate = useFormatDate()
  const basePath = useBasePath()

  useEffect(() => {
    let isMounted = true

    // Skip version checking if disabled in settings
    if (disableVersionCheck) {
      return
    }

    const checkVersions = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/brandawg93/peanut/releases')
        const json = await res.json()
        if (!isMounted || !Array.isArray(json)) return
        const version = json.find((r) => r.name === `v${pJson.version}`)
        if (!version) return
        const latest = json[0]
        const created = new Date(version.published_at)
        startTransition(() => {
          setCurrentVersion({ created, version: version.name, url: version.html_url })
          if (version.name !== latest.name) {
            setUpdateAvailable({ created: new Date(latest.published_at), version: latest.name, url: latest.html_url })
          }
        })
      } catch (error) {
        if (isMounted) {
          console.error('Failed to check versions:', error)
        }
      }
    }
    checkVersions()

    return () => {
      isMounted = false
    }
  }, [disableVersionCheck])

  const updateAvailableWrapper = updateAvailable.version ? (
    <Link
      className='no-underline-text text-muted-foreground m-0 text-sm'
      href={updateAvailable.url}
      target='_blank'
      rel='noreferrer'
      data-testid='update-available-link'
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
          <Link
            className='text-muted-foreground text-sm underline'
            href={{ pathname: `${basePath}/api/docs` }}
            target='_blank'
            rel='noreferrer'
          >
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
