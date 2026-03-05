import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../apiClient";
import KopSurat from "./KopSurat";
import html2pdf from "html2pdf.js";

export default function PrintSuratTugas() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const printRef = useRef();

    useEffect(() => {
        const load = async () => {
            try {
                const response = await apiClient.get("surat_tugas.php");
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
            .set({
                filename: `Surat-Tugas-${data.nomor_surat}.pdf`,
                html2canvas: { scale: 1.2 },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            })
            .from(printRef.current)
            .save();
    };

    if (!data) return null;

    return (
        <div className="p-3">
            <div className="no-print mb-3 d-flex gap-2">
                <button className="btn btn-primary" onClick={() => window.print()}>
                    🖨 Cetak
                </button>
                <button className="btn btn-danger" onClick={downloadPDF}>
                    📄 PDF
                </button>
            </div>

            <div ref={printRef} className="print-area" style={{ fontSize: 12, lineHeight: 1.6 }}>
                <KopSurat />

                <h4 className="text-center mt-3">SURAT TUGAS</h4>
                <p className="text-center">Nomor : {data.nomor_surat}</p>

                <p>Yang bertanda tangan di bawah ini :</p>

                <table>
                    <tbody>
                        <tr><td>Nama</td><td>: {data.nama_pejabat}</td></tr>
                        <tr><td>NIP</td><td>: {data.nip_pejabat}</td></tr>
                        <tr><td>Jabatan</td><td>: {data.jabatan_pejabat}</td></tr>
                    </tbody>
                </table>

                <p className="mt-2">Dengan ini menugaskan :</p>

                <table>
                    <tbody>
                        <tr><td>Nama</td><td>: {data.nama_pegawai}</td></tr>
                        <tr><td>NIP</td><td>: {data.nip_pegawai}</td></tr>
                        <tr><td>Pangkat/Gol</td><td>: {data.pangkat_golongan}</td></tr>
                        <tr><td>Jabatan</td><td>: {data.jabatan_pegawai}</td></tr>
                        <tr><td>Unit Kerja</td><td>: {data.unit_kerja}</td></tr>
                    </tbody>
                </table>

                <p className="mt-2">{data.uraian_tugas}</p>

                <table>
                    <tbody>
                        <tr><td>Tempat</td><td>: {data.tempat_tugas}</td></tr>
                        <tr><td>Waktu</td><td>: {data.waktu_pelaksanaan}</td></tr>
                    </tbody>
                </table>

                <p className="mt-3">
                    Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab.
                </p>

                <div style={{ marginTop: 50, textAlign: "right" }}>
                    <p>Banjarmasin, {data.tanggal_surat}</p>
                    <p>{data.jabatan_pejabat}</p>
                    <br />
                    <b>{data.nama_pejabat}</b><br />
                    NIP. {data.nip_pejabat}
                </div>
            </div>
        </div>
    );
}
