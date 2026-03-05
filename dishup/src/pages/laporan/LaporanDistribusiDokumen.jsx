import { useMemo, useRef, useState } from "react";
import { Card, Row, Col, Form, Button, Spinner, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { apiClient } from "../../apiClient";
import { useRole } from "../../hooks/useRole";
import KopSurat from "../printsurat/KopSurat";

/* =====================================================
   HELPER
===================================================== */

// Konversi kategori → nama bidang
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

// Jenis dokumen dari ekstensi file
const getJenisDokumen = (fileName = "") => {
  const ext = fileName.split(".").pop().toLowerCase();
  if (ext === "pdf") return "PDF";
  if (["doc", "docx"].includes(ext)) return "Word";
  if (["xls", "xlsx"].includes(ext)) return "Excel";
  if (["ppt", "pptx"].includes(ext)) return "PowerPoint";
  return "Lainnya";
};

// Helper tanggal (hindari masalah jam)
const startOfDay = (tgl) => new Date(`${tgl}T00:00:00`).toISOString();
const endOfDay = (tgl) => new Date(`${tgl}T23:59:59`).toISOString();

/* =====================================================
   COMPONENT
===================================================== */
export default function LaporanDistribusiDokumen() {
  const { role } = useRole();
  const bolehAkses = role === "admin" || role === "pegawai";

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  const [dariTanggal, setDariTanggal] = useState("");
  const [sampaiTanggal, setSampaiTanggal] = useState("");

  // mode laporan: "tanggal" atau "semua" (untuk label periode di PDF)
  const [modeLaporan, setModeLaporan] = useState("tanggal");

  const kopSuratRef = useRef(null);

  /* ===============================
     AMBIL DATA (DENGAN FILTER TANGGAL)
  ================================ */
  const ambilData = async () => {
    if (!bolehAkses) return;

    if (!dariTanggal || !sampaiTanggal) {
      toast.warn("Silakan pilih rentang tanggal");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get("files.php");
      if (response.status !== 'success') throw new Error("Gagal mengambil data laporan");

      let list = response.data || [];

      // Filter tanggal di sisi klien
      const startTgl = new Date(startOfDay(dariTanggal)).getTime();
      const endTgl = new Date(endOfDay(sampaiTanggal)).getTime();

      list = list.filter(f => {
        if (!f.created_at) return false;
        const createdTime = new Date(f.created_at).getTime();
        return createdTime >= startTgl && createdTime <= endTgl;
      });

      setFiles(list);
      setModeLaporan("tanggal");

      if (!data || data.length === 0) {
        toast.info("Tidak ada data pada rentang tanggal tersebut");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data laporan");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     AMBIL SEMUA DATA (TANPA FILTER TANGGAL) ✅ fitur dosen
  ================================ */
  const ambilSemuaData = async () => {
    if (!bolehAkses) return;

    setLoading(true);
    try {
      const response = await apiClient.get("files.php");
      if (response.status !== 'success') throw new Error("Gagal mengambil semua data laporan");

      const data = response.data || [];

      setFiles(data);
      setModeLaporan("semua");

      if (!data || data.length === 0) {
        toast.info("Tidak ada data dokumen");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil semua data laporan");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     PROSES DATA → DATA BARU
  ================================ */
  const hasil = useMemo(() => {
    const total = files.length;
    let publik = 0;
    let terbatas = 0;

    const jenisMap = {};
    const bidangMap = {};

    files.forEach((f) => {
      // status akses
      f.private ? terbatas++ : publik++;

      // jenis dokumen
      const jenis = getJenisDokumen(f.name);
      jenisMap[jenis] = (jenisMap[jenis] || 0) + 1;

      // bidang dari kategori
      const bidang = getNamaBidang(f.kategori);
      bidangMap[bidang] = (bidangMap[bidang] || 0) + 1;
    });

    const arrJenis = Object.entries(jenisMap).map(([k, v]) => ({
      nama: k,
      jumlah: v,
      persen: total ? ((v / total) * 100).toFixed(1) : "0.0",
    }));

    const arrBidang = Object.entries(bidangMap).map(([k, v]) => ({
      nama: k,
      jumlah: v,
      persen: total ? ((v / total) * 100).toFixed(1) : "0.0",
    }));

    return { total, publik, terbatas, arrJenis, arrBidang };
  }, [files]);

  /* ===============================
     CETAK PDF (mode: "tanggal" / "semua")
  ================================ */
  const cetakPDF = async (mode = modeLaporan) => {
    if (hasil.total === 0) {
      toast.warn("Tidak ada data untuk dicetak");
      return;
    }

    // validasi kalau user memaksa cetak mode tanggal tapi belum isi tanggal
    if (mode === "tanggal" && (!dariTanggal || !sampaiTanggal)) {
      toast.warn("Periode tanggal belum dipilih (untuk cetak sesuai tanggal)");
      return;
    }

    try {
      const pdf = new jsPDF("p", "mm", "a4");

      // Ambil kop surat dari React
      const canvas = await html2canvas(kopSuratRef.current, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

      let y = imgHeight + 15;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("LAPORAN DISTRIBUSI DOKUMEN", 105, y, { align: "center" });

      y += 10;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);

      const periodeText =
        mode === "semua"
          ? "Semua Data (Tanpa Filter Tanggal)"
          : `Periode: ${dariTanggal} s.d ${sampaiTanggal}`;

      pdf.text(periodeText, 14, y);

      y += 8;
      pdf.text(
        `Total Dokumen : ${hasil.total}\n` +
        `Dokumen Publik : ${hasil.publik}\n` +
        `Dokumen Terbatas : ${hasil.terbatas}`,
        14,
        y
      );

      autoTable(pdf, {
        startY: y + 20,
        head: [["Jenis Dokumen", "Jumlah", "Persentase"]],
        body: hasil.arrJenis.map((j) => [j.nama, j.jumlah, `${j.persen}%`]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 10,
        head: [["Bidang", "Jumlah", "Persentase"]],
        body: hasil.arrBidang.map((b) => [b.nama, b.jumlah, `${b.persen}%`]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      const ttdY = pdf.lastAutoTable.finalY + 25;
      pdf.text("Banjarmasin, .........................", 130, ttdY);
      pdf.text("Mengetahui,", 130, ttdY + 6);
      pdf.text("Kepala Bidang Lalu Lintas Jalan", 130, ttdY + 30);

      const blobUrl = pdf.output("bloburl");
      window.open(blobUrl);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mencetak PDF");
    }
  };

  if (!bolehAkses) {
    return <p className="text-danger">Akses ditolak</p>;
  }

  /* ===============================
     RENDER
  ================================ */
  return (
    <Card className="p-4">
      {/* Kop surat untuk layar & PDF */}
      <div
        ref={kopSuratRef}
        style={{ position: "absolute", top: "-10000px", left: "-10000px" }}
      >
        <KopSurat />
      </div>

      <h5 className="text-center fw-bold my-4">LAPORAN DISTRIBUSI DOKUMEN</h5>

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
          {/* tombol lama (tetap) */}
          <Button onClick={ambilData} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Tampilkan (Filter Tanggal)"}
          </Button>

          {/* tombol baru ✅ */}
          <Button variant="outline-primary" onClick={ambilSemuaData} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Tampilkan Semua"}
          </Button>

          {/* cetak sesuai mode yang terakhir ditampilkan */}
          <Button variant="secondary" onClick={() => cetakPDF(modeLaporan)}>
            Cetak PDF
          </Button>

          {/* opsi tambahan biar jelas untuk dosen (boleh dihapus kalau tidak perlu) */}
          <Button variant="outline-secondary" onClick={() => cetakPDF("semua")}>
            Cetak PDF Semua
          </Button>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          📁 Total Dokumen: <b>{hasil.total}</b>
        </Col>
        <Col>
          🌐 Publik: <b>{hasil.publik}</b>
        </Col>
        <Col>
          🔒 Terbatas: <b>{hasil.terbatas}</b>
        </Col>
      </Row>

      <h6 className="fw-bold">Distribusi per Jenis Dokumen</h6>
      <Table bordered>
        <thead>
          <tr>
            <th>No</th>
            <th>Jenis Dokumen</th>
            <th>Jumlah</th>
            <th>Persen</th>
          </tr>
        </thead>
        <tbody>
          {hasil.arrJenis.map((j, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{j.nama}</td>
              <td>{j.jumlah}</td>
              <td>{j.persen}%</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h6 className="fw-bold mt-4">Distribusi per Bidang</h6>
      <Table bordered>
        <thead>
          <tr>
            <th>No</th>
            <th>Bidang</th>
            <th>Jumlah</th>
            <th>Persen</th>
          </tr>
        </thead>
        <tbody>
          {hasil.arrBidang.map((b, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{b.nama}</td>
              <td>{b.jumlah}</td>
              <td>{b.persen}%</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
