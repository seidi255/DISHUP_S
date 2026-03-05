import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet's default icon issue in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

// Komponen Pembantu: Map Picker
function MapPicker({ position, setPosition }) {
    const markerRef = useRef(null);

    // Tangkap klik di peta untuk memindah marker
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    const handleDragEnd = () => {
        const marker = markerRef.current;
        if (marker != null) {
            setPosition(marker.getLatLng());
        }
    };

    return (
        <Marker
            draggable={true}
            eventHandlers={{
                dragend: handleDragEnd,
            }}
            position={position}
            ref={markerRef}
        />
    );
}

export default function LaporanDataTilang() {
    const [dataTilang, setDataTilang] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    // State Form
    const [formData, setFormData] = useState({
        id: null,
        lokasi: '',
        wilayah: '',
        jenis_pelanggaran: '',
        tanggal: new Date().toISOString().split('T')[0],
        keterangan: ''
    });

    // State Map Picker (Default: Banjarmasin)
    const defaultCenter = { lat: -3.316694, lng: 114.590111 };
    const [mapPosition, setMapPosition] = useState(defaultCenter);

    const API_URL = 'http://localhost/DISHUP_S/dishup/api/tilang.php';

    // Ambil Data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(API_URL);
            const json = await res.json();
            if (json.status === 'success') {
                setDataTilang(json.data);
            }
        } catch (error) {
            console.error("Gagal mengambil data Tilang", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Modal
    const handleAdd = () => {
        setFormData({
            id: null,
            lokasi: '',
            wilayah: '',
            jenis_pelanggaran: '',
            tanggal: new Date().toISOString().split('T')[0],
            keterangan: ''
        });
        setMapPosition(defaultCenter);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setFormData({
            id: item.id,
            lokasi: item.lokasi,
            wilayah: item.wilayah,
            jenis_pelanggaran: item.jenis_pelanggaran,
            tanggal: item.tanggal,
            keterangan: item.keterangan || ''
        });
        setMapPosition({ lat: parseFloat(item.lat || defaultCenter.lat), lng: parseFloat(item.lng || defaultCenter.lng) });
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    // Form Update
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Save Data (Create / Update)
    const handleSave = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            lat: mapPosition.lat,
            lng: mapPosition.lng
        };

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

    // Delete Data
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        });

        if (confirm.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}?id=${id}`, {
                    method: 'DELETE'
                });
                const json = await res.json();

                if (json.status === 'success') {
                    Swal.fire('Terhapus!', json.message, 'success');
                    fetchData();
                } else {
                    Swal.fire('Error', json.message, 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Gagal menghapus data', 'error');
            }
        }
    };

    // Navigasi Print PDF
    const exportPDF = () => {
        navigate('/print/laporan-tilang');
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark"><i className="bi bi-shield-exclamation me-2"></i>Kelola Data Tilang</h2>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-danger shadow-sm" onClick={exportPDF} disabled={dataTilang.length === 0}>
                        <i className="bi bi-file-earmark-pdf-fill me-2"></i>Cetak PDF
                    </button>
                    <button className="btn btn-primary shadow-sm" onClick={handleAdd}>
                        <i className="bi bi-plus-lg me-2"></i>Tambah Data
                    </button>
                </div>
            </div>

            <div className="card shadow-sm border-0" style={{ borderRadius: '12px' }}>
                <div className="card-body">
                    {isLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Lokasi</th>
                                        <th>Wilayah</th>
                                        <th>Jenis Pelanggaran</th>
                                        <th>Tanggal</th>
                                        <th className="text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataTilang.length > 0 ? dataTilang.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="fw-bold">{index + 1}</td>
                                            <td>{item.lokasi}</td>
                                            <td>{item.wilayah}</td>
                                            <td>{item.jenis_pelanggaran}</td>
                                            <td>{item.tanggal}</td>
                                            <td className="text-center">
                                                <button className="btn btn-sm btn-outline-info me-2 my-1" onClick={() => handleEdit(item)}>
                                                    <i className="bi bi-pencil"></i> Edit
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger my-1" onClick={() => handleDelete(item.id)}>
                                                    <i className="bi bi-trash"></i> Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted py-4">Data Tilang masih kosong.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Bootstrap Modal Form */}
            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'transparent', zIndex: 1050 }}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 shadow" style={{ borderRadius: '12px' }}>
                        <div className="modal-header bg-light border-0">
                            <h5 className="modal-title fw-bold">{formData.id ? 'Edit Data Tilang' : 'Tambah Data Tilang Baru'}</h5>
                            <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Lokasi Pelanggaran</label>
                                        <input type="text" className="form-control" name="lokasi" value={formData.lokasi} onChange={handleChange} required placeholder="Contoh: Jl. Ahmad Yani Km 5" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Wilayah</label>
                                        <input type="text" className="form-control" name="wilayah" value={formData.wilayah} onChange={handleChange} required placeholder="Contoh: Banjarmasin Timur" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Jenis Pelanggaran</label>
                                        <input type="text" className="form-control" name="jenis_pelanggaran" value={formData.jenis_pelanggaran} onChange={handleChange} required placeholder="Contoh: Parkir Sembarangan" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Tanggal</label>
                                        <input type="date" className="form-control" name="tanggal" value={formData.tanggal} onChange={handleChange} required />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Keterangan (Opsional)</label>
                                        <textarea className="form-control" name="keterangan" value={formData.keterangan} onChange={handleChange} rows="2" placeholder="Catatan tambahan..."></textarea>
                                    </div>
                                    <div className="col-12">
                                        <hr />
                                        <label className="form-label fw-semibold text-primary">Pin Titik Lokasi Peta</label>
                                        <p className="small text-muted mb-2">Klik area di peta atau geser (drag) pin biru ke lokasi pelanggaran.</p>

                                        {/* Leaflet Map Picker */}
                                        <div style={{ height: '250px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ced4da', marginBottom: '15px' }}>
                                            {showModal && (
                                                <MapContainer center={mapPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                                                    <MapPicker position={mapPosition} setPosition={setMapPosition} />
                                                </MapContainer>
                                            )}
                                        </div>

                                        <div className="row g-2">
                                            <div className="col-6">
                                                <div className="input-group input-group-sm">
                                                    <span className="input-group-text">Lat</span>
                                                    <input type="text" className="form-control" value={mapPosition.lat} readOnly />
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="input-group input-group-sm">
                                                    <span className="input-group-text">Lng</span>
                                                    <input type="text" className="form-control" value={mapPosition.lng} readOnly />
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Batal</button>
                                <button type="submit" className="btn btn-primary px-4"><i className="bi bi-save me-2"></i>Simpan Data</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
}
