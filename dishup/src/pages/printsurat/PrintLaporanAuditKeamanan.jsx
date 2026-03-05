import React, { useEffect, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";
import KopSurat from "./KopSurat";

export default function PrintLaporanAuditKeamanan() {
    const [data, setData] = useState({
        logSemua: [],
        summary: {
            login_hari_ini: 0,
            aktivitas_hari_ini: 0,
            perubahan_hari_ini: 0,
            gagal_login_hari_ini: 0
        }
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost/DISHUP_S/dishup/api/log_aktivitas.php');
                const result = await response.json();

                if (result.status === 'success') {
                    setData({
                        logSemua: result.data.logSemua || [],
                        summary: result.data.summary || {
                            login_hari_ini: 0,
                            aktivitas_hari_ini: 0,
                            perubahan_hari_ini: 0,
                            gagal_login_hari_ini: 0
                        }
                    });
                }
            } catch (error) {
                console.error("Gagal menarik data log:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handlePrint = () => window.print();

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const currentDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="p-4" style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
            {/* ================= TOMBOL (TIDAK IKUT PRINT) ================= */}
            <div className="d-flex justify-content-end align-items-center mb-4 gap-2 no-print">
                <Button variant="secondary" onClick={() => window.history.back()}>
                    Kembali
                </Button>
                <Button variant="primary" onClick={handlePrint} disabled={isLoading || data.logSemua.length === 0}>
                    🖨️ Cetak Laporan
                </Button>
            </div>

            {/* ================= AREA YANG DICETAK ================= */}
            <div className="print-area">
                {/* KOP SURAT */}
                <KopSurat />

                {/* JUDUL */}
                <div className="text-center my-4">
                    <h5 className="fw-bold text-decoration-underline mb-1">LAPORAN AUDIT KEAMANAN SISTEM</h5>
                    <p className="mb-0 text-muted" style={{ fontSize: "14px" }}>Riwayat Aktivitas Pengguna Terakhir</p>
                </div>

                {isLoading ? (
                    <div className="text-center my-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-2 text-muted">Memuat data log...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-3 d-flex justify-content-between" style={{ fontSize: '14px' }}>
                            <div>
                                <strong>Ringkasan Hari Ini:</strong>
                                <ul className="mb-0" style={{ paddingLeft: '20px' }}>
                                    <li>Total Login Berhasil: {data.summary.login_hari_ini}</li>
                                    <li>Total Perubahan Data: {data.summary.perubahan_hari_ini}</li>
                                </ul>
                            </div>
                            <div>
                                <br />
                                <ul className="mb-0 text-danger" style={{ paddingLeft: '20px' }}>
                                    <li>Total Login Gagal: {data.summary.gagal_login_hari_ini}</li>
                                </ul>
                            </div>
                        </div>

                        <Table bordered className="mt-4" style={{ fontSize: '12px', border: '1px solid #000' }}>
                            <thead className="bg-light text-center align-middle">
                                <tr>
                                    <th style={{ width: '5%' }}>No</th>
                                    <th style={{ width: '15%' }}>Waktu</th>
                                    <th style={{ width: '15%' }}>User</th>
                                    <th style={{ width: '30%' }}>Aktivitas</th>
                                    <th style={{ width: '10%' }}>Aksi</th>
                                    <th style={{ width: '10%' }}>Status</th>
                                    <th style={{ width: '15%' }}>IP Address</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.logSemua.length > 0 ? (
                                    data.logSemua.map((item, index) => (
                                        <tr key={index} className="align-middle">
                                            <td className="text-center">{index + 1}</td>
                                            <td>{formatDate(item.created_at)}</td>
                                            <td>{item.username || 'System'}</td>
                                            <td>{item.aktivitas}</td>
                                            <td className="text-center">{item.aksi}</td>
                                            <td className="text-center fw-bold">{item.status}</td>
                                            <td className="text-center">{item.ip_address}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-4 text-muted border-dark">
                                            Tidak ada data log aktivitas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>

                        {/* TANDA TANGAN */}
                        <div className="d-flex justify-content-end mt-5 pt-3">
                            <div className="text-center" style={{ width: '300px' }}>
                                <p className="mb-1">Banjarbaru, {currentDate}</p>
                                <p className="mb-5">Mengetahui,</p>
                                <br /><br />
                                <p className="fw-bold text-decoration-underline mb-0">Admin Sistem</p>
                                <p className="mb-0">Dinas Perhubungan Kalsel</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @media print {
                    body { background-color: #fff !important; margin: 0; padding: 0; }
                    .no-print, .no-print * { display: none !important; }
                    .print-area { width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    table, th, td, tr { border-color: #000 !important; border-width: 1px !important; }
                    .bg-light { background-color: rgba(0,0,0,0.05) !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
