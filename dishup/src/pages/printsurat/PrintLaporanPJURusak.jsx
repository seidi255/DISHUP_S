import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import '../../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import logoDishub from '../../assets/logo-dishub.jpg';

export default function PrintLaporanPJURusak() {
    const [dataLaporan, setDataLaporan] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch data
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost/DISHUP_S/dishup/api/pju_rusak.php');
                const result = await response.json();
                if (result.status === 'success') {
                    setDataLaporan(result.data);
                }
            } catch (error) {
                console.error("Error fetching PJU Report data:", error);
            } finally {
                setTimeout(() => {
                    window.print();
                }, 500);
            }
        };
        fetchData();
    }, []);

    const handleDownloadPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');

        // ==== KOP SURAT ====
        // Kita menggunakan Image jika logo load, tapi untuk fallback kita pakai teks saja.
        // Asumsi logo di tengah atas
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PEMERINTAH PROVINSI KALIMANTAN SELATAN', 105, 20, null, null, 'center');
        doc.setFontSize(16);
        doc.text('DINAS PERHUBUNGAN', 105, 26, null, null, 'center');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Jl. Dharma Praja No. 1, Perkantoran Pemprov Kalsel, Banjarbaru', 105, 31, null, null, 'center');

        // Garis Pembatas Kop
        doc.setLineWidth(1);
        doc.line(14, 35, 196, 35);
        doc.setLineWidth(0.3);
        doc.line(14, 36, 196, 36);

        // Judul Laporan
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('LAPORAN PENANGANAN PJU RUSAK', 105, 45, null, null, 'center');

        // Date generated
        const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Tanggal Cetak: ${today}`, 14, 52);

        // ==== TABEL ====
        const tableColumn = ["No", "Lokasi", "Wilayah", "Kerusakan", "Dilaporkan", "Petugas", "Status"];
        const tableRows = [];

        dataLaporan.forEach((item, index) => {
            const rowData = [
                index + 1,
                item.lokasi,
                item.wilayah,
                item.jenis_kerusakan,
                item.tanggal_laporan,
                item.petugas || '-',
                item.status
            ];
            tableRows.push(rowData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                6: { halign: 'center' }
            }
        });

        doc.save(`Laporan_PJU_Rusak_${today.replace(/\s/g, '_')}.pdf`);
    };

    return (
        <div className="container mt-5 print-area">
            <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-2"></i>Kembali
                </button>
                <div className="d-flex gap-2">
                    <button className="btn btn-primary shadow-sm" onClick={() => window.print()}>
                        <i className="bi bi-printer-fill me-2"></i>Cetak Laporan
                    </button>
                    <button className="btn btn-danger shadow-sm" onClick={handleDownloadPDF}>
                        <i className="bi bi-file-earmark-pdf-fill me-2"></i>Download PDF
                    </button>
                </div>
            </div>

            {/* Print Header (Kop Surat) */}
            <div className="mb-3 border-bottom border-dark border-3 pb-2 position-relative d-flex align-items-center justify-content-center">
                <img src={logoDishub} alt="Logo Dishub" className="print-logo" style={{ width: '80px', position: 'absolute', left: '20px' }} />
                <div className="text-center print-kop-text" style={{ marginLeft: '80px', flexGrow: 1 }}>
                    <h5 className="fw-bold mb-1" style={{ letterSpacing: '1px', fontSize: '18px' }}>PEMERINTAH PROVINSI KALIMANTAN SELATAN</h5>
                    <h3 className="fw-bolder mb-1" style={{ fontSize: '24px' }}>DINAS PERHUBUNGAN</h3>
                    <p className="mb-0" style={{ fontSize: '12px' }}>Jl. Dharma Praja No. 1, Perkantoran Pemprov Kalsel, Banjarbaru</p>
                </div>
            </div>

            <div className="text-center mb-3">
                <h5 className="fw-bold text-decoration-underline mb-1">LAPORAN PENANGANAN PJU RUSAK</h5>
                <p className="text-muted mb-3" style={{ fontSize: '11px' }}>Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 15mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .print-area {
                        padding: 0 !important;
                    }
                    .print-logo {
                        width: 70px !important;
                        left: 0px !important;
                    }
                    .print-kop-text h5 { fontSize: 16px !important; }
                    .print-kop-text h3 { fontSize: 20px !important; }
                    .print-kop-text p { fontSize: 11px !important; }
                    
                    table th, table td {
                        font-size: 11px !important;
                        padding: 6px !important;
                    }
                    .table-dark th {
                        background-color: #212529 !important;
                        color: white !important;
                    }
                }
            `}</style>

            {/* Print Content Table */}
            <table className="table table-bordered table-striped align-middle">
                <thead className="table-dark text-center align-middle">
                    <tr>
                        <th style={{ width: '5%' }}>No</th>
                        <th style={{ width: '25%' }}>Lokasi</th>
                        <th style={{ width: '15%' }}>Wilayah</th>
                        <th style={{ width: '20%' }}>Jenis Kerusakan</th>
                        <th style={{ width: '12%' }}>Tgl Laporan</th>
                        <th style={{ width: '13%' }}>Petugas</th>
                        <th style={{ width: '10%' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {dataLaporan.map((item, index) => (
                        <tr key={item.id}>
                            <td className="text-center">{index + 1}</td>
                            <td>{item.lokasi}</td>
                            <td>{item.wilayah}</td>
                            <td>{item.jenis_kerusakan}</td>
                            <td className="text-center">{item.tanggal_laporan}</td>
                            <td>{item.petugas || '-'}</td>
                            <td className="text-center fw-bold">
                                <span className={`text-${item.status === 'Selesai' ? 'success' : item.status === 'Proses' ? 'warning' : 'danger'}`}>
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {dataLaporan.length === 0 && (
                        <tr><td colSpan="7" className="text-center">Belum ada data PJU rusak.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
