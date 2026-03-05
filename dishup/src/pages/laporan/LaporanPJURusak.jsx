import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

function MapPicker({ position, setPosition }) {
    const markerRef = useRef(null);
    useMapEvents({
        click(e) { setPosition(e.latlng); },
    });
    return (
        <Marker draggable={true} eventHandlers={{ dragend: () => setPosition(markerRef.current.getLatLng()) }} position={position} ref={markerRef} />
    );
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981']; // Red, Yellow, Green for status

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

const pjuIcons = {
    Rusak: createMarkerIcon('red'),
    Proses: createMarkerIcon('orange'),
    Selesai: createMarkerIcon('green'),
    DEFAULT: createMarkerIcon('grey')
};

export default function LaporanPJURusak() {
    const [dataPju, setDataPju] = useState([]);
    const [summary, setSummary] = useState({ total: 0, rusak: 0, proses: 0, selesai: 0 });
    const [wilayahChart, setWilayahChart] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id: null,
        lokasi: '',
        wilayah: '',
        jenis_kerusakan: '',
        tanggal_laporan: new Date().toISOString().split('T')[0],
        tanggal_perbaikan: '',
        status: 'Rusak',
        petugas: '',
        keterangan: ''
    });

    const defaultCenter = { lat: -3.316694, lng: 114.590111 };
    const [mapPosition, setMapPosition] = useState(defaultCenter);

    const API_URL = 'http://localhost/DISHUP_S/dishup/api/pju_rusak.php';

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Get Summary Data
            const resSum = await fetch(`${API_URL}?summary=true`);
            const jsonSum = await resSum.json();
            if (jsonSum.status === 'success') {
                setSummary(jsonSum.data.summary);
                setWilayahChart(jsonSum.data.wilayahChart);
            }

            // Get Table Data
            const res = await fetch(API_URL);
            const json = await res.json();
            if (json.status === 'success') {
                setDataPju(json.data);
            }
        } catch (error) {
            console.error("Gagal mengambil data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAdd = () => {
        setFormData({
            id: null, lokasi: '', wilayah: '', jenis_kerusakan: '', tanggal_laporan: new Date().toISOString().split('T')[0],
            tanggal_perbaikan: '', status: 'Rusak', petugas: '', keterangan: ''
        });
        setMapPosition(defaultCenter);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setFormData({
            id: item.id,
            lokasi: item.lokasi,
            wilayah: item.wilayah,
            jenis_kerusakan: item.jenis_kerusakan,
            tanggal_laporan: item.tanggal_laporan,
            tanggal_perbaikan: item.tanggal_perbaikan || '',
            status: item.status,
            petugas: item.petugas || '',
            keterangan: item.keterangan || ''
        });
        setMapPosition({ lat: parseFloat(item.lat || defaultCenter.lat), lng: parseFloat(item.lng || defaultCenter.lng) });
        setShowModal(true);
    };

    const handleViewDetail = (item) => {
        setDetailData(item);
        setShowDetailModal(true);
    };

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = { ...formData, lat: mapPosition.lat, lng: mapPosition.lng };
        const method = formData.id ? 'PUT' : 'POST';

        try {
            const res = await fetch(API_URL, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.status === 'success') {
                Swal.fire('Berhasil!', json.message, 'success');
                setShowModal(false);
                fetchData();
            } else {
                Swal.fire('Error', json.message, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal menyimpan data', 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'Hapus data?', text: "Data tidak dapat dikembalikan!", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Ya, hapus!'
        });
        if (confirm.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
                const json = await res.json();
                if (json.status === 'success') {
                    Swal.fire('Terhapus!', json.message, 'success');
                    fetchData();
                }
            } catch (error) { Swal.fire('Error', 'Gagal menghapus data', 'error'); }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Rusak': return <span className="badge bg-danger">Rusak</span>;
            case 'Proses': return <span className="badge bg-warning text-dark">Dalam Proses</span>;
            case 'Selesai': return <span className="badge bg-success">Selesai</span>;
            default: return <span className="badge bg-secondary">{status}</span>;
        }
    };

    const pieData = [
        { name: 'Rusak', value: parseInt(summary.rusak) },
        { name: 'Proses', value: parseInt(summary.proses) },
        { name: 'Selesai', value: parseInt(summary.selesai) }
    ].filter(d => d.value > 0);

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1"><i className="bi bi-tools me-2 text-primary"></i>Manajemen PJU Rusak</h2>
                    <p className="text-muted mb-0">Pemantauan dan penanganan kerusakan Lampu Penerangan Jalan Umum.</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-danger shadow-sm" onClick={() => navigate('/print/laporan-pju-rusak')} disabled={dataPju.length === 0}>
                        <i className="bi bi-file-earmark-pdf-fill me-2"></i>Cetak PDF
                    </button>
                    <button className="btn btn-primary shadow-sm" onClick={handleAdd}>
                        <i className="bi bi-plus-lg me-2"></i>Tambah Data
                    </button>
                </div>
            </div>

            {/* 1. Summary Cards */}
            <div className="row g-3 mb-4">
                {[
                    { title: "Total Laporan", val: summary.total, color: "primary", icon: "bi-clipboard-data" },
                    { title: "Selesai Diperbaiki", val: summary.selesai, color: "success", icon: "bi-check-circle" },
                    { title: "Dalam Proses", val: summary.proses, color: "warning", icon: "bi-arrow-repeat" },
                    { title: "Belum Ditangani", val: summary.rusak, color: "danger", icon: "bi-exclamation-triangle" }
                ].map((stat, idx) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="col-md-3 col-6" key={idx}>
                        <div className={`card shadow-sm border-0 border-start border-4 border-${stat.color} h-100 bg-white`}>
                            <div className="card-body d-flex align-items-center">
                                <div className={`flex-shrink-0 text-${stat.color} bg-${stat.color} bg-opacity-10 p-3 rounded-circle me-3`}>
                                    <i className={`bi ${stat.icon} fs-4`}></i>
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1 small text-uppercase fw-bold">{stat.title}</h6>
                                    <h4 className="mb-0 fw-bold text-dark"><CountUp end={stat.val} /></h4>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* 5. Charts */}
            <div className="row mb-4">
                <div className="col-md-5 mb-4 mb-md-0">
                    <div className="card shadow-sm border-0 h-100 rounded-4">
                        <div className="card-header bg-white border-0 pt-3 pb-0"><h6 className="fw-bold text-secondary">Status Penanganan</h6></div>
                        <div className="card-body" style={{ height: '280px' }}>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <div className="d-flex h-100 justify-content-center align-items-center text-muted">Belum ada data</div>}
                        </div>
                    </div>
                </div>
                <div className="col-md-7">
                    <div className="card shadow-sm border-0 h-100 rounded-4">
                        <div className="card-header bg-white border-0 pt-3 pb-0"><h6 className="fw-bold text-secondary">Kerusakan per Wilayah</h6></div>
                        <div className="card-body" style={{ height: '280px' }}>
                            {wilayahChart.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={wilayahChart} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="wilayah" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip cursor={{ fill: '#f8f9fa' }} />
                                        <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} name="Jumlah PJU" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <div className="d-flex h-100 justify-content-center align-items-center text-muted">Belum ada data</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. CRUD Table */}
            <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body p-0">
                    {isLoading ? (
                        <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">No</th>
                                        <th>Lokasi</th>
                                        <th>Wilayah</th>
                                        <th>Jenis Kerusakan</th>
                                        <th>Tgl Laporan</th>
                                        <th>Status</th>
                                        <th className="text-center pe-4">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataPju.length > 0 ? dataPju.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="ps-4 fw-bold">{index + 1}</td>
                                            <td>{item.lokasi}</td>
                                            <td>{item.wilayah}</td>
                                            <td>{item.jenis_kerusakan}</td>
                                            <td>{item.tanggal_laporan}</td>
                                            <td>{getStatusBadge(item.status)}</td>
                                            <td className="text-center pe-4">
                                                <button className="btn btn-sm btn-light text-primary me-2 border" onClick={() => handleViewDetail(item)} title="Detail">
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                                <button className="btn btn-sm btn-light text-info me-2 border" onClick={() => handleEdit(item)} title="Edit">
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button className="btn btn-sm btn-light text-danger border" onClick={() => handleDelete(item.id)} title="Hapus">
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="7" className="text-center text-muted py-4">Data PJU Rusak masih kosong.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Form Modal (Add/Edit) */}
            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'transparent', zIndex: 1050 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-4">
                        <div className="modal-header bg-light border-0 rounded-top-4">
                            <h5 className="modal-title fw-bold">{formData.id ? 'Update Status / Edit Data' : 'Tambah Laporan PJU Rusak'}</h5>
                            <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body p-4">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Lokasi <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" name="lokasi" value={formData.lokasi} onChange={handleChange} required placeholder="Contoh: Jl. Ahmad Yani Km 34" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Wilayah <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" name="wilayah" value={formData.wilayah} onChange={handleChange} required placeholder="Contoh: Banjarbaru" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Jenis Kerusakan <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" name="jenis_kerusakan" value={formData.jenis_kerusakan} onChange={handleChange} required placeholder="Lampu Mati, Tiang Miring, dll" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Status Penanganan</label>
                                        <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                            <option value="Rusak">Rusak (Belum Ditangani)</option>
                                            <option value="Proses">Dalam Proses</option>
                                            <option value="Selesai">Selesai Diperbaiki</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Tanggal Laporan <span className="text-danger">*</span></label>
                                        <input type="date" className="form-control" name="tanggal_laporan" value={formData.tanggal_laporan} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Tanggal Perbaikan</label>
                                        <input type="date" className="form-control" name="tanggal_perbaikan" value={formData.tanggal_perbaikan} onChange={handleChange} disabled={formData.status === 'Rusak'} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Petugas Penanganan</label>
                                        <input type="text" className="form-control" name="petugas" value={formData.petugas} onChange={handleChange} placeholder="Nama Petugas atau Tim" disabled={formData.status === 'Rusak'} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Keterangan / Deskripsi</label>
                                        <textarea className="form-control" name="keterangan" value={formData.keterangan} onChange={handleChange} rows="2"></textarea>
                                    </div>
                                    <div className="col-12 mt-4">
                                        <label className="form-label fw-semibold text-primary"><i className="bi bi-geo-alt me-2"></i>Pin Titik PJU</label>
                                        <div style={{ height: '250px', width: '100%', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                                            {showModal && (
                                                <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '8px' }}>
                                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                                                    {/* Existing PJU Markers */}
                                                    {dataPju.filter(d => d.lat && d.lng).map((pju) => (
                                                        <Marker
                                                            key={`existing-${pju.id}`}
                                                            position={[parseFloat(pju.lat), parseFloat(pju.lng)]}
                                                            icon={pjuIcons[pju.status] || pjuIcons.DEFAULT}
                                                            eventHandlers={{
                                                                click: () => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        lokasi: pju.lokasi,
                                                                        wilayah: pju.wilayah
                                                                    }));
                                                                    setMapPosition({ lat: parseFloat(pju.lat), lng: parseFloat(pju.lng) });
                                                                }
                                                            }}
                                                        >
                                                        </Marker>
                                                    ))}

                                                    <MapPicker position={mapPosition} setPosition={setMapPosition} />
                                                </MapContainer>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 bg-light rounded-bottom-4">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary px-4"><i className="bi bi-save me-2"></i>Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* 4. Detail Modal */}
            <div className={`modal fade ${showDetailModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showDetailModal ? 'rgba(0,0,0,0.5)' : 'transparent', zIndex: 1050 }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow rounded-4">
                        <div className="modal-header bg-primary text-white border-0 rounded-top-4">
                            <h5 className="modal-title fw-bold"><i className="bi bi-info-circle me-2"></i>Detail Penanganan</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={() => setShowDetailModal(false)}></button>
                        </div>
                        <div className="modal-body p-4">
                            {detailData && (
                                <div>
                                    <div className="mb-3 d-flex justify-content-between align-items-center border-bottom pb-2">
                                        <span className="fw-semibold text-muted">Status Saat Ini</span>
                                        <span className="fs-5">{getStatusBadge(detailData.status)}</span>
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted d-block">Lokasi PJU</small>
                                        <strong>{detailData.lokasi} <span className="text-secondary fw-normal">({detailData.wilayah})</span></strong>
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted d-block">Jenis Kerusakan</small>
                                        <span className="text-danger fw-bold">{detailData.jenis_kerusakan}</span>
                                    </div>
                                    <div className="row mb-3">
                                        <div className="col-6">
                                            <small className="text-muted d-block">Tanggal Dilaporkan</small>
                                            <strong>{detailData.tanggal_laporan}</strong>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Tanggal Diperbaiki</small>
                                            <strong>{detailData.tanggal_perbaikan || '-'}</strong>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted d-block">Petugas Penanganan</small>
                                        <strong>{detailData.petugas || 'Belum ditugaskan'}</strong>
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted d-block">Keterangan Tambahan</small>
                                        <p className="mb-0 bg-light p-2 rounded border border-light">{detailData.keterangan || 'Tidak ada catatan'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-primary" onClick={() => setShowDetailModal(false)}>Tutup</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
