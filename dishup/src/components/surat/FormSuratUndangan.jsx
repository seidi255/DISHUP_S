import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { apiClient } from "../../apiClient";
import { toast } from "react-toastify";

export default function FormSuratUndangan({
    show,
    setShow,
    reload,
    selectedData,
}) {
    const [loading, setLoading] = useState(false);

    const initialForm = {
        nomor_surat: "",
        tanggal_surat: "",
        perihal: "",
        jabatan_tujuan: "",
        instansi_tujuan: "",
        hari_tanggal: "",
        waktu: "",
        tempat: "",
        agenda: "",
        keterangan: "",
    };

    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        if (selectedData) {
            setForm({ ...initialForm, ...selectedData });
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
                response = await apiClient.put("surat_undangan.php", selectedData.id, form);
            } else {
                // ➕ INSERT
                response = await apiClient.post("surat_undangan.php", {
                    ...form,
                    tujuan: "-", // aman
                    dibuat_oleh: userId,
                });
            }

            if (response.status === 'success') {
                toast.success(
                    selectedData
                        ? "Surat Undangan berhasil diperbarui"
                        : "Surat Undangan berhasil ditambahkan"
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
                    {selectedData
                        ? "✏️ Edit Surat Undangan"
                        : "➕ Tambah Surat Undangan"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <h6 className="fw-bold mb-2">Informasi Surat</h6>
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

                        <Col md={12}>
                            <Form.Label>Perihal</Form.Label>
                            <Form.Control
                                name="perihal"
                                value={form.perihal}
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>

                    <hr />

                    <h6 className="fw-bold mb-2">Tujuan Undangan</h6>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Label>Jabatan Tujuan</Form.Label>
                            <Form.Control
                                name="jabatan_tujuan"
                                value={form.jabatan_tujuan}
                                onChange={handleChange}
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Label>Instansi Tujuan</Form.Label>
                            <Form.Control
                                name="instansi_tujuan"
                                value={form.instansi_tujuan}
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>

                    <hr />

                    <h6 className="fw-bold mb-2">Detail Kegiatan</h6>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Label>Hari / Tanggal</Form.Label>
                            <Form.Control
                                name="hari_tanggal"
                                value={form.hari_tanggal}
                                onChange={handleChange}
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Label>Waktu</Form.Label>
                            <Form.Control
                                name="waktu"
                                value={form.waktu}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={12}>
                            <Form.Label>Tempat</Form.Label>
                            <Form.Control
                                name="tempat"
                                value={form.tempat}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={12}>
                            <Form.Label>Agenda</Form.Label>
                            <Form.Control
                                name="agenda"
                                value={form.agenda}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={12}>
                            <Form.Label>Keterangan</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="keterangan"
                                value={form.keterangan}
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
