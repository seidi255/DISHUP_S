import { useEffect, useState, useMemo } from "react";
import { Table, Button, Spinner, Form, Badge, Card, InputGroup, Pagination, Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../apiClient";
import { toast } from "react-toastify";
import { FiSearch, FiPrinter, FiRefreshCw, FiUser, FiShield, FiAlertCircle } from "react-icons/fi"; // Pastikan install react-icons

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [search, setSearch] = useState(""); // State pencarian
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // Jumlah user per halaman

    const navigate = useNavigate();

    // === Ambil user login ===
    useEffect(() => {
        const getAuthUser = async () => {
            const tokenRaw = localStorage.getItem('dishup_token');
            if (tokenRaw) {
                try {
                    const userData = JSON.parse(atob(tokenRaw));
                    setCurrentUser(userData);
                } catch (e) {
                    setCurrentUser(null);
                }
            }
        };
        getAuthUser();
    }, []);

    // === Load semua user ===
    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("auth.php?action=list_users");

            if (response.status !== 'success') throw new Error(response.message || "Gagal mengambil data");

            let data = response.data || [];
            // Sort by created_at desc
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setUsers(data);
        } catch (e) {
            toast.error("Gagal memuat pengguna: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    // === Update role ===
    const handleRoleChange = async (id, email, newRole) => {
        try {
            const response = await apiClient.post("auth.php?action=update_user_role", { id, role: newRole });
            if (response.status !== 'success') throw new Error(response.message || "Gagal update role");

            // Update state lokal agar tidak perlu reload network
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
            toast.success(`✅ Role ${email} diubah ke ${newRole}`);
        } catch (e) {
            toast.error("Gagal update role: " + e.message);
        }
    };

    // === Toggle Active Status ===
    const handleToggleActive = async (id, email, currentStatus) => {
        if (email === currentUser?.email) return toast.error("❌ Tidak bisa menonaktifkan diri sendiri!");

        try {
            const newStatus = !currentStatus;
            const response = await apiClient.post("auth.php?action=update_user_status", { id, is_active: newStatus });
            if (response.status !== 'success') throw new Error(response.message || "Gagal update status");

            setUsers(users.map(u => u.id === id ? { ...u, is_active: newStatus } : u));
            toast.success(newStatus ? `🟢 ${email} Diaktifkan` : `🔴 ${email} Dinonaktifkan`);
        } catch (e) {
            toast.error("Gagal mengubah status: " + e.message);
        }
    };

    // === Logic Filter & Pagination ===
    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
            (u.nama || "").toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    const paginatedUsers = useMemo(() => {
        const indexOfLast = currentPage * itemsPerPage;
        const indexOfFirst = indexOfLast - itemsPerPage;
        return filteredUsers.slice(indexOfFirst, indexOfLast);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    return (
        <Container fluid className="p-4">
            <Card className="shadow-sm border-0 rounded-4">
                <Card.Body className="p-4">

                    {/* HEADER DASHBOARD */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                        <div>
                            <h3 className="fw-bold text-dark mb-1">👥 Kelola Pengguna</h3>
                            <p className="text-muted mb-0 small">Total {users.length} pengguna terdaftar di sistem.</p>
                        </div>

                        <div className="d-flex gap-2 w-100 w-md-auto">
                            <Button
                                variant="outline-primary"
                                className="d-flex align-items-center gap-2"
                                onClick={() => navigate("/print-laporan-pengguna")}
                            >
                                <FiPrinter /> <span className="d-none d-md-inline">Laporan</span>
                            </Button>
                            <Button variant="light" className="border shadow-sm" onClick={loadUsers} title="Refresh Data">
                                <FiRefreshCw className={loading ? "spin" : ""} />
                            </Button>
                        </div>
                    </div>

                    {/* SEARCH BAR */}
                    <Row className="mb-4">
                        <Col md={6}>
                            <InputGroup className="shadow-sm rounded-pill overflow-hidden bg-white border">
                                <InputGroup.Text className="bg-transparent border-0 ps-3">
                                    <FiSearch className="text-muted" />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Cari email atau nama user..."
                                    className="border-0 shadow-none bg-transparent"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                />
                            </InputGroup>
                        </Col>
                    </Row>

                    {/* TABLE */}
                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : (
                        <div className="table-responsive rounded-3 border">
                            <Table hover className="align-middle mb-0" style={{ minWidth: "800px" }}>
                                <thead className="bg-light text-secondary small text-uppercase">
                                    <tr>
                                        <th className="py-3 ps-4">User</th>
                                        <th className="py-3">Role Access</th>
                                        <th className="py-3">Status Akun</th>
                                        <th className="py-3">Tanggal Gabung</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUsers.length > 0 ? (
                                        paginatedUsers.map((u) => (
                                            <tr key={u.id} className={!u.is_active ? "bg-light opacity-75" : ""}>
                                                {/* Kolom User */}
                                                <td className="ps-4 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                                                            <FiUser />
                                                        </div>
                                                        <div>
                                                            <div className="fw-bold text-dark">{u.email}</div>
                                                            <small className="text-muted">{u.nama || "Tanpa Nama"}</small>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Kolom Role */}
                                                <td>
                                                    <Form.Select
                                                        size="sm"
                                                        value={u.role}
                                                        onChange={(e) => handleRoleChange(u.id, u.email, e.target.value)}
                                                        disabled={u.email === currentUser?.email}
                                                        className={`fw-bold border-0 shadow-none px-3 py-1 rounded-pill ${u.role === "admin" ? "bg-danger-subtle text-danger" :
                                                                u.role === "pegawai" ? "bg-info-subtle text-info" :
                                                                    "bg-secondary-subtle text-secondary"
                                                            }`}
                                                        style={{ width: "auto", cursor: "pointer" }}
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="pegawai">Pegawai</option>
                                                        <option value="admin">Admin</option>
                                                    </Form.Select>
                                                </td>

                                                {/* Kolom Status (Switch) */}
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Form.Check
                                                            type="switch"
                                                            checked={u.is_active}
                                                            onChange={() => handleToggleActive(u.id, u.email, u.is_active)}
                                                            disabled={u.email === currentUser?.email}
                                                            style={{ transform: "scale(1.2)" }}
                                                        />
                                                        <Badge bg={u.is_active ? "success" : "secondary"} className="fw-normal">
                                                            {u.is_active ? "Aktif" : "Nonaktif"}
                                                        </Badge>
                                                    </div>
                                                </td>

                                                {/* Kolom Tanggal */}
                                                <td className="text-muted small">
                                                    {new Date(u.created_at).toLocaleDateString("id-ID", {
                                                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                                    })}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-muted">
                                                <FiAlertCircle size={30} className="mb-2" />
                                                <p className="mb-0">Tidak ada pengguna ditemukan.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    )}

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-end mt-4">
                            <Pagination className="shadow-sm">
                                <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} />
                                {[...Array(totalPages)].map((_, i) => (
                                    <Pagination.Item key={i} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} />
                            </Pagination>
                        </div>
                    )}

                </Card.Body>
            </Card>
        </Container>
    );
}