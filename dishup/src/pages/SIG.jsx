import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

// Custom icons for different statuses
const createCustomIcon = (color) => {
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
    aktif: createCustomIcon('green'),
    perbaikan: createCustomIcon('yellow'),
    rusak: createCustomIcon('red')
};

// Data from User Map (imported via JSON above)

export default function SIG() {
    const [pjuData, setPjuData] = useState([]);
    const [selectedKecamatan, setSelectedKecamatan] = useState('Semua');

    useEffect(() => {
        fetch('http://localhost/DISHUP_S/dishup/api/pju.php')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setPjuData(data.data);
                }
            })
            .catch(err => console.error("Gagal load data PJU", err));
    }, []);

    const kecamatans = ['Semua', ...new Set(pjuData.map(item => item.kecamatan))];

    // Filter Data
    const filteredData = useMemo(() => {
        if (selectedKecamatan === 'Semua') return pjuData;
        return pjuData.filter(item => item.kecamatan === selectedKecamatan);
    }, [selectedKecamatan, pjuData]);

    // Statistik Data
    const stats = useMemo(() => {
        return {
            total: filteredData.length,
            aktif: filteredData.filter(item => item.status === 'aktif').length,
            perbaikan: filteredData.filter(item => item.status === 'perbaikan').length,
            rusak: filteredData.filter(item => item.status === 'rusak').length,
        };
    }, [filteredData]);

    // Tentukan Map Center berdasarakan data yang difilter agar dinamis (opsional)
    const mapCenter = filteredData.length > 0
        ? [filteredData[0].lat, filteredData[0].lng]
        : [-6.200000, 106.816666];

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-12">
                    <h2 className="fw-bold text-primary border-bottom pb-2">
                        <i className="bi bi-map me-2"></i>Sistem Informasi Geografis (SIG)
                    </h2>
                    <p className="text-muted">Peta interaktif sebaran dan status Penerangan Jalan Umum (PJU).</p>
                </div>
            </div>

            {/* Statistik Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-3 col-6">
                    <div className="card shadow-sm border-0 border-start border-4 border-primary">
                        <div className="card-body py-3">
                            <h6 className="text-muted mb-1">Total PJU</h6>
                            <h3 className="mb-0 fw-bold">{stats.total}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card shadow-sm border-0 border-start border-4 border-success">
                        <div className="card-body py-3">
                            <h6 className="text-muted mb-1">Aktif</h6>
                            <h3 className="mb-0 fw-bold text-success">{stats.aktif}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card shadow-sm border-0 border-start border-4 border-warning">
                        <div className="card-body py-3">
                            <h6 className="text-muted mb-1">Perlu Perbaikan</h6>
                            <h3 className="mb-0 fw-bold text-warning">{stats.perbaikan}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <div className="card shadow-sm border-0 border-start border-4 border-danger">
                        <div className="card-body py-3">
                            <h6 className="text-muted mb-1">Rusak</h6>
                            <h3 className="mb-0 fw-bold text-danger">{stats.rusak}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                {/* Filter Section */}
                <div className="col-md-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-body">
                            <label htmlFor="filterKecamatan" className="form-label fw-semibold">
                                Saring Berdasarkan Wilayah
                            </label>
                            <select
                                id="filterKecamatan"
                                className="form-select"
                                value={selectedKecamatan}
                                onChange={(e) => setSelectedKecamatan(e.target.value)}
                            >
                                {kecamatans.map((kec, idx) => (
                                    <option key={idx} value={kec}>{kec}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Peta Interaktif Leaflet */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white pb-0 border-0">
                            <h5 className="card-title fw-semibold mb-0">Peta Sebaran PJU</h5>
                        </div>
                        <div className="card-body p-3">
                            <div style={{ height: '550px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
                                <MapContainer
                                    center={mapCenter}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                    key={selectedKecamatan} // Re-mount map when center changes heavily (simple trick)
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />

                                    {filteredData.map((pju) => (
                                        <Marker
                                            key={pju.id}
                                            position={[pju.lat, pju.lng]}
                                            icon={icons[pju.status] || icons.aktif}
                                        >
                                            <Popup>
                                                <div style={{ minWidth: '180px' }}>
                                                    <h6 className="fw-bold border-bottom pb-2 mb-2">Detail PJU</h6>
                                                    <div className="mb-1"><strong>ID/Nama:</strong> {pju.nama}</div>
                                                    <div className="mb-1"><strong>Lokasi:</strong> {pju.lokasi}</div>
                                                    <div className="mb-1"><strong>Kecamatan:</strong> {pju.kecamatan}</div>
                                                    <div className="mb-1"><strong>Tahun:</strong> {pju.tahun}</div>
                                                    <div>
                                                        <strong>Status: </strong>
                                                        <span className={`badge bg-${pju.status === 'aktif' ? 'success' :
                                                            pju.status === 'perbaikan' ? 'warning text-dark' : 'danger'
                                                            }`}>
                                                            {pju.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                            <div className="mt-3 d-flex gap-3 justify-content-center text-muted small">
                                <span className="d-flex align-items-center"><img src={icons.aktif.options.iconUrl} alt="aktif" width="16" className="me-1" /> Aktif</span>
                                <span className="d-flex align-items-center"><img src={icons.perbaikan.options.iconUrl} alt="perbaikan" width="16" className="me-1" /> Perlu Perbaikan</span>
                                <span className="d-flex align-items-center"><img src={icons.rusak.options.iconUrl} alt="rusak" width="16" className="me-1" /> Rusak</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
