import { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { apiClient } from "../../apiClient";
import { toast } from "react-toastify";

export default function FormSuratPermohonan({
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
        tujuan: "",
        instansi_tujuan: "",
        nama_pemohon: "",
        identitas_pemohon: "",
        jabatan_pemohon: "",
        unit_pemohon: "",
        keperluan: "",
        nama_penandatangan: "",
        jabatan_penandatangan: "",
        nip_penandatangan: "",
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
                response = await apiClient.put("surat_permohonan.php", selectedData.id, form);
            } else {
                // ➕ INSERT
                response = await apiClient.post("surat_permohonan.php", {
                    ...form,
                    dibuat_oleh: userId,
                });
            }

            if (response.status === 'success') {
                toast.success(
                    selectedData
                        ? "Surat Permohonan berhasil diperbarui"
                        : "Surat Permohonan berhasil ditambahkan"
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
                        ? "✏️ Edit Surat Permohonan"
                        : "➕ Tambah Surat Permohonan"}
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

                        <Col md={6}>
                            <Form.Label>Tujuan</Form.Label>
                            <Form.Control
                                name="tujuan"
                                value={form.tujuan}
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

                    <h6 className="fw-bold mb-2">Data Pemohon</h6>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Label>Nama Pemohon</Form.Label>
                            <Form.Control
                                name="nama_pemohon"
                                value={form.nama_pemohon}
                                onChange={handleChange}
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Label>Identitas Pemohon</Form.Label>
                            <Form.Control
                                name="identitas_pemohon"
                                value={form.identitas_pemohon}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Jabatan</Form.Label>
                            <Form.Control
                                name="jabatan_pemohon"
                                value={form.jabatan_pemohon}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Unit</Form.Label>
                            <Form.Control
                                name="unit_pemohon"
                                value={form.unit_pemohon}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={12}>
                            <Form.Label>Keperluan</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="keperluan"
                                value={form.keperluan}
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>

                    <hr />

                    <h6 className="fw-bold mb-2">Penandatangan</h6>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Label>Nama Penandatangan</Form.Label>
                            <Form.Control
                                name="nama_penandatangan"
                                value={form.nama_penandatangan}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>Jabatan Penandatangan</Form.Label>
                            <Form.Control
                                name="jabatan_penandatangan"
                                value={form.jabatan_penandatangan}
                                onChange={handleChange}
                            />
                        </Col>

                        <Col md={6}>
                            <Form.Label>NIP Penandatangan</Form.Label>
                            <Form.Control
                                name="nip_penandatangan"
                                value={form.nip_penandatangan}
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
