import React, { useEffect, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import KopSurat from "./KopSurat";

// Custom divIcon untuk mengatasi bug print di Leaflet
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
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
};

export default function PrintLaporanLokasiPrioritas() {
    const [dataWilayah, setDataWilayah] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mapCenter, setMapCenter] = useState([-3.0926, 115.2837]);

    useEffect(() => {
        const fetchData = async () => {
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
                console.error("Gagal menarik data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        // Wait for map to load fully before enabling print preview
        setTimeout(() => window.dispatchEvent(new Event('resize')), 1000);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const currentDateInfo = new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <div className="p-4 print-container" style={{ backgroundColor: "#fff", minHeight: "100vh", color: '#000' }}>
            {/* ================= TOMBOL (TIDAK IKUT PRINT) ================= */}
            <div className="d-flex justify-content-end align-items-center mb-4 gap-2 no-print">
                <Button variant="secondary" onClick={() => window.history.back()}>
                    Kembali
                </Button>
                <Button variant="primary" onClick={handlePrint} disabled={isLoading}>
                    🖨️ Cetak Laporan PDF
                </Button>
            </div>

            {/* ================= AREA YANG DICETAK ================= */}
            <div className="print-area">
                <KopSurat />

                {isLoading ? (
                    <div className="text-center my-5">
                        <Spinner animation="border" variant="danger" />
                        <p className="mt-2 text-muted">Memuat dokumen cetak...</p>
                    </div>
                ) : (
                    <div className="document-body mt-4" style={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt', lineHeight: '1.5' }}>

                        {/* 1. Judul Laporan */}
                        <div className="text-center mb-4">
                            <h5 className="fw-bold mb-1" style={{ textDecoration: 'underline' }}>
                                LAPORAN ANALISIS LOKASI PRIORITAS PENAMBAHAN
                                <br />PENERANGAN JALAN UMUM (PJU)
                            </h5>
                        </div>

                        <p className="mb-4 text-justify" style={{ textAlign: 'justify' }}>
                            Laporan ini menyajikan analisis lokasi yang menjadi prioritas penambahan Penerangan Jalan Umum (PJU) berdasarkan data wilayah yang belum memiliki fasilitas penerangan jalan. Analisis difokuskan pada wilayah tertinggal di Kalimantan Selatan guna mendukung peningkatan keselamatan lalu lintas dan aksesibilitas masyarakat.
                        </p>

                        {/* 2. Informasi Laporan */}
                        <div className="mb-4">
                            <h6 className="fw-bold">A. Informasi Laporan</h6>
                            <Table size="sm" bordered style={{ width: '60%', borderColor: '#000' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '40%', fontWeight: 'bold' }}>Tanggal Laporan</td>
                                        <td>{currentDateInfo}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>Wilayah Analisis</td>
                                        <td>Kalimantan Selatan</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>Sumber Data</td>
                                        <td>Data Infrastruktur PJU DISHUP</td>
                                    </tr>
                                    <tr>
                                        <td style={{ fontWeight: 'bold' }}>Metode Analisis</td>
                                        <td>Analisis Spasial Infrastruktur</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>

                        {/* 3. Peta Wilayah Prioritas (Dihapus sesuai permintaan) */}
                        <div className="mb-4 page-break-avoid">
                            <h6 className="fw-bold">B. Peta Wilayah Prioritas</h6>
                            <p className="mb-2" style={{ textAlign: 'justify' }}>
                                (Bagian visual peta dihilangkan dari cetakan fisik. Detail wilayah yang menjadi fokus tercantum pada tabel prioritas di bawah ini).
                            </p>
                        </div>

                        {/* 4. Tabel Wilayah Prioritas PJU */}
                        <div className="mb-4 page-break-avoid">
                            <h6 className="fw-bold">C. Tabel Wilayah Prioritas PJU</h6>
                            <Table bordered className="mt-2" style={{ fontSize: '11pt', borderColor: '#000' }}>
                                <thead className="text-center" style={{ backgroundColor: '#f0f0f0' }}>
                                    <tr>
                                        <th style={{ width: '5%' }}>No</th>
                                        <th style={{ width: '30%' }}>Wilayah</th>
                                        <th style={{ width: '25%' }}>Kecamatan</th>
                                        <th style={{ width: '20%' }}>Status PJU</th>
                                        <th style={{ width: '20%' }}>Tingkat Prioritas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dataWilayah.length > 0 ? (
                                        dataWilayah.map((item, index) => (
                                            <tr key={item.id}>
                                                <td className="text-center">{index + 1}</td>
                                                <td>{item.wilayah}</td>
                                                <td>{item.kecamatan}</td>
                                                <td className="text-center text-danger fw-bold">{item.status_pju}</td>
                                                <td className="text-center fw-bold">{item.tingkat_prioritas}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4">Tidak ada data wilayah tertinggal.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>

                        {/* 5. Analisis Wilayah Tanpa PJU */}
                        <div className="mb-4 page-break-avoid">
                            <h6 className="fw-bold">D. Analisis Wilayah Tanpa PJU</h6>
                            <p style={{ textAlign: 'justify' }}>
                                Berdasarkan hasil analisis data infrastruktur, terdapat beberapa wilayah di Kalimantan Selatan yang belum memiliki fasilitas Penerangan Jalan Umum. Kondisi ini berpotensi menimbulkan berbagai permasalahan seperti rendahnya tingkat keamanan jalan serta meningkatnya risiko kecelakaan lalu lintas pada malam hari.
                            </p>
                        </div>

                        {/* 6. Analisis Prioritas Pembangunan */}
                        <div className="mb-4 page-break-avoid">
                            <h6 className="fw-bold">E. Analisis Prioritas Pembangunan</h6>
                            <p style={{ textAlign: 'justify' }}>
                                Wilayah yang belum memiliki fasilitas PJU dan termasuk dalam kategori wilayah tertinggal menjadi prioritas utama dalam pembangunan infrastruktur penerangan jalan. Pembangunan PJU pada wilayah tersebut diharapkan dapat meningkatkan keamanan masyarakat serta mendukung mobilitas transportasi pada malam hari. Penilaian prioritas didasarkan pada ketidaktersediaan infrastruktur utama, tingkat terisoliran desa, dan potensi risiko keselamatan.
                            </p>
                        </div>

                        {/* 7. Dampak Penambahan PJU */}
                        <div className="mb-4 page-break-avoid">
                            <h6 className="fw-bold">F. Dampak Penambahan PJU</h6>
                            <p className="mb-1" style={{ textAlign: 'justify' }}>Penambahan PJU dapat memberikan beberapa manfaat secara langsung antara lain:</p>
                            <ul>
                                <li>Meningkatkan keselamatan lalu lintas pada rute rawan dan kawasan rawan laka.</li>
                                <li>Mengurangi potensi tindak kriminalitas malam hari di pedesaan.</li>
                                <li>Meningkatkan aktivitas ekonomi masyarakat dengan aksesibilitas yang lebih baik.</li>
                                <li>Memperbaiki kualitas dan pemerataan infrastruktur daerah Kalimantan Selatan.</li>
                            </ul>
                        </div>

                        {/* 8. Kesimpulan */}
                        <div className="mb-4 page-break-avoid">
                            <h6 className="fw-bold">G. Kesimpulan</h6>
                            <p style={{ textAlign: 'justify' }}>
                                Berdasarkan hasil analisis pemetaan geospasial, disimpulkan bahwa terdapat sejumlah wilayah di Kalimantan Selatan yang belum memiliki fasilitas PJU dan tergolong sangat mendesak (Prioritas Tinggi) untuk pembangunan infrastruktur penerangan jalan. Pembangunan PJU pada wilayah tersebut diyakini akan menjawab langsung isu keamanan dan mendukung terwujudnya pembangunan daerah yang terintegrasi dan berkelanjutan.
                            </p>
                        </div>

                        {/* 9. Rekomendasi */}
                        <div className="mb-4 page-break-avoid">
                            <h6 className="fw-bold">H. Rekomendasi</h6>
                            <ul>
                                <li>Pemerintah daerah perlu memasukkan pembangunan PJU pada wilayah-wilayah yang tercantum ke dalam rencana anggaran strategis tahun berikutnya.</li>
                                <li>Sistem monitoring berbasis WebGIS harus terus diperbarui agar distribusi PJU dan pengadaan lampu pintar dapat diawali langsung dari data yang paling akurat.</li>
                                <li>Pembangunan tahap pertama sebaiknya difokuskan pada wilayah dengan tingkat aksesibilitas paling rendah yang menjadi satu-satunya jalur penghubung aktivitas masyarakat.</li>
                            </ul>
                        </div>

                        {/* TANDA TANGAN */}
                        <div className="d-flex justify-content-end mt-5 pt-3 page-break-avoid">
                            <div className="text-center" style={{ width: '300px' }}>
                                <p className="mb-1">Banjarbaru, {currentDateInfo}</p>
                                <p className="mb-5">Kepala Dinas Perhubungan</p>
                                <br /><br />
                                <p className="fw-bold text-decoration-underline mb-0">H. FITRI HERNADI, AP., M.Si</p>
                                <p className="mb-0">NIP. 19760312 199412 1 001</p>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            <style>{`
                @media print {
                    body { background-color: #fff !important; margin: 0; padding: 0; color: #000 !important; }
                    .no-print, .no-print * { display: none !important; }
                    .print-area { width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    table, th, td, tr { border-color: #000 !important; border-width: 1px !important; }
                    .bg-light { background-color: transparent !important; }
                    .document-body { font-size: 12pt !important; line-height: 1.5; }
                    h5, h6 { font-size: 13pt !important; }
                    .page-break-avoid { page-break-inside: avoid; }
                    
                    /* Pastikan Map tercetak */
                    .leaflet-container { 
                        width: 100% !important; 
                        background: #eee !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Pastikan div icon tercetak */
                    .custom-div-icon div {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
