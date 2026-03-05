// src/pages/laporan/LaporanDokumen.jsx  (sesuaikan path jika beda)
import { useEffect, useMemo, useState } from "react";
import { Table, Spinner, Badge, Button, Form, Row, Col, InputGroup } from "react-bootstrap";
import { apiClient } from "../../apiClient";
import PrintLaporanDokumen from "./PrintLaporanDokumen";

export default function LaporanDokumen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // ====== FILTER UI STATE
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("semua"); // semua | publik | private
  const [kategori, setKategori] = useState("semua"); // semua | A | B | C (atau nilai di tabel kamu)
  const [from, setFrom] = useState(""); // yyyy-mm-dd
  const [to, setTo] = useState("");     // yyyy-mm-dd

  // ===============================
  // FETCH DATA
  // ===============================
  const fetchDokumen = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get("files.php");
      if (response.status !== 'success') throw new Error("Gagal mengambil data");

      let data = response.data || [];
      // urutkan berdasarkan created_at descending
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setRows(data);
    } catch (err) {
      console.error("Gagal memuat laporan dokumen:", err.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDokumen();
  }, []);

  // ===============================
  // HELPERS
  // ===============================
  const formatTanggal = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  const inDateRange = (createdAt) => {
    if (!createdAt) return true;
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return true;

    // from/to dari input date -> buat jadi batas waktu
    if (from) {
      const start = new Date(from + "T00:00:00");
      if (d < start) return false;
    }
    if (to) {
      const end = new Date(to + "T23:59:59");
      if (d > end) return false;
    }
    return true;
  };

  // ===============================
  // FILTERED ROWS (untuk layar & print)
  // ===============================
  const filteredRows = useMemo(() => {
    const keyword = q.trim().toLowerCase();

    return (rows || [])
      .filter((r) => {
        // status filter
        if (status === "publik" && r.private) return false;
        if (status === "private" && !r.private) return false;

        // kategori filter (kalau di DB kamu A/B/C, ini cocok)
        if (kategori !== "semua") {
          const k = (r.kategori || "").toString().trim();
          if (k !== kategori) return false;
        }

        // date range filter
        if (!inDateRange(r.created_at)) return false;

        // search filter
        if (!keyword) return true;
        const name = (r.name || "").toLowerCase();
        const owner = (r.owner || "").toLowerCase();
        const kat = (r.kategori || "").toLowerCase();
        return name.includes(keyword) || owner.includes(keyword) || kat.includes(keyword);
      })
      .map((r) => r);
  }, [rows, q, status, kategori, from, to]);

  // ===============================
  // STATS (berdasarkan filteredRows biar sinkron)
  // ===============================
  const stats = useMemo(() => {
    const total = filteredRows.length;
    const publik = filteredRows.filter((r) => !r.private).length;
    const privat = filteredRows.filter((r) => r.private).length;

    const byKategori = filteredRows.reduce((acc, r) => {
      const k = (r.kategori || "-").toString().trim() || "-";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    return { total, publik, privat, byKategori };
  }, [filteredRows]);

  const resetFilter = () => {
    setQ("");
    setStatus("semua");
    setKategori("semua");
    setFrom("");
    setTo("");
  };

  return (
    <div className="p-4">
      {/* ===== ACTION BAR (LAYAR SAJA) ===== */}
      <div className="no-print mb-3">
        <Row className="g-2 align-items-end">
          <Col lg={4} md={6}>
            <Form.Label className="mb-1">Cari (nama / uploader / kategori)</Form.Label>
            <InputGroup>
              <Form.Control
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="contoh: laporan, seidi, A"
              />
              <Button variant="outline-secondary" onClick={() => setQ("")} disabled={!q}>
                ✕
              </Button>
            </InputGroup>
          </Col>

          <Col lg={2} md={3}>
            <Form.Label className="mb-1">Status</Form.Label>
            <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="semua">Semua</option>
              <option value="publik">Publik</option>
              <option value="private">Private</option>
            </Form.Select>
          </Col>

          <Col lg={2} md={3}>
            <Form.Label className="mb-1">Kategori</Form.Label>
            <Form.Select value={kategori} onChange={(e) => setKategori(e.target.value)}>
              <option value="semua">Semua</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </Form.Select>
          </Col>

          <Col lg={2} md={3}>
            <Form.Label className="mb-1">Dari Tanggal</Form.Label>
            <Form.Control type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Col>

          <Col lg={2} md={3}>
            <Form.Label className="mb-1">Sampai</Form.Label>
            <Form.Control type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Col>
        </Row>

        <div className="mt-3 d-flex gap-2 flex-wrap align-items-center">
          <Button variant="secondary" onClick={fetchDokumen} disabled={loading}>
            {loading ? "Memuat..." : "🔄 Muat Ulang"}
          </Button>

          <Button variant="outline-secondary" onClick={resetFilter} disabled={!q && status === "semua" && kategori === "semua" && !from && !to}>
            ♻ Reset Filter
          </Button>

          <Button variant="primary" onClick={() => window.print()} disabled={filteredRows.length === 0}>
            🖨 Cetak Laporan
          </Button>

          <div className="ms-auto small text-muted">
            <span className="me-2">
              Total: <b>{stats.total}</b>
            </span>
            <span className="me-2">
              Publik: <b>{stats.publik}</b>
            </span>
            <span>
              Private: <b>{stats.privat}</b>
            </span>
          </div>
        </div>

        {/* Ringkas kategori */}
        <div className="mt-2 small text-muted">
          Kategori:{" "}
          {Object.keys(stats.byKategori).length === 0 ? (
            <span>-</span>
          ) : (
            Object.entries(stats.byKategori)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v], idx) => (
                <span key={k}>
                  <b>{k}</b>: {v}
                  {idx < Object.entries(stats.byKategori).length - 1 ? " | " : ""}
                </span>
              ))
          )}
        </div>
      </div>

      {/* ===== TABEL ADMIN (LAYAR SAJA) ===== */}
      <div className="no-print">
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Table bordered hover responsive className="screen-table">
            <thead className="table-dark">
              <tr>
                <th style={{ width: 60 }}>No</th>
                <th>Nama Dokumen</th>
                <th style={{ width: 120 }}>Kategori</th>
                <th style={{ width: 220 }}>Uploader</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 160 }}>Tanggal Upload</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    Tidak ada data (coba reset filter)
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td style={{ wordBreak: "break-word" }}>{r.name}</td>
                    <td>{r.kategori || "-"}</td>
                    <td style={{ wordBreak: "break-word" }}>{r.owner || "-"}</td>
                    <td>
                      <Badge bg={r.private ? "danger" : "success"}>
                        {r.private ? "Private" : "Publik"}
                      </Badge>
                    </td>
                    <td>{formatTanggal(r.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* ===== AREA CETAK (HANYA INI YANG BOLEH KEPRINT) ===== */}
      <div className="print-area">
        {/* kirim filteredRows agar hasil print sesuai filter */}
        <PrintLaporanDokumen rows={filteredRows} />
      </div>

      {/* ===== STYLE PRINT (opsional tapi penting biar rapi) ===== */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { display: block !important; }
          body { background: #fff !important; }
          .screen-table { display: none !important; }
        }
        @media screen {
          .print-area { display: none; }
        }
      `}</style>
    </div>
  );
}
