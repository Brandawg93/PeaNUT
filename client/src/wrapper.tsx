import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheck, faExclamation, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import NutGrid from './grid';
import Gauge from './gauge';
import LineChart from './line-chart';
import NavBar from './navbar';
import './wrapper.css';
import Runtime from './runtime';

let query = gql`
  query {
    ups {
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
            return <p className='status-icon'><FontAwesomeIcon icon={faCheck} style={{color: '#00ff00'}} />&nbsp;Online</p>;
        case 'OB':
            return <p className='status-icon'><FontAwesomeIcon icon={faExclamation} style={{color: '#ffff00'}} />&nbsp;On Battery</p>;
        case 'LB':
            return <p className='status-icon'><FontAwesomeIcon icon={faCircleExclamation} style={{color: '#ff0000'}} />&nbsp;Low Battery</p>;
    }
};

export default function Wrapper() {
    const localRefresh = parseInt(localStorage.getItem('refreshInterval') || '0');
    const [refreshInterval, setRefreshInterval] = useState(localRefresh);
    const { data, error, refetch } = useQuery(query, { pollInterval: refreshInterval * 1000 });

    if (error) {
        if (error.message.includes('ECONNREFUSED')) {
            return (
                <div className='error-container'>
                    <div>
                        <FontAwesomeIcon icon={faCircleExclamation} className='error-icon' />
                        <p>Connection refused. Is NUT server running?</p>
                    </div>
                </div>
            );
        }
        console.error(error);
    }
    if (!data?.ups) {
        return (
            <div className='loading-container'>
                <FontAwesomeIcon icon={faSpinner} spinPulse />
            </div>
        );
    }
    return (
        <>
        <NavBar onRefreshClick={() => refetch()} onRefreshIntervalChange={(interval: number) => setRefreshInterval(interval)} />
        <Container>
            <div className='info-container'>
                <div>
                    <p className='m-0'>Manufacturer: {data.ups.ups_mfr}</p>
                    <p className='m-0'>Model: {data.ups.ups_model}</p>
                    <p>Serial: {data.ups.device_serial}</p>
                </div>
                <div>
                    {getStatus(data.ups.ups_status)}
                </div>
            </div>
            <Row>
                <Col className='mb-4'>
                    <Gauge percentage={data?.ups.ups_load} title={'Current Load'} invert />
                </Col>
                <Col className='mb-4'>
                    <Gauge percentage={data?.ups.battery_charge} title={'Battery Charge'} />
                </Col>
                <Col className='mb-4'>
                    <Runtime runtime={data?.ups.battery_runtime} />
                </Col>
            </Row>
            <Row>
                <Col className='mb-4'>
                    <LineChart data={data} />
                </Col>
            </Row>
            <Row>
                <Col className='mb-4'>
                    <NutGrid data={data} />
                </Col>
            </Row>
        </Container>
        </>
    );
}