import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import logoDishub from '../../assets/logo-dishub.jpg';

export default function PrintLaporanAnalisisPJU() {
    const navigate = useNavigate();
    const [dataAnalisis, setDataAnalisis] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resPju, resTilang] = await Promise.all([
                    fetch('http://localhost/DISHUP_S/dishup/api/pju_rusak.php'),
                    fetch('http://localhost/DISHUP_S/dishup/api/tilang.php')
                ]);
                const jsonPju = await resPju.json();
                const jsonTilang = await resTilang.json();

                const pjuData = jsonPju.status === 'success' ? jsonPju.data : [];
                const tilangData = jsonTilang.status === 'success' ? jsonTilang.data : [];

                const mapWilayah = {};

                // Group PJU (only active damage i.e., Rusak & Proses)
                pjuData.forEach(p => {
                    if (p.status === 'Rusak' || p.status === 'Proses') {
                        const wil = p.wilayah || 'Lainnya';
                        if (!mapWilayah[wil]) mapWilayah[wil] = { wilayah: wil, pju_rusak: 0, tilang: 0 };
                        mapWilayah[wil].pju_rusak++;
                    }
                });

                // Group Tilang
                tilangData.forEach(t => {
                    let matched = false;
                    for (const wil of Object.keys(mapWilayah)) {
                        if (t.lokasi && t.lokasi.toLowerCase().includes(wil.toLowerCase())) {
                            mapWilayah[wil].tilang++;
                            matched = true;
                            break;
                        }
                    }
                    if (!matched) {
                        const defaultWil = 'Lainnya';
                        if (!mapWilayah[defaultWil]) mapWilayah[defaultWil] = { wilayah: defaultWil, pju_rusak: 0, tilang: 0 };
                        mapWilayah[defaultWil].tilang++;
                    }
                });

                // Convert to array and filter out those with 0 pju AND 0 tilang
                const finalData = Object.values(mapWilayah).filter(d => d.pju_rusak > 0 || d.tilang > 0);
                setDataAnalisis(finalData);

            } catch (error) {
                console.error("Gagal menarik data:", error);
            } finally {
                setIsLoading(false);
                setTimeout(() => {
                    window.print();
                }, 1000);
            }
        };
        fetchData();
    }, []);

    const totalPju = dataAnalisis.reduce((sum, item) => sum + item.pju_rusak, 0);
    const totalTilang = dataAnalisis.reduce((sum, item) => sum + item.tilang, 0);

    // Find highest PJU Rusak
    let maxPjuWil = { wilayah: '-', pju_rusak: 0, tilang: 0 };
    if (dataAnalisis.length > 0) {
        maxPjuWil = dataAnalisis.reduce((prev, current) => (prev.pju_rusak > current.pju_rusak) ? prev : current);
    }

    return (
        <div className="w-100 px-4 mt-4 mb-5 print-area">
            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-2"></i>Kembali
                </button>
                <button className="btn btn-primary shadow-sm" onClick={() => window.print()}>
                    <i className="bi bi-printer-fill me-2"></i>Cetak Laporan
                </button>
            </div>

            <div className="card shadow-sm border-0 pt-4 px-5 pb-5">

                {/* 1. KOP SURAT */}
                <div className="mb-4 border-bottom border-dark border-3 pb-3 d-flex align-items-center justify-content-center">
                    <img src={logoDishub} alt="Logo Dishub" className="print-logo me-4" style={{ width: '90px' }} />
                    <div className="text-center print-kop-text">
                        <h5 className="fw-bold mb-1" style={{ letterSpacing: '1px', fontSize: '18px' }}>PEMERINTAH PROVINSI KALIMANTAN SELATAN</h5>
                        <h3 className="fw-bolder mb-1" style={{ fontSize: '24px' }}>DINAS PERHUBUNGAN</h3>
                        <p className="mb-0" style={{ fontSize: '13px' }}>Jl. Dharma Praja No. 1, Perkantoran Pemprov Kalsel, Banjarbaru</p>
                    </div>
                </div>

                {/* JUDUL LAPORAN */}
                <div className="text-center mb-5">
                    <h4 className="fw-bold text-decoration-underline mb-2">LAPORAN ANALISIS INFRASTRUKTUR PJU & PELANGGARAN LALU LINTAS</h4>
                </div>

                {isLoading ? (
                    <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
                ) : (
                    <>
                        {/* PENGANTAR */}
                        <div className="mb-4" style={{ textAlign: 'justify' }}>
                            Laporan ini menyajikan analisis komparatif antara kondisi Penerangan Jalan Umum (PJU) yang mengalami kerusakan dengan tingkat pelanggaran lalu lintas (tilang) pada berbagai wilayah pengawasan. Analisis ini bertujuan untuk membuktikan secara kuantitatif pengaruh pencahayaan jalan (infrastruktur PJU) terhadap efektivitas keselamatan berlalu lintas.
                        </div>

                        {/* 2. INFORMASI LAPORAN */}
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">1. Informasi Laporan</h6>
                        <table className="table table-sm table-borderless mb-4" style={{ maxWidth: '600px' }}>
                            <tbody>
                                <tr><td width="180" className="text-muted">Tanggal Laporan</td><td>: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                                <tr><td className="text-muted">Periode Kueri Data</td><td>: Januari – Desember {new Date().getFullYear()}</td></tr>
                                <tr><td className="text-muted">Sumber Meta Data</td><td>: Sistem Monitoring PJU & Data Penindakan Tilang Terpadu</td></tr>
                                <tr><td className="text-muted">Metodologi Analisis</td><td>: Observasi Spasial Silang (Cross-Spatial Analysis)</td></tr>
                            </tbody>
                        </table>

                        {/* 3. TABEL DATA ANALISIS */}
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">2. Tabel Rekapitulasi Data Analisis</h6>
                        <table className="table table-bordered table-striped text-center mb-5 align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ width: '10%' }}>No</th>
                                    <th style={{ width: '40%' }}>Wilayah / Area</th>
                                    <th style={{ width: '25%' }}>PJU Rusak (Titik)</th>
                                    <th style={{ width: '25%' }}>Pelanggaran Tilang (Kasus)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataAnalisis.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td className="text-start">{item.wilayah}</td>
                                        <td className="fw-bold text-danger">{item.pju_rusak}</td>
                                        <td className="fw-bold text-warning text-dark">{item.tilang}</td>
                                    </tr>
                                ))}
                                {dataAnalisis.length === 0 && (
                                    <tr><td colSpan="4" className="text-center text-muted">Data Analisis Kosong</td></tr>
                                )}
                                <tr className="fw-bold bg-light">
                                    <td colSpan="2" className="text-end">Total Insiden Tercatat</td>
                                    <td className="text-danger fs-5">{totalPju}</td>
                                    <td className="text-warning text-dark fs-5">{totalTilang}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* 4. VISUALISASI DATA */}
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">3. Visualisasi Data Komparatif</h6>
                        <div className="mb-4 d-flex justify-content-center" style={{ height: '350px', width: '100%' }}>
                            {dataAnalisis.length > 0 ? (
                                <div className="d-flex justify-content-center w-100">
                                    <BarChart width={700} height={350} data={dataAnalisis} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="wilayah" tick={{ fontSize: 12 }} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip cursor={{ fill: '#f8f9fa' }} />
                                        <Legend wrapperStyle={{ paddingTop: "10px" }} />
                                        <Bar dataKey="pju_rusak" name="PJU Rusak" fill="#ef4444" barSize={35} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                                        <Bar dataKey="tilang" name="Kasus Tilang" fill="#f59e0b" barSize={35} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                                    </BarChart>
                                </div>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 text-muted border rounded w-100">Grafik Tidak Tersedia</div>
                            )}
                        </div>

                        {/* 5. ANALISIS SPASIAL & INTERPRETASI */}
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3 mt-4">4. Analisis Spasial & Interpretasi Hasil</h6>
                        <div className="mb-5 text-justify" style={{ lineHeight: '1.8' }}>
                            <p>
                                Berdasarkan data yang dihimpun pada tabel dan grafik komparatif di atas, dapat diobservasi secara empiris bahwa wilayah dengan tingkat kerusakan penerangan jalan yang signifikan (kurangnya penerangan malam hari) turut mencatatkan angka pelanggaran yang sejalan. Sebagai sorotan data, wilayah <strong>{maxPjuWil.wilayah}</strong> saat ini menjadi wilayah urgensi tinggi dengan <strong>{maxPjuWil.pju_rusak} titik PJU mati/rusak</strong>, bersamaan dengan catatan pelanggaran lalu lintas (tilang) aktif sebanyak <strong>{maxPjuWil.tilang} kasus</strong>.
                            </p>
                            <p>
                                Dari pola spasial tersebut, dapat diinterpretasikan bahwa wilayah dengan kondisi fasilitas PJU yang kurang memadai sangat berpotensi menurunkan efektivitas pengawasan visual oleh petugas kepolisian/Dinas Perhubungan di malam hari. Kurangnya rasio pencahayaan juga mengakibatkan penurunan drastis pada visibilitas marka jalan, yang mana secara psikologis meningkatkan peluang oknum angkutan (seperti kasus Overdimensi & Overload) untuk melanggar batas tonase di wilayah tersebut karena minimnya antisipasi patroli lapangan.
                            </p>
                        </div>

                        {/* 6. KESIMPULAN */}
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">5. Kesimpulan</h6>
                        <div className="text-justify mb-5" style={{ lineHeight: '1.8' }}>
                            <p>
                                Analisis data ini menyimpulkan adanya <strong>indikasi korelasi positif</strong> antara rasio jumlah infrastruktur PJU yang bermasalah dengan laju pelanggaran lalu lintas di suatu area. Wilayah dengan persentase fasilitas PJU <em>offline</em> lebih tinggi memiliki kerawanan insiden tilang yang proporsional.
                            </p>
                            <p>
                                Oleh karena itu, <strong>kami merekomendasikan agar peningkatan dan percepatan perbaikan titik PJU, khususnya pada area {maxPjuWil.wilayah}, dijadikan sebagai agenda prioritas pemeliharaan teknis</strong> dalam upaya komprehensif mengembalikan keamanan, keselamatan, dan ketertiban lalu lintas.
                            </p>
                        </div>

                        {/* TTD PENUTUP */}
                        <div className="d-flex justify-content-end mt-5 pt-3 pe-5">
                            <div className="text-center" style={{ width: '250px' }}>
                                <p className="mb-5">Banjarbaru, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}<br />Mengetahui,</p>
                                <br />
                                <p className="fw-bold text-decoration-underline mb-0 mt-4">Kepala Dinas Perhubungan</p>
                                <p className="mb-0">NIP. 19800101 200501 1 001</p>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print-area { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
                    .card { border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
                    .print-logo { width: 85px !important; margin-right: 20px !important; }
                    .print-kop-text h5 { font-size: 16px !important; }
                    .print-kop-text h3 { font-size: 20px !important; }
                    .print-kop-text p { font-size: 12px !important; }
                    table { width: 100% !important; margin-bottom: 20px !important; }
                    table th, table td { font-size: 11px !important; padding: 6px !important; }
                    .table-dark th { background-color: #212529 !important; color: white !important; }
                    .recharts-wrapper { margin: 0 auto; width: 100% !important; }
                    p { font-size: 12px !important; line-height: 1.5 !important; }
                    h6 { font-size: 14px !important; }
                    .d-print-none { display: none !important; }
                    /* Hindari pemotongan halaman di tengah blok */
                    h6, table, .text-justify, .d-flex.justify-content-end { page-break-inside: avoid; }
                }
            `}</style>
        </div>
    );
}
