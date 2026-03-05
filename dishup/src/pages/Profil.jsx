import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Image, Spinner, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiClient } from "../apiClient";
import { FiUser, FiLogOut, FiSave, FiCamera, FiMail, FiShield, FiCheckCircle } from "react-icons/fi";

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
    const [profil, setProfil] = useState({ id: "", nama: "", email: "", role: "", foto: null });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
                if (data) {
                    setProfil({ id: data.id, nama: data.nama || "", email: data.email || "", role: data.role || "Pegawai", foto: data.foto });
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
                foto: profil.foto
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

                            {/* Tombol Aksi */}
                            <div className="d-flex align-items-center justify-content-between mt-5">
                                <Button
                                    variant="link"
                                    className="text-danger text-decoration-none px-0 fw-bold"
                                    onClick={handleLogout}
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
        </div>
    );
}