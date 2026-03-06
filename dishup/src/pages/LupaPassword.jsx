import { useState, useEffect } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiClient } from "../apiClient";
import logoWeb from "../assets/logo web.jpeg";

export default function LupaPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [devNote, setDevNote] = useState(""); // Hanya untuk lokal

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
      @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
        document.head.appendChild(styleSheet);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.warning("Silakan masukkan email Anda");
            return;
        }

        setLoading(true);
        setDevNote("");
        try {
            const response = await apiClient.post('lupa_password.php?action=request', { email });
            if (response.status === 'success') {
                setSuccess(true);
                if (response.dev_note) {
                    setDevNote(response.dev_note);
                    console.log(response.dev_note);
                }
            } else {
                toast.error(response.message || "Gagal mengirim permintaan reset");
            }
        } catch (err) {
            toast.error("Gagal terhubung ke server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center px-3"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
                backgroundSize: "400% 400%",
                animation: "gradientBG 15s ease infinite",
            }}
        >
            <Card
                className="shadow-lg border-0"
                style={{
                    width: "420px",
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        background: "linear-gradient(135deg, #0d6efd, #20c997)",
                        padding: "32px 24px 26px",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            width: 96,
                            height: 96,
                            borderRadius: "50%",
                            backgroundColor: "#2c3e50",
                            margin: "0 auto 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
                            overflow: "hidden"
                        }}
                    >
                        <img
                            src={logoWeb}
                            alt="Logo LumaTrack"
                            style={{
                                width: 96,
                                height: 96,
                                objectFit: "cover",
                                transform: "scale(1.4)"
                            }}
                        />
                    </div>
                    <h4 style={{ margin: 0, color: "#fff", fontWeight: 700 }}>LumaTrack</h4>
                    <small style={{ color: "rgba(255,255,255,0.9)" }}>Lupa Password</small>
                </div>

                <div style={{ padding: "24px 26px 22px" }}>
                    {success ? (
                        <div className="text-center">
                            <div className="mb-3">
                                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
                            </div>
                            <h5 className="fw-bold text-success mb-3">Email Terkirim</h5>
                            <p className="text-muted">
                                Jika email <b>{email}</b> terdaftar di sistem kami, instruksi pemulihan telah dikirim.
                            </p>

                            {/* Hanya untuk tujuan testing lokal tanpa sistem email asil */}
                            {devNote && (
                                <div className="alert alert-warning p-2 mt-3 text-start mt-3" style={{ fontSize: '0.8rem' }}>
                                    <strong>[TESTING MODE]</strong><br />
                                    <a href={devNote.split('= ')[1]} target="_blank" rel="noreferrer" className="text-break">
                                        Klik link ini untuk reset (Hanya untuk keperluan Testing Dosen)
                                    </a>
                                </div>
                            )}

                            <Button
                                variant="outline-primary"
                                className="w-100 mt-4"
                                onClick={() => navigate("/login")}
                            >
                                Kembali ke Login
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p className="text-center text-muted mb-4" style={{ fontSize: "0.95rem" }}>
                                Masukkan email akun Anda untuk menerima link reset password.
                            </p>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold">Alamat Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Contoh: user@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{ padding: "10px 14px" }}
                                    />
                                </Form.Group>

                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="w-100 fw-bold shadow-sm"
                                    disabled={loading}
                                    style={{ padding: "12px", background: "linear-gradient(135deg, #0d6efd, #0b5ed7)", border: "none" }}
                                >
                                    {loading ? "Memproses..." : "Kirim Link Reset"}
                                </Button>
                            </Form>

                            <div className="text-center mt-4">
                                <a
                                    href="#!"
                                    onClick={(e) => { e.preventDefault(); navigate("/login"); }}
                                    className="text-decoration-none text-muted fw-semibold"
                                >
                                    <i className="bi bi-arrow-left me-1"></i> Kembali ke Login
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}
