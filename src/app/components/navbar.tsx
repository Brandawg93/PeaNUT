import { Container, Navbar, Dropdown } from 'react-bootstrap';
import { useState } from 'react';
import Image from 'next/image';

import logo from '../../../public/logo.svg';

import Refresh from './refresh';

function NavBar(props: any) {
  const { onRefreshClick, onRefreshIntervalChange, onDeviceChange, devices } = props;
  const [device, setDevice] = useState(devices[0]);

  const handleSelect = (eventKey: any) => {
    setDevice(devices.find((d: any) => d.device_serial === eventKey));
    onDeviceChange(eventKey);
  };

  const dropdown = (
    <>
      <Dropdown onSelect={handleSelect}>
        <Dropdown.Toggle variant="outline-secondary">{`${device.device_mfr} ${device.device_model}`}</Dropdown.Toggle>
        <Dropdown.Menu>
          {devices.map((d: any) => (
            <Dropdown.Item
              key={d.device_serial}
              eventKey={d.device_serial}
              onClick={() => setDevice(d)}
            >{`${d.device_mfr} ${d.device_model}`}</Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      <div>&nbsp;</div>
    </>
  );

  return (
    <Navbar bg="light" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand href="/">
          <Image alt="" src={logo} width="30" height="30" className="d-inline-block align-top" /> PeaNUT
        </Navbar.Brand>
        <div style={{ display: 'inline-flex' }}>
          {devices.length > 1 ? dropdown : null}
          <Refresh onClick={onRefreshClick} onChange={onRefreshIntervalChange} />
        </div>
      </Container>
    </Navbar>
  );
}

export default NavBar;
