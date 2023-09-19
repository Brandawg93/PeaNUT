import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheck, faExclamation, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import NutGrid from './grid';
import Gauge from './gauge';
import LineChart from './line-chart';
import NavBar from './navbar';
import './wrapper.css';
import Runtime from './runtime';
import pJson from '../package.json';
import WattsChart from './watts-chart';

const query = gql`
  query {
    devices {
      battery_charge
      battery_charge_low
      battery_charge_warning
      battery_mfr_date
      battery_runtime
      battery_runtime_low
      battery_type
      battery_voltage
      battery_voltage_nominal
      device_mfr
      device_model
      device_serial
      device_type
      driver_name
      driver_parameter_pollfreq
      driver_parameter_pollinterval
      driver_parameter_port
      driver_parameter_synchronous
      driver_version
      driver_version_data
      driver_version_internal
      driver_version_usb
      input_voltage
      input_voltage_nominal
      output_voltage
      ups_beeper_status
      ups_delay_shutdown
      ups_delay_start
      ups_load
      ups_mfr
      ups_model
      ups_productid
      ups_realpower
      ups_realpower_nominal
      ups_serial
      ups_status
      ups_test_result
      ups_timer_shutdown
      ups_timer_start
      ups_vendorid
    }
    updated
  }
`;

const getStatus = (status: string) => {
  switch (status) {
    case 'OL':
      return (
        <p className="status-icon">
          <FontAwesomeIcon icon={faCheck} style={{ color: '#00ff00' }} />
          &nbsp;Online
        </p>
      );
    case 'OB':
      return (
        <p className="status-icon">
          <FontAwesomeIcon icon={faExclamation} style={{ color: '#ffff00' }} />
          &nbsp;On Battery
        </p>
      );
    case 'LB':
      return (
        <p className="status-icon">
          <FontAwesomeIcon icon={faCircleExclamation} style={{ color: '#ff0000' }} />
          &nbsp;Low Battery
        </p>
      );
  }
};

export default function Wrapper() {
  const localRefresh = parseInt(localStorage.getItem('refreshInterval') || '0');
  const [refreshInterval, setRefreshInterval] = useState(localRefresh);
  const { data, error, refetch } = useQuery(query, { pollInterval: refreshInterval * 1000 });
  const [preferredDevice, setPreferredDevice] = useState();
  const [latestRelease, setLatestRelease] = useState({ created: new Date(), version: null, url: '' });

  useEffect(() => {
    fetch('https://api.github.com/repos/brandawg93/peanut/releases').then((res) => {
      res.json().then((json) => {
        const version = json.find((r: any) => r.name === `v${pJson.version}`);
        const created = new Date(version.published_at);
        setLatestRelease({ created: created, version: version.name, url: version.html_url });
      });
    });
  }, []);

  if (error) {
    if (error.message.includes('ECONNREFUSED')) {
      return (
        <div className="error-container">
          <div>
            <FontAwesomeIcon icon={faCircleExclamation} className="error-icon" />
            <p>Connection refused. Is NUT server running?</p>
          </div>
        </div>
      );
    }
    console.error(error);
  }
  if (!data?.devices) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spinPulse />
      </div>
    );
  }
  if (data.devices && data.devices.length === 0) {
    return (
      <div className="error-container">
        <div>
          <FontAwesomeIcon icon={faCircleExclamation} className="error-icon" />
          <p>No devices found on this server.</p>
        </div>
      </div>
    );
  }

  const ups = preferredDevice ? preferredDevice : data.devices[0];
  const voltageWrapper = ups.input_voltage ? (
    <Row>
      <Col className="mb-4">
        <LineChart data={ups} />
      </Col>
    </Row>
  ) : (
    <></>
  );
  const wattsWrapper = ups.ups_realpower ? (
    <Row>
      <Col className="mb-4">
        <WattsChart data={ups} />
      </Col>
    </Row>
  ) : (
    <></>
  );
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
            <p className="m-0">Manufacturer: {ups.ups_mfr}</p>
            <p className="m-0">Model: {ups.ups_model}</p>
            <p>Serial: {ups.device_serial}</p>
          </div>
          <div>{getStatus(ups.ups_status)}</div>
        </div>
        <Row>
          <Col className="mb-4">
            <Gauge percentage={ups.ups_load} title={'Current Load'} invert />
          </Col>
          <Col className="mb-4">
            <Gauge percentage={ups.battery_charge} title={'Battery Charge'} />
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
              <p className="m-0">
                Last updated: {new Date(data.updated * 1000).toLocaleString('en-US', { hour12: true })}
              </p>
            </div>
          </Col>
          <Col>
            <div style={{ textAlign: 'right' }}>
              <a
                href={latestRelease.url}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none', color: 'black' }}
              >
                <FontAwesomeIcon icon={faGithub} />
                &nbsp;{latestRelease.version}&nbsp;({latestRelease.created.toLocaleDateString()})
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
