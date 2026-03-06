import { useState, useEffect, useMemo } from "react";
import { Button, Form, Pagination, Modal, Image, Spinner, Badge, InputGroup, Container, Dropdown } from "react-bootstrap";
import { toast } from "react-toastify";
import { apiClient } from "../apiClient";
import { cekBolehDownload } from "../utils/cekBolehDownload";
// Icons Modern
import { FiSearch, FiRefreshCw, FiDownload, FiTrash2, FiLock, FiUnlock, FiEye, FiFileText, FiMoreVertical, FiCalendar, FiUser } from "react-icons/fi";
// Custom Toggle untuk Dropdown
import React from 'react';

export default function Seksi({ kategori, nama }) {
    const [files, setFiles] = useState([]);
    const [filteredFiles, setFilteredFiles] = useState([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [authUser, setAuthUser] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Preview state
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [previewLoading, setPreviewLoading] = useState(false);

    const isImage = (name = "") => /\.(jpg|jpeg|png|gif|webp)$/i.test(name || "");

    // 1. Load User
    useEffect(() => {
        const tokenRaw = localStorage.getItem('dishup_token');
        if (tokenRaw) {
            try {
                const userData = JSON.parse(atob(tokenRaw));
                setAuthUser(userData);
            } catch (e) {
                setAuthUser(null);
            }
        }
    }, []);

    // 2. Load Data
    const loadData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get("files.php");
            if (response.status !== 'success') throw new Error("Gagal mengambil data");

            let data = response.data || [];
            // Filter by kategori
            data = data.filter(d => d.kategori === kategori);
            // Sort by created_at desc
            data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setFiles(data);
            setFilteredFiles(data);
            setCurrentPage(1);
        } catch (e) {
            toast.error("Gagal load data: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [kategori]);

    // 3. Search
    const handleSearch = (e) => {
        const q = e.target.value.toLowerCase();
        setQuery(q);
        const result = files.filter(f =>
            f.name.toLowerCase().includes(q) ||
            (f.owner || "").toLowerCase().includes(q)
        );
        setFilteredFiles(result);
        setCurrentPage(1);
    };

    // 4. Pagination
    const paginate = useMemo(() => {
        const indexOfLast = currentPage * itemsPerPage;
        const indexOfFirst = indexOfLast - itemsPerPage;
        return {
            currentFiles: filteredFiles.slice(indexOfFirst, indexOfLast),
            totalPages: Math.ceil(filteredFiles.length / itemsPerPage) || 1,
        };
    }, [filteredFiles, currentPage]);

    // Actions
    const handleDownload = async (file) => {
        try {
            toast.success("Mulai mengunduh...");
            // Asumsi file di uploads ditaruh di sana oleh upload script kita di files.php
            const url = `http://localhost/DISHUP_S/dishup/api/uploads/${file.path}`;
            const a = document.createElement("a");
            a.href = url; a.download = file.name; a.target = "_blank"; a.click();
        } catch (e) { toast.error("Gagal: " + e.message); }
    };

    const handleDelete = async (file) => {
        if (!confirm(`Hapus permanen "${file.name}"?`)) return;
        try {
            const response = await apiClient.delete("files.php", file.id);
            if (response.status === 'success') {
                toast.success("File dihapus");
                loadData();
            } else {
                throw new Error(response.message);
            }
        } catch (e) { toast.error(e.message); }
    };

    const handleToggle = async (file) => {
        try {
            // Karena tidak ada partial update mudah tanpa mengirim semua field, 
            // setidaknya kita bisa kirim field yang mau diupdate, di API belum handle partial put,
            // jadi untuk keamanan tambahkan implementasi di backend files.php
            // Update file via API PUT
            // kita kirim data utuh dengan satu nilai diubah
            const response = await apiClient.put("files.php", file.id, {
                ...file,
                private: !file.private
            });
            if (response.status === 'success') {
                toast.success(!file.private ? "File sekarang Privat" : "File sekarang Publik");
                loadData();
            } else {
                throw new Error(response.message);
            }
        } catch (e) { toast.error(e.message); }
    };

    const handlePreview = async (file) => {
        if (!isImage(file.name)) return;
        setSelectedFile(file); setShowModal(true);
        setPreviewUrl(`http://localhost/DISHUP_S/dishup/api/uploads/${file.path}`);
    };

    const handleRequest = async (file) => {
        if (!authUser) return toast.error("Login dulu");
        const pesan = prompt("Pesan (opsional):");
        if (pesan === null) return; // User membatalkan
        try {
            const response = await apiClient.post("permintaan_akses_files.php?action=insert", {
                file_id: file.id,
                peminta_id: authUser.id,
                email_peminta: authUser.email,
                pesan: pesan || ""
            });
            if (response.status === 'success') {
                toast.success("Permintaan terkirim");
            } else {
                throw new Error(response.message || "Gagal mengirim permintaan");
            }
        } catch (e) { toast.error(e.message); }
    };

    return (
        <Container className="py-4">
            {/* Header Bersih */}
            <div className="bg-white p-4 rounded-4 shadow-sm mb-4 border d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                    <h4 className="fw-bold mb-1 text-dark">📂 {nama || `Seksi ${kategori}`}</h4>
                    <span className="text-muted small">Total {filteredFiles.length} dokumen tersimpan</span>
                </div>

                <div className="d-flex gap-2" style={{ minWidth: "300px" }}>
                    <InputGroup className="border rounded-pill overflow-hidden bg-light">
                        <InputGroup.Text className="bg-transparent border-0 ps-3"><FiSearch className="text-muted" /></InputGroup.Text>
                        <Form.Control
                            placeholder="Cari file..."
                            className="bg-transparent border-0 shadow-none"
                            value={query}
                            onChange={handleSearch}
                        />
                    </InputGroup>
                    <Button variant="light" className="rounded-circle border" onClick={loadData} title="Refresh">
                        <FiRefreshCw className={loading ? "spin" : ""} />
                    </Button>
                </div>
            </div>

            {/* LIST CONTAINER */}
            <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                ) : paginate.currentFiles.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="bg-light d-inline-block p-4 rounded-circle mb-3">
                            <FiFileText size={30} className="text-muted opacity-50" />
                        </div>
                        <p className="text-muted mb-0">Tidak ada file ditemukan.</p>
                    </div>
                ) : (
                    <div>
                        {/* Header Kolom */}
                        <div className="d-none d-md-flex px-4 py-3 bg-light border-bottom text-muted small fw-bold text-uppercase">
                            <div style={{ flex: 2 }}>Nama Dokumen</div>
                            <div style={{ flex: 1 }}>Pemilik</div>
                            <div style={{ flex: 1 }}>Tanggal</div>
                            <div style={{ width: "100px" }} className="text-end">Aksi</div>
                        </div>

                        {/* Items Loop */}
                        {paginate.currentFiles.map((file, idx) => (
                            <FileListItem
                                key={file.id}
                                file={file}
                                authUser={authUser}
                                onDownload={handleDownload}
                                onDelete={handleDelete}
                                onToggle={handleToggle}
                                onRequest={handleRequest}
                                onPreview={handlePreview}
                                isImage={isImage}
                                isLast={idx === paginate.currentFiles.length - 1}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* PAGINATION */}
            {!loading && paginate.currentFiles.length > 0 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination className="shadow-sm rounded-pill overflow-hidden">
                        <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} />
                        <Pagination.Item active>{currentPage}</Pagination.Item>
                        <Pagination.Next disabled={currentPage === paginate.totalPages} onClick={() => setCurrentPage(p => p + 1)} />
                    </Pagination>
                </div>
            )}

            {/* PREVIEW MODAL */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Body className="p-0 bg-dark text-center">
                    {previewLoading ? <div className="py-5 text-white"><Spinner animation="border" /></div> :
                        <Image src={previewUrl} fluid style={{ maxHeight: "85vh" }} />
                    }
                </Modal.Body>
            </Modal>
        </Container>
    );
}

// === KOMPONEN BARIS FILE (Clean List) ===
function FileListItem({ file, authUser, onDownload, onDelete, onToggle, onRequest, onPreview, isImage, isLast }) {
    const [bolehDownload, setBolehDownload] = useState(false);
    const isOwner = authUser?.email === file.owner;

    useEffect(() => {
        (async () => setBolehDownload(await cekBolehDownload(file)))();
    }, [file]);

    return (
        <div className={`px-4 py-3 d-flex flex-column flex-md-row align-items-md-center gap-3 ${!isLast ? "border-bottom" : ""} hover-bg-gray`} style={{ transition: "0.2s" }}>

            {/* 1. Nama & Ikon */}
            <div className="d-flex align-items-center gap-3" style={{ flex: 2, minWidth: 0 }}>
                <div
                    className={`rounded p-2 d-flex align-items-center justify-content-center ${isImage(file.name) ? "bg-primary-subtle text-primary" : "bg-light text-secondary"}`}
                    style={{ width: "45px", height: "45px", cursor: isImage(file.name) ? "pointer" : "default" }}
                    onClick={() => onPreview(file)}
                >
                    {isImage(file.name) ? <FiEye size={20} /> : <FiFileText size={20} />}
                </div>
                <div style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold text-dark text-truncate d-block" style={{ maxWidth: "100%" }} title={file.name}>
                            {file.name}
                        </span>
                        {file.private && <Badge bg="warning" text="dark" className="d-md-none" style={{ fontSize: "0.6rem" }}>Privat</Badge>}
                        {file.private && <FiLock size={14} className="text-warning d-none d-md-block" title="File Privat" />}
                    </div>
                    <small className="text-muted d-md-none">
                        {new Date(file.created_at).toLocaleDateString("id-ID")} • {file.owner}
                    </small>
                </div>
            </div>

            {/* 2. Metadata */}
            <div className="d-none d-md-flex align-items-center text-muted small" style={{ flex: 1 }}>
                <FiUser className="me-2" /> <span className="text-truncate">{file.owner.split('@')[0]}</span>
            </div>

            <div className="d-none d-md-flex align-items-center text-muted small" style={{ flex: 1 }}>
                <FiCalendar className="me-2" /> {new Date(file.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            {/* 3. Actions */}
            <div className="d-flex align-items-center justify-content-between justify-content-md-end gap-2" style={{ minWidth: "100px" }}>
                {bolehDownload ? (
                    <Button variant="outline-primary" size="sm" className="rounded-pill px-3" onClick={() => onDownload(file)}>
                        Download
                    </Button>
                ) : (
                    <Button variant="outline-secondary" size="sm" className="rounded-pill px-3" onClick={() => onRequest(file)}>
                        Minta Akses
                    </Button>
                )}

                {/* Menu Owner */}
                {isOwner && (
                    <Dropdown align="end">
                        <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components" />
                        <Dropdown.Menu className="shadow border-0">
                            <Dropdown.Item onClick={() => onToggle(file)}>
                                {file.private ? <><FiUnlock className="me-2 text-success" /> Ke Publik</> : <><FiLock className="me-2 text-warning" /> Ke Privat</>}
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => onDelete(file)} className="text-danger">
                                <FiTrash2 className="me-2" /> Hapus
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </div>

            {/* --- FIX CSS HERE --- */}
            {/* Menggunakan tag style biasa tanpa atribut jsx */}
            <style>{`
                .hover-bg-gray:hover { background-color: #f8f9fa; }
            `}</style>
        </div>
    );
}

// Custom Toggle
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <Button
        ref={ref}
        variant="light"
        size="sm"
        className="rounded-circle border-0 text-muted"
        onClick={(e) => { e.preventDefault(); onClick(e); }}
        style={{ width: "32px", height: "32px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
        <FiMoreVertical />
    </Button>
));