// src/pages/Dashboard.jsx
import { useState, useEffect, useMemo } from "react";
import { Card, Row, Col, Spinner, Badge } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { apiClient } from "../apiClient";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../hooks/useRole";
import {
  FiFileText,
  FiFolder,
  FiUnlock,
  FiLock,
  FiUser,
  FiRefreshCw,
  FiShield,
  FiSearch,
  FiPrinter,
} from "react-icons/fi";

// Import logo
import logo from "../assets/logo web.png";

export default function Dashboard() {
  const { role } = useRole();
  const { user: authUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    A: 0,
    B: 0,
    C: 0,
    publik: 0,
    privat: 0,
  });

  /* ================= FETCH DATA ================= */
  const loadDashboard = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get("files.php");
      if (response.status !== 'success') throw new Error("Gagal mengambil data");
      const data = response.data;

      const A = data.filter((f) => f.kategori === "A").length;
      const B = data.filter((f) => f.kategori === "B").length;
      const C = data.filter((f) => f.kategori === "C").length;
      // Konversi tipe tinyint (1/0) SQL ke boolean JS
      const publik = data.filter((f) => !f.private || f.private == 0).length;
      const privat = data.filter((f) => f.private == 1).length;

      setStats({
        total: data.length,
        A,
        B,
        C,
        publik,
        privat,
      });
    } catch (err) {
      console.error(err);
      alert("Gagal memuat dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ================= CHART ================= */
  const chartData = useMemo(
    () => [
      { name: "Publik", value: stats.publik },
      { name: "Privat", value: stats.privat },
    ],
    [stats]
  );

  const COLORS = ["#4cc9f0", "#7c3aed"];

  return (
    <div className="p-4" style={{ background: "#f4f6fb", minHeight: "100vh" }}>
      {/* ================= HERO HEADER DENGAN LOGO BESAR ================= */}
      <div
        className="mb-4 p-4"
        style={{
          borderRadius: 22,
          background: "linear-gradient(135deg, #4cc9f0, #7c3aed)",
          color: "#fff",
          boxShadow: "0 25px 50px rgba(124,58,237,.4)",
          position: "relative",
          overflow: "hidden",
          minHeight: "180px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "300px",
            height: "100%",
            background: "rgba(255,255,255,0.1)",
            clipPath: "polygon(100% 0, 0 0, 100% 100%)",
          }}
        ></div>

        <div className="d-flex justify-content-between align-items-center position-relative h-100">
          <div className="d-flex align-items-center">
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 20,
                background: "rgba(255,255,255,0.95)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 30,
                boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
                overflow: "hidden",
                border: "3px solid rgba(255,255,255,0.8)",
              }}
            >
              <img
                src={logo}
                alt="SIMANDU Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  padding: 8,
                }}
              />
            </div>

            <div>
              <h4 className="fw-bold mb-2" style={{ fontSize: "1.8rem" }}>
                Selamat Datang 👋
              </h4>
              <div
                style={{
                  opacity: 0.95,
                  fontSize: "1.1rem",
                  marginBottom: "8px",
                }}
              >
                {authUser?.email} • {role}
              </div>
              <small style={{ opacity: 0.9, fontSize: "1rem" }}>
                Dashboard Manajemen Dokumen Dishub LLJ
              </small>
            </div>
          </div>

          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "rgba(255,255,255,.25)",
              display: "grid",
              placeItems: "center",
              fontSize: 24,
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          >
            <FiUser />
          </div>
        </div>
      </div>

      {/* ================= KPI CARDS ================= */}
      <Row className="g-4 mb-4">
        {[
          { label: "Total File", value: stats.total, icon: <FiFileText />, color: "#4cc9f0" },
          { label: "Publik", value: stats.publik, icon: <FiUnlock />, color: "#22c55e" },
          { label: "Privat", value: stats.privat, icon: <FiLock />, color: "#ef4444" },
          { label: "Seksi A", value: stats.A, icon: <FiFolder />, color: "#6366f1" },
          { label: "Seksi B", value: stats.B, icon: <FiFolder />, color: "#8b5cf6" },
          { label: "Seksi C", value: stats.C, icon: <FiFolder />, color: "#ec4899" },
        ].map((item, i) => (
          <Col key={i} lg={2} md={4} sm={6}>
            <Card
              className="border-0 h-100"
              style={{
                borderRadius: 18,
                background: "#0f172a",
                color: "#fff",
                boxShadow: `0 15px 35px ${item.color}55`,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = `0 25px 45px ${item.color}77`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 15px 35px ${item.color}55`;
              }}
            >
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div
                      style={{
                        fontSize: 34,
                        fontWeight: 800,
                        color: item.color,
                      }}
                    >
                      {item.value}
                    </div>
                    <div style={{ opacity: 0.7 }}>{item.label}</div>
                  </div>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      background: `${item.color}22`,
                      color: item.color,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 20,
                      transition: "transform 0.3s ease",
                    }}
                  >
                    {item.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ================= CHART SECTION ================= */}
      <Row className="g-4">
        <Col lg={8}>
          <Card
            className="border-0 h-100"
            style={{
              borderRadius: 22,
              boxShadow: "0 25px 45px rgba(0,0,0,.12)",
            }}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold m-0">Distribusi File</h5>
                <FiRefreshCw
                  role="button"
                  onClick={loadDashboard}
                  className="text-muted"
                  style={{ cursor: "pointer", transition: "transform 0.3s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(180deg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(0deg)")}
                />
              </div>

              <div style={{ width: "100%", height: 340 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={chartData} innerRadius={95} outerRadius={135} paddingAngle={6} dataKey="value">
                      <Cell fill={COLORS[0]} />
                      <Cell fill={COLORS[1]} />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="text-center text-muted">Publik vs Privat</div>
            </Card.Body>
          </Card>
        </Col>

        {/* ================= QUICK INFO CARD (UPDATED) ================= */}
        <Col lg={4}>
          <Card
            className="border-0 h-100"
            style={{
              borderRadius: 22,
              background: "linear-gradient(135deg, #4cc9f0, #7c3aed)",
              color: "#fff",
              boxShadow: "0 25px 45px rgba(124,58,237,.3)",
            }}
          >
            <Card.Body className="d-flex flex-column">
              <div className="text-center mb-3">
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 32,
                    margin: "0 auto 15px",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <FiShield />
                </div>
                <h5 className="fw-bold">Ringkasan Sistem</h5>
                <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                  Manajemen dokumen & surat Bidang Lalu Lintas Jalan
                </div>
              </div>

              {/* TAGS */}
              <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
                <Badge bg="light" text="dark" style={{ borderRadius: 999, padding: "6px 10px" }}>
                  <span className="me-1"><FiSearch /></span> Pencarian Cepat
                </Badge>
                <Badge bg="light" text="dark" style={{ borderRadius: 999, padding: "6px 10px" }}>
                  <span className="me-1"><FiLock /></span> Akses Privat
                </Badge>
                <Badge bg="light" text="dark" style={{ borderRadius: 999, padding: "6px 10px" }}>
                  <span className="me-1"><FiPrinter /></span> Cetak Laporan
                </Badge>
              </div>

              {/* INFO UTAMA */}
              <div
                style={{
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  borderRadius: 16,
                  padding: 14,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: "1.1rem", opacity: 0.95 }}>
                  SIMANDU
                </div>
                <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                  Sistem Informasi Manajemen Dokumen & Surat
                </div>

                <div style={{ marginTop: 10, fontSize: "0.88rem", lineHeight: 1.5, opacity: 0.92 }}>
                  <div className="mb-2">
                    • Mengelola dokumen berdasarkan <b>Seksi A/B/C</b> (struktur lebih rapi & terarah).
                  </div>
                  <div className="mb-2">
                    • Mendukung <b>dokumen publik & privat</b> dengan kontrol akses sesuai peran.
                  </div>
                  <div>
                    • Menyediakan <b>rekap & laporan</b> untuk kebutuhan evaluasi dan administrasi.
                  </div>
                </div>
              </div>

              {/* FOOTER MINI */}
              <div className="mt-auto pt-3" style={{ opacity: 0.9, fontSize: "0.85rem" }}>
                Status:{" "}
                <b>{role === "admin" ? "Administrator" : "Pengguna"}</b> • Data real-time dari MySQL
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {loading && (
        <div className="text-center mt-4">
          <Spinner />
        </div>
      )}
    </div>
  );
}
