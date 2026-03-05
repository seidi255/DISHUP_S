import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Swal from 'sweetalert2';

export default function LaporanInfrastrukturTerburuk() {
    const navigate = useNavigate();
    const [dataWilayah, setDataWilayah] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost/DISHUP_S/dishup/api/pju_rusak.php?summary=true');
            const result = await response.json();

            if (result.status === 'success' && result.data && result.data.wilayahChart) {
                // filter wilayah yang kosong atau Tidak Tahu
                const validData = result.data.wilayahChart.filter(item =>
                    item.wilayah &&
                    item.wilayah.trim() !== '' &&
                    item.value > 0
                );
                setDataWilayah(validData);
            }
        } catch (error) {
            console.error("Gagal menarik data:", error);
            Swal.fire('Error', 'Gagal memuat data infrastruktur terburuk.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        navigate('/print/laporan-infrastruktur-terburuk');
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* Judul Halaman */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">
                        <i className="bi bi-cone-striped me-2 text-danger"></i>
                        Laporan Infrastruktur Terburuk
                    </h2>
                    <p className="text-muted mb-0">Peringkat wilayah berdasarkan jumlah PJU yang rusak.</p>
                </div>
                <button
                    className="btn btn-danger shadow px-4 py-2 rounded-3"
                    onClick={handlePrint}
                    disabled={isLoading || dataWilayah.length === 0}
                >
                    <i className="bi bi-printer-fill me-2"></i>Cetak PDF
                </button>
            </div>

            {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row g-4 mb-4">
                    {/* Panel Grafik */}
                    <div className="col-md-7">
                        <div className="card shadow-sm border-0 rounded-4 h-100">
                            <div className="card-header bg-white border-0 pt-4 pb-0">
                                <h5 className="fw-bold mb-0">Grafik Kerusakan PJU per Wilayah</h5>
                            </div>
                            <div className="card-body p-4" style={{ minHeight: '450px' }}>
                                {dataWilayah.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dataWilayah} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis
                                                dataKey="wilayah"
                                                tick={{ fill: '#64748b', fontSize: 12 }}
                                                angle={-45}
                                                textAnchor="end"
                                                height={60}
                                            />
                                            <YAxis tick={{ fill: '#64748b' }} allowDecimals={false} />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(239, 68, 68, 0.1)' }}
                                                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="value" name="Jumlah PJU Rusak" radius={[6, 6, 0, 0]}>
                                                {dataWilayah.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#f87171'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="d-flex justify-content-center align-items-center h-100">
                                        <span className="text-muted"><i className="bi bi-info-circle me-2"></i>Tidak ada data PJU rusak yang ditemukan.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Panel Tabel */}
                    <div className="col-md-5">
                        <div className="card shadow-sm border-0 rounded-4 h-100">
                            <div className="card-header bg-white border-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold mb-0">Peringkat Wilayah</h5>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th className="text-center" style={{ width: '15%' }}>Peringkat</th>
                                                <th>Wilayah</th>
                                                <th className="text-center">Jumlah Rusak</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataWilayah.map((item, index) => (
                                                <tr key={index} className={index === 0 ? "table-danger" : ""}>
                                                    <td className="text-center fw-bold">
                                                        {index === 0 ? (
                                                            <i className="bi bi-trophy-fill text-danger fs-5"></i>
                                                        ) : (
                                                            `#${index + 1}`
                                                        )}
                                                    </td>
                                                    <td className={index === 0 ? "fw-bold text-danger" : "fw-semibold text-secondary"}>
                                                        {item.wilayah}
                                                    </td>
                                                    <td className="text-center">
                                                        <span className={`badge ${index === 0 ? 'bg-danger fs-6' : 'bg-secondary'} rounded-pill px-3`}>
                                                            {item.value}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {dataWilayah.length === 0 && (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-4 text-muted">
                                                        Tidak ada data
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        {dataWilayah.length > 0 && (
                                            <tfoot className="table-light sticky-bottom">
                                                <tr>
                                                    <th colSpan="2" className="text-end">Total PJU Rusak:</th>
                                                    <th className="text-center text-danger fs-6">
                                                        {dataWilayah.reduce((sum, item) => sum + parseInt(item.value || 0, 10), 0)}
                                                    </th>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
