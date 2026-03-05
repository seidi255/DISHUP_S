import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Swal from 'sweetalert2';

export default function LaporanAuditKeamanan() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        grafik: [],
        logSemua: [],
        logLogin: [],
        logPerubahan: [],
        summary: {
            login_hari_ini: 0,
            aktivitas_hari_ini: 0,
            perubahan_hari_ini: 0,
            gagal_login_hari_ini: 0
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('semua');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost/DISHUP_S/dishup/api/log_aktivitas.php');
            const result = await response.json();

            if (result.status === 'success') {
                setData(result.data);
            }
        } catch (error) {
            console.error("Gagal menarik data log:", error);
            Swal.fire('Error', 'Gagal memuat data audit keamanan.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        navigate('/print/laporan-audit-keamanan');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">
                        <i className="bi bi-shield-lock-fill me-2 text-primary"></i>
                        Audit Keamanan Sistem
                    </h2>
                    <p className="text-muted mb-0">Pemantauan aktivitas pengguna, histori login, dan pelacakan perubahan data.</p>
                </div>
                <button
                    className="btn btn-primary shadow px-4 py-2 rounded-3"
                    onClick={handlePrint}
                    disabled={isLoading}
                >
                    <i className="bi bi-printer-fill me-2"></i>Cetak Laporan
                </button>
            </div>

            {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    {/* SUMMARY CARDS */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 rounded-4 bg-white">
                                <div className="card-body p-4 d-flex align-items-center">
                                    <div className="bg-primary text-white p-3 rounded-circle me-3">
                                        <i className="bi bi-box-arrow-in-right fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-1">Login Berhasil (Hari ini)</h6>
                                        <h3 className="fw-bold mb-0">{data.summary.login_hari_ini}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 rounded-4 bg-white">
                                <div className="card-body p-4 d-flex align-items-center">
                                    <div className="bg-danger text-white p-3 rounded-circle me-3">
                                        <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-1">Login Gagal (Hari ini)</h6>
                                        <h3 className="fw-bold mb-0">{data.summary.gagal_login_hari_ini}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 rounded-4 bg-white">
                                <div className="card-body p-4 d-flex align-items-center">
                                    <div className="bg-warning text-dark p-3 rounded-circle me-3">
                                        <i className="bi bi-pencil-square fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-1">Perubahan Data (Hari ini)</h6>
                                        <h3 className="fw-bold mb-0">{data.summary.perubahan_hari_ini}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card shadow-sm border-0 rounded-4 bg-white">
                                <div className="card-body p-4 d-flex align-items-center">
                                    <div className="bg-success text-white p-3 rounded-circle me-3">
                                        <i className="bi bi-activity fs-4"></i>
                                    </div>
                                    <div>
                                        <h6 className="text-muted mb-1">Total Aktivitas (Hari ini)</h6>
                                        <h3 className="fw-bold mb-0">{data.summary.aktivitas_hari_ini + data.summary.login_hari_ini + data.summary.perubahan_hari_ini + data.summary.gagal_login_hari_ini}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CHART ACTIVITY */}
                    <div className="card shadow-sm border-0 rounded-4 mb-4">
                        <div className="card-header bg-white border-0 pt-4 pb-0">
                            <h5 className="fw-bold mb-0">Aktivitas Sistem 7 Hari Terakhir</h5>
                        </div>
                        <div className="card-body p-4" style={{ height: '300px' }}>
                            {data.grafik.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.grafik} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="tanggal" tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#64748b' }} allowDecimals={false} />
                                        <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="jumlah" name="Jumlah Aktivitas" stroke="#0d6efd" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="d-flex justify-content-center align-items-center h-100">
                                    <span className="text-muted">Tidak ada data untuk grafik.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TABEL LOG */}
                    <div className="card shadow-sm border-0 rounded-4 mb-4">
                        <div className="card-header bg-white border-0 pt-4">
                            <ul className="nav nav-pills gap-2">
                                <li className="nav-item">
                                    <button className={`nav-link rounded-pill ${activeTab === 'semua' ? 'active shadow-sm' : 'bg-light text-dark'}`} onClick={() => setActiveTab('semua')}>
                                        <i className="bi bi-list-ul me-2"></i>Semua Aktivitas
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button className={`nav-link rounded-pill ${activeTab === 'login' ? 'active shadow-sm' : 'bg-light text-dark'}`} onClick={() => setActiveTab('login')}>
                                        <i className="bi bi-door-open me-2"></i>Log Login
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button className={`nav-link rounded-pill ${activeTab === 'perubahan' ? 'active shadow-sm' : 'bg-light text-dark'}`} onClick={() => setActiveTab('perubahan')}>
                                        <i className="bi bi-database-check me-2"></i>Perubahan Data
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="card-body p-0">
                            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th className="px-4 py-3">Waktu</th>
                                            <th className="py-3">Pengguna</th>
                                            <th className="py-3">Aktivitas</th>
                                            {activeTab === 'semua' && <th className="py-3">Kategori</th>}
                                            {activeTab === 'perubahan' && <th className="py-3">Data Terkait</th>}
                                            {activeTab === 'perubahan' && <th className="py-3">Aksi</th>}
                                            <th className="py-3 text-center">Status</th>
                                            <th className="px-4 py-3 text-end">IP Address</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {((activeTab === 'semua' ? data.logSemua : (activeTab === 'login' ? data.logLogin : data.logPerubahan)) || []).map((log) => (
                                            <tr key={log.id}>
                                                <td className="px-4 text-nowrap text-secondary" style={{ fontSize: '14px' }}>{formatDate(log.created_at)}</td>
                                                <td className="fw-semibold">{log.username || 'System'}</td>
                                                <td>{log.aktivitas}</td>
                                                {activeTab === 'semua' && <td><span className="badge bg-secondary rounded-pill px-3">{log.tipe_log}</span></td>}
                                                {activeTab === 'perubahan' && <td>{log.data_terkait}</td>}
                                                {activeTab === 'perubahan' && <td>
                                                    <span className={`badge rounded-pill px-3 ${log.aksi === 'Insert' ? 'bg-success' : (log.aksi === 'Update' ? 'bg-warning text-dark' : 'bg-danger')}`}>
                                                        {log.aksi}
                                                    </span>
                                                </td>}
                                                <td className="text-center">
                                                    {log.status === 'Berhasil' ? (
                                                        <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1 rounded-pill">Berhasil</span>
                                                    ) : (
                                                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1 rounded-pill">Gagal</span>
                                                    )}
                                                </td>
                                                <td className="px-4 text-end text-muted font-monospace" style={{ fontSize: '13px' }}>{log.ip_address}</td>
                                            </tr>
                                        ))}
                                        {((activeTab === 'semua' ? data.logSemua : (activeTab === 'login' ? data.logLogin : data.logPerubahan)) || []).length === 0 && (
                                            <tr>
                                                <td colSpan="8" className="text-center py-5 text-muted">
                                                    <i className="bi bi-inbox fs-2 d-block mb-3"></i>
                                                    Belum ada data log aktivitas
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
