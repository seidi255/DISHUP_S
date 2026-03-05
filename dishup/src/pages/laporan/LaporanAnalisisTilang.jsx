import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Swal from 'sweetalert2';

// Custom icons based on kerawanan
const iconRendah = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const iconSedang = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const iconTinggi = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

export default function LaporanAnalisisTilang() {
    const navigate = useNavigate();
    const [dataAnalisis, setDataAnalisis] = useState([]);
    const [rawTilangData, setRawTilangData] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);
    const [totalPelanggaran, setTotalPelanggaran] = useState(0);
    const [highestWilayah, setHighestWilayah] = useState('');

    const handleAnalisis = async () => {
        setIsAnalyzing(true);
        setTimeout(async () => {
            try {
                const response = await fetch('http://localhost/DISHUP_S/dishup/api/tilang.php');
                const result = await response.json();

                const tilangData = result.status === 'success' ? result.data : [];
                setRawTilangData(tilangData);

                const mapWilayah = {};

                tilangData.forEach(t => {
                    let text = ((t.lokasi || '') + ' ' + (t.wilayah || '')).toLowerCase();
                    let wil = 'Lainnya';

                    if (text.includes('banjarbaru') || text.includes('bjb') || text.includes('trikora') || text.includes('ulin') || text.includes('cempaka') || text.includes('loktabat')) wil = 'Banjarbaru';
                    else if (text.includes('banjarmasin') || text.includes('bjm') || text.includes('hksn') || text.includes('belitung') || text.includes('sutoyo') || text.includes('antasari') || text.includes('trisakti') || text.includes('hasan basri')) wil = 'Banjarmasin';
                    else if (text.includes('martapura') || text.includes('mtp') || text.includes('sekumpul')) wil = 'Martapura';
                    else if (text.includes('gambut') || text.includes('km 14')) wil = 'Gambut';
                    else if (text.includes('pelaihari') || text.includes('tanah laut')) wil = 'Pelaihari';
                    else if (text.includes('barito') || text.includes('batola') || text.includes('alalak') || text.includes('syarkawi')) wil = 'Barito Kuala';

                    if (!mapWilayah[wil]) {
                        mapWilayah[wil] = { wilayah: wil, jumlah: 0, tingkat: '' };
                    }
                    mapWilayah[wil].jumlah++;
                });

                const finalData = Object.values(mapWilayah).map(d => {
                    if (d.jumlah <= 5) d.tingkat = 'Rendah';
                    else if (d.jumlah <= 15) d.tingkat = 'Sedang';
                    else d.tingkat = 'Tinggi';
                    return d;
                }).sort((a, b) => b.jumlah - a.jumlah); // Sort desc

                // Cari region dengan pelanggaran tertinggi untuk filter map
                if (finalData.length > 0) {
                    setHighestWilayah(finalData[0].wilayah);
                } else {
                    setHighestWilayah('');
                }

                setDataAnalisis(finalData);
                setTotalPelanggaran(tilangData.length);
                setHasAnalyzed(true);

                Swal.fire({
                    icon: 'success',
                    title: 'Analisis Selesai',
                    text: 'Data spasial tilang berhasil dikalkulasi.',
                    timer: 1500,
                    showConfirmButton: false
                });

            } catch (error) {
                console.error("Gagal menarik data:", error);
                Swal.fire('Error', 'Gagal memproses data analisis.', 'error');
            } finally {
                setIsAnalyzing(false);
            }
        }, 1200);
    };

    const getBadgeColor = (tingkat) => {
        if (tingkat === 'Tinggi') return 'bg-danger';
        if (tingkat === 'Sedang') return 'bg-warning text-dark';
        return 'bg-success';
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1"><i className="bi bi-shield-exclamation text-danger me-2"></i>Analisis Rawan Pelanggaran</h2>
                    <p className="text-muted mb-0">Pemetaan dan identifikasi titik lokasi rawan pelanggaran lalu lintas.</p>
                </div>
                {hasAnalyzed && (
                    <button className="btn btn-danger shadow px-4 py-2 rounded-3" onClick={() => navigate('/print/laporan-analisis-tilang')}>
                        <i className="bi bi-printer-fill me-2"></i>Cetak Laporan Resmi
                    </button>
                )}
            </div>

            <div className="card shadow-sm border-0 mb-4 rounded-4">
                <div className="card-body p-4 text-center">
                    <div className="mb-3">
                        <i className="bi bi-map text-primary" style={{ fontSize: '2.5rem' }}></i>
                    </div>
                    <h5 className="fw-bold">Pemrosesan Geospasial Tilang</h5>
                    <p className="mb-4 text-secondary mx-auto" style={{ maxWidth: '600px', fontSize: '14px' }}>
                        Analisis ini akan mengumpulkan semua data koordinat tilang dan mengklasifikasikan wilayah berdasarkan intensitas pelanggaran (Rendah, Sedang, Tinggi).
                    </p>
                    <button className="btn btn-primary px-5 shadow-sm rounded-pill" onClick={handleAnalisis} disabled={isAnalyzing}>
                        {isAnalyzing ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>Menghitung Cluster...</>
                        ) : (
                            <><i className="bi bi-calculator me-2"></i>Kalkulasi Indeks Kerawanan</>
                        )}
                    </button>
                </div>
            </div>

            {hasAnalyzed && (
                <>
                    {/* Row 1: Peta & Tabel */}
                    <div className="row g-4 mb-4">
                        <div className="col-md-7">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-header bg-white border-0 pt-4 pb-0">
                                    <h5 className="fw-bold mb-0">Persebaran Spasial Pelanggaran</h5>
                                </div>
                                <div className="card-body p-3">
                                    <div style={{ height: '400px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                                        <MapContainer center={[-3.4400, 114.8298]} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            {rawTilangData.map(t => {
                                                if (t.lat && t.lng) {
                                                    // Ambil region
                                                    let text = ((t.lokasi || '') + ' ' + (t.wilayah || '')).toLowerCase();
                                                    let wil = 'Lainnya';
                                                    if (text.includes('banjarbaru') || text.includes('bjb') || text.includes('trikora') || text.includes('ulin') || text.includes('cempaka') || text.includes('loktabat')) wil = 'Banjarbaru';
                                                    else if (text.includes('banjarmasin') || text.includes('bjm') || text.includes('hksn') || text.includes('belitung') || text.includes('sutoyo') || text.includes('antasari') || text.includes('trisakti') || text.includes('hasan basri')) wil = 'Banjarmasin';
                                                    else if (text.includes('martapura') || text.includes('mtp') || text.includes('sekumpul')) wil = 'Martapura';
                                                    else if (text.includes('gambut') || text.includes('km 14')) wil = 'Gambut';
                                                    else if (text.includes('pelaihari') || text.includes('tanah laut')) wil = 'Pelaihari';
                                                    else if (text.includes('barito') || text.includes('batola') || text.includes('alalak') || text.includes('syarkawi')) wil = 'Barito Kuala';

                                                    // HANYA tampilkan pin jika wilayah tilang ini adalah wilayah yang paling tinggi kasusnya
                                                    if (wil !== highestWilayah) return null;

                                                    // Ambil tingkat kerawanan wilayah ini
                                                    let wilTingkat = 'Rendah';
                                                    for (const w of dataAnalisis) {
                                                        if (w.wilayah === wil) {
                                                            wilTingkat = w.tingkat;
                                                            break;
                                                        }
                                                    }
                                                    const icon = wilTingkat === 'Tinggi' ? iconTinggi : wilTingkat === 'Sedang' ? iconSedang : iconRendah;

                                                    return (
                                                        <Marker key={t.id} position={[parseFloat(t.lat), parseFloat(t.lng)]} icon={icon}>
                                                            <Popup>
                                                                <strong>{t.lokasi}</strong><br />
                                                                <span className="text-muted">{wil}</span><br />
                                                                {t.tanggal_waktu}<br />
                                                                Tingkat Kerawanan Area: <span className={`badge ${getBadgeColor(wilTingkat)}`}>{wilTingkat}</span>
                                                            </Popup>
                                                        </Marker>
                                                    )
                                                }
                                                return null;
                                            })}
                                        </MapContainer>
                                    </div>
                                    <div className="mt-2 text-center small text-muted">
                                        Legenda: <i className="bi bi-circle-fill text-danger mx-1"></i>Tinggi ( {'>'} 15) | <i className="bi bi-circle-fill text-warning mx-1"></i>Sedang (6-15) | <i className="bi bi-circle-fill text-success mx-1"></i>Rendah (0-5)
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-5">
                            <div className="card shadow-sm border-0 rounded-4 h-100">
                                <div className="card-header bg-white border-0 pt-4 pb-0">
                                    <h5 className="fw-bold mb-0">Tabel Kerawanan Wilayah</h5>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive" style={{ maxHeight: '380px' }}>
                                        <table className="table table-hover align-middle mb-0">
                                            <thead className="table-light sticky-top">
                                                <tr>
                                                    <th>Wilayah</th>
                                                    <th className="text-center">Jumlah Kasus</th>
                                                    <th className="text-center">Indeks Kerawanan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dataAnalisis.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="fw-semibold text-secondary">{item.wilayah}</td>
                                                        <td className="text-center fw-bold">{item.jumlah}</td>
                                                        <td className="text-center">
                                                            <span className={`badge ${getBadgeColor(item.tingkat)} w-75 py-2`}>{item.tingkat}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {dataAnalisis.length === 0 && (
                                                    <tr><td colSpan="3" className="text-center">Belum ada data</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Grafik */}
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-header bg-white border-0 pt-4 pb-0">
                            <h5 className="fw-bold mb-0">Grafik Komparasi Pelanggaran</h5>
                        </div>
                        <div className="card-body p-4" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataAnalisis} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="wilayah" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="jumlah" name="Jumlah Pelanggaran" fill="#1e40af" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
