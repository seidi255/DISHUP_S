import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Swal from 'sweetalert2';
import { Modal, Button, Form } from 'react-bootstrap';

// Custom divIcon untuk mengatasi bug print di Leaflet & marker interaktif
const createCustomIcon = () => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
            background-color: #dc3545;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.5);
            transform: translate(-50%, -50%);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
    });
};

// Komponen penangkap klik Map pada Modal Form
const LocationMarkerClick = ({ setFormData }) => {
    useMapEvents({
        async click(e) {
            const { lat, lng } = e.latlng;
            setFormData(prev => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }));

            // Reverse Geocoding via Nominatim
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`);
                const data = await response.json();
                if (data && data.address) {
                    const kecamatanRaw = data.address.county || data.address.city_district || '';
                    const kabupatenRaw = data.address.state_district || data.address.city || data.address.regency || '';
                    const wilayahRaw = data.address.village || data.address.suburb || data.address.town || '';

                    setFormData(prev => ({
                        ...prev,
                        kecamatan: prev.kecamatan || kecamatanRaw.replace('Kecamatan ', ''),
                        kabupaten: prev.kabupaten || kabupatenRaw,
                        wilayah: prev.wilayah || wilayahRaw
                    }));
                }
            } catch (err) {
                console.log("Geocode error", err);
            }
        }
    });
    return null;
};

export default function LaporanLokasiPrioritas() {
    const navigate = useNavigate();
    const [dataWilayah, setDataWilayah] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState([-3.0926, 115.2837]); // Kalsel center

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        wilayah: '',
        kecamatan: '',
        kabupaten: '',
        status_pju: 'Tidak Ada',
        tingkat_prioritas: 'Sedang',
        lat: '',
        lng: '',
        keterangan: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost/DISHUP_S/dishup/api/wilayah_prioritas.php');
            const result = await response.json();

            if (result.status === 'success' && result.data) {
                setDataWilayah(result.data);
                if (result.data.length > 0) {
                    setMapCenter([result.data[0].lat, result.data[0].lng]);
                }
            }
        } catch (error) {
            console.error("Gagal menarik data wilayah prioritas:", error);
            Swal.fire('Error', 'Gagal memuat data.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => navigate('/print/laporan-lokasi-prioritas');

    const handleShowAdd = () => {
        setIsEditing(false);
        setFormData({
            id: '', wilayah: '', kecamatan: '', kabupaten: '',
            status_pju: 'Tidak Ada', tingkat_prioritas: 'Sedang', lat: '', lng: '', keterangan: ''
        });
        setShowModal(true);
    };

    const handleShowEdit = (item) => {
        setIsEditing(true);
        setFormData(item);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Data?',
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost/DISHUP_S/dishup/api/wilayah_prioritas.php?id=${id}`, {
                    method: 'DELETE'
                });
                const resData = await response.json();

                if (resData.status === 'success') {
                    Swal.fire('Terhapus!', 'Data berhasil dihapus.', 'success');
                    fetchData();
                } else {
                    Swal.fire('Error!', resData.message || 'Gagal menghapus data', 'error');
                }
            } catch (error) {
                Swal.fire('Error!', 'Terjadi kesalahan jaringan', 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch('http://localhost/DISHUP_S/dishup/api/wilayah_prioritas.php', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const result = await response.json();

            if (result.status === 'success') {
                Swal.fire('Berhasil!', result.message, 'success');
                setShowModal(false);
                fetchData();
            } else {
                Swal.fire('Gagal!', result.message || 'Gagal menyimpan data.', 'error');
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            Swal.fire('Error!', 'Terjadi kesalahan teknis.', 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Lokasi Prioritas (Tanpa PJU)</h2>
                    <p className="text-muted mb-0">Pemetaan wilayah tertinggal tanpa Penerangan Jalan Umum yang menjadi prioritas pembangunan.</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-success shadow px-3 py-2 rounded-3" onClick={handleShowAdd}>
                        <i className="bi bi-plus-lg me-2"></i>Tambah Data
                    </button>
                    <button className="btn btn-primary shadow px-4 py-2 rounded-3" onClick={handlePrint} disabled={isLoading}>
                        <i className="bi bi-printer-fill me-2"></i>Cetak Laporan
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <>
                    {/* BAGIAN MAP */}
                    <div className="card shadow-sm border-0 rounded-4 mb-4">
                        <div className="card-header bg-white border-0 pt-4 pb-2">
                            <h5 className="fw-bold mb-0">
                                <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                                Peta Sebaran Wilayah Tanpa PJU
                            </h5>
                        </div>
                        <div className="card-body p-0" style={{ height: '400px', overflow: 'hidden' }}>
                            <MapContainer
                                center={mapCenter}
                                zoom={8}
                                style={{ height: '100%', width: '100%', borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem' }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {dataWilayah.map((lokasi) => (
                                    <Marker
                                        key={lokasi.id}
                                        position={[lokasi.lat || 0, lokasi.lng || 0]}
                                        icon={createCustomIcon()}
                                    >
                                        <Popup>
                                            <div style={{ minWidth: '200px' }}>
                                                <h6 className="fw-bold mb-1">{lokasi.wilayah}</h6>
                                                <p className="text-muted small mb-2">{lokasi.kecamatan}, {lokasi.kabupaten}</p>
                                                <span className="badge bg-danger mb-2">PJU: {lokasi.status_pju}</span>
                                                <p className="small mb-0">{lokasi.keterangan}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>

                    {/* BAGIAN TABEL */}
                    <div className="card shadow-sm border-0 rounded-4">
                        <div className="card-header bg-white border-0 pt-4 d-flex justify-content-between align-items-center">
                            <h5 className="fw-bold mb-0">Daftar Wilayah Prioritas</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="px-4 py-3" style={{ width: '5%' }}>No</th>
                                            <th className="py-3" style={{ width: '20%' }}>Wilayah / Desa</th>
                                            <th className="py-3" style={{ width: '15%' }}>Kecamatan</th>
                                            <th className="py-3" style={{ width: '20%' }}>Kabupaten</th>
                                            <th className="py-3 text-center" style={{ width: '10%' }}>Status PJU</th>
                                            <th className="py-3 text-center" style={{ width: '15%' }}>Prioritas</th>
                                            <th className="py-3 text-center" style={{ width: '15%' }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataWilayah.length > 0 ? (
                                            dataWilayah.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 text-secondary">{index + 1}</td>
                                                    <td className="fw-semibold">{item.wilayah}</td>
                                                    <td>{item.kecamatan}</td>
                                                    <td>{item.kabupaten}</td>
                                                    <td className="text-center">
                                                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1 rounded-pill">
                                                            {item.status_pju}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <span className={`badge px-3 py-1 rounded-pill ${item.tingkat_prioritas === 'Tinggi' ? 'bg-danger' : (item.tingkat_prioritas === 'Rendah' ? 'bg-info' : 'bg-warning text-dark')}`}>
                                                            {item.tingkat_prioritas}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <button className="btn btn-sm btn-outline-primary me-2 rounded-3" onClick={() => handleShowEdit(item)}>
                                                            <i className="bi bi-pencil-square"></i>
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-danger rounded-3" onClick={() => handleDelete(item.id)}>
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center py-5 text-muted">
                                                    Tidak ada data wilayah tertinggal yang ditemukan.
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

            {/* MODAL FORM CRUD */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">{isEditing ? 'Edit Data Prioritas' : 'Tambah Data Prioritas'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <div className="row g-3">

                            {/* Peta Interaktif dalam Modal */}
                            <div className="col-12 mb-2">
                                <label className="form-label fw-bold">Penentuan Titik Lokasi Peta</label>
                                <div className="border rounded" style={{ height: '300px', width: '100%', overflow: 'hidden' }}>
                                    <MapContainer
                                        center={[-3.0926, 115.2837]}
                                        zoom={7}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <LocationMarkerClick setFormData={setFormData} />
                                        {(formData.lat && formData.lng) && (
                                            <Marker position={[formData.lat, formData.lng]} icon={createCustomIcon()} />
                                        )}
                                    </MapContainer>
                                </div>
                                <small className="text-muted d-block mt-1">
                                    <i className="bi bi-info-circle me-1"></i> Klik pada peta untuk langsung mengisi Latitude, Longitude, Kecamatan, dan Kabupaten secara otomatis.
                                </small>
                            </div>

                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Latitude (Otomatis/Manual)</Form.Label>
                                    <Form.Control type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} placeholder="-3.xxxx" required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Longitude (Otomatis/Manual)</Form.Label>
                                    <Form.Control type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} placeholder="115.xxxx" required />
                                </Form.Group>
                            </div>

                            <div className="col-md-12">
                                <Form.Group>
                                    <Form.Label>Nama Wilayah / Desa <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="wilayah" value={formData.wilayah} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Kecamatan <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="kecamatan" value={formData.kecamatan} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Kabupaten/Kota <span className="text-danger">*</span></Form.Label>
                                    <Form.Control type="text" name="kabupaten" value={formData.kabupaten} onChange={handleChange} required />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Status PJU</Form.Label>
                                    <Form.Select name="status_pju" value={formData.status_pju} onChange={handleChange}>
                                        <option value="Tidak Ada">Tidak Ada</option>
                                        <option value="Minim">Minim</option>
                                        <option value="Rusak Total">Rusak Total</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label>Tingkat Prioritas</Form.Label>
                                    <Form.Select name="tingkat_prioritas" value={formData.tingkat_prioritas} onChange={handleChange}>
                                        <option value="Tinggi">Tinggi</option>
                                        <option value="Sedang">Sedang</option>
                                        <option value="Rendah">Rendah</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-12">
                                <Form.Group>
                                    <Form.Label>Keterangan Tambahan</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="keterangan" value={formData.keterangan} onChange={handleChange} />
                                </Form.Group>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="secondary" onClick={() => setShowModal(false)} className="rounded-pill px-4">Batal</Button>
                        <Button variant="primary" type="submit" className="rounded-pill px-4">
                            {isEditing ? 'Simpan Perubahan' : 'Tambah Data'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}
