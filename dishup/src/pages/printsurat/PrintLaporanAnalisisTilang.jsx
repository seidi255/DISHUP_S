import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import logoDishub from '../../assets/logo-dishub.jpg';

export default function PrintLaporanAnalisisTilang() {
    const navigate = useNavigate();
    const [dataAnalisis, setDataAnalisis] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost/DISHUP_S/dishup/api/tilang.php');
                const result = await response.json();

                const tilangData = result.status === 'success' ? result.data : [];
                const mapWilayah = {};

                tilangData.forEach(t => {
                    let text = ((t.lokasi || '') + ' ' + (t.wilayah || '')).toLowerCase();
                    let wil = 'Lainnya';

                    if (text.includes('banjarbaru') || text.includes('bjb') || text.includes('trikora') || text.includes('ulin') || text.includes('cempaka') || text.includes('loktabat')) wil = 'Banjarbaru';
                    else if (text.includes('banjarmasin') || text.includes('bjm') || text.includes('hksn') || text.includes('belitung') || text.includes('sutoyo') || text.includes('antasari') || text.includes('trisakti') || text.includes('hasan basri')) wil = 'Banjarmasin';
                    else if (text.includes('martapura') || text.includes('mtp') || text.includes('sekumpul')) wil = 'Martapura';
                    else if (text.includes('gambut') || text.includes('km 14')) wil = 'Gambut';
                    else if (text.includes('pelaihari') || text.includes('tanah laut')) wil = 'Pelaihari';
                    else if (text.includes('barito') || text.includes('batola') || text.includes('alalak') || text.includes('syarkawi')) wil = 'Barito Kuala';

                    if (!mapWilayah[wil]) {
                        mapWilayah[wil] = { wilayah: wil, jumlah: 0, tingkat: '' };
                    }
                    mapWilayah[wil].jumlah++;
                });

                const finalData = Object.values(mapWilayah).map(d => {
                    if (d.jumlah <= 5) d.tingkat = 'Rendah';
                    else if (d.jumlah <= 15) d.tingkat = 'Sedang';
                    else d.tingkat = 'Tinggi';
                    return d;
                }).sort((a, b) => b.jumlah - a.jumlah);

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

    // Helper text generation
    let maxWilayah = { wilayah: '-', jumlah: 0 };
    if (dataAnalisis.length > 0) {
        maxWilayah = dataAnalisis[0]; // Already sorted desc
    }
    const isTinggi = maxWilayah.jumlah > 15;

    return (
        <div className="w-100 px-4 mt-4 mb-5 print-area">
            <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left me-2"></i>Kembali
                </button>
                <button className="btn btn-primary shadow-sm" onClick={() => window.print()}>
                    <i className="bi bi-printer-fill me-2"></i>Cetak Laporan
                </button>
            </div>

            <div className="card shadow-sm border-0 pt-4 px-5 pb-5 m-0 p-0">
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
                    <h4 className="fw-bold text-decoration-underline mb-2">LAPORAN ANALISIS LOKASI RAWAN PELANGGARAN LALU LINTAS</h4>
                </div>

                {isLoading ? (
                    <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
                ) : (
                    <>
                        <div className="mb-4" style={{ textAlign: 'justify' }}>
                            <p>
                                Laporan ini menyajikan analisis lokasi yang memiliki tingkat pelanggaran lalu lintas tinggi berdasarkan data tilang spasial yang tercatat pada sistem. Tujuan dari laporan ini adalah untuk mengidentifikasi klasifikasi wilayah yang tergolong rawan pelanggaran, sehingga dapat menjadi basis empiris dalam pengambilan kebijakan peningkatan infrastruktur maupun patroli keselamatan lalu lintas terpadu.
                            </p>
                        </div>

                        {/* 2. INFORMASI LAPORAN */}
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3 mt-4">1. Informasi Meta Laporan</h6>
                        <table className="table table-sm table-borderless mb-4" style={{ maxWidth: '600px' }}>
                            <tbody>
                                <tr><td width="180" className="text-muted">Tanggal Cetak Dokumen</td><td>: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                                <tr><td className="text-muted">Periode Ekstraksi Data</td><td>: Januari – Desember {new Date().getFullYear()}</td></tr>
                                <tr><td className="text-muted">Sumber Data Primer</td><td>: Sistem Geospasial Tilang Dinas Perhubungan</td></tr>
                                <tr><td className="text-muted">Metodologi Klasifikasi</td><td>: Kuantifikasi Indeks Spasial Tingkat Kerawanan</td></tr>
                            </tbody>
                        </table>

                        {/* 3. TABEL DATA */}
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3 mt-4">2. Tabel Rekapitulasi Pelanggaran Spasial</h6>
                        <p className="small text-muted mb-2">
                            * Kriteria Indeks: 0–5 (Rendah), 6–15 (Sedang),  {'>'}15 (Tinggi)
                        </p>
                        <table className="table table-bordered table-striped text-center mb-5 align-middle">
                            <thead className="table-dark text-center align-middle">
                                <tr>
                                    <th style={{ width: '10%' }}>No</th>
                                    <th style={{ width: '40%' }}>Lokasi / Wilayah Operasi</th>
                                    <th style={{ width: '25%' }}>Total Angka Pelanggaran (Kasus)</th>
                                    <th style={{ width: '25%' }}>Status Kerawanan Area</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataAnalisis.map((item, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td className="text-start">{item.wilayah}</td>
                                        <td className="fw-bold">{item.jumlah}</td>
                                        <td className={`fw-bold text-${item.tingkat === 'Tinggi' ? 'danger' : item.tingkat === 'Sedang' ? 'warning' : 'success'}`}>
                                            {item.tingkat.toUpperCase()}
                                        </td>
                                    </tr>
                                ))}
                                {dataAnalisis.length === 0 && (
                                    <tr><td colSpan="4" className="text-center text-muted">Data Kosong</td></tr>
                                )}
                            </tbody>
                        </table>

                        {/* 4. GRAFIK */}
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">3. Grafik Bar Komparasi Pelanggaran</h6>
                        <div className="mb-4 d-flex justify-content-center" style={{ height: '350px', width: '100%' }}>
                            {dataAnalisis.length > 0 ? (
                                <div className="d-flex justify-content-center w-100">
                                    <BarChart width={700} height={350} data={dataAnalisis} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="wilayah" tick={{ fontSize: 12 }} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip cursor={{ fill: '#f8f9fa' }} />
                                        {/* Tidak pakai ResponsiveContainer untuk menjamin fixed height pas render PDF */}
                                        <Bar dataKey="jumlah" name="Kasus Tilang" fill="#1e40af" barSize={40} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                                    </BarChart>
                                </div>
                            ) : (
                                <div className="text-muted border rounded p-5 w-100 text-center">Grafik Tidak Tersedia</div>
                            )}
                        </div>

                        {/* 5. ANALISIS & INTERPRETASI */}
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3 mt-5">4. Analisis Klasifikasi Titik Rawan</h6>
                        <div className="mb-4 text-justify" style={{ lineHeight: '1.8' }}>
                            <p>
                                Berdasarkan olah data statistik di atas, terpantau secara transparan bahwa wilayah <strong>{maxWilayah.wilayah}</strong> saat ini memegang rekor terburuk terkait ketertiban berkendara, mendominasi grafik dengan total temuan aktif sebanyak <strong>{maxWilayah.jumlah} pelanggaran hukum</strong>. Merujuk pada parameter indeks kami, wilayah tersebut jelas masuk dalam klasifikasi rona <strong>{maxWilayah.tingkat}</strong>.
                            </p>
                            <p>
                                Hal ini mengindikasikan bahwa rasio tingkat pengawasan pada titik zona <em>{maxWilayah.wilayah}</em> {isTinggi ? "sudah mencapai taraf kritis" : "sedang membutuhkan intervensi proporsional"}. Tingginya angka kalkulasi pada titik zona tunggal tersebut menandakan perlunya evaluasi menyeluruh serta realokasi prioritas penugasan lapangan yang lebih presisi pada wilayah tersebut.
                            </p>
                        </div>

                        {/* 6. IDENTIFIKASI FAKTOR */}
                        <h6 className="fw-bold text-danger border-bottom pb-2 mb-3">5. Identifikasi Faktor Probabilitas</h6>
                        <div className="text-justify mb-5" style={{ lineHeight: '1.8' }}>
                            <p>
                                Selaras dengan kajian multidimensi yang lazim di lapangan, lonjakan kasus di satu wilayah (khususnya {maxWilayah.wilayah}) memiliki korelasi yang sangat erat dengan beberapa hipotesis teknis di bawah ini:
                            </p>
                            <ul>
                                <li className="mb-2"><strong>Kurangnya Kapasitas PJU (Penerangan Jalan):</strong> Visibilitas malam hari yang minim menyulitkan pengemudi mengidentifikasi marka jalan secara jelas, khususnya pada perlintasan krusial.</li>
                                <li className="mb-2"><strong>Degradasi Rambu Visual:</strong> Minimnya tanda peringatan atau kondisi rambu yang kusam / tersembunyi sehingga acap kali terlewat oleh pengguna angkutan berat.</li>
                                <li className="mb-2"><strong>Kepadatan Volume Angkutan:</strong> Volume kendaraan niaga / tambang di wilayah tersebut melampaui standar muatan sehingga angka kasus Tilang Angkutan Barang juga otomatis terekskalasi.</li>
                                <li className="mb-2"><strong>Minimnya Filter Pos Jaga:</strong> Tidak adanya pos pengawasan stasioner sehingga mendorong kelalaian pengendara akibat nihilnya potensi razia di area tersebut.</li>
                            </ul>
                        </div>

                        {/* TTD PENUTUP */}
                        <div className="d-flex justify-content-end mt-5 pt-4 pe-5">
                            <div className="text-center" style={{ width: '250px' }}>
                                <p className="mb-5">Banjarbaru, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}<br />Diperiksa & Disahkan,</p>
                                <br />
                                <p className="fw-bold text-decoration-underline mb-0 mt-4">Kepala Bidang Lalu Lintas</p>
                                <p className="mb-0">NIP. 19780615 200212 1 003</p>
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
                    p, li { font-size: 13px !important; line-height: 1.6 !important; }
                    h6 { font-size: 15px !important; margin-top: 15px !important; }
                    .d-print-none { display: none !important; }
                    /* Hindari pemotongan halaman di blok tanda tangan dan tabel */
                    table, .d-flex.justify-content-end { page-break-inside: avoid; }
                }
            `}</style>
        </div>
    );
}
