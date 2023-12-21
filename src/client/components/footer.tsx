import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

import pJson from '../../../package.json'

export default function Footer({ updated, lng }: { updated: number; lng: string }) {
  const [currentVersion, setcurrentVersion] = useState({ created: new Date(), version: null, url: '' })
  const [updateAvailable, setUpdateAvailable] = useState({ created: new Date(), version: null, url: '' })
  const { t } = useTranslation(lng)

  useEffect(() => {
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
    <div className='mb-3 grid grid-flow-row grid-cols-2 text-gray-600'>
      <div>
        <p className='text-neutral-500 m-0 text-sm no-underline'>
          {t('lastUpdated')}: {new Date(updated * 1000).toLocaleString('en-US', { hour12: true })}
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
  )
}
