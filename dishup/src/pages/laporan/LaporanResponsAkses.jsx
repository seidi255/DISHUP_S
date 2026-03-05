import { useMemo, useRef, useState } from "react";
import { Card, Row, Col, Form, Button, Table, Spinner } from "react-bootstrap";
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
const getNamaBidang = (kategori) => {
  switch (kategori) {
    case "A":
      return "Seksi A - Keselamatan Lalu Lintas";
    case "B":
      return "Seksi B - Manajemen dan Rekayasa Lalu Lintas";
    case "C":
      return "Seksi C - Pengendalian dan Operasional Lalu Lintas";
    default:
      return "Tidak Diketahui";
  }
};

const startOfDay = (tgl) => new Date(`${tgl}T00:00:00`).toISOString();
const endOfDay = (tgl) => new Date(`${tgl}T23:59:59`).toISOString();

// hitung selisih jam (1 angka desimal)
const diffHours = (start, end) => {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 0) return null;
  return +(ms / (1000 * 60 * 60)).toFixed(1);
};

export default function LaporanResponsAkses() {
  const { role } = useRole();
  const bolehAkses = role === "admin" || role === "pegawai";

  const [loading, setLoading] = useState(false);
  const [dariTanggal, setDariTanggal] = useState("");
  const [sampaiTanggal, setSampaiTanggal] = useState("");

  // data izin + kategori
  const [rows, setRows] = useState([]);

  // mode laporan: "tanggal" atau "semua" (untuk label periode di PDF)
  const [modeLaporan, setModeLaporan] = useState("tanggal");

  const kopRef = useRef(null);

  /* =========================
     AMBIL DATA (FILTER TANGGAL)
     - izin_files (approved)
     - files (kategori)
  ========================= */
  const ambilData = async () => {
    if (!dariTanggal || !sampaiTanggal) {
      toast.warn("Pilih rentang tanggal terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get("izin_files.php?action=with_kategori");
      if (response.status !== 'success') throw new Error("Gagal ambil data izin_files");

      let izin = response.data || [];

      // Filter tanggal di sisi klien (agar sesuai rentang yang dipilih)
      const startTgl = new Date(startOfDay(dariTanggal)).getTime();
      const endTgl = new Date(endOfDay(sampaiTanggal)).getTime();

      izin = izin.filter(i => {
        if (!i.diberi_pada) return false;
        const givenTime = new Date(i.diberi_pada).getTime();
        return givenTime >= startTgl && givenTime <= endTgl;
      });

      if (!izin || izin.length === 0) {
        setRows([]);
        setModeLaporan("tanggal");
        toast.info("Tidak ada data pada rentang tanggal tersebut");
        return;
      }

      setRows(izin);
      setModeLaporan("tanggal");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data laporan respons akses");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     AMBIL SEMUA DATA (TANPA FILTER TANGGAL) ✅ fitur dosen
  ========================= */
  const ambilSemuaData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("izin_files.php?action=with_kategori");
      if (response.status !== 'success') throw new Error("Gagal mengambil respon akses");

      const izin = response.data || [];

      if (!izin || izin.length === 0) {
        setRows([]);
        setModeLaporan("semua");
        toast.info("Tidak ada data izin akses");
        return;
      }

      setRows(izin);
      setModeLaporan("semua");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil semua data laporan respons akses");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     PROSES → DATA BARU
     (INI YANG DINILAI DOSEN)
  ========================= */
  const hasil = useMemo(() => {
    const total = rows.length;
    const map = {};
    const durasi = [];

    rows.forEach((r) => {
      const bidang = getNamaBidang(r.kategori);

      if (!map[bidang]) {
        map[bidang] = { bidang, jumlah: 0 };
      }
      map[bidang].jumlah += 1;

      // pakai waktu_permohonan
      const d = diffHours(r.waktu_permohonan, r.diberi_pada);
      if (d !== null) durasi.push(d);
    });

    const list = Object.values(map).map((b) => ({
      ...b,
      persen: total ? +((b.jumlah / total) * 100).toFixed(1) : 0,
    }));

    const avg =
      durasi.length > 0
        ? +(durasi.reduce((a, c) => a + c, 0) / durasi.length).toFixed(1)
        : null;

    const top = list.sort((a, b) => b.jumlah - a.jumlah)[0]?.bidang || "-";

    return { total, list, avg, top };
  }, [rows]);

  /* =========================
     CETAK PDF (mode: "tanggal" / "semua")
  ========================= */
  const cetakPDF = async (mode = modeLaporan) => {
    if (hasil.total === 0) {
      toast.warn("Tidak ada data untuk dicetak");
      return;
    }

    // jika user cetak mode tanggal tapi belum isi tanggal
    if (mode === "tanggal" && (!dariTanggal || !sampaiTanggal)) {
      toast.warn("Periode tanggal belum dipilih (untuk cetak sesuai tanggal)");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");

    // kop surat
    const canvas = await html2canvas(kopRef.current, {
      scale: 2,
      useCORS: true,
    });
    const img = canvas.toDataURL("image/png");
    const w = 190;
    const h = (canvas.height * w) / canvas.width;

    pdf.addImage(img, "PNG", 10, 10, w, h);
    let y = h + 15;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("LAPORAN ANALISIS RESPONS PERMINTAAN AKSES", 105, y, {
      align: "center",
    });

    y += 10;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    const periodeText =
      mode === "semua"
        ? "Periode: Semua Data (Tanpa Filter Tanggal)"
        : `Periode: ${dariTanggal} s.d ${sampaiTanggal}`;

    pdf.text(periodeText, 14, y);

    y += 8;
    pdf.text(
      `Ringkasan:\n` +
      `- Total akses disetujui: ${hasil.total}\n` +
      `- Bidang dominan: ${hasil.top}\n` +
      `- Rata-rata waktu respons: ${hasil.avg ?? "-"} jam`,
      14,
      y
    );

    autoTable(pdf, {
      startY: y + 25,
      head: [["Bidang", "Jumlah Persetujuan", "Persentase"]],
      body: hasil.list.map((b) => [b.bidang, b.jumlah, `${b.persen}%`]),
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    });

    // tanda tangan
    const ttdY = pdf.lastAutoTable.finalY + 25;
    pdf.text("Banjarmasin, .........................", 130, ttdY);
    pdf.text("Mengetahui,", 130, ttdY + 6);
    pdf.text("Kepala Bidang Lalu Lintas Jalan", 130, ttdY + 30);

    const blobUrl = pdf.output("bloburl");
    window.open(blobUrl);
  };

  if (!bolehAkses) {
    return <p className="text-danger">Akses ditolak</p>;
  }

  return (
    <Card className="p-4">
      {/* Kop Surat */}
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

      <h5 className="text-center fw-bold my-4">
        LAPORAN ANALISIS RESPONS PERMINTAAN AKSES
      </h5>

      {/* Filter */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Label>Dari Tanggal</Form.Label>
          <Form.Control
            type="date"
            value={dariTanggal}
            onChange={(e) => setDariTanggal(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Label>Sampai Tanggal</Form.Label>
          <Form.Control
            type="date"
            value={sampaiTanggal}
            onChange={(e) => setSampaiTanggal(e.target.value)}
          />
        </Col>

        <Col md={4} className="d-flex align-items-end gap-2 flex-wrap">
          <Button onClick={ambilData} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Tampilkan (Filter Tanggal)"}
          </Button>

          <Button variant="outline-primary" onClick={ambilSemuaData} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Tampilkan Semua"}
          </Button>

          <Button variant="secondary" onClick={() => cetakPDF(modeLaporan)}>
            Cetak PDF
          </Button>

          <Button variant="outline-secondary" onClick={() => cetakPDF("semua")}>
            Cetak PDF Semua
          </Button>
        </Col>
      </Row>

      {/* Ringkasan */}
      <Row className="mb-3">
        <Col>
          ✅ Total Akses Disetujui: <b>{hasil.total}</b>
        </Col>
        <Col>
          🏷️ Bidang Dominan: <b>{hasil.top}</b>
        </Col>
        <Col>
          ⏱️ Rata-rata Respons:{" "}
          <b>{hasil.avg !== null ? `${hasil.avg} jam` : "-"}</b>
        </Col>
      </Row>

      {/* Tabel */}
      <h6 className="fw-bold">Distribusi Persetujuan Akses per Bidang</h6>
      <Table bordered responsive>
        <thead>
          <tr>
            <th>No</th>
            <th>Bidang</th>
            <th>Jumlah</th>
            <th>Persen</th>
          </tr>
        </thead>
        <tbody>
          {hasil.list.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                Tidak ada data
              </td>
            </tr>
          ) : (
            hasil.list.map((b, i) => (
              <tr key={b.bidang}>
                <td>{i + 1}</td>
                <td>{b.bidang}</td>
                <td>{b.jumlah}</td>
                <td>{b.persen}%</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <div className="text-muted" style={{ fontSize: 13 }}>
        Catatan: Rata-rata waktu respons dihitung dari selisih antara waktu permohonan akses dan waktu persetujuan akses dokumen.
      </div>
    </Card>
  );
}
