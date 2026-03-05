import { useEffect, useMemo, useState } from "react";
import { Table, Button, Spinner, Form, Badge, InputGroup } from "react-bootstrap";
import { toast } from "react-toastify";
import { apiClient } from "../../apiClient";

export default function AdminPermintaan() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState("semua");
    const [q, setQ] = useState("");
    const [timeLeft, setTimeLeft] = useState({});

    // ================= LOAD DATA =================
    const load = async () => {
        try {
            setLoading(true);

            const response = await apiClient.get("permintaan_akses_files.php");
            if (response.status !== 'success') throw new Error("Gagal mengambil data permintaan");

            const enriched = response.data || [];

            // auto delete > 24 jam (hanya yang sudah disetujui) -> sekarang ditangani secara lokal (filtering status)
            // ideally handled backend side query, but let's replicate logic here
            const now = new Date();
            for (const r of enriched) {
                if (r.status === "disetujui") {
                    const diff = (now - new Date(r.dibuat_pada)) / (1000 * 60 * 60);
                    if (diff > 24) {
                        try {
                            await apiClient.delete("permintaan_akses_files.php", r.id);
                        } catch (e) { }
                    }
                }
            }

            setRows(
                enriched.filter((r) => {
                    if (r.status !== "disetujui") return true;
                    const diff = (now - new Date(r.dibuat_pada)) / (1000 * 60 * 60);
                    return diff <= 24;
                })
            );
        } catch (e) {
            toast.error("Gagal memuat permintaan: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // ================= COUNTDOWN =================
    useEffect(() => {
        const itv = setInterval(() => {
            const updated = {};
            rows.forEach((r) => {
                if (r.status === "disetujui") {
                    const start = new Date(r.dibuat_pada);
                    const diff = 24 * 60 * 60 * 1000 - (Date.now() - start.getTime());
                    updated[r.id] = diff > 0 ? diff : 0;
                }
            });
            setTimeLeft(updated);
        }, 1000);

        return () => clearInterval(itv);
    }, [rows]);

    const formatCountdown = (ms) => {
        if (!ms || ms <= 0) return "⏰ Habis";
        const s = Math.floor(ms / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const ss = s % 60;
        return `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
    };

    // ================= FILTER =================
    const filtered = useMemo(() => {
        return rows.filter((r) => {
            const passStatus =
                statusFilter === "semua"
                    ? true
                    : (r.status || "menunggu") === statusFilter;

            const text = `${r.email_peminta || ""} ${r.pesan || ""} ${r.file?.name || ""
                }`.toLowerCase();

            const passQ = q.trim() === "" ? true : text.includes(q.trim().toLowerCase());

            return passStatus && passQ;
        });
    }, [rows, statusFilter, q]);

    // ================= APPROVE (DIPERBAIKI) =================
    const approve = async (r) => {
        try {
            const tokenRaw = localStorage.getItem('dishup_token');
            if (!tokenRaw) throw new Error("Admin belum login.");
            const admin = JSON.parse(atob(tokenRaw));

            toast.info("⏳ Memproses persetujuan...");

            const response = await apiClient.post("permintaan_akses_files.php?action=approve", {
                id: r.id,
                file_id: r.file_id,
                peminta_id: r.peminta_id,
                admin_id: admin.id
            });

            if (response.status !== 'success') throw new Error(response.message);

            console.log(`Email Approval Simulated to ${r.email_peminta}`);

            toast.success("✅ Permintaan disetujui.");
            load();
        } catch (e) {
            toast.error("Gagal menyetujui: " + e.message);
        }
    };

    // ================= DENY =================
    const deny = async (r) => {
        try {
            if (!window.confirm(`Yakin ingin menolak permintaan dari ${r.email_peminta}?`))
                return;

            console.log(`Email Deny Simulated to ${r.email_peminta}`);

            const response = await apiClient.delete("permintaan_akses_files.php", r.id);
            if (response.status !== 'success') throw new Error(response.message);

            toast.success("❌ Permintaan ditolak.");
            setRows((prev) => prev.filter((x) => x.id !== r.id));
        } catch (e) {
            toast.error("Gagal menolak: " + e.message);
        }
    };

    // ================= REVOKE (SOLUSI 2) =================
    // Cabut = hapus izin di izin_files + ubah status permintaan jadi "dicabut"
    const revoke = async (r) => {
        try {
            if (!window.confirm(`Cabut akses untuk ${r.email_peminta}?`)) return;

            const response = await apiClient.post("permintaan_akses_files.php?action=revoke", {
                id: r.id,
                file_id: r.file_id,
                peminta_id: r.peminta_id
            });
            if (response.status !== 'success') throw new Error(response.message);

            toast.warn("🔒 Izin dicabut.");
            load();
        } catch (e) {
            toast.error("Gagal mencabut izin: " + (e?.message || "Unknown error"));
        }
    };

    const StatusBadge = ({ s }) => {
        const v = s || "menunggu";
        const variant =
            v === "disetujui"
                ? "success"
                : v === "ditolak"
                    ? "danger"
                    : v === "dicabut"
                        ? "warning"
                        : "secondary";
        return <Badge bg={variant}>{v.toUpperCase()}</Badge>;
    };

    // ================= UI =================
    return (
        <div className="container-responsive">
            <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
                <h3>📨 Permintaan Akses File</h3>
                <Button variant="outline-secondary" onClick={load} disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : "🔄 Muat Ulang"}
                </Button>
            </div>

            <div className="d-flex gap-2 flex-wrap mb-3">
                <Form.Select
                    style={{ maxWidth: 220 }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="semua">Semua Status</option>
                    <option value="menunggu">Menunggu</option>
                    <option value="disetujui">Disetujui</option>
                    <option value="ditolak">Ditolak</option>
                    <option value="dicabut">Dicabut</option>
                </Form.Select>

                <InputGroup style={{ maxWidth: 360 }}>
                    <Form.Control
                        placeholder="Cari email / file / pesan..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <Button variant="outline-secondary" onClick={() => setQ("")}>
                        Bersihkan
                    </Button>
                </InputGroup>
            </div>

            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>File</th>
                            <th>Peminta</th>
                            <th>Pesan</th>
                            <th>Waktu</th>
                            <th>Status</th>
                            <th>Sisa</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-4">
                                    Tidak ada data
                                </td>
                            </tr>
                        ) : (
                            filtered.map((r, i) => (
                                <tr key={r.id}>
                                    <td>{i + 1}</td>
                                    <td>
                                        <b>{r.file?.name || "-"}</b>
                                        <br />
                                        <small>{r.file?.private ? "Privat" : "Publik"}</small>
                                    </td>
                                    <td>{r.email_peminta}</td>
                                    <td>{r.pesan || "-"}</td>
                                    <td>{new Date(r.dibuat_pada).toLocaleString()}</td>
                                    <td>
                                        <StatusBadge s={r.status} />
                                    </td>
                                    <td>
                                        {r.status === "disetujui"
                                            ? formatCountdown(timeLeft[r.id])
                                            : "-"}
                                    </td>
                                    <td className="d-flex gap-2 flex-wrap">
                                        {r.status === "menunggu" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    onClick={() => approve(r)}
                                                >
                                                    Setujui
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => deny(r)}
                                                >
                                                    Tolak
                                                </Button>
                                            </>
                                        )}

                                        {r.status === "disetujui" && (
                                            <Button
                                                size="sm"
                                                variant="warning"
                                                onClick={() => revoke(r)}
                                            >
                                                Cabut
                                            </Button>
                                        )}

                                        {r.status === "dicabut" && (
                                            <small className="text-muted">-</small>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}
