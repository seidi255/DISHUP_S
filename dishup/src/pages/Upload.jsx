import { useState, useEffect, useRef } from "react";
import { Form, Button, Container, Card, Row, Col, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../apiClient";
import { toast } from "react-toastify";
import { FiUploadCloud, FiFile, FiX, FiLock, FiUnlock, FiCheckCircle } from "react-icons/fi"; // Menggunakan React Icons

export default function Upload() {
    const [file, setFile] = useState(null);
    const [kategori, setKategori] = useState("A");
    const [isPrivate, setIsPrivate] = useState(false);
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // 🔹 Ambil role user (Logika Tetap Sama)
    useEffect(() => {
        const fetchRole = async () => {
            try {
                const tokenRaw = localStorage.getItem('dishup_token');
                if (!tokenRaw) {
                    toast.error("Anda belum login!");
                    navigate("/login");
                    return;
                }

                let userData;
                try {
                    userData = JSON.parse(atob(tokenRaw));
                } catch (e) {
                    toast.error("Sesi tidak valid!");
                    navigate("/login");
                    return;
                }

                if (!userData) {
                    toast.error("Anda belum login!");
                    navigate("/login");
                    return;
                }
                setRole(userData.role);
            } catch (err) {
                console.error("Gagal memuat role:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRole();
    }, [navigate]);

    // 🔹 Helper: Format Ukuran File
    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    // 🔹 Handle Drag & Drop
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    // 🔹 Fungsi Upload
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (role !== "pegawai" && role !== "admin") return;
        if (!file) {
            toast.error("❌ Pilih file terlebih dahulu!");
            return;
        }

        setUploading(true); // Mulai status uploading

        try {
            const tokenRaw = localStorage.getItem('dishup_token');
            const userData = JSON.parse(atob(tokenRaw));

            // Siapkan FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('kategori', kategori);
            formData.append('private', isPrivate ? 1 : 0);
            formData.append('user_id', userData.id);
            formData.append('owner', userData.email);

            // Upload dengan apiClient khusus form data
            const response = await apiClient.postFormData("files.php", formData);

            if (response.status === 'success') {
                toast.success(`✅ File berhasil diupload ke Seksi ${kategori}`);
                navigate(`/seksi-${kategori.toLowerCase()}`);
            } else {
                throw new Error(response.message || "Gagal mengupload file");
            }

        } catch (err) {
            console.error(err);
            toast.error("❌ Upload gagal: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    // 🔹 UI Loading Awal
    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <Spinner animation="border" variant="primary" />
            <span className="ms-3 text-muted">Memuat data user...</span>
        </Container>
    );

    // 🔹 UI Akses Dibatasi
    if (role !== "pegawai" && role !== "admin") {
        return (
            <Container className="d-flex justify-content-center mt-5">
                <Card className="text-center p-5 shadow-sm border-0" style={{ maxWidth: "500px" }}>
                    <div className="mb-3 text-danger display-4"><FiLock /></div>
                    <h3 className="fw-bold">Akses Dibatasi</h3>
                    <p className="text-muted">
                        Anda login sebagai <Badge bg="secondary">{role || "User"}</Badge>.<br />
                        Hanya Pegawai dan Admin yang dapat mengupload dokumen.
                    </p>
                    <Button variant="outline-dark" onClick={() => navigate("/")} className="mt-3">
                        🔙 Kembali ke Beranda
                    </Button>
                </Card>
            </Container>
        );
    }

    // 🔹 UI UTAMA (Upload Form)
    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-lg border-0 rounded-4">
                        <Card.Header className="bg-primary text-white text-center py-4 rounded-top-4">
                            <h4 className="mb-0 fw-bold"><FiUploadCloud className="me-2" /> Upload Dokumen</h4>
                            <small className="opacity-75">Sistem Manajemen File Dishub</small>
                        </Card.Header>
                        <Card.Body className="p-4 p-md-5">
                            <Form onSubmit={handleSubmit}>

                                {/* Area Drag & Drop */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold text-secondary">File Dokumen</Form.Label>
                                    <div
                                        className={`upload-area p-4 text-center rounded-3 border-2 ${dragActive ? "border-primary bg-light" : "border-secondary"}`}
                                        style={{ borderStyle: "dashed", cursor: "pointer", transition: "0.3s" }}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="d-none"
                                            onChange={handleChange}
                                        />

                                        {!file ? (
                                            <div className="text-muted">
                                                <FiUploadCloud size={40} className="mb-2 text-primary" />
                                                <p className="mb-0 fw-medium">Klik atau Tarik file ke sini</p>
                                                <small style={{ fontSize: "12px" }}>PDF, Word, Excel, JPG (Max 10MB)</small>
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-between p-2 bg-white rounded border shadow-sm">
                                                <div className="d-flex align-items-center text-truncate">
                                                    <div className="bg-light p-2 rounded me-3 text-primary">
                                                        <FiFile size={24} />
                                                    </div>
                                                    <div className="text-start">
                                                        <p className="mb-0 fw-bold text-dark text-truncate" style={{ maxWidth: "200px" }}>{file.name}</p>
                                                        <small className="text-muted">{formatBytes(file.size)}</small>
                                                    </div>
                                                </div>
                                                <Button variant="link" className="text-danger p-0" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                                    <FiX size={20} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Form.Group>

                                {/* Kategori Selection */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-semibold text-secondary">Kategori Seksi</Form.Label>
                                    <Form.Select
                                        size="lg"
                                        className="form-select-lg shadow-none border-secondary-subtle"
                                        value={kategori}
                                        onChange={(e) => setKategori(e.target.value)}
                                    >
                                        <option value="A">🚥 Keselamatan Lalu Lintas</option>
                                        <option value="B">🛣️ Manajemen & Rekayasa Lalin</option>
                                        <option value="C">👮 Pengendalian & Operasional</option>
                                    </Form.Select>
                                </Form.Group>

                                {/* Privacy Toggle */}
                                <Card className={`mb-4 border-${isPrivate ? "warning" : "light"} bg-light`}>
                                    <Card.Body className="d-flex align-items-center justify-content-between py-3">
                                        <div className="d-flex align-items-center">
                                            {isPrivate ? <FiLock className="text-warning me-3" size={24} /> : <FiUnlock className="text-success me-3" size={24} />}
                                            <div>
                                                <h6 className="mb-0 fw-bold">Status Privasi</h6>
                                                <small className="text-muted">
                                                    {isPrivate ? "Hanya Anda yang bisa melihat file ini." : "File dapat dilihat oleh semua pegawai."}
                                                </small>
                                            </div>
                                        </div>
                                        <Form.Check
                                            type="switch"
                                            id="custom-switch"
                                            checked={isPrivate}
                                            onChange={(e) => setIsPrivate(e.target.checked)}
                                            style={{ transform: "scale(1.3)" }}
                                        />
                                    </Card.Body>
                                </Card>

                                {/* Submit Button */}
                                <div className="d-grid gap-2">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        type="submit"
                                        disabled={!file || uploading}
                                        className="fw-bold py-3 shadow-sm"
                                    >
                                        {uploading ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                                Mengupload...
                                            </>
                                        ) : (
                                            <>
                                                <FiCheckCircle className="me-2" /> Upload Sekarang
                                            </>
                                        )}
                                    </Button>
                                </div>

                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}