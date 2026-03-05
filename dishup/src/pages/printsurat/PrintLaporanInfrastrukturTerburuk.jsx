import React, { useEffect, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";
import KopSurat from "./KopSurat";

export default function PrintLaporanInfrastrukturTerburuk() {
    const [dataWilayah, setDataWilayah] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost/DISHUP_S/dishup/api/pju_rusak.php?summary=true');
                const result = await response.json();

                if (result.status === 'success' && result.data && result.data.wilayahChart) {
                    const validData = result.data.wilayahChart.filter(item =>
                        item.wilayah &&
                        item.wilayah.trim() !== '' &&
                        item.value > 0
                    );
                    setDataWilayah(validData);
                }
            } catch (error) {
                console.error("Gagal menarik data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handlePrint = () => window.print();

    const totalRusak = dataWilayah.reduce((sum, item) => sum + parseInt(item.value || 0, 10), 0);
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
                <Button variant="primary" onClick={handlePrint} disabled={isLoading || dataWilayah.length === 0}>
                    🖨️ Cetak Laporan
                </Button>
            </div>

            {/* ================= AREA YANG DICETAK ================= */}
            <div className="print-area">
                {/* KOP SURAT */}
                <KopSurat />

                {/* JUDUL */}
                <div className="text-center my-4">
                    <h5 className="fw-bold text-decoration-underline mb-1">LAPORAN INFRASTRUKTUR TERBURUK (PJU RUSAK)</h5>
                    <p className="mb-0 text-muted" style={{ fontSize: "14px" }}>Berdasarkan Jumlah PJU Rusak per Wilayah</p>
                </div>

                {isLoading ? (
                    <div className="text-center my-5">
                        <Spinner animation="border" variant="danger" />
                        <p className="mt-2 text-muted">Memuat data cetak...</p>
                    </div>
                ) : (
                    <>
                        <Table bordered className="mt-4" style={{ fontSize: '14px', border: '1px solid #000' }}>
                            <thead className="bg-light">
                                <tr>
                                    <th className="text-center py-2" style={{ width: '10%' }}>No</th>
                                    <th className="text-center py-2" style={{ width: '60%' }}>Wilayah</th>
                                    <th className="text-center py-2" style={{ width: '30%' }}>Jumlah Kerusakan (Unit)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataWilayah.length > 0 ? (
                                    dataWilayah.map((item, index) => (
                                        <tr key={index}>
                                            <td className="text-center py-2">{index + 1}</td>
                                            <td className="py-2 px-3" style={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
                                                {item.wilayah} {index === 0 && "(Terburuk)"}
                                            </td>
                                            <td className="text-center py-2" style={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
                                                {item.value}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-4 text-muted border-dark">
                                            Tidak ada data wilayah dengan PJU rusak.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {dataWilayah.length > 0 && (
                                <tfoot>
                                    <tr className="fw-bold bg-light">
                                        <td colSpan={2} className="text-end py-2 px-3">TOTAL KESELURUHAN</td>
                                        <td className="text-center py-2 text-danger">{totalRusak}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </Table>

                        {/* TANDA TANGAN */}
                        <div className="d-flex justify-content-end mt-5 pt-3">
                            <div className="text-center" style={{ width: '300px' }}>
                                <p className="mb-1">Banjarbaru, {currentDate}</p>
                                <p className="mb-5">Kepala Dinas Perhubungan</p>
                                <br /><br />
                                <p className="fw-bold text-decoration-underline mb-0">H. FITRI HERNADI, AP., M.Si</p>
                                <p className="mb-0">NIP. 19760312 199412 1 001</p>
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
