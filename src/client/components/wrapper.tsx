import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { Container, Row, Col } from 'react-bootstrap'
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

import { DEVICE } from '@/common/graphql'
import { query } from '@/client/lib/schema'
import { upsStatus } from '@/common/constants'
import { useTranslation } from '@/client/i18n'

import './wrapper.css'

const getStatus = (status: keyof typeof upsStatus) => {
  switch (status) {
    case 'OL':
      return <FontAwesomeIcon icon={faCheck} style={{ color: '#00ff00' }} />
    case 'OB':
      return <FontAwesomeIcon icon={faExclamation} style={{ color: '#ffff00' }} />
    case 'LB':
      return <FontAwesomeIcon icon={faCircleExclamation} style={{ color: '#ff0000' }} />
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
  const [preferredDevice, setPreferredDevice] = useState<DEVICE>()
  const [currentVersion, setcurrentVersion] = useState({ created: new Date(), version: null, url: '' })
  const [updateAvailable, setUpdateAvailable] = useState({ created: new Date(), version: null, url: '' })
  const { t } = useTranslation(lng)

  const loadingContainer = (
    <div className="loading-container">
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
        <div className="error-container">
          <div>
            <FontAwesomeIcon icon={faCircleExclamation} className="error-icon" />
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
      <div className="error-container">
        <div>
          <FontAwesomeIcon icon={faCircleExclamation} className="error-icon" />
          <p>No devices found on this server.</p>
        </div>
      </div>
    )
  }

  const ups = preferredDevice || data.devices[0]
  const voltageWrapper = ups.input_voltage ? (
    <Row>
      <Col className="mb-4">
        <LineChart data={ups} />
      </Col>
    </Row>
  ) : (
    <></>
  )
  const wattsWrapper = ups.ups_realpower ? (
    <Row>
      <Col className="mb-4">
        <WattsChart data={ups} />
      </Col>
    </Row>
  ) : (
    <></>
  )

  const updateAvailableWrapper = updateAvailable.version ? (
    <a className="footer-text" href={updateAvailable.url} target="_blank" rel="noreferrer">
      &nbsp;
      <FontAwesomeIcon icon={faCircleExclamation} />
      &nbsp;Update Available: {updateAvailable.version}
    </a>
  ) : (
    <></>
  )
  return (
    <>
      <NavBar
        onRefreshClick={() => refetch()}
        onRefreshIntervalChange={(interval: number) => setRefreshInterval(interval)}
        onDeviceChange={(serial: string) =>
          setPreferredDevice(data.devices.find((d: any) => d.device_serial === serial))
        }
        devices={data.devices}
      />
      <Container>
        <div className="info-container">
          <div>
            <p className="m-0">
              {t('manufacturer')}: {ups.ups_mfr}
            </p>
            <p className="m-0">Model: {ups.ups_model}</p>
            <p>Serial: {ups.device_serial}</p>
          </div>
          <div>
            <p className="status-icon">
              {getStatus(ups.ups_status)}
              &nbsp;{upsStatus[ups.ups_status as keyof typeof upsStatus]}
            </p>
          </div>
        </div>
        <Row>
          <Col className="mb-4">
            {ups.ups_load ? (
              <Gauge percentage={ups.ups_load} title="Current Load" invert />
            ) : (
              <div style={{ fontSize: '2em' }}>
                <Kpi text="N/A" description="Current Load" />
              </div>
            )}
          </Col>
          <Col className="mb-4">
            <Gauge percentage={ups.battery_charge} title="Battery Charge" />
          </Col>
          <Col className="mb-4">
            <Runtime runtime={ups.battery_runtime} />
          </Col>
        </Row>
        {voltageWrapper}
        {wattsWrapper}
        <Row>
          <Col className="mb-4">
            <NutGrid data={ups} />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <div>
              <p className="m-0 footer-text">
                Last Updated: {new Date(data.updated * 1000).toLocaleString('en-US', { hour12: true })}
              </p>
            </div>
          </Col>
          <Col>
            <div style={{ textAlign: 'right' }}>
              <a className="footer-text" href={currentVersion.url} target="_blank" rel="noreferrer">
                <FontAwesomeIcon icon={faGithub} />
                &nbsp;{currentVersion.version}
                &nbsp;({currentVersion.created.toLocaleDateString()})
              </a>
              {updateAvailableWrapper}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}
