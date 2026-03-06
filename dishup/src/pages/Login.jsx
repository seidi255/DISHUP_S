import { useState, useEffect } from "react"; // Pastikan useEffect diimport
import { Form, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../apiClient";
import logoWeb from "../assets/logo web.jpeg";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // ===== TAMBAHAN BARU: Inject CSS Animasi =====
  // Ini digunakan agar background bisa bergerak
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
      // Login via PHP API
      const response = await apiClient.post('auth.php?action=login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 'success') {
        const { session, user } = response.data;

        localStorage.setItem("isLoggedIn", "true");
        // Menyimpan token akses dari PHP
        localStorage.setItem("dishup_token", session.access_token);

        const role = session.user.user_metadata.role || "user";
        localStorage.setItem("role", role);
        localStorage.setItem("email", user.email);

        alert("✅ Login berhasil!");
        // Reload page to re-initialize contexts or navigate
        window.location.href = "/";
      } else {
        throw new Error(response.message || "Gagal login");
      }
    } catch (err) {
      alert("❌ Gagal login: " + err.message);
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
        // Background lama dihapus, diganti dengan gradient animasi yang baru
        background: "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
        // =====================================
      }}
    >
      {/* KODINGAN DI BAWAH INI SAMA PERSIS DENGAN ASLINYA TIDAK ADA YANG DIUBAH */}
      <Card
        className="shadow-lg border-0"
        style={{
          width: "420px",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {/* ===== Header (SAMA DENGAN DAFTAR) ===== */}
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
              backgroundColor: "#2c3e50", // Dark circle matches typical logo themes better than solid white, or adjust later.
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

          <h4 style={{ margin: 0, color: "#fff", fontWeight: 700 }}>
            LumaTrack
          </h4>
          <small style={{ color: "rgba(255,255,255,0.9)" }}>
            Sistem Monitoring
          </small>
        </div>

        {/* ===== Body ===== */}
        <div style={{ padding: "24px 26px 22px" }}>
          <h5
            className="text-center mb-4"
            style={{ fontWeight: 700 }}
          >
            Login
          </h5>

          <Form onSubmit={handleSubmit}>
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
              style={{ padding: "10px" }}
            >
              {loading ? "Memproses..." : "Login"}
            </Button>
          </Form>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <p className="mb-0" style={{ fontSize: "0.9rem" }}>
              Belum punya akun?{" "}
              <a href="/daftar" style={{ textDecoration: "none" }}>
                Daftar di sini
              </a>
            </p>
            <a href="/lupa-password" style={{ textDecoration: "none", fontSize: "0.9rem", color: "#6c757d" }}>
              Lupa password?
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}