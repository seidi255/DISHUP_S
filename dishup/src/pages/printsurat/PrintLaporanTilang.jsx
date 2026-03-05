import React, { useEffect, useState, useMemo } from "react";
import { Button, Spinner, Table, Form } from "react-bootstrap";
import KopSurat from "./KopSurat";

export default function PrintLaporanTilang() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedWilayah, setSelectedWilayah] = useState("Semua");

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost/DISHUP_S/dishup/api/tilang.php');
            const json = await res.json();
            if (json.status === 'success') {
                setRows(json.data);
            }
        } catch (error) {
            console.error("Gagal load data Tilang", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handlePrint = () => window.print();

    // Dapatkan list wilayah unik
    const wilayahs = useMemo(() => {
        const unique = [...new Set(rows.map((r) => r.wilayah))].filter(Boolean);
        return ["Semua", ...unique];
    }, [rows]);

    // Filter baris
    const filteredRows = useMemo(() => {
        if (selectedWilayah === "Semua") return rows;
        return rows.filter((r) => r.wilayah === selectedWilayah);
    }, [rows, selectedWilayah]);

    return (
        <div className="p-4">
            {/* ================= TOMBOL (TIDAK IKUT PRINT) ================= */}
            <div className="d-flex justify-content-between align-items-center mb-3 no-print">
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold">Filter Wilayah:</span>
                    <Form.Select
                        value={selectedWilayah}
                        onChange={(e) => setSelectedWilayah(e.target.value)}
                        style={{ width: "250px" }}
                    >
                        {wilayahs.map((wil) => (
                            <option key={wil} value={wil}>{wil}</option>
                        ))}
                    </Form.Select>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="secondary" onClick={() => window.history.back()}>
                        Kembali
                    </Button>
                    <Button variant="dark" onClick={handlePrint} disabled={loading || filteredRows.length === 0}>
                        🖨️ Cetak Laporan Tilang
                    </Button>
                </div>
            </div>

            {/* ================= AREA YANG DICETAK ================= */}
            <div className="print-area">
                {/* KOP SURAT */}
                <KopSurat />

                {/* JUDUL */}
                <div className="text-center my-3">
                    <h5 className="fw-bold mb-1">LAPORAN DATA TILANG PELANGGARAN LALU LINTAS</h5>
                    <div className="text-muted" style={{ fontSize: 13 }}>
                        Bidang Lalu Lintas Jalan – Dinas Perhubungan Provinsi Kalimantan Selatan
                    </div>
                </div>

                {/* ISI */}
                {loading ? (
                    <div className="text-center my-4">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <>
                        <Table bordered responsive className="mt-4" style={{ fontSize: '13px' }}>
                            <thead>
                                <tr className="align-middle text-center">
                                    <th style={{ width: 40 }}>No</th>
                                    <th>Lokasi</th>
                                    <th>Jenis Pelanggaran</th>
                                    <th>Wilayah</th>
                                    <th style={{ width: 100 }}>Tanggal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((r, i) => (
                                    <tr key={r.id}>
                                        <td className="text-center">{i + 1}</td>
                                        <td className="fw-semibold">{r.lokasi}</td>
                                        <td>{r.jenis_pelanggaran}</td>
                                        <td>{r.wilayah}</td>
                                        <td className="text-center">{r.tanggal}</td>
                                    </tr>
                                ))}

                                {filteredRows.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center text-muted py-4">
                                            Data Tilang masih kosong atau gagal dimuat.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>

                        {/* TANDA TANGAN */}
                        <div className="d-flex justify-content-end mt-5">
                            <div style={{ width: 320, textAlign: "center" }}>
                                <div>
                                    Banjarmasin, {new Date().toLocaleDateString("id-ID")}
                                </div>
                                <div className="fw-bold mt-1">Mengetahui,</div>
                                <div>Kepala Bidang Lalu Lintas Jalan</div>

                                <div style={{ height: 80 }} />

                                <div className="fw-bold text-decoration-underline">
                                    (....................................)
                                </div>
                                <div>NIP. ....................................</div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
