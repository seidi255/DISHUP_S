// src/components/Sidebar.jsx
import {
    FaUser, FaHome, FaUpload, FaFolder, FaSignOutAlt,
    FaUsersCog, FaEnvelopeOpenText, FaBars, FaTimes,
    FaChevronDown, FaChevronUp, FaFileAlt, FaMailBulk, FaMap
} from "react-icons/fa";
import logoDishub from "../assets/logo-dishub.jpg";
import { useRole } from "../hooks/useRole";
import { useState } from "react";
import { useLocation, Link } from "react-router-dom";

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
    const { role } = useRole();
    const location = useLocation();
    const [openBidang, setOpenBidang] = useState(false);
    const [openSurat, setOpenSurat] = useState(false);

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        { path: "/", label: "Dashboard", icon: <FaHome /> },
        { path: "/sig", label: "SIG (PJU)", icon: <FaMap /> },
        { path: "/sig-operasional", label: "SIG (Operasional)", icon: <FaMap /> },
        { path: "/profil", label: "Profil", icon: <FaUser /> },
        { path: "/upload", label: "Upload", icon: <FaUpload /> },
    ];

    const bidangItems = [
        { path: "/seksi-a", label: "Keselamatan Lalu Lintas" },
        { path: "/seksi-b", label: "Manajemen & Rekayasa" },
        { path: "/seksi-c", label: "Pengendalian Operasional" },
    ];

    const adminSuratItems = [
        { path: "/laporan-pju", label: "Data PJU (SIG)" },
        { path: "/laporan-pju-rusak", label: "Manajemen PJU Rusak" },
        { path: "/laporan-tilang", label: "Data Tilang" },
        { path: "/laporan-analisis-tilang", label: "Analisis Lokasi Tilang" },
        { path: "/laporan-analisis-pju", label: "Analisis PJU & Tilang" },
        { path: "/laporan-infrastruktur-terburuk", label: "Infrastruktur Terburuk" },
        { path: "/laporan/surat-tugas", label: "Surat Tugas" },
        { path: "/laporan/surat-permohonan", label: "Surat Permohonan" },
        { path: "/laporan/surat-undangan", label: "Surat Undangan" },
        { path: "/laporan/distribusi-dokumen", label: "Distribusi Dokumen" },
        { path: "/laporan/keamanan-data", label: "Keamanan Data" },
        { path: "/laporan/respons-akses", label: "Respons Akses" },
        { path: "/laporan/efisiensi-surat", label: "Efisiensi Surat" },
        { path: "/laporan-audit-keamanan", label: "Audit Keamanan Sistem" },
        { path: "/laporan-lokasi-prioritas", label: "Lokasi Prioritas PJU" },
    ];

    const adminItems = [
        { path: "/admin/users", label: "Kelola Pengguna", icon: <FaUsersCog /> },
        { path: "/admin/permintaan", label: "Permintaan Akses", icon: <FaEnvelopeOpenText /> },
        { path: "/admin/laporan-dokumen", label: "Laporan Dokumen", icon: <FaFileAlt /> },
    ];

    return (
        <>
            {/* Toggle Button - FIXED dengan warna kontras */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                    position: "fixed",
                    top: "15px",
                    left: isSidebarOpen ? "220px" : "15px",
                    zIndex: 10001,
                    background: "linear-gradient(135deg, #4cc9f0, #7c3aed)",
                    color: "#fff",
                    border: "none",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    width: "44px",
                    height: "44px"
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(124, 58, 237, 0.4)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                }}
            >
                {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Sidebar */}
            <div
                className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
                style={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    height: "100vh",
                    width: isSidebarOpen ? "220px" : "0",
                    overflowY: "auto",
                    overflowX: "hidden",
                    transition: "width 0.3s ease",
                    zIndex: 9999,
                    background: "linear-gradient(180deg, #0f172a 0%, #1a2332 100%)",
                    boxShadow: "4px 0 20px rgba(0, 0, 0, 0.25)",
                    borderRight: "1px solid rgba(255, 255, 255, 0.05)"
                }}
            >
                {isSidebarOpen && (
                    <div className="d-flex flex-column h-100">
                        {/* Logo Section */}
                        <div
                            style={{
                                padding: "20px 15px 15px",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                                marginBottom: "15px"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "12px",
                                    background: "rgba(255, 255, 255, 0.03)",
                                    borderRadius: "12px",
                                    backdropFilter: "blur(5px)"
                                }}
                            >
                                <img
                                    src={logoDishub}
                                    alt="Logo Dishub"
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "10px",
                                        background: "#fff",
                                        padding: "3px",
                                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
                                    }}
                                />
                                <div>
                                    <div style={{
                                        fontSize: "11px",
                                        fontWeight: "700",
                                        color: "#fff",
                                        lineHeight: "1.2",
                                        letterSpacing: "0.5px"
                                    }}>
                                        DINAS PERHUBUNGAN
                                    </div>
                                    <div style={{
                                        fontSize: "9px",
                                        color: "#94a3b8",
                                        lineHeight: "1.2",
                                        letterSpacing: "0.3px"
                                    }}>
                                        Lalu Lintas Jalan
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Menu Section */}
                        <div style={{ flexGrow: 1, padding: "0 10px" }}>
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    style={{
                                        borderRadius: "10px",
                                        padding: "12px 14px",
                                        marginBottom: "3px",
                                        background: isActive(item.path) ? "rgba(76, 201, 240, 0.15)" : "transparent",
                                        color: isActive(item.path) ? "#4cc9f0" : "#cbd5e1",
                                        textDecoration: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        fontWeight: isActive(item.path) ? "600" : "400",
                                        transition: "all 0.2s ease",
                                        fontSize: "14px",
                                        borderLeft: isActive(item.path) ? "3px solid #4cc9f0" : "3px solid transparent"
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive(item.path)) {
                                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                                            e.currentTarget.style.color = "#e2e8f0";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive(item.path)) {
                                            e.currentTarget.style.background = "transparent";
                                            e.currentTarget.style.color = "#cbd5e1";
                                        }
                                    }}
                                >
                                    <span style={{ opacity: 0.9, minWidth: "20px" }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}

                            {/* Bidang Menu */}
                            <div style={{ margin: "10px 0" }}>
                                <div
                                    style={{
                                        borderRadius: "10px",
                                        padding: "12px 14px",
                                        background: openBidang ? "rgba(76, 201, 240, 0.1)" : "transparent",
                                        color: openBidang ? "#4cc9f0" : "#cbd5e1",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        fontSize: "14px"
                                    }}
                                    onClick={() => setOpenBidang(!openBidang)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                                        e.currentTarget.style.color = "#e2e8f0";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!openBidang) {
                                            e.currentTarget.style.background = "transparent";
                                            e.currentTarget.style.color = "#cbd5e1";
                                        }
                                    }}
                                >
                                    <span style={{ opacity: 0.9, minWidth: "20px" }}><FaFolder /></span>
                                    <span>Bidang Lalu Lintas Jalan</span>
                                    <span style={{ marginLeft: "auto", opacity: 0.7 }}>
                                        {openBidang ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                    </span>
                                </div>

                                {openBidang && (
                                    <div style={{ padding: "5px 0 5px 30px" }}>
                                        {bidangItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                style={{
                                                    display: "block",
                                                    padding: "10px 12px",
                                                    marginBottom: "2px",
                                                    borderRadius: "8px",
                                                    color: isActive(item.path) ? "#7c3aed" : "#94a3b8",
                                                    textDecoration: "none",
                                                    fontSize: "13px",
                                                    transition: "all 0.2s ease",
                                                    background: isActive(item.path) ? "rgba(124, 58, 237, 0.1)" : "transparent",
                                                    borderLeft: isActive(item.path) ? "2px solid #7c3aed" : "2px solid transparent"
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isActive(item.path)) {
                                                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                                                        e.currentTarget.style.color = "#e2e8f0";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isActive(item.path)) {
                                                        e.currentTarget.style.background = "transparent";
                                                        e.currentTarget.style.color = "#94a3b8";
                                                    }
                                                }}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Admin Menu */}
                            {role === "admin" && (
                                <>
                                    {adminItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            style={{
                                                borderRadius: "10px",
                                                padding: "12px 14px",
                                                marginBottom: "3px",
                                                background: isActive(item.path) ? "rgba(76, 201, 240, 0.15)" : "transparent",
                                                color: isActive(item.path) ? "#4cc9f0" : "#cbd5e1",
                                                textDecoration: "none",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                fontWeight: isActive(item.path) ? "600" : "400",
                                                transition: "all 0.2s ease",
                                                fontSize: "14px",
                                                borderLeft: isActive(item.path) ? "3px solid #4cc9f0" : "3px solid transparent"
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive(item.path)) {
                                                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                                                    e.currentTarget.style.color = "#e2e8f0";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive(item.path)) {
                                                    e.currentTarget.style.background = "transparent";
                                                    e.currentTarget.style.color = "#cbd5e1";
                                                }
                                            }}
                                        >
                                            <span style={{ opacity: 0.9, minWidth: "20px" }}>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}

                                    {/* Manajemen Surat */}
                                    <div style={{ margin: "10px 0" }}>
                                        <div
                                            style={{
                                                borderRadius: "10px",
                                                padding: "12px 14px",
                                                background: openSurat ? "rgba(124, 58, 237, 0.1)" : "transparent",
                                                color: openSurat ? "#7c3aed" : "#cbd5e1",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "10px",
                                                cursor: "pointer",
                                                transition: "all 0.2s ease",
                                                fontSize: "14px"
                                            }}
                                            onClick={() => setOpenSurat(!openSurat)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                                                e.currentTarget.style.color = "#e2e8f0";
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!openSurat) {
                                                    e.currentTarget.style.background = "transparent";
                                                    e.currentTarget.style.color = "#cbd5e1";
                                                }
                                            }}
                                        >
                                            <span style={{ opacity: 0.9, minWidth: "20px" }}><FaMailBulk /></span>
                                            <span>Laporan</span>
                                            <span style={{ marginLeft: "auto", opacity: 0.7 }}>
                                                {openSurat ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                            </span>
                                        </div>

                                        {openSurat && (
                                            <div style={{ padding: "5px 0 5px 30px" }}>
                                                {adminSuratItems.map((item) => (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        style={{
                                                            display: "block",
                                                            padding: "10px 12px",
                                                            marginBottom: "2px",
                                                            borderRadius: "8px",
                                                            color: isActive(item.path) ? "#7c3aed" : "#94a3b8",
                                                            textDecoration: "none",
                                                            fontSize: "13px",
                                                            transition: "all 0.2s ease",
                                                            background: isActive(item.path) ? "rgba(124, 58, 237, 0.1)" : "transparent",
                                                            borderLeft: isActive(item.path) ? "2px solid #7c3aed" : "2px solid transparent"
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!isActive(item.path)) {
                                                                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                                                                e.currentTarget.style.color = "#e2e8f0";
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!isActive(item.path)) {
                                                                e.currentTarget.style.background = "transparent";
                                                                e.currentTarget.style.color = "#94a3b8";
                                                            }
                                                        }}
                                                    >
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Logout Section */}
                        <div style={{ padding: "15px 10px 0", borderTop: "1px solid rgba(255, 255, 255, 0.08)", marginTop: "15px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    background: "rgba(239, 68, 68, 0.08)",
                                    color: "#ef4444",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    fontSize: "14px"
                                }}
                                onClick={() => {
                                    localStorage.removeItem("isLoggedIn");
                                    window.location.href = "/login";
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                /* Custom Scrollbar */
                .sidebar::-webkit-scrollbar {
                    width: 4px;
                }
                
                .sidebar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .sidebar::-webkit-scrollbar-thumb {
                    background: rgba(76, 201, 240, 0.3);
                    border-radius: 4px;
                }
                
                .sidebar::-webkit-scrollbar-thumb:hover {
                    background: rgba(76, 201, 240, 0.5);
                }
            `}</style>
        </>
    );
}