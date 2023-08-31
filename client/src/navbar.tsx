import { Container, Navbar } from 'react-bootstrap';
import Refresh from './refresh';
import logo from './logo.svg';

function NavBar(props: any) {
  const { onRefreshClick, onRefreshIntervalChange } = props;

  return (
    <Navbar bg="light" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand href="/">
          <img alt="" src={logo} width="30" height="30" className="d-inline-block align-top" /> PeaNUT
        </Navbar.Brand>
        <Refresh onClick={onRefreshClick} onChange={onRefreshIntervalChange} />
      </Container>
    </Navbar>
  );
}

export default NavBar;
