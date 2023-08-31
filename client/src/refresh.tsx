import { Button, Dropdown, ButtonGroup } from 'react-bootstrap';
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

export default function Refresh(props: any) {

    const { onClick, onChange } = props;
    const [refreshInterval, setRefreshInterval] = useState(localStorage.getItem('refreshInterval') || '0');

    const handleSelect = (eventKey: any) => {
        setRefreshInterval(eventKey);
        onChange(parseInt(eventKey));
        localStorage.setItem('refreshInterval', eventKey);
    };

    return (
        <Dropdown as={ButtonGroup} onSelect={handleSelect}>
            <Button variant='outline-primary'><FontAwesomeIcon icon={faRefresh} onClick={onClick} /></Button>

            <Dropdown.Toggle split variant='outline-primary' />

            <Dropdown.Menu>
                <Dropdown.Item eventKey={0} active={refreshInterval === '0'}>off</Dropdown.Item>
                <Dropdown.Item eventKey={1} active={refreshInterval === '1'}>1s</Dropdown.Item>
                <Dropdown.Item eventKey={3} active={refreshInterval === '3'}>3s</Dropdown.Item>
                <Dropdown.Item eventKey={5} active={refreshInterval === '5'}>5s</Dropdown.Item>
                <Dropdown.Item eventKey={10} active={refreshInterval === '10'}>10s</Dropdown.Item>
                <Dropdown.Item eventKey={30} active={refreshInterval === '30'}>30s</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}