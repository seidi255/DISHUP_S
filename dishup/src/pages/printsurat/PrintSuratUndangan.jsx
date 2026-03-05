import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../apiClient";
import KopSurat from "./KopSurat";
import html2pdf from "html2pdf.js";

export default function PrintSuratUndangan() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const printRef = useRef();

    useEffect(() => {
        const load = async () => {
            try {
                const response = await apiClient.get("surat_undangan.php");
                if (response.status === 'success') {
                    const found = response.data.find(r => String(r.id) === String(id));
                    setData(found || null);
                }
            } catch (e) { console.error(e) }
        };
        load();
    }, [id]);

    const downloadPDF = () => {
        html2pdf()
            .from(printRef.current)
            .set({
                filename: `surat-undangan-${data.nomor_surat}.pdf`,
                margin: 10,
                jsPDF: { format: "a4", orientation: "portrait" },
            })
            .save();
    };

    if (!data) return <p>Loading...</p>;

    return (
        <div className="p-4">
            {/* Tombol Aksi */}
            <div className="no-print mb-3 d-flex gap-2">
                <button className="btn btn-primary" onClick={() => window.print()}>
                    🖨 Cetak
                </button>
                <button className="btn btn-danger" onClick={downloadPDF}>
                    📄 Download PDF
                </button>
            </div>

            {/* AREA CETAK */}
            <div ref={printRef} className="print-area" style={{ lineHeight: 1.6 }}>
                <KopSurat />

                <h4 style={{ textAlign: "center", margin: "20px 0" }}>
                    SURAT UNDANGAN
                </h4>

                <p style={{ textAlign: "center" }}>
                    Nomor : {data.nomor_surat}
                </p>

                <p>Dengan hormat,</p>

                <p style={{ textAlign: "justify" }}>
                    Sehubungan dengan <b>{data.perihal}</b>, dengan ini kami mengundang:
                </p>

                <p>
                    <b>{data.jabatan_tujuan}</b><br />
                    {data.instansi_tujuan}
                </p>

                <table style={{ marginLeft: 40 }}>
                    <tbody>
                        <tr><td>Hari / Tanggal</td><td>: {data.hari_tanggal}</td></tr>
                        <tr><td>Waktu</td><td>: {data.waktu}</td></tr>
                        <tr><td>Tempat</td><td>: {data.tempat}</td></tr>
                        <tr><td>Agenda</td><td>: {data.agenda}</td></tr>
                    </tbody>
                </table>

                <p style={{ marginTop: 20 }}>{data.keterangan}</p>

                <div style={{ marginTop: 60, textAlign: "right" }}>
                    <p>Banjarmasin, {data.tanggal_surat}</p>
                    <p>Kepala Bidang Lalu Lintas Jalan</p>
                    <br /><br />
                    <p><b>(………………………………)</b></p>
                    <p>NIP. …………………………</p>
                </div>
            </div>
        </div>
    );
}
