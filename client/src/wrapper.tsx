import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import NutGrid from './grid';
import Gauge from './gauge';
import LineChart from './line-chart';
import NavBar from './navbar';
import './wrapper.css';

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

export default function Wrapper() {
    const [refreshInterval, setRefreshInterval] = useState(0);
    const { data, refetch } = useQuery(query, { pollInterval: refreshInterval * 1000 });

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
                <Row>
                    <Col>
                        <div className='gauge-container'>
                            <Gauge percentage={data?.ups.ups_load} title={'Current Load'} invert />
                        </div>
                    </Col>
                    <Col>
                        <div className='gauge-container'>
                            <Gauge percentage={data?.ups.battery_charge} title={'Battery Charge'} />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className='line-container'>
                            <LineChart data={data} />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <NutGrid data={data} />
                    </Col>
                </Row>
            </Container>
        </>
    );
}