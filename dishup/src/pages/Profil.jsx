import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Image, Spinner, InputGroup, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiClient } from "../apiClient";
import { FiUser, FiLogOut, FiSave, FiCamera, FiMail, FiShield, FiCheckCircle, FiPhone, FiBriefcase, FiTag } from "react-icons/fi";

// 🔹 CSS Tambahan untuk Animasi & Glassmorphism (Disisipkan dalam JS)
const styles = {
    pageContainer: {
        minHeight: "100vh",
        background: "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
    },
    glassCard: {
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        overflow: "hidden",
        maxWidth: "900px",
        width: "100%",
    },
    leftPanel: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        position: "relative",
        overflow: "hidden",
    },
    inputCustom: {
        border: "none",
        borderBottom: "2px solid #ddd",
        borderRadius: "0",
        background: "transparent",
        paddingLeft: "10px",
        fontWeight: "500"
    }
};

export default function Profil() {
    const navigate = useNavigate();
    const [profil, setProfil] = useState({ id: "", nama: "", email: "", role: "", foto: null, no_telepon: "", jabatan: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // 🔹 Inject Keyframe Animation untuk Background
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = `
            @keyframes gradientBG {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            .form-control:focus {
                box-shadow: none;
                border-bottom-color: #764ba2 !important;
            }
        `;
        document.head.appendChild(styleSheet);
    }, []);

    // 🔹 Fetch Data (Logika Tetap Sama)
    useEffect(() => {
        const fetchProfil = async () => {
            try {
                const response = await apiClient.get("auth.php?action=me");
                if (response.status !== 'success') {
                    navigate("/login");
                    return;
                }

                const data = response.data;
                if (data && data.user) {
                    const user = data.user;
                    const meta = user.user_metadata || {};
                    setProfil({
                        id: user.id,
                        nama: meta.nama || "",
                        email: user.email || "",
                        role: meta.role || "Pegawai",
                        foto: meta.foto || null,
                        no_telepon: meta.no_telepon || "",
                        jabatan: meta.jabatan || ""
                    });
                }
            } catch (err) {
                toast.error("Gagal memuat profil.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfil();
    }, [navigate]);

    // 🔹 Handle Update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Karena tidak ada routing API profile khusus, kita modifikasi via action update, atau di put auth.php
            // Untuk profil saat ini dikirim POST dengan action=update_profile
            const response = await apiClient.post("auth.php?action=update_profile", {
                nama: profil.nama,
                foto: profil.foto,
                no_telepon: profil.no_telepon,
                jabatan: profil.jabatan
            });

            if (response.status !== 'success') throw new Error(response.message || "Gagal update profil");

            // Update token lokal kalau nama berubah (optional)
            let tokenRaw = localStorage.getItem('dishup_token');
            if (tokenRaw) {
                try {
                    let userData = JSON.parse(atob(tokenRaw));
                    userData.nama = profil.nama;
                    localStorage.setItem('dishup_token', btoa(JSON.stringify(userData)));
                } catch (e) { }
            }

            toast.success("✨ Profil berhasil diupdate!");
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    // 🔹 Handle Foto
    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfil({ ...profil, foto: reader.result });
            reader.readAsDataURL(file);
        }
    };

    // 🔹 Handle Logout
    const handleLogout = async () => {
        localStorage.removeItem('dishup_token');
        navigate("/login");
    };

    if (loading) return <div style={styles.pageContainer}><Spinner animation="border" variant="light" style={{ width: "3rem", height: "3rem" }} /></div>;

    return (
        <div style={styles.pageContainer}>
            <div style={styles.glassCard}>
                <Row className="g-0">

                    {/* === BAGIAN KIRI: VISUAL IDENTITY === */}
                    <Col md={5} style={styles.leftPanel}>
                        {/* Hiasan Lingkaran Background */}
                        <div style={{ position: "absolute", top: "-50px", left: "-50px", width: "150px", height: "150px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>
                        <div style={{ position: "absolute", bottom: "20px", right: "-30px", width: "100px", height: "100px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }}></div>

                        <div className="text-center position-relative">
                            {/* Avatar Container */}
                            <div className="position-relative d-inline-block mb-3">
                                <Image
                                    src={profil.foto || `https://ui-avatars.com/api/?name=${profil.nama || "User"}&background=random&size=200`}
                                    roundedCircle
                                    style={{
                                        width: "160px",
                                        height: "160px",
                                        objectFit: "cover",
                                        border: "6px solid rgba(255,255,255,0.3)",
                                        boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
                                    }}
                                />
                                <label
                                    className="position-absolute bottom-0 end-0 bg-white text-primary p-2 rounded-circle shadow hover-scale"
                                    style={{ cursor: "pointer", transform: "translate(10px, -10px)" }}
                                >
                                    <FiCamera size={22} />
                                    <input type="file" accept="image/*" onChange={handleFotoChange} hidden />
                                </label>
                            </div>

                            <h3 className="fw-bold mb-0">{profil.nama || "User Baru"}</h3>
                            <p className="opacity-75 mb-3">{profil.email}</p>

                            <div className="d-inline-block px-4 py-1 rounded-pill" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(5px)" }}>
                                <small className="fw-bold letter-spacing-2 text-uppercase">{profil.role}</small>
                            </div>
                        </div>
                    </Col>

                    {/* === BAGIAN KANAN: FORM EDIT === */}
                    <Col md={7} className="p-5 bg-white">
                        <div className="mb-4">
                            <h2 className="fw-bold text-dark mb-1">Pengaturan Profil</h2>
                            <p className="text-muted">Kelola informasi profil Anda di sini.</p>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            {/* Nama Input */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-uppercase text-muted fw-bold" style={{ fontSize: "0.75rem" }}>Nama Lengkap</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-transparent border-0 border-bottom ps-0">
                                        <FiUser size={20} className="text-primary" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Masukkan nama Anda"
                                        value={profil.nama}
                                        onChange={(e) => setProfil({ ...profil, nama: e.target.value })}
                                        style={styles.inputCustom}
                                    />
                                </InputGroup>
                            </Form.Group>

                            {/* Username Input (Readonly - Derived from Email) */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-uppercase text-muted fw-bold" style={{ fontSize: "0.75rem" }}>Username</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-transparent border-0 border-bottom ps-0">
                                        <FiTag size={20} className="text-secondary" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        value={profil.email.split('@')[0]}
                                        disabled
                                        style={{ ...styles.inputCustom, color: "#888", cursor: "not-allowed" }}
                                    />
                                    <InputGroup.Text className="bg-transparent border-0 border-bottom">
                                        <FiShield className="text-success" />
                                    </InputGroup.Text>
                                </InputGroup>
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    {/* No Telepon Input */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-uppercase text-muted fw-bold" style={{ fontSize: "0.75rem" }}>No Telepon</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-transparent border-0 border-bottom ps-0">
                                                <FiPhone size={20} className="text-primary" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="0812xxxxxxx"
                                                value={profil.no_telepon}
                                                onChange={(e) => setProfil({ ...profil, no_telepon: e.target.value })}
                                                style={styles.inputCustom}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    {/* Jabatan Input */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-uppercase text-muted fw-bold" style={{ fontSize: "0.75rem" }}>Jabatan</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-transparent border-0 border-bottom ps-0">
                                                <FiBriefcase size={20} className="text-primary" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Contoh: Administrator Sistem"
                                                value={profil.jabatan}
                                                onChange={(e) => setProfil({ ...profil, jabatan: e.target.value })}
                                                style={styles.inputCustom}
                                            />
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    {/* Email Input (Readonly) */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-uppercase text-muted fw-bold" style={{ fontSize: "0.75rem" }}>Email Address</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-transparent border-0 border-bottom ps-0">
                                                <FiMail size={20} className="text-secondary" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="email"
                                                value={profil.email}
                                                disabled
                                                style={{ ...styles.inputCustom, color: "#888", cursor: "not-allowed" }}
                                            />
                                            <InputGroup.Text className="bg-transparent border-0 border-bottom">
                                                <FiShield className="text-success" />
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    {/* Role Input (Readonly) */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-uppercase text-muted fw-bold" style={{ fontSize: "0.75rem" }}>Role Sistem</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-transparent border-0 border-bottom ps-0">
                                                <FiShield size={20} className="text-secondary" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                value={profil.role.toUpperCase()}
                                                disabled
                                                style={{ ...styles.inputCustom, color: "#888", cursor: "not-allowed", fontWeight: "bold" }}
                                            />
                                            <InputGroup.Text className="bg-transparent border-0 border-bottom">
                                                <FiShield className="text-success" />
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Tombol Aksi */}
                            <div className="d-flex align-items-center justify-content-between mt-5">
                                <Button
                                    variant="link"
                                    className="text-danger text-decoration-none px-0 fw-bold"
                                    onClick={() => setShowLogoutModal(true)}
                                >
                                    <FiLogOut className="me-2" /> Keluar
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        border: "none",
                                        padding: "12px 30px",
                                        borderRadius: "50px",
                                        fontWeight: "bold",
                                        boxShadow: "0 4px 15px rgba(118, 75, 162, 0.4)",
                                        transition: "0.3s"
                                    }}
                                >
                                    {saving ? (
                                        <Spinner size="sm" animation="border" />
                                    ) : (
                                        <>Simpan Perubahan <FiCheckCircle className="ms-2" /></>
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </div>

            {/* Modal Logout (Enhanced) */}
            <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered backdrop="static">
                <Modal.Body className="text-center p-5" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)", borderRadius: "24px" }}>
                    <div
                        style={{
                            width: "80px",
                            height: "80px",
                            background: "rgba(239, 68, 68, 0.1)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px"
                        }}
                    >
                        <FiLogOut size={40} color="#ef4444" style={{ transform: "translateX(-2px)" }} />
                    </div>
                    <h4 className="fw-bold text-dark mb-3">Keluar Sistem?</h4>
                    <p className="text-muted mb-4 px-3">
                        Sesi Anda akan dihentikan dan Anda harus login kembali untuk mengakses LumaTrack.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <Button
                            variant="light"
                            onClick={() => setShowLogoutModal(false)}
                            style={{
                                borderRadius: "12px",
                                padding: "12px 24px",
                                fontWeight: "600",
                                color: "#64748b",
                                background: "#f1f5f9",
                                border: "none"
                            }}
                            onMouseEnter={(e) => e.target.style.background = "#e2e8f0"}
                            onMouseLeave={(e) => e.target.style.background = "#f1f5f9"}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleLogout}
                            style={{
                                borderRadius: "12px",
                                padding: "12px 24px",
                                fontWeight: "600",
                                background: "#ef4444",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
                            }}
                            onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                        >
                            Ya, Keluar
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}