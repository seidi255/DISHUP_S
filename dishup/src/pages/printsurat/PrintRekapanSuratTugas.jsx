import { useEffect, useMemo, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "../../apiClient";
import KopSurat from "./KopSurat";

export default function PrintRekapanSuratTugas() {
  const [params] = useSearchParams();
  const tahun = params.get("tahun") || "semua";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    return tahun === "semua"
      ? "REKAPAN SURAT TUGAS (SEMUA TAHUN)"
      : `REKAPAN SURAT TUGAS TAHUN ${tahun}`;
  }, [tahun]);

  const load = async () => {
    setLoading(true);

    try {
      const response = await apiClient.get("surat_tugas.php");
      if (response.status !== 'success') throw new Error("Gagal load data");

      let data = response.data || [];
      // order desc
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      let filtered = data;
      if (tahun !== "semua") {
        filtered = filtered.filter((r) => {
          if (!r?.created_at) return false;
          return String(new Date(r.created_at).getFullYear()) === String(tahun);
        });
      }

      setRows(filtered);
    } catch (error) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tahun]);

  const handlePrint = () => window.print();

  return (
    <div className="p-4">

      {/* ================= TOMBOL (TIDAK IKUT PRINT) ================= */}
      <div className="d-flex justify-content-end gap-2 mb-3 no-print">
        <Button variant="secondary" onClick={() => window.history.back()}>
          Kembali
        </Button>
        <Button variant="dark" onClick={handlePrint}>
          🖨️ Cetak Rekapan
        </Button>
      </div>

      {/* ================= AREA YANG DICETAK ================= */}
      <div className="print-area">

        {/* KOP SURAT */}
        <KopSurat />

        {/* JUDUL */}
        <div className="text-center my-3">
          <h5 className="fw-bold mb-1">{title}</h5>
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
            <Table bordered responsive className="mt-3">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>No</th>
                  <th style={{ width: 170 }}>Nomor Surat</th>
                  <th>Nama Pegawai</th>
                  <th>Jabatan</th>
                  <th style={{ width: 130 }}>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>{r.nomor_surat}</td>
                    <td>{r.nama_pegawai}</td>
                    <td>{r.jabatan_pegawai}</td>
                    <td>
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString("id-ID")
                        : "-"}
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      Tidak ada data untuk rekapan ini
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
