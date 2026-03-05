import { useState, useEffect } from "react"; // Tambahkan useEffect
import { Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../apiClient";
import logoWeb from "../assets/logo web.png";

export default function Daftar() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // ===== TAMBAHAN BARU: Inject CSS Animasi =====
  // Agar background bisa bergerak warna-warni
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
  // ===========================================

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Register akun ke PHP API
      const response = await apiClient.post('auth.php?action=register', {
        nama: formData.name,
        email: formData.email,
        password: formData.password,
        role: "user"
      });

      if (response.status !== 'success') {
        throw new Error(response.message || "Gagal mendaftar");
      }

      alert(
        "✅ Pendaftaran berhasil! Silakan login dengan akun baru Anda."
      );
      navigate("/login");
    } catch (err) {
      alert("❌ Gagal daftar: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center px-3"
      style={{
        minHeight: "100vh",
        // ===== BACKGROUND DIUBAH DI SINI =====
        background: "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
        // =====================================
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
        {/* Header atas */}
        <div
          style={{
            background: "linear-gradient(135deg, #0d6efd, #20c997)",
            padding: "28px 24px 22px",
            textAlign: "center",
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              backgroundColor: "#fff",
              margin: "0 auto 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            }}
          >
            <img
              src={logoWeb}
              alt="Logo SIMANDU"
              style={{
                width: 70,
                height: 70,
                objectFit: "contain",
              }}
            />
          </div>

          <h4 style={{ margin: 0, color: "#fff", fontWeight: 700 }}>
            SIMANDU
          </h4>
          <small style={{ color: "rgba(255,255,255,0.9)" }}>
            Sistem Informasi Manajemen Dokumen dan Surat
          </small>
        </div>

        {/* Body form */}
        <div style={{ padding: "22px 24px 18px" }}>
          <h5 className="text-center mb-3" style={{ fontWeight: 700 }}>
            Daftar Akun
          </h5>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nama</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Masukkan nama"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Masukkan email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Masukkan password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? "Mendaftar..." : "Daftar"}
            </Button>
          </Form>

          <p className="mt-3 mb-0 text-center">
            Sudah punya akun?{" "}
            <a href="/login" style={{ textDecoration: "none" }}>
              Login di sini
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}