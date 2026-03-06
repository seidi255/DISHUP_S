// src/pages/Dashboard.jsx
import { useState, useEffect, useMemo } from "react";
import { Card, Row, Col, Spinner, Badge, Button } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Link } from "react-router-dom";
import { apiClient } from "../apiClient";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../hooks/useRole";
import {
  FiMapPin,
  FiZapOff,
  FiAlertTriangle,
  FiActivity,
  FiUser,
  FiRefreshCw,
  FiShield,
  FiSearch,
  FiPrinter,
  FiLock,
  FiFileText,
  FiUnlock,
  FiFolder,
  FiPlus,
  FiClock,
  FiCheckCircle
} from "react-icons/fi";

// Import logo
import logo from "../assets/logo web.jpeg";

export default function Dashboard() {
  const { role } = useRole();
  const { user: authUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPju: 0,
    wilayahPrioritas: 0,
    pjuRusak: 0,
    pjuProses: 0,
    pjuSelesai: 0,
    totalTilang: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [tilangChart, setTilangChart] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  /* ================= FETCH DATA ================= */
  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [resPJU, resWilayah, resRusak, resTilang, resLog] = await Promise.all([
        apiClient.get("pju.php"),
        apiClient.get("wilayah_prioritas.php"),
        apiClient.get("pju_rusak.php?summary=true"),
        apiClient.get("tilang.php"),
        apiClient.get("log_aktivitas.php")
      ]);

      const totalPju = resPJU.status === 'success' ? resPJU.data.length : 0;
      const wilayahPrioritas = resWilayah.status === 'success' ? resWilayah.data.length : 0;
      const totalTilang = resTilang.status === 'success' ? resTilang.data.length : 0;

      let pjuRusak = 0, pjuProses = 0, pjuSelesai = 0;
      let newChartData = [];

      if (resRusak.status === 'success' && resRusak.data) {
        const summary = resRusak.data.summary || {};
        pjuRusak = summary.rusak || 0;
        pjuProses = summary.proses || 0;
        pjuSelesai = summary.selesai || 0;

        if (resRusak.data.wilayahChart) {
          newChartData = resRusak.data.wilayahChart.map(item => ({
            name: item.wilayah,
            value: parseInt(item.value, 10)
          }));
        }
      }

      setStats({
        totalPju,
        wilayahPrioritas,
        pjuRusak,
        pjuProses,
        pjuSelesai,
        totalTilang,
      });

      setChartData(newChartData);

      // Process Tilang Chart Data
      let newTilangChart = [];
      if (resTilang.status === 'success' && resTilang.data) {
        const pelanggaranCounts = {};
        resTilang.data.forEach(t => {
          const jenis = t.jenis_pelanggaran || 'Lainnya';
          pelanggaranCounts[jenis] = (pelanggaranCounts[jenis] || 0) + 1;
        });
        newTilangChart = Object.keys(pelanggaranCounts).map(key => ({
          name: key,
          value: pelanggaranCounts[key]
        })).sort((a, b) => b.value - a.value).slice(0, 5); // top 5
      }
      setTilangChart(newTilangChart);

      // Process Recent Activities
      if (resLog.logAktivitas) {
        setRecentActivities(resLog.logAktivitas.slice(0, 6));
      } else if (resLog.status === 'success' && resLog.data && resLog.data.logAktivitas) {
        // for safety based on actual API format
        setRecentActivities(resLog.data.logAktivitas.slice(0, 6));
      } else {
        // alternative format if api returns array directly
        if (Array.isArray(resLog)) {
          setRecentActivities(resLog.slice(0, 6));
        }
      }

    } catch (err) {
      console.error(err);
      alert("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ================= CHART COLORS ================= */
  const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];

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
                borderRadius: "50%",
                background: "#2c3e50",
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
                alt="LumaTrack Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: "scale(1.4)"
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
                Sistem Monitoring LumaTrack
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
          { label: "Total PJU", value: stats.totalPju, icon: <FiActivity />, color: "#3b82f6", trend: "Sedang Aktif" },
          { label: "Titik Prioritas", value: stats.wilayahPrioritas, icon: <FiMapPin />, color: "#8b5cf6", trend: "Area Pemantauan" },
          { label: "Data Tilang", value: stats.totalTilang, icon: <FiAlertTriangle />, color: "#eab308", trend: "Total Pelanggaran" },
          { label: "PJU Rusak", value: stats.pjuRusak, icon: <FiZapOff />, color: "#ef4444", trend: "Perlu Tindakan" },
          { label: "Sedang Proses", value: stats.pjuProses, icon: <FiRefreshCw />, color: "#f97316", trend: "Dalam Perbaikan" },
          { label: "Selesai Perbaikan", value: stats.pjuSelesai, icon: <FiShield />, color: "#22c55e", trend: "PJU Normal" },
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
                    <div style={{ opacity: 0.7, fontSize: "0.9rem" }}>{item.label}</div>
                    <div style={{ fontSize: "0.75rem", color: item.color, marginTop: 5, fontWeight: 700 }}>
                      <FiActivity className="me-1" /> {item.trend}
                    </div>
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

      {/* ================= QUICK ACTIONS ================= */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <Link to="/laporan-pju" className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm" style={{ borderRadius: 12, fontWeight: 600 }}>
          <FiPlus /> Tambah Data PJU
        </Link>
        <Link to="/laporan-tilang" className="btn btn-warning d-flex align-items-center gap-2 px-4 shadow-sm text-dark" style={{ borderRadius: 12, fontWeight: 600 }}>
          <FiPlus /> Input Data Tilang
        </Link>
        <Link to="/laporan-pju-rusak" className="btn btn-danger d-flex align-items-center gap-2 px-4 shadow-sm" style={{ borderRadius: 12, fontWeight: 600 }}>
          <FiZapOff /> Lapor PJU Rusak
        </Link>
      </div>

      {/* ================= BOTTOM SECTION: CHARTS & ACTIVITIES ================= */}
      <Row className="g-4">
        {/* PIE CHART (PJU RUSAK) */}
        <Col lg={4}>
          <Card className="border-0 h-100" style={{ borderRadius: 22, boxShadow: "0 25px 45px rgba(0,0,0,.08)" }}>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold m-0" style={{ fontSize: "1.1rem" }}>Distribusi PJU Rusak</h5>
                <FiRefreshCw role="button" onClick={loadDashboard} className="text-primary" style={{ cursor: "pointer", transition: "transform 0.3s" }} onMouseEnter={(e) => (e.currentTarget.style.transform = "rotate(180deg)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "rotate(0deg)")} />
              </div>

              <div className="flex-grow-1 d-flex flex-column justify-content-center">
                {chartData.length > 0 ? (
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={chartData} innerRadius={65} outerRadius={95} paddingAngle={6} dataKey="value">
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ width: "100%", height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="text-muted">Tidak ada PJU rusak.</span>
                  </div>
                )}
              </div>
              <div className="text-center text-muted small mt-2">Berdasarkan Wilayah Laporan</div>
            </Card.Body>
          </Card>
        </Col>

        {/* BAR CHART (TILANG) */}
        <Col lg={4}>
          <Card className="border-0 h-100" style={{ borderRadius: 22, boxShadow: "0 25px 45px rgba(0,0,0,.08)" }}>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold m-0" style={{ fontSize: "1.1rem" }}>Statistik Tilang</h5>
                <FiAlertTriangle className="text-warning" />
              </div>

              <div className="flex-grow-1 d-flex flex-column justify-content-center">
                {tilangChart.length > 0 ? (
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={tilangChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                          {tilangChart.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ width: "100%", height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="text-muted">Belum ada data tilang.</span>
                  </div>
                )}
              </div>
              <div className="text-center text-muted small mt-2">Pelanggaran Terbanyak</div>
            </Card.Body>
          </Card>
        </Col>

        {/* RECENT ACTIVITIES */}
        <Col lg={4}>
          <Card className="border-0 h-100" style={{ borderRadius: 22, boxShadow: "0 25px 45px rgba(0,0,0,.08)", background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" }}>
            <Card.Body className="d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold m-0" style={{ fontSize: "1.1rem" }}>Aktivitas Terbaru</h5>
                <Badge bg="light" text="primary" className="rounded-pill px-3 py-2"><FiClock className="me-1" /> Real-time</Badge>
              </div>

              <div className="flex-grow-1 overflow-auto" style={{ maxHeight: "280px", paddingRight: "5px" }}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((log, idx) => (
                    <div key={idx} className="d-flex align-items-start mb-3 pb-3" style={{ borderBottom: idx !== recentActivities.length - 1 ? "1px dashed #e2e8f0" : "none" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: log.tipe_log === 'Login' ? '#dcfce7' : (log.tipe_log === 'Perubahan Data' ? '#e0e7ff' : '#fef3c7'),
                        color: log.tipe_log === 'Login' ? '#16a34a' : (log.tipe_log === 'Perubahan Data' ? '#4f46e5' : '#d97706'),
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0
                      }}>
                        {log.tipe_log === 'Login' ? <FiUser /> : (log.tipe_log === 'Perubahan Data' ? <FiCheckCircle /> : <FiActivity />)}
                      </div>
                      <div className="ms-3">
                        <div className="fw-bold" style={{ fontSize: "0.9rem", color: "#1e293b" }}>{log.aktivitas}</div>
                        <div style={{ fontSize: "0.80rem", color: "#64748b", marginTop: 2 }}>
                          {log.pengguna || "User"} • {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted mt-5 small">
                    <FiClock size={24} className="mb-2 opacity-50" /><br />
                    Belum ada aktivitas.
                  </div>
                )}
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
