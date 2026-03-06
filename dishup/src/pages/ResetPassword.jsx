import { useState, useEffect } from "react";
import { Form, Button, Card } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { apiClient } from "../apiClient";
import logoWeb from "../assets/logo web.jpeg";

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");

    const [formData, setFormData] = useState({
        password: "",
        confirm_password: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Link tidak valid (Tidak ada token reset).");
            navigate("/login");
        }

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
    }, [token, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password.length < 6) {
            toast.warning("Password minimal 6 karakter");
            return;
        }

        if (formData.password !== formData.confirm_password) {
            toast.warning("Password konfirmasi tidak cocok!");
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('lupa_password.php?action=reset', {
                token: token,
                new_password: formData.password
            });

            if (response.status === 'success') {
                setSuccess(true);
                toast.success("Password berhasil diubah!");
            } else {
                toast.error(response.message || "Gagal mereset password");
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
                    <small style={{ color: "rgba(255,255,255,0.9)" }}>Buat Password Baru</small>
                </div>

                <div style={{ padding: "24px 26px 22px" }}>
                    {success ? (
                        <div className="text-center py-3">
                            <i className="bi bi-check-circle-fill text-success d-block mb-3" style={{ fontSize: "3rem" }}></i>
                            <h5 className="fw-bold mb-3">Sukses!</h5>
                            <p className="text-muted">Password Anda berhasil diperbarui.</p>
                            <Button
                                variant="primary"
                                className="w-100 fw-bold mt-3"
                                onClick={() => navigate("/login")}
                                style={{ padding: "12px", background: "linear-gradient(135deg, #0d6efd, #0b5ed7)" }}
                            >
                                Login Sekarang
                            </Button>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Password Baru</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    placeholder="Minimal 6 karakter"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    style={{ padding: "10px 14px" }}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">Konfirmasi Password Baru</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="confirm_password"
                                    placeholder="Ketik ulang password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
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
                                {loading ? "Menyimpan..." : "Simpan Password Baru"}
                            </Button>
                        </Form>
                    )}
                </div>
            </Card>
        </div>
    );
}
