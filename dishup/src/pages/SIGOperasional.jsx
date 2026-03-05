import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, FeatureGroup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import tilangDataRaw from '../assets/tilang_data.json';
import area1Data from '../assets/area_1.json';
import area2Data from '../assets/area_2.json';

// Fix Leaflet's default icon issue in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

// Helper for Custom Colors (Marker)
const createMarkerIcon = (color) => {
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const icons = {
    KIR: createMarkerIcon('blue'),
    OVERDIMENSI: createMarkerIcon('red'),
    GABUNGAN: createMarkerIcon('yellow'),
    DEFAULT: createMarkerIcon('violet')
};

const COLORS = ['#0088FE', '#FF8042', '#FFBB28', '#00C49F'];

export default function SIGOperasional() {
    // Pusat peta Kalsel
    const mapCenter = [-3.316694, 114.590111];

    // State Filter
    const [filterJenis, setFilterJenis] = useState('Semua');
    const [filterWilayah, setFilterWilayah] = useState('Semua');
    const [filterTahun, setFilterTahun] = useState('Semua');

    // Menderivasi Data Categories (KIR, Overdimensi, dll)
    const tilangData = useMemo(() => {
        return tilangDataRaw.map(item => {
            let kategori = 'KIR';
            if (item.pelanggaran.toLowerCase().includes('dimensi') || item.pelanggaran.toLowerCase().includes('muatan')) {
                // Sengaja dimasukkan gabungan jika ada KIR & Dimensi
                kategori = item.pelanggaran.toLowerCase().includes('kir') ? 'GABUNGAN' : 'OVERDIMENSI';
            }
            return { ...item, kategori };
        });
    }, []);

    // Filtered Data
    const filteredData = useMemo(() => {
        return tilangData.filter(item => {
            const matchJenis = filterJenis === 'Semua' || item.kategori === filterJenis;
            const matchWilayah = filterWilayah === 'Semua' || item.lokasi.includes(filterWilayah);
            // Ekstrak tahun dari pasal/data jika ada (untuk demo kita anggap random atau ambil dari ID/Kategori jika tidak ada atribut tahun asli)
            const itemTahun = item.tahun || '2024';
            const matchTahun = filterTahun === 'Semua' || itemTahun === filterTahun;

            return matchJenis && matchWilayah && matchTahun;
        });
    }, [filterJenis, filterWilayah, filterTahun, tilangData]);

    // Unique filter options
    const jenisOptions = ['Semua', 'KIR', 'OVERDIMENSI', 'GABUNGAN'];
    const wilayahOptions = ['Semua', ...new Set(tilangData.map(d => {
        if (d.lokasi.includes(',')) return d.lokasi.split(',')[0].trim();
        return d.lokasi.replace(/(Jl\.|Ds\.|Jl)/gi, '').trim();
    }))];
    const tahunOptions = ['Semua', '2024', '2023', '2022'];

    // Stats
    const totalTilang = filteredData.length;
    const totalKIR = filteredData.filter(d => d.kategori === 'KIR' || d.kategori === 'GABUNGAN').length;
    const totalDimensi = filteredData.filter(d => d.kategori === 'OVERDIMENSI' || d.kategori === 'GABUNGAN').length;

    // Wilayah terbanyak (Analysis)
    const wilayahCount = Object.entries(
        filteredData.reduce((acc, curr) => {
            const wil = curr.lokasi.replace(/(Jl\.|Ds\.|Jl)/gi, '').trim();
            acc[wil] = (acc[wil] || 0) + 1;
            return acc;
        }, {})
    ).sort((a, b) => b[1] - a[1]);
    const topWilayah = wilayahCount.length > 0 ? wilayahCount[0] : ['-', 0];

    // Data for charts
    const pieData = [
        { name: 'KIR', value: totalKIR },
        { name: 'Overdimensi', value: totalDimensi }
    ].filter(d => d.value > 0);

    const barData = wilayahCount.slice(0, 5).map(([name, value]) => ({ name: name.substring(0, 10) + (name.length > 10 ? '...' : ''), value }));

    // Animation Variants
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
        })
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="row mb-4">
                <div className="col-12">
                    <h2 className="fw-bold text-primary border-bottom pb-2">
                        <i className="bi bi-shield-exclamation me-2"></i>SIG Penindakan & Operasional
                    </h2>
                    <p className="text-secondary">Peta interaktif persebaran lokasi penindakan tilang dan analisis kepatuhan angkutan barang.</p>
                </div>
            </motion.div>

            {/* Statistik Ringkas */}
            <div className="row g-3 mb-4">
                {[
                    { title: "Total Penindakan", val: totalTilang, color: "primary", icon: "bi-card-list" },
                    { title: "Pelanggaran KIR", val: totalKIR, color: "info", icon: "bi-journal-x" },
                    { title: "Overdimensi/Load", val: totalDimensi, color: "danger", icon: "bi-truck" },
                    { title: "Wilayah Terbanyak", val: topWilayah[1], label: topWilayah[0], color: "warning", icon: "bi-geo-alt" }
                ].map((stat, idx) => (
                    <motion.div custom={idx} initial="hidden" animate="visible" variants={cardVariants} className="col-md-3 col-6" key={idx}>
                        <div className={`card shadow-sm border-0 border-start border-4 border-${stat.color} h-100 bg-white`}
                            style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div className="card-body d-flex align-items-center">
                                <div className={`flex-shrink-0 text-${stat.color} bg-${stat.color} bg-opacity-10 p-3 rounded-circle me-3`}>
                                    <i className={`bi ${stat.icon} fs-4`}></i>
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1 small text-uppercase fw-bold">{stat.title}</h6>
                                    <h4 className="mb-0 fw-bold text-dark">
                                        <CountUp end={stat.val} duration={2} />
                                        {stat.label && <span className="fs-6 fw-normal ms-2 text-muted">({stat.label})</span>}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* AI Analysis Summary Box */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="row mb-4">
                <div className="col-12">
                    <div className="alert alert-primary shadow-sm border-0 d-flex align-items-center mb-0" role="alert" style={{ borderRadius: '12px' }}>
                        <i className="bi bi-lightbulb-fill text-warning fs-3 me-3"></i>
                        <div>
                            <strong>Ringkasan Analisis: </strong>
                            {filteredData.length > 0 ? (
                                <span>Wilayah dengan pelanggaran tertinggi saat ini berada di <b>{topWilayah[0]}</b> dengan <b>{topWilayah[1]} kasus</b>, didominasi oleh masalah <b>{totalKIR > totalDimensi ? 'Buku Uji KIR' : 'Overdimensi / Overload'}</b>. Peningkatan patroli disarankan pada area ini.</span>
                            ) : (
                                <span>Tidak ada data pelanggaran yang sesuai dengan filter wilayah dan jenis kendaraan yang dipilih.</span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Filter Section */}
            <div className="row mb-4">
                <div className="col-md-8">
                    <div className="card shadow-sm border-0 bg-white" style={{ borderRadius: '12px' }}>
                        <div className="card-body d-flex gap-3 align-items-center flex-wrap">
                            <i className="bi bi-funnel text-primary fs-4 d-none d-sm-block"></i>
                            <div className="flex-grow-1" style={{ minWidth: '150px' }}>
                                <label className="form-label small text-muted fw-bold mb-1">Kategori Pelanggaran</label>
                                <select className="form-select border-0 bg-light" value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}>
                                    {jenisOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="flex-grow-1" style={{ minWidth: '150px' }}>
                                <label className="form-label small text-muted fw-bold mb-1">Wilayah / Area</label>
                                <select className="form-select border-0 bg-light" value={filterWilayah} onChange={(e) => setFilterWilayah(e.target.value)}>
                                    {wilayahOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div className="flex-grow-1" style={{ minWidth: '120px' }}>
                                <label className="form-label small text-muted fw-bold mb-1">Tahun Sidang</label>
                                <select className="form-select border-0 bg-light" value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)}>
                                    {tahunOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Peta Integrasi */}
            <div className="row mb-4">
                <div className="col-12 mb-4 mb-lg-0">
                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                        <div className="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                            <h5 className="card-title fw-semibold mb-0 text-dark">Peta Interaktif Penindakan</h5>
                            <div className="d-flex gap-3 small text-muted font-monospace">
                                <span><img src={icons.KIR.options.iconUrl} width="14" alt="kir" /> KIR</span>
                                <span><img src={icons.OVERDIMENSI.options.iconUrl} width="14" alt="od" /> Dimensi</span>
                                <span><img src={icons.GABUNGAN.options.iconUrl} width="14" alt="g" /> Gabungan</span>
                            </div>
                        </div>
                        <div className="card-body p-3">
                            <div style={{ height: '550px', width: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 0 }}>
                                <MapContainer center={mapCenter} zoom={10} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                                    <LayersControl position="topright">
                                        <LayersControl.BaseLayer checked name="Mode Terang (OSM)">
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                                        </LayersControl.BaseLayer>
                                        <LayersControl.BaseLayer name="Satelit">
                                            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution='Tiles &copy; Esri' />
                                        </LayersControl.BaseLayer>

                                        {/* Titik Penilangan */}
                                        <LayersControl.Overlay checked name="Titik Pelanggaran">
                                            <FeatureGroup>
                                                {filteredData.map((tilang) => (
                                                    <Marker key={tilang.id} position={[tilang.lat, tilang.lng]} icon={icons[tilang.kategori] || icons.DEFAULT}>
                                                        <Popup>
                                                            <div style={{ minWidth: '220px', fontFamily: 'sans-serif' }}>
                                                                <div className={`badge bg-${tilang.kategori === 'KIR' ? 'primary' : tilang.kategori === 'OVERDIMENSI' ? 'danger' : 'warning text-dark'} mb-2`}>
                                                                    {tilang.kategori}
                                                                </div>
                                                                <h6 className="fw-bold border-bottom pb-1 mb-2 text-dark">{tilang.nama}</h6>
                                                                <div className="mb-1 small"><strong>Area:</strong> {tilang.lokasi}</div>
                                                                <div className="mb-1 small"><strong>Kendaraan:</strong> {tilang.kendaraan} <span className="text-muted">({tilang.nopol})</span></div>
                                                                <div className="mb-1 small"><strong>Detail:</strong> {tilang.pelanggaran}</div>
                                                                <div className="mb-0 small"><strong>Pasal:</strong> {tilang.pasal}</div>
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                ))}
                                            </FeatureGroup>
                                        </LayersControl.Overlay>

                                        {/* Area Pengawasan 1 */}
                                        {area1Data?.features && (
                                            <LayersControl.Overlay checked name="Area Pengawasan 1">
                                                <GeoJSON
                                                    data={area1Data}
                                                    style={{ color: '#ef4444', weight: 4, opacity: 0.8 }}
                                                    pointToLayer={(feature, latlng) => {
                                                        return L.circleMarker(latlng, {
                                                            radius: 6,
                                                            fillColor: "#ef4444",
                                                            color: "#ffffff",
                                                            weight: 2,
                                                            opacity: 1,
                                                            fillOpacity: 1
                                                        });
                                                    }}
                                                    onEachFeature={(feature, layer) => {
                                                        if (feature.properties && feature.properties.name) {
                                                            layer.bindPopup(`<strong>Area Pengawasan 1:</strong><br/>${feature.properties.name}`);
                                                        }
                                                    }}
                                                />
                                            </LayersControl.Overlay>
                                        )}

                                        {/* Area Pengawasan 2 */}
                                        {area2Data?.features && (
                                            <LayersControl.Overlay checked name="Area Pengawasan 2">
                                                <GeoJSON
                                                    data={area2Data}
                                                    style={{ color: '#0d9488', weight: 4, opacity: 0.8 }}
                                                    pointToLayer={(feature, latlng) => {
                                                        return L.circleMarker(latlng, {
                                                            radius: 6,
                                                            fillColor: "#0d9488",
                                                            color: "#ffffff",
                                                            weight: 2,
                                                            opacity: 1,
                                                            fillOpacity: 1
                                                        });
                                                    }}
                                                    onEachFeature={(feature, layer) => {
                                                        if (feature.properties && feature.properties.name) {
                                                            layer.bindPopup(`<strong>Area Pengawasan 2:</strong><br/>${feature.properties.name}`);
                                                        }
                                                    }}
                                                />
                                            </LayersControl.Overlay>
                                        )}

                                    </LayersControl>
                                </MapContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="row pb-5">
                <div className="col-md-6 mb-4 mb-md-0">
                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                        <div className="card-header bg-white border-0 pt-3">
                            <h6 className="fw-bold mb-0 text-secondary">Komposisi Jenis Pelanggaran</h6>
                        </div>
                        <div className="card-body d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} fill="#8884d8" paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value} Kasus`, 'Jumlah']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (<span className="text-muted">Tidak ada data</span>)}
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                        <div className="card-header bg-white border-0 pt-3">
                            <h6 className="fw-bold mb-0 text-secondary">Top 5 Wilayah Rawan</h6>
                        </div>
                        <div className="card-body" style={{ height: '300px' }}>
                            {barData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (<span className="text-muted d-flex justify-content-center align-items-center h-100">Tidak ada data</span>)}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
