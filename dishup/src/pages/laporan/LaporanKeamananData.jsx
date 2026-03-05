import { useMemo, useRef, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Table,
  Badge,
} from "react-bootstrap";
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

// kategori -> nama seksi
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

const getStatusKeamanan = (kepatuhanPct) => {
  if (kepatuhanPct >= 85) return { label: "BAIK", variant: "success" };
  if (kepatuhanPct >= 70) return { label: "CUKUP", variant: "warning" };
  return { label: "PERLU PERHATIAN", variant: "danger" };
};

export default function LaporanKeamananData() {
  const { role } = useRole();
  const bolehAkses = role === "admin" || role === "pegawai";

  const [loading, setLoading] = useState(false);

  const [dariTanggal, setDariTanggal] = useState("");
  const [sampaiTanggal, setSampaiTanggal] = useState("");

  const [files, setFiles] = useState([]);
  const [izinFileIds, setIzinFileIds] = useState(new Set()); // file_id yang punya izin

  // mode laporan: "tanggal" atau "semua" (untuk label periode di PDF)
  const [modeLaporan, setModeLaporan] = useState("tanggal");

  const kopSuratRef = useRef(null);

  /* =========================
     AMBIL DATA (FILTER TANGGAL)
  ========================= */
  const ambilData = async () => {
    if (!bolehAkses) return;

    if (!dariTanggal || !sampaiTanggal) {
      toast.warn("Silakan pilih rentang tanggal");
      return;
    }

    setLoading(true);
    try {
      // 1) Ambil files dari PHP API
      const responseFiles = await apiClient.get("files.php");
      if (responseFiles.status !== 'success') throw new Error("Gagal mengambil data files");

      let list = responseFiles.data || [];

      // Filter tanggal
      const startTgl = new Date(startOfDay(dariTanggal)).getTime();
      const endTgl = new Date(endOfDay(sampaiTanggal)).getTime();

      list = list.filter(f => {
        if (!f.created_at) return false;
        const createdTime = new Date(f.created_at).getTime();
        return createdTime >= startTgl && createdTime <= endTgl;
      });

      setFiles(list);
      setModeLaporan("tanggal");

      if (list.length === 0) {
        setIzinFileIds(new Set());
        toast.info("Tidak ada data pada rentang tanggal tersebut");
        return;
      }

      // 2) Ambil izin_files
      const responseIzin = await apiClient.get("izin_files.php");
      if (responseIzin.status !== 'success') throw new Error("Gagal mengambil izin files");

      const izinData = responseIzin.data || [];
      const s = new Set(izinData.map((x) => x.file_id).filter(Boolean));
      setIzinFileIds(s);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil data laporan keamanan");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     AMBIL SEMUA DATA (TANPA FILTER TANGGAL) ✅ fitur dosen
  ========================= */
  const ambilSemuaData = async () => {
    if (!bolehAkses) return;

    setLoading(true);
    try {
      // 1) Ambil semua files dari PHP API
      const responseFiles = await apiClient.get("files.php");
      if (responseFiles.status !== 'success') throw new Error("Gagal mengambil data files");

      const list = responseFiles.data || [];
      setFiles(list);
      setModeLaporan("semua");

      if (list.length === 0) {
        setIzinFileIds(new Set());
        toast.info("Tidak ada data dokumen");
        return;
      }

      // 2) Ambil semua izin_files
      const responseIzin = await apiClient.get("izin_files.php");
      if (responseIzin.status !== 'success') throw new Error("Gagal mengambil izin files");

      const izinData = responseIzin.data || [];
      const s = new Set(izinData.map((x) => x.file_id).filter(Boolean));
      setIzinFileIds(s);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil semua data laporan keamanan");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     PROSES -> DATA BARU
     (kepatuhan, status keamanan, risiko)
  ========================= */
  const hasil = useMemo(() => {
    const total = files.length;

    let publik = 0;
    let terbatas = 0;

    // kepatuhan hanya untuk dokumen terbatas
    let patuh = 0;
    let tidakPatuh = 0;

    const bidangMap = {}; // per bidang: total/publik/terbatas/patuh/tidakPatuh
    const risikoList = []; // dokumen terbatas tanpa izin

    files.forEach((f) => {
      const bidang = getNamaBidang(f.kategori);

      if (!bidangMap[bidang]) {
        bidangMap[bidang] = {
          bidang,
          total: 0,
          publik: 0,
          terbatas: 0,
          patuh: 0,
          tidakPatuh: 0,
        };
      }

      bidangMap[bidang].total += 1;

      if (f.private) {
        terbatas += 1;
        bidangMap[bidang].terbatas += 1;

        const punyaIzin = izinFileIds.has(f.id);

        if (punyaIzin) {
          patuh += 1;
          bidangMap[bidang].patuh += 1;
        } else {
          tidakPatuh += 1;
          bidangMap[bidang].tidakPatuh += 1;
          risikoList.push({
            name: f.name,
            bidang,
            created_at: f.created_at,
          });
        }
      } else {
        publik += 1;
        bidangMap[bidang].publik += 1;
      }
    });

    // Kepatuhan dihitung dari dokumen terbatas saja
    const kepatuhanPct = terbatas === 0 ? 100 : (patuh / terbatas) * 100;

    const status = getStatusKeamanan(kepatuhanPct);

    const arrBidang = Object.values(bidangMap).map((b) => ({
      ...b,
      kepatuhan_bidang_pct:
        b.terbatas === 0 ? 100 : (b.patuh / b.terbatas) * 100,
    }));

    // urutkan risiko (terbaru dulu)
    risikoList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      total,
      publik,
      terbatas,
      patuh,
      tidakPatuh,
      kepatuhanPct: Number(kepatuhanPct.toFixed(1)),
      status,
      arrBidang,
      risikoList,
    };
  }, [files, izinFileIds]);

  /* =========================
     CETAK PDF
     (mode: "tanggal" / "semua")
  ========================= */
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

      // ambil kop surat dari komponen
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
      pdf.text("LAPORAN STATUS KEPATUHAN & KEAMANAN DATA", 105, y, {
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

      y += 7;
      pdf.text(
        `Ringkasan:\n` +
        `- Total Dokumen: ${hasil.total}\n` +
        `- Publik: ${hasil.publik}\n` +
        `- Terbatas: ${hasil.terbatas}\n` +
        `- Terbatas Patuh (ada izin): ${hasil.patuh}\n` +
        `- Terbatas Tidak Patuh (tanpa izin): ${hasil.tidakPatuh}\n` +
        `- Tingkat Kepatuhan: ${hasil.kepatuhanPct}%\n` +
        `- Status Keamanan: ${hasil.status.label}`,
        14,
        y
      );

      // tabel per bidang
      autoTable(pdf, {
        startY: y + 30,
        head: [
          [
            "Bidang",
            "Total",
            "Publik",
            "Terbatas",
            "Patuh",
            "Tidak Patuh",
            "Kepatuhan (%)",
          ],
        ],
        body: hasil.arrBidang.map((b) => [
          b.bidang,
          b.total,
          b.publik,
          b.terbatas,
          b.patuh,
          b.tidakPatuh,
          (b.kepatuhan_bidang_pct ?? 0).toFixed(1),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
      });

      // daftar risiko (maks 10 biar ga kepanjangan)
      const risikoTop = hasil.risikoList.slice(0, 10);
      if (risikoTop.length > 0) {
        autoTable(pdf, {
          startY: pdf.lastAutoTable.finalY + 10,
          head: [["Dokumen Terbatas Tanpa Izin (Risiko)", "Bidang", "Tanggal Upload"]],
          body: risikoTop.map((r) => [
            r.name,
            r.bidang,
            new Date(r.created_at).toLocaleString(),
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [231, 76, 60] },
        });
      }

      // TTD
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

  /* =========================
     UI
  ========================= */
  return (
    <Card className="p-4">
      <div
        ref={kopSuratRef}
        style={{ position: "absolute", top: "-10000px", left: "-10000px" }}
      >
        <KopSurat />
      </div>

      <h5 className="text-center fw-bold my-4">
        LAPORAN STATUS KEPATUHAN & KEAMANAN DATA
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
          {/* tombol lama (tetap) */}
          <Button onClick={ambilData} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Tampilkan (Filter Tanggal)"}
          </Button>

          {/* tombol baru ✅ */}
          <Button variant="outline-primary" onClick={ambilSemuaData} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Tampilkan Semua"}
          </Button>

          {/* cetak ikut mode terakhir */}
          <Button variant="secondary" onClick={() => cetakPDF(modeLaporan)}>
            Cetak PDF
          </Button>

          {/* opsi tambahan biar jelas */}
          <Button variant="outline-secondary" onClick={() => cetakPDF("semua")}>
            Cetak PDF Semua
          </Button>
        </Col>
      </Row>

      {/* Ringkasan */}
      <Row className="mb-3 g-3">
        <Col md={3}>
          <Card className="p-3 h-100">
            <div className="text-muted">Total Dokumen</div>
            <div className="fs-4 fw-bold">{hasil.total}</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 h-100">
            <div className="text-muted">Publik</div>
            <div className="fs-4 fw-bold">{hasil.publik}</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 h-100">
            <div className="text-muted">Terbatas</div>
            <div className="fs-4 fw-bold">{hasil.terbatas}</div>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="p-3 h-100">
            <div className="text-muted">Kepatuhan</div>
            <div className="fs-4 fw-bold">
              {hasil.kepatuhanPct}%{" "}
              <Badge bg={hasil.status.variant}>{hasil.status.label}</Badge>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Detail Kepatuhan */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="p-3 h-100">
            <div className="text-muted">Terbatas Patuh (Ada Izin)</div>
            <div className="fs-4 fw-bold">{hasil.patuh}</div>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3 h-100">
            <div className="text-muted">Terbatas Tidak Patuh (Tanpa Izin)</div>
            <div className="fs-4 fw-bold text-danger">{hasil.tidakPatuh}</div>
          </Card>
        </Col>
      </Row>

      {/* Tabel per Bidang */}
      <h6 className="fw-bold">Rekap Kepatuhan per Bidang</h6>
      <Table bordered responsive>
        <thead>
          <tr>
            <th>No</th>
            <th>Bidang</th>
            <th>Total</th>
            <th>Publik</th>
            <th>Terbatas</th>
            <th>Patuh</th>
            <th>Tidak Patuh</th>
            <th>Kepatuhan (%)</th>
          </tr>
        </thead>
        <tbody>
          {hasil.arrBidang.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center text-muted">
                Tidak ada data
              </td>
            </tr>
          ) : (
            hasil.arrBidang.map((b, idx) => (
              <tr key={b.bidang}>
                <td>{idx + 1}</td>
                <td>{b.bidang}</td>
                <td>{b.total}</td>
                <td>{b.publik}</td>
                <td>{b.terbatas}</td>
                <td>{b.patuh}</td>
                <td className={b.tidakPatuh > 0 ? "text-danger fw-bold" : ""}>
                  {b.tidakPatuh}
                </td>
                <td>{(b.kepatuhan_bidang_pct ?? 0).toFixed(1)}%</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Daftar Risiko */}
      <h6 className="fw-bold mt-4">Daftar Dokumen Berisiko</h6>
      <div className="text-muted mb-2" style={{ fontSize: 13 }}>
        Dokumen terbatas yang <b>belum memiliki izin akses</b> (indikasi risiko kepatuhan).
      </div>

      <Table bordered responsive>
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Dokumen</th>
            <th>Bidang</th>
            <th>Tanggal Upload</th>
          </tr>
        </thead>
        <tbody>
          {hasil.risikoList.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-muted">
                Tidak ada dokumen berisiko ✅
              </td>
            </tr>
          ) : (
            hasil.risikoList.slice(0, 20).map((r, i) => (
              <tr key={`${r.name}-${i}`}>
                <td>{i + 1}</td>
                <td className="text-danger fw-semibold">{r.name}</td>
                <td>{r.bidang}</td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Card>
  );
}
