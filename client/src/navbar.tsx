import { Container, Nav, Navbar } from 'react-bootstrap';
import logo from './logo.svg';

function NavBar() {
  return (
    <Navbar bg="light" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand href="/">
          <img alt="" src={logo} width="30" height="30" className="d-inline-block align-top" /> PeaNUT
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default NavBar;
