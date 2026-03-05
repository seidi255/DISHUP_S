import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { apiClient } from "../../apiClient";
import { toast } from "react-toastify";

export default function FormSuratTugas({ show, setShow, reload, selectedData }) {
    const [loading, setLoading] = useState(false);

    const initialForm = {
        nomor_surat: "",
        tanggal_surat: "",
        nama_pejabat: "",
        nip_pejabat: "",
        jabatan_pejabat: "",
        nama_pegawai: "",
        nip_pegawai: "",
        pangkat_golongan: "",
        jabatan_pegawai: "",
        unit_kerja: "",
        dasar_penugasan: "",
        uraian_tugas: "",
        tempat_tugas: "",
        waktu_pelaksanaan: "",
    };

    const [form, setForm] = useState(initialForm);

    // 🔹 Isi form saat EDIT
    useEffect(() => {
        if (selectedData) {
            setForm({
                ...initialForm,
                ...selectedData,
            });
        } else {
            setForm(initialForm);
        }
    }, [selectedData, show]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        setLoading(true);

        const userId = localStorage.getItem('dishup_token') ? JSON.parse(atob(localStorage.getItem('dishup_token'))).id : null;
        if (!userId) {
            toast.error("Harus login");
            setLoading(false);
            return;
        }

        try {
            let response;
            if (selectedData) {
                // ✏️ UPDATE
                response = await apiClient.put("surat_tugas.php", selectedData.id, form);
            } else {
                // ➕ INSERT
                response = await apiClient.post("surat_tugas.php", {
                    ...form,
                    dibuat_oleh: userId,
                });
            }

            if (response.status === 'success') {
                toast.success(
                    selectedData
                        ? "Surat Tugas berhasil diperbarui"
                        : "Surat Tugas berhasil ditambahkan"
                );
                setShow(false);
                reload();
            } else {
                throw new Error(response.message || "Gagal menyimpan data");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    {selectedData ? "✏️ Edit Surat Tugas" : "➕ Tambah Surat Tugas"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Label>Nomor Surat</Form.Label>
                            <Form.Control
                                name="nomor_surat"
                                value={form.nomor_surat}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Tanggal Surat</Form.Label>
                            <Form.Control
                                type="date"
                                name="tanggal_surat"
                                value={form.tanggal_surat}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Nama Pejabat</Form.Label>
                            <Form.Control
                                name="nama_pejabat"
                                value={form.nama_pejabat}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>NIP Pejabat</Form.Label>
                            <Form.Control
                                name="nip_pejabat"
                                value={form.nip_pejabat}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Jabatan Pejabat</Form.Label>
                            <Form.Control
                                name="jabatan_pejabat"
                                value={form.jabatan_pejabat}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Nama Pegawai</Form.Label>
                            <Form.Control
                                name="nama_pegawai"
                                value={form.nama_pegawai}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>NIP Pegawai</Form.Label>
                            <Form.Control
                                name="nip_pegawai"
                                value={form.nip_pegawai}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Pangkat / Golongan</Form.Label>
                            <Form.Control
                                name="pangkat_golongan"
                                value={form.pangkat_golongan}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Jabatan Pegawai</Form.Label>
                            <Form.Control
                                name="jabatan_pegawai"
                                value={form.jabatan_pegawai}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Unit Kerja</Form.Label>
                            <Form.Control
                                name="unit_kerja"
                                value={form.unit_kerja}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={12}>
                            <Form.Label>Dasar Penugasan</Form.Label>
                            <Form.Control
                                name="dasar_penugasan"
                                value={form.dasar_penugasan}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={12}>
                            <Form.Label>Uraian Tugas</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="uraian_tugas"
                                value={form.uraian_tugas}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Tempat Tugas</Form.Label>
                            <Form.Control
                                name="tempat_tugas"
                                value={form.tempat_tugas}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Waktu Pelaksanaan</Form.Label>
                            <Form.Control
                                name="waktu_pelaksanaan"
                                value={form.waktu_pelaksanaan}
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    Batal
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading
                        ? "Menyimpan..."
                        : selectedData
                            ? "Update"
                            : "Simpan"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
