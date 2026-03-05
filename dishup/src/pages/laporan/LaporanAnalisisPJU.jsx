import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Swal from 'sweetalert2';

export default function LaporanAnalisisPJU() {
    const navigate = useNavigate();
    const [dataAnalisis, setDataAnalisis] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);
    const [totalPju, setTotalPju] = useState(0);
    const [totalTilang, setTotalTilang] = useState(0);

    const handleAnalisis = async () => {
        setIsAnalyzing(true);
        // Simulasi proses
        setTimeout(async () => {
            try {
                const [resPju, resTilang] = await Promise.all([
                    fetch('http://localhost/DISHUP_S/dishup/api/pju_rusak.php'),
                    fetch('http://localhost/DISHUP_S/dishup/api/tilang.php')
                ]);
                const jsonPju = await resPju.json();
                const jsonTilang = await resTilang.json();

                const pjuData = jsonPju.status === 'success' ? jsonPju.data : [];
                const tilangData = jsonTilang.status === 'success' ? jsonTilang.data : [];

                const mapWilayah = {};

                // Group PJU (hanya yang Rusak / Proses)
                pjuData.forEach(p => {
                    if (p.status === 'Rusak' || p.status === 'Proses') {
                        const wil = p.wilayah || 'Lainnya';
                        if (!mapWilayah[wil]) mapWilayah[wil] = { wilayah: wil, pju_rusak: 0, tilang: 0 };
                        mapWilayah[wil].pju_rusak++;
                    }
                });

                // Group Tilang
                tilangData.forEach(t => {
                    let matched = false;
                    for (const wil of Object.keys(mapWilayah)) {
                        if (t.lokasi && t.lokasi.toLowerCase().includes(wil.toLowerCase())) {
                            mapWilayah[wil].tilang++;
                            matched = true;
                            break;
                        }
                    }
                    if (!matched) {
                        const defaultWil = 'Lainnya';
                        if (!mapWilayah[defaultWil]) mapWilayah[defaultWil] = { wilayah: defaultWil, pju_rusak: 0, tilang: 0 };
                        mapWilayah[defaultWil].tilang++;
                    }
                });

                const finalData = Object.values(mapWilayah).filter(d => d.pju_rusak > 0 || d.tilang > 0);
                setDataAnalisis(finalData);

                setTotalPju(finalData.reduce((sum, item) => sum + item.pju_rusak, 0));
                setTotalTilang(finalData.reduce((sum, item) => sum + item.tilang, 0));

                setHasAnalyzed(true);
                Swal.fire({
                    icon: 'success',
                    title: 'Proses Selesai',
                    text: 'Data spasial PJU dan Tilang telah berhasil disinkronisasi.',
                    timer: 1500,
                    showConfirmButton: false
                });

            } catch (error) {
                console.error("Gagal menarik data:", error);
                Swal.fire('Error', 'Gagal memproses data analisis.', 'error');
            } finally {
                setIsAnalyzing(false);
            }
        }, 1500); // 1.5 detik loading buatan (UX)
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* Judul Halaman */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1"><i className="bi bi-diagram-3-fill me-2 text-primary"></i>Manajemen Analisis</h2>
                    <p className="text-muted mb-0">Sinkronisasi & komparasi data infrastruktur PJU dengan pelanggaran lalu lintas (Tilang).</p>
                </div>
                {hasAnalyzed && (
                    <button className="btn btn-danger shadow px-4 py-2 rounded-3" onClick={() => navigate('/print/laporan-analisis-pju')}>
                        <i className="bi bi-printer-fill me-2"></i>Cetak PDF
                    </button>
                )}
            </div>

            {/* Panel Proses */}
            <div className="card shadow-sm border-0 mb-4 rounded-4">
                <div className="card-body p-5 text-center">
                    <div className="mb-4">
                        <i className="bi bi-arrow-repeat text-primary" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h4 className="fw-bold">Sinkronisasi Data Spasial</h4>
                    <p className="mb-4 text-secondary mx-auto" style={{ maxWidth: '600px' }}>
                        Klik tombol di bawah ini untuk memulai proses <strong>data mining</strong>. Sistem akan menyatukan letak koordinat dan wilayah dari laporan PJU Rusak dengan lokasi pelanggaran Tilang secara otomatis.
                    </p>
                    <button className="btn btn-primary btn-lg px-5 shadow-sm rounded-pill" onClick={handleAnalisis} disabled={isAnalyzing}>
                        {isAnalyzing ? (
                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Memproses Data...</>
                        ) : (
                            <><i className="bi bi-play-circle-fill me-2"></i>Jalankan Proses Analisis</>
                        )}
                    </button>
                </div>
            </div>

            {/* Hasil Analisis Dashboard */}
            {hasAnalyzed && (
                <div className="row g-4 mb-4">
                    <div className="col-md-5">
                        <div className="card shadow-sm border-0 rounded-4 h-100">
                            <div className="card-header bg-white border-0 pt-4 pb-0">
                                <h5 className="fw-bold mb-0">Tabel Komparasi Wilayah</h5>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive" style={{ maxHeight: '350px' }}>
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light sticky-top">
                                            <tr>
                                                <th>Wilayah</th>
                                                <th className="text-center">PJU Rusak</th>
                                                <th className="text-center">Tilang</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataAnalisis.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="fw-semibold text-secondary">{item.wilayah}</td>
                                                    <td className="text-center"><span className="badge bg-danger rounded-pill px-3">{item.pju_rusak}</span></td>
                                                    <td className="text-center"><span className="badge bg-warning text-dark rounded-pill px-3">{item.tilang}</span></td>
                                                </tr>
                                            ))}
                                            <tr className="table-secondary fw-bold">
                                                <td>TOTAL DATA</td>
                                                <td className="text-center text-danger">{totalPju}</td>
                                                <td className="text-center text-warning text-dark">{totalTilang}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-7">
                        {dataAnalisis.length > 0 ? (
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-header bg-white border-0 pt-4 pb-0">
                                    <h5 className="fw-bold mb-0">Grafik Komparatif</h5>
                                </div>
                                <div className="card-body p-4" style={{ minHeight: '350px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={dataAnalisis} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="wilayah" tick={{ fontSize: 12 }} />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip cursor={{ fill: '#f8fafc' }} />
                                            <Legend wrapperStyle={{ paddingTop: "10px" }} />
                                            <Bar dataKey="pju_rusak" name="Jumlah PJU Rusak" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="tilang" name="Kasus Tilang Aktif" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className="card border-0 shadow-sm rounded-4 h-100 d-flex justify-content-center align-items-center bg-light">
                                <span className="text-muted"><i className="bi bi-bar-chart-line me-2"></i>Tidak ada grafik tersedia.</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
