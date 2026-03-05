import { useEffect, useState } from "react";
import { apiClient } from "../apiClient";
import { Button, Table } from "react-bootstrap";
import { toast } from "react-toastify";
import FormSuratModal from "../components/FormSuratModal";

export default function LaporanSurat() {

    const [rows, setRows] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await apiClient.get("laporan_surat.php");
            if (response.status !== 'success') throw new Error("Gagal mengambil data");

            let data = response.data || [];
            // Order by id descending
            data.sort((a, b) => b.id - a.id);
            setRows(data);
        } catch (error) {
            toast.error("Gagal mengambil data!");
        }
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-3">Laporan Surat</h3>

            {/* 🔹 Tombol Tambah Data */}
            <Button
                variant="primary"
                className="mb-3"
                onClick={() => setShowModal(true)}
            >
                Tambah Data Surat
            </Button>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Nomor Surat</th>
                        <th>Jenis Surat</th>
                        <th>Nama Pegawai</th>
                        <th>Perihal</th>
                        <th>Tujuan</th>
                        <th>Aksi</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="text-center">
                                Tidak ada data
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, index) => (
                            <tr key={row.id}>
                                <td>{index + 1}</td>
                                <td>{row.nomor_surat}</td>
                                <td>{row.jenis_surat}</td>
                                <td>{row.nama_pegawai}</td>
                                <td>{row.perihal}</td>
                                <td>{row.tujuan}</td>

                                <td>
                                    {/* 🔹 Tombol CETAK */}
                                    <Button
                                        variant="success"
                                        onClick={() => window.location.href = `/printsurat/${row.id}`}
                                    >
                                        Cetak
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* 🔹 Modal Tambah Surat */}
            <FormSuratModal
                show={showModal}
                setShow={setShowModal}
                reload={loadData}
            />
        </div>
    );
}
