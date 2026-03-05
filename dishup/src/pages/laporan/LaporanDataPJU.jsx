import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

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

export default function LaporanDataPJU() {
    const [dataPJU, setDataPJU] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    // State Form
    const [formData, setFormData] = useState({
        id: null,
        nama: '',
        lokasi: '',
        kecamatan: '',
        status: 'aktif',
        tahun: new Date().getFullYear()
    });

    // State Map Picker (Default: Banjarmasin)
    const defaultCenter = { lat: -3.316694, lng: 114.590111 };
    const [mapPosition, setMapPosition] = useState(defaultCenter);

    const API_URL = 'http://localhost/DISHUP_S/dishup/api/pju.php';

    // Ambil Data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(API_URL);
            const json = await res.json();
            if (json.status === 'success') {
                setDataPJU(json.data);
            }
        } catch (error) {
            console.error("Gagal mengambil data PJU", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Modal
    const handleAdd = () => {
        setFormData({ id: null, nama: '', lokasi: '', kecamatan: '', status: 'aktif', tahun: new Date().getFullYear() });
        setMapPosition(defaultCenter);
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setFormData({
            id: item.id,
            nama: item.nama,
            lokasi: item.lokasi,
            kecamatan: item.kecamatan,
            status: item.status,
            tahun: item.tahun
        });
        setMapPosition({ lat: parseFloat(item.lat), lng: parseFloat(item.lng) });
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
            text: "Data PJU yang dihapus tidak dapat dikembalikan!",
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
        navigate('/print/laporan-pju');
    };

    // Status Badge Helper
    const getStatusBadge = (status) => {
        switch (status) {
            case 'aktif': return <span className="badge bg-success">Aktif</span>;
            case 'rusak': return <span className="badge bg-danger">Rusak</span>;
            case 'perbaikan': return <span className="badge bg-warning text-dark">Perbaikan</span>;
            default: return <span className="badge bg-secondary">{status}</span>;
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark"><i className="bi bi-lightbulb me-2"></i>Kelola Data PJU</h2>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-danger shadow-sm" onClick={exportPDF} disabled={dataPJU.length === 0}>
                        <i className="bi bi-file-earmark-pdf-fill me-2"></i>Cetak PDF
                    </button>
                    <button className="btn btn-primary shadow-sm" onClick={handleAdd}>
                        <i className="bi bi-plus-lg me-2"></i>Tambah PJU
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
                                        <th>Nama / Kode</th>
                                        <th>Lokasi</th>
                                        <th>Kecamatan</th>
                                        <th>Status</th>
                                        <th className="text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataPJU.length > 0 ? dataPJU.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="fw-bold">{index + 1}</td>
                                            <td>{item.nama}</td>
                                            <td>{item.lokasi}</td>
                                            <td>{item.kecamatan}</td>
                                            <td>{getStatusBadge(item.status)}</td>
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
                                            <td colSpan="6" className="text-center text-muted py-4">Data PJU masih kosong.</td>
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
                            <h5 className="modal-title fw-bold">{formData.id ? 'Edit Data PJU' : 'Tambah Data PJU Baru'}</h5>
                            <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Nama / Kode Tiang PJU</label>
                                        <input type="text" className="form-control" name="nama" value={formData.nama} onChange={handleChange} required placeholder="Contoh: PJU-A YANI-001" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Area / Kecamatan</label>
                                        <input type="text" className="form-control" name="kecamatan" value={formData.kecamatan} onChange={handleChange} required placeholder="Contoh: Banjarmasin Barat" />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label fw-semibold">Lokasi Jalan</label>
                                        <textarea className="form-control" name="lokasi" value={formData.lokasi} onChange={handleChange} rows="2" placeholder="Detail jalan/gang"></textarea>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Status Operasional</label>
                                        <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                            <option value="aktif">Aktif (Hijau)</option>
                                            <option value="rusak">Rusak (Merah)</option>
                                            <option value="perbaikan">Dalam Perbaikan (Kuning)</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Tahun Pasang/Data</label>
                                        <input type="number" className="form-control" name="tahun" value={formData.tahun} onChange={handleChange} />
                                    </div>
                                    <div className="col-12">
                                        <hr />
                                        <label className="form-label fw-semibold text-primary">Pin Titik Lokasi PJU</label>
                                        <p className="small text-muted mb-2">Klik area di peta atau geser (drag) pin biru ke lokasi yang tepat untuk mengisi otomatis latitude dan longitude.</p>

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
