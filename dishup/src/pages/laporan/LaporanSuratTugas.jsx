import { useEffect, useMemo, useState } from "react";
import { Button, Table, Spinner, Form, Card, Row, Col, Badge, InputGroup, Container } from "react-bootstrap";
import { apiClient } from "../../apiClient";
import { toast } from "react-toastify";
import FormSuratTugas from "../../components/surat/FormSuratTugas";
import { useNavigate } from "react-router-dom";
// Icons
import { FiPlus, FiPrinter, FiEdit, FiTrash2, FiFileText, FiUser, FiCalendar, FiFilter, FiSearch } from "react-icons/fi";

export default function LaporanSuratTugas() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [tahun, setTahun] = useState("semua");
    const [search, setSearch] = useState(""); // Tambahan: Fitur Search
    const navigate = useNavigate();

    // === LOAD DATA ===
    const loadData = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get("surat_tugas.php");
            if (response.status === 'success') {
                setRows(response.data || []);
            } else {
                throw new Error(response.message || "Gagal memuat data");
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // === ACTIONS ===
    const handleDelete = async (id) => {
        if (!window.confirm("Hapus surat tugas ini?")) return;
        try {
            const response = await apiClient.delete("surat_tugas.php", id);
            if (response.status === 'success') {
                toast.success("Surat tugas berhasil dihapus");
                loadData();
            } else {
                throw new Error(response.message || "Gagal menghapus");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEdit = (row) => {
        setSelectedData(row);
        setShow(true);
    };

    const handleTambah = () => {
        setSelectedData(null);
        setShow(true);
    };

    // === FILTERING ===
    const tahunList = useMemo(() => {
        const setT = new Set();
        (rows || []).forEach((r) => {
            if (!r?.created_at) return;
            const y = new Date(r.created_at).getFullYear();
            if (!Number.isNaN(y)) setT.add(String(y));
        });
        return ["semua", ...Array.from(setT).sort((a, b) => Number(b) - Number(a))];
    }, [rows]);

    const filteredRows = useMemo(() => {
        let data = rows;

        // Filter Tahun
        if (tahun !== "semua") {
            data = data.filter((r) => {
                if (!r?.created_at) return false;
                return String(new Date(r.created_at).getFullYear()) === tahun;
            });
        }

        // Filter Search (Nomor Surat / Nama Pegawai)
        if (search) {
            const q = search.toLowerCase();
            data = data.filter(r =>
                (r.nomor_surat || "").toLowerCase().includes(q) ||
                (r.nama_pegawai || "").toLowerCase().includes(q)
            );
        }

        return data;
    }, [rows, tahun, search]);

    const handleCetakRekapan = () => {
        navigate(`/print/rekapan-surat-tugas?tahun=${encodeURIComponent(tahun)}`);
    };

    useEffect(() => { loadData(); }, []);

    // === UI ===
    return (
        <Container fluid className="p-4">
            <Card className="shadow-sm border-0 rounded-4">
                <Card.Body className="p-4">

                    {/* HEADER SECTION */}
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                        <div>
                            <h3 className="fw-bold mb-1 text-primary">📄 Laporan Surat Tugas</h3>
                            <p className="text-muted mb-0 small">Kelola data penugasan pegawai dan cetak surat.</p>
                        </div>
                        <Button variant="primary" onClick={handleTambah} className="d-flex align-items-center gap-2 shadow-sm px-4 py-2 rounded-pill">
                            <FiPlus size={18} /> Buat Surat Baru
                        </Button>
                    </div>

                    {/* TOOLBAR (FILTER & ACTIONS) */}
                    <div className="bg-light p-3 rounded-3 mb-4 d-flex flex-wrap gap-3 align-items-center justify-content-between">

                        {/* Kiri: Search & Filter */}
                        <div className="d-flex gap-2 flex-wrap flex-grow-1">
                            {/* Filter Tahun */}
                            <InputGroup style={{ maxWidth: "200px" }}>
                                <InputGroup.Text className="bg-white border-end-0"><FiCalendar className="text-muted" /></InputGroup.Text>
                                <Form.Select
                                    className="border-start-0 shadow-none"
                                    value={tahun}
                                    onChange={(e) => setTahun(e.target.value)}
                                >
                                    {tahunList.map((t) => (
                                        <option key={t} value={t}>
                                            {t === "semua" ? "📅 Semua Tahun" : `📅 Tahun ${t}`}
                                        </option>
                                    ))}
                                </Form.Select>
                            </InputGroup>

                            {/* Search */}
                            <InputGroup style={{ maxWidth: "300px" }}>
                                <InputGroup.Text className="bg-white border-end-0"><FiSearch className="text-muted" /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Cari Nomor / Nama..."
                                    className="border-start-0 shadow-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </InputGroup>
                        </div>

                        {/* Kanan: Cetak Rekapan */}
                        <Button variant="outline-dark" onClick={handleCetakRekapan} className="d-flex align-items-center gap-2">
                            <FiPrinter /> Cetak Laporan Tahunan
                        </Button>
                    </div>

                    {/* TABLE */}
                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                    ) : filteredRows.length === 0 ? (
                        <div className="text-center py-5 border rounded-3 bg-light">
                            <FiFileText size={40} className="text-muted opacity-50 mb-2" />
                            <p className="text-muted mb-0">Tidak ada data surat tugas ditemukan.</p>
                        </div>
                    ) : (
                        <div className="table-responsive rounded-3 border">
                            <Table hover className="align-middle mb-0" style={{ minWidth: "800px" }}>
                                <thead className="bg-light text-secondary small text-uppercase">
                                    <tr>
                                        <th className="py-3 ps-4" style={{ width: "50px" }}>No</th>
                                        <th className="py-3">Detail Surat</th>
                                        <th className="py-3">Pegawai Ditugaskan</th>
                                        <th className="py-3 text-end pe-4" style={{ width: "250px" }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRows.map((r, i) => (
                                        <tr key={r.id}>
                                            <td className="ps-4 fw-bold text-muted">{i + 1}</td>

                                            {/* Kolom Surat */}
                                            <td>
                                                <div className="d-flex align-items-start gap-2">
                                                    <div className="bg-primary-subtle text-primary p-2 rounded mt-1">
                                                        <FiFileText size={18} />
                                                    </div>
                                                    <div>
                                                        <span className="fw-bold text-dark d-block">{r.nomor_surat}</span>
                                                        <small className="text-muted">
                                                            <FiCalendar className="me-1" size={12} />
                                                            Dibuat: {new Date(r.created_at).toLocaleDateString("id-ID")}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Kolom Pegawai */}
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-light border rounded-circle d-flex align-items-center justify-content-center text-muted" style={{ width: 35, height: 35 }}>
                                                        <FiUser />
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{r.nama_pegawai}</div>
                                                        <Badge bg="secondary" className="fw-normal bg-opacity-10 text-secondary border border-secondary">
                                                            {r.jabatan_pegawai}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Kolom Aksi */}
                                            <td className="text-end pe-4">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="d-flex align-items-center gap-1"
                                                        onClick={() => navigate(`/print/surat-tugas/${r.id}`)}
                                                        title="Cetak Surat"
                                                    >
                                                        <FiPrinter /> <span className="d-none d-lg-inline">Cetak</span>
                                                    </Button>
                                                    <Button
                                                        variant="warning"
                                                        size="sm"
                                                        className="d-flex align-items-center gap-1 text-white"
                                                        onClick={() => handleEdit(r)}
                                                        title="Edit Data"
                                                    >
                                                        <FiEdit />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="d-flex align-items-center gap-1"
                                                        onClick={() => handleDelete(r.id)}
                                                        title="Hapus Data"
                                                    >
                                                        <FiTrash2 />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            <FormSuratTugas
                show={show}
                setShow={setShow}
                reload={loadData}
                selectedData={selectedData}
            />
        </Container>
    );
}