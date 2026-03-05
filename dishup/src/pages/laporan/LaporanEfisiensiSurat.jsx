import { useMemo, useRef, useState } from "react";
import { Card, Row, Col, Form, Button, Table, Spinner, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { apiClient } from "../../apiClient";
import { useRole } from "../../hooks/useRole";
import KopSurat from "../printsurat/KopSurat";

/* =========================
   HELPER
========================= */
const startOfDay = (tgl) => new Date(`${tgl}T00:00:00`).toISOString();
const endOfDay = (tgl) => new Date(`${tgl}T23:59:59`).toISOString();

const daysBetweenInclusive = (from, to) => {
    if (!from || !to) return 0;
    const a = new Date(from + "T00:00:00");
    const b = new Date(to + "T00:00:00");
    const diff = Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff + 1 : 0;
};

const toDateOnly = (isoOrDate) => {
    if (!isoOrDate) return null;
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return null;
    // YYYY-MM-DD
    return d.toISOString().slice(0, 10);
};

const round1 = (n) => (n === null || n === undefined ? null : +(+n).toFixed(1));

/* =========================
   MAIN
========================= */
export default function LaporanEfisiensiSurat() {
    const { role } = useRole();
    const bolehAkses = role === "admin" || role === "pegawai";

    const [loading, setLoading] = useState(false);
    const [dariTanggal, setDariTanggal] = useState("");
    const [sampaiTanggal, setSampaiTanggal] = useState("");

    const [dataTugas, setDataTugas] = useState([]);
    const [dataPermohonan, setDataPermohonan] = useState([]);
    const [dataUndangan, setDataUndangan] = useState([]);

    const kopRef = useRef(null);

    // ✅ tambahan: penanda mode data yang sedang tampil (tanggal / semua)
    const [modeData, setModeData] = useState("tanggal"); // "tanggal" | "semua"

    /* =========================
       AMBIL DATA 3 TABEL (FILTER TANGGAL)
    ========================= */
    const ambilData = async () => {
        if (!dariTanggal || !sampaiTanggal) {
            toast.warn("Pilih rentang tanggal terlebih dahulu");
            return;
        }

        setLoading(true);
        try {
            const startTgl = new Date(startOfDay(dariTanggal)).getTime();
            const endTgl = new Date(endOfDay(sampaiTanggal)).getTime();

            // fungsi kecil untuk fetch & filter per API
            const fetchA = async (endpoint) => {
                const res = await apiClient.get(endpoint);
                if (res.status !== 'success') throw new Error(`Gagal fetch ${endpoint}`);
                let arr = res.data || [];
                return arr.filter(x => {
                    if (!x.tanggal_surat) return false;
                    // karena tanggal surat biasanya yyyy-mm-dd format string
                    // pastikan bandingkan dengan rentang hari ini
                    const tx = new Date(startOfDay(x.tanggal_surat)).getTime();
                    return tx >= startTgl && tx <= endTgl;
                });
            };

            const [tugas, permohonan, undangan] = await Promise.all([
                fetchA("surat_tugas.php"),
                fetchA("surat_permohonan.php"),
                fetchA("surat_undangan.php")
            ]);

            setDataTugas(tugas);
            setDataPermohonan(permohonan);
            setDataUndangan(undangan);

            // ✅ tambahan
            setModeData("tanggal");

            const total = tugas.length + permohonan.length + undangan.length;
            if (total === 0) toast.info("Tidak ada data pada rentang tanggal tersebut");
        } catch (e) {
            console.error(e);
            toast.error("Gagal mengambil data efisiensi surat: " + (e.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       ✅ TAMBAHAN FITUR DOSEN:
       AMBIL SEMUA DATA (TANPA FILTER TANGGAL)
    ========================= */
    const ambilSemuaData = async () => {
        setLoading(true);
        try {
            const fetchA = async (endpoint) => {
                const res = await apiClient.get(endpoint);
                if (res.status !== 'success') throw new Error(`Gagal fetch ${endpoint}`);
                return res.data || [];
            };

            const [tugas, permohonan, undangan] = await Promise.all([
                fetchA("surat_tugas.php"),
                fetchA("surat_permohonan.php"),
                fetchA("surat_undangan.php")
            ]);

            setDataTugas(tugas);
            setDataPermohonan(permohonan);
            setDataUndangan(undangan);

            setModeData("semua");

            const total = tugas.length + permohonan.length + undangan.length;
            if (total === 0) toast.info("Tidak ada data surat");
        } catch (e) {
            console.error(e);
            toast.error("Gagal mengambil semua data surat: " + (e.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    /* =========================
       PROSES → DATA BARU (KUNCI DOSEN)
    ========================= */
    const hasil = useMemo(() => {
        const nTugas = dataTugas.length;
        const nPerm = dataPermohonan.length;
        const nUnd = dataUndangan.length;
        const total = nTugas + nPerm + nUnd;

        // hari dihitung dari input tanggal (kalau mode semua, ini tetap aman tapi periodenya nanti di PDF kita ubah)
        const hari = daysBetweenInclusive(dariTanggal, sampaiTanggal);
        const rataPerHari = hari > 0 ? round1(total / hari) : null;

        // jenis dominan
        const listJenis = [
            { jenis: "Surat Tugas", jumlah: nTugas },
            { jenis: "Surat Permohonan", jumlah: nPerm },
            { jenis: "Surat Undangan", jumlah: nUnd },
        ].sort((a, b) => b.jumlah - a.jumlah);

        const dominan = listJenis[0]?.jumlah > 0 ? listJenis[0].jenis : "-";

        // distribusi per hari (gabungan) → indikator beban kerja harian
        const mapHari = new Map(); // date => count
        const pushTanggal = (arr) => {
            arr.forEach((x) => {
                const t = x.tanggal_surat || x.created_at;
                const d = toDateOnly(t);
                if (!d) return;
                mapHari.set(d, (mapHari.get(d) || 0) + 1);
            });
        };
        pushTanggal(dataTugas);
        pushTanggal(dataPermohonan);
        pushTanggal(dataUndangan);

        const distribusiHarian = Array.from(mapHari.entries())
            .map(([tanggal, jumlah]) => ({ tanggal, jumlah }))
            .sort((a, b) => a.tanggal.localeCompare(b.tanggal));

        const puncak = distribusiHarian.length
            ? distribusiHarian.reduce((best, cur) => (cur.jumlah > best.jumlah ? cur : best), distribusiHarian[0])
            : null;

        // hitung surat per pegawai (menghasilkan data baru untuk evaluasi beban)
        const mapPegawai = new Map(); // dibuat_oleh => jumlah
        const pushPegawai = (arr) => {
            arr.forEach((x) => {
                const k = x.dibuat_oleh || null;
                if (!k) return;
                mapPegawai.set(k, (mapPegawai.get(k) || 0) + 1);
            });
        };
        pushPegawai(dataTugas);
        pushPegawai(dataPermohonan);
        pushPegawai(dataUndangan);

        const perPegawai = Array.from(mapPegawai.entries())
            .map(([uid, jumlah]) => ({ uid, jumlah }))
            .sort((a, b) => b.jumlah - a.jumlah);

        const jumlahPegawaiAktif = perPegawai.length;
        const rataPerPegawai = jumlahPegawaiAktif > 0 ? round1(total / jumlahPegawaiAktif) : null;

        // indikator efisiensi sederhana (kategori)
        let kategoriEfisiensi = "Tidak dapat dinilai";
        if (hari > 0) {
            if (rataPerHari >= 5) kategoriEfisiensi = "Tinggi";
            else if (rataPerHari >= 2) kategoriEfisiensi = "Sedang";
            else kategoriEfisiensi = "Rendah";
        }

        return {
            total,
            hari,
            rataPerHari,
            dominan,
            listJenis,
            distribusiHarian,
            puncak,
            perPegawai,
            jumlahPegawaiAktif,
            rataPerPegawai,
            kategoriEfisiensi,
        };
    }, [dataTugas, dataPermohonan, dataUndangan, dariTanggal, sampaiTanggal]);

    /* =========================
       CETAK PDF (ASLI) - tetap untuk mode tanggal
    ========================= */
    const cetakPDF = async () => {
        if (!dariTanggal || !sampaiTanggal) {
            toast.warn("Pilih rentang tanggal dulu");
            return;
        }
        if (hasil.total === 0) {
            toast.warn("Tidak ada data untuk dicetak");
            return;
        }

        try {
            const pdf = new jsPDF("p", "mm", "a4");

            // kop surat dari komponen
            const canvas = await html2canvas(kopRef.current, { scale: 2, useCORS: true });
            const img = canvas.toDataURL("image/png");

            const pageW = 210;
            const margin = 10;
            const w = pageW - margin * 2;
            const h = (canvas.height * w) / canvas.width;

            pdf.addImage(img, "PNG", margin, 10, w, h);

            let y = 10 + h + 10;

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text("LAPORAN ANALISIS EFISIENSI MANAJEMEN SURAT", 105, y, { align: "center" });

            y += 8;
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text(`Periode: ${dariTanggal} s.d ${sampaiTanggal} (${hasil.hari} hari)`, margin + 4, y);

            y += 8;
            const narasi =
                `Laporan ini menyajikan hasil pengolahan data surat pada sistem manajemen surat digital ` +
                `untuk menilai efisiensi proses administrasi. Berdasarkan pengolahan data pada periode tersebut, ` +
                `terdapat total ${hasil.total} surat yang tercatat, dengan rata-rata ${hasil.rataPerHari ?? "-"} surat per hari. ` +
                `Jenis surat yang paling dominan adalah ${hasil.dominan}. ` +
                (hasil.puncak
                    ? `Puncak aktivitas pencatatan surat terjadi pada tanggal ${hasil.puncak.tanggal} sebanyak ${hasil.puncak.jumlah} surat. `
                    : "") +
                `Hasil analisis ini dapat digunakan sebagai dasar evaluasi beban kerja dan pengambilan keputusan ` +
                `untuk peningkatan kinerja pengelolaan surat.`;

            const split = pdf.splitTextToSize(narasi, w - 8);
            pdf.text(split, margin + 4, y);
            y += split.length * 5 + 5;

            // Tabel ringkasan per jenis
            autoTable(pdf, {
                startY: y,
                head: [["Jenis Surat", "Jumlah", "Persentase"]],
                body: hasil.listJenis.map((x) => {
                    const persen = hasil.total ? round1((x.jumlah / hasil.total) * 100) : 0;
                    return [x.jenis, x.jumlah, `${persen}%`];
                }),
                headStyles: { fillColor: [41, 128, 185] },
                styles: { fontSize: 10 },
            });

            y = pdf.lastAutoTable.finalY + 8;

            // Distribusi harian (opsional, bila banyak: tampilkan 10 teratas)
            const topHarian = [...hasil.distribusiHarian]
                .sort((a, b) => b.jumlah - a.jumlah)
                .slice(0, 10);

            autoTable(pdf, {
                startY: y,
                head: [["Top Aktivitas Harian", "Jumlah Surat"]],
                body: topHarian.map((x) => [x.tanggal, x.jumlah]),
                headStyles: { fillColor: [52, 73, 94] },
                styles: { fontSize: 10 },
            });

            y = pdf.lastAutoTable.finalY + 10;

            // Kesimpulan + indikator
            pdf.setFont("helvetica", "bold");
            pdf.text("Kesimpulan:", margin + 4, y);
            y += 6;

            pdf.setFont("helvetica", "normal");
            const kesimpulan =
                `Berdasarkan hasil analisis, tingkat efisiensi operasional pengelolaan surat pada periode ini ` +
                `dikategorikan "${hasil.kategoriEfisiensi}" (berdasarkan rata-rata surat per hari). ` +
                `Rata-rata surat per pegawai aktif: ${hasil.rataPerPegawai ?? "-"} surat.`;
            const split2 = pdf.splitTextToSize(kesimpulan, w - 8);
            pdf.text(split2, margin + 4, y);
            y += split2.length * 5 + 12;

            // TTD kanan bawah
            pdf.text("Banjarmasin, .........................", 130, y);
            pdf.text("Mengetahui,", 130, y + 6);
            pdf.text("Kepala Bidang Lalu Lintas Jalan", 130, y + 30);

            const blobUrl = pdf.output("bloburl");
            window.open(blobUrl);
        } catch (e) {
            console.error(e);
            toast.error("Gagal mencetak PDF: " + (e.message || "Unknown error"));
        }
    };

    /* =========================
       ✅ TAMBAHAN: CETAK PDF SEMUA (tanpa filter tanggal)
       (pakai data state yang sudah diisi ambilSemuaData)
    ========================= */
    const cetakPDFSemua = async () => {
        if (hasil.total === 0) {
            toast.warn("Tidak ada data untuk dicetak");
            return;
        }
        if (modeData !== "semua") {
            toast.info("Klik 'Tampilkan Semua' dulu agar data yang dicetak adalah semua data");
            return;
        }

        try {
            const pdf = new jsPDF("p", "mm", "a4");

            // kop surat dari komponen
            const canvas = await html2canvas(kopRef.current, { scale: 2, useCORS: true });
            const img = canvas.toDataURL("image/png");

            const pageW = 210;
            const margin = 10;
            const w = pageW - margin * 2;
            const h = (canvas.height * w) / canvas.width;

            pdf.addImage(img, "PNG", margin, 10, w, h);

            let y = 10 + h + 10;

            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text("LAPORAN ANALISIS EFISIENSI MANAJEMEN SURAT", 105, y, { align: "center" });

            y += 8;
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(10);
            pdf.text("Periode: Semua Data (Tanpa Filter Tanggal)", margin + 4, y);

            y += 8;
            const narasi =
                `Laporan ini menyajikan hasil pengolahan data surat pada sistem manajemen surat digital ` +
                `untuk menilai efisiensi proses administrasi. Berdasarkan pengolahan seluruh data, ` +
                `terdapat total ${hasil.total} surat yang tercatat. ` +
                `Jenis surat yang paling dominan adalah ${hasil.dominan}. ` +
                (hasil.puncak
                    ? `Puncak aktivitas pencatatan surat terjadi pada tanggal ${hasil.puncak.tanggal} sebanyak ${hasil.puncak.jumlah} surat. `
                    : "") +
                `Hasil analisis ini dapat digunakan sebagai dasar evaluasi beban kerja dan pengambilan keputusan ` +
                `untuk peningkatan kinerja pengelolaan surat.`;

            const split = pdf.splitTextToSize(narasi, w - 8);
            pdf.text(split, margin + 4, y);
            y += split.length * 5 + 5;

            // Tabel ringkasan per jenis
            autoTable(pdf, {
                startY: y,
                head: [["Jenis Surat", "Jumlah", "Persentase"]],
                body: hasil.listJenis.map((x) => {
                    const persen = hasil.total ? round1((x.jumlah / hasil.total) * 100) : 0;
                    return [x.jenis, x.jumlah, `${persen}%`];
                }),
                headStyles: { fillColor: [41, 128, 185] },
                styles: { fontSize: 10 },
            });

            y = pdf.lastAutoTable.finalY + 8;

            // Top Aktivitas Harian
            const topHarian = [...hasil.distribusiHarian]
                .sort((a, b) => b.jumlah - a.jumlah)
                .slice(0, 10);

            autoTable(pdf, {
                startY: y,
                head: [["Top Aktivitas Harian", "Jumlah Surat"]],
                body: topHarian.map((x) => [x.tanggal, x.jumlah]),
                headStyles: { fillColor: [52, 73, 94] },
                styles: { fontSize: 10 },
            });

            y = pdf.lastAutoTable.finalY + 10;

            // Kesimpulan (tanpa kategori per hari karena tidak pakai rentang)
            pdf.setFont("helvetica", "bold");
            pdf.text("Kesimpulan:", margin + 4, y);
            y += 6;

            pdf.setFont("helvetica", "normal");
            const kesimpulan =
                `Berdasarkan hasil analisis seluruh data, beban kerja surat dapat dievaluasi melalui distribusi harian ` +
                `dan distribusi per pegawai. Rata-rata surat per pegawai aktif: ${hasil.rataPerPegawai ?? "-"} surat.`;
            const split2 = pdf.splitTextToSize(kesimpulan, w - 8);
            pdf.text(split2, margin + 4, y);
            y += split2.length * 5 + 12;

            // TTD kanan bawah
            pdf.text("Banjarmasin, .........................", 130, y);
            pdf.text("Mengetahui,", 130, y + 6);
            pdf.text("Kepala Bidang Lalu Lintas Jalan", 130, y + 30);

            const blobUrl = pdf.output("bloburl");
            window.open(blobUrl);
        } catch (e) {
            console.error(e);
            toast.error("Gagal mencetak PDF semua: " + (e.message || "Unknown error"));
        }
    };

    const badgeEfisiensi = (kat) => {
        if (kat === "Tinggi") return <Badge bg="success">Tinggi</Badge>;
        if (kat === "Sedang") return <Badge bg="warning" text="dark">Sedang</Badge>;
        if (kat === "Rendah") return <Badge bg="danger">Rendah</Badge>;
        return <Badge bg="secondary">-</Badge>;
    };

    if (!bolehAkses) return <p className="text-danger">Akses ditolak</p>;

    return (
        <Card className="p-4">
            <div
                ref={kopRef}
                style={{
                    position: "absolute",
                    top: "-10000px",
                    left: "-10000px",
                }}
            >
                <KopSurat />
            </div>

            <h5 className="text-center fw-bold my-4">LAPORAN ANALISIS EFISIENSI MANAJEMEN SURAT</h5>

            <Row className="mb-3">
                <Col md={4}>
                    <Form.Label>Dari Tanggal</Form.Label>
                    <Form.Control type="date" value={dariTanggal} onChange={(e) => setDariTanggal(e.target.value)} />
                </Col>
                <Col md={4}>
                    <Form.Label>Sampai Tanggal</Form.Label>
                    <Form.Control type="date" value={sampaiTanggal} onChange={(e) => setSampaiTanggal(e.target.value)} />
                </Col>
                <Col md={4} className="d-flex align-items-end gap-2 flex-wrap">
                    <Button onClick={ambilData} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : "Tampilkan"}
                    </Button>

                    {/* ✅ tambahan fitur dosen */}
                    <Button variant="outline-primary" onClick={ambilSemuaData} disabled={loading}>
                        {loading ? <Spinner size="sm" /> : "Tampilkan Semua"}
                    </Button>

                    <Button variant="secondary" onClick={cetakPDF}>
                        Cetak PDF
                    </Button>

                    {/* ✅ tambahan fitur dosen */}
                    <Button variant="outline-secondary" onClick={cetakPDFSemua}>
                        Cetak PDF Semua
                    </Button>
                </Col>
            </Row>

            {/* Ringkasan KPI */}
            <Row className="mb-3">
                <Col>📌 Total Surat: <b>{hasil.total}</b></Col>
                <Col>📅 Periode: <b>{hasil.hari || "-"}</b> hari</Col>
                <Col>📈 Rata-rata / Hari: <b>{hasil.rataPerHari ?? "-"}</b></Col>
            </Row>
            <Row className="mb-4">
                <Col>🏷️ Jenis Dominan: <b>{hasil.dominan}</b></Col>
                <Col>👥 Pegawai Aktif: <b>{hasil.jumlahPegawaiAktif}</b></Col>
                <Col>⚙️ Efisiensi: <b>{badgeEfisiensi(hasil.kategoriEfisiensi)}</b></Col>
            </Row>

            {/* Narasi singkat */}
            <div className="mb-3" style={{ fontSize: 14, lineHeight: 1.5 }}>
                Laporan ini menyajikan hasil pengolahan data surat pada sistem manajemen surat digital untuk menilai efisiensi proses
                administrasi. Berdasarkan periode yang dipilih, terdapat <b>{hasil.total}</b> surat dengan rata-rata{" "}
                <b>{hasil.rataPerHari ?? "-"}</b> surat per hari. Jenis surat dominan adalah <b>{hasil.dominan}</b>.
                {hasil.puncak ? (
                    <> Puncak aktivitas terjadi pada tanggal <b>{hasil.puncak.tanggal}</b> sebanyak <b>{hasil.puncak.jumlah}</b> surat.</>
                ) : null}
            </div>

            {/* Tabel per jenis */}
            <h6 className="fw-bold">Ringkasan Jumlah Surat per Jenis</h6>
            <Table bordered responsive>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Jenis Surat</th>
                        <th>Jumlah</th>
                        <th>Persen</th>
                    </tr>
                </thead>
                <tbody>
                    {hasil.total === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center text-muted">Tidak ada data</td>
                        </tr>
                    ) : (
                        hasil.listJenis.map((x, i) => {
                            const persen = hasil.total ? round1((x.jumlah / hasil.total) * 100) : 0;
                            return (
                                <tr key={x.jenis}>
                                    <td>{i + 1}</td>
                                    <td>{x.jenis}</td>
                                    <td>{x.jumlah}</td>
                                    <td>{persen}%</td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </Table>

            {/* Top harian */}
            <h6 className="fw-bold mt-4">Top Aktivitas Harian (10 Teratas)</h6>
            <Table bordered responsive>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Tanggal</th>
                        <th>Jumlah Surat</th>
                    </tr>
                </thead>
                <tbody>
                    {hasil.distribusiHarian.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="text-center text-muted">Tidak ada data</td>
                        </tr>
                    ) : (
                        [...hasil.distribusiHarian]
                            .sort((a, b) => b.jumlah - a.jumlah)
                            .slice(0, 10)
                            .map((x, i) => (
                                <tr key={x.tanggal}>
                                    <td>{i + 1}</td>
                                    <td>{x.tanggal}</td>
                                    <td>{x.jumlah}</td>
                                </tr>
                            ))
                    )}
                </tbody>
            </Table>

            {/* Per pegawai */}
            <h6 className="fw-bold mt-4">Distribusi Surat per Pegawai (berdasarkan dibuat_oleh)</h6>
            <Table bordered responsive>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>UID Pegawai</th>
                        <th>Jumlah Surat</th>
                    </tr>
                </thead>
                <tbody>
                    {hasil.perPegawai.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="text-center text-muted">
                                Data pegawai tidak tersedia (kolom dibuat_oleh kosong pada surat)
                            </td>
                        </tr>
                    ) : (
                        hasil.perPegawai.slice(0, 10).map((x, i) => (
                            <tr key={x.uid}>
                                <td>{i + 1}</td>
                                <td style={{ fontFamily: "monospace" }}>{x.uid}</td>
                                <td>{x.jumlah}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <div className="text-muted mt-3" style={{ fontSize: 13 }}>
                Catatan: Indikator efisiensi dihitung berdasarkan rata-rata jumlah surat per hari dalam periode yang dipilih.
            </div>
        </Card>
    );
}
