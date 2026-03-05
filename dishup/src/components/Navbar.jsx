import { Navbar, Container, Nav } from "react-bootstrap";

export default function MyNavbar() {
    return (
        <Navbar bg="dark" variant="dark" fixed="top" expand="lg" className="w-100 shadow-sm py-4">
            {/* Pakai fluid biar full */}
            <Container fluid>
                {/* Brand sebelah kiri */}
                <Navbar.Brand href="/" className="fw-bold">
                    Dishub LLJ Storage
                </Navbar.Brand>

                {/* Tombol toggle buat mobile */}
                <Navbar.Toggle aria-controls="basic-navbar-nav" />

                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Menu geser ke kanan */}
                    <Nav className="ms-auto">
                        <Nav.Link href="/">Dashboard</Nav.Link>
                        <Nav.Link href="/upload">Upload</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
