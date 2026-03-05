import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../apiClient";
import KopSurat from "./KopSurat";
import html2pdf from "html2pdf.js";

export default function PrintSuratPermohonan() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const printRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await apiClient.get("surat_permohonan.php");
                if (response.status === 'success') {
                    const found = response.data.find(r => String(r.id) === String(id));
                    setData(found || null);
                }
            } catch (e) { console.error(e) }
        };
        load();
    }, [id]);

    // ==========================
    // CETAK BROWSER
    // ==========================
    const printBrowser = () => {
        window.print();
    };

    // ==========================
    // DOWNLOAD PDF
    // ==========================
    const downloadPDF = () => {
        if (!printRef.current) return;

        html2pdf()
            .set({
                margin: [20, 20, 20, 20],
                filename: `Surat_Permohonan_${data.nomor_surat}.pdf`,
                image: { type: "jpeg", quality: 1 },
                html2canvas: { scale: 2, scrollY: 0 },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            })
            .from(printRef.current)
            .save();
    };

    if (!data) return <p>Memuat data...</p>;

    return (
        <div style={{ padding: 20 }}>
            {/* ==========================
         TOMBOL AKSI (TIDAK DICETAK)
      ========================== */}
            <div className="no-print d-flex gap-2 mb-3">
                <button className="btn btn-primary" onClick={printBrowser}>
                    🖨 Cetak (Browser)
                </button>
                <button className="btn btn-danger" onClick={downloadPDF}>
                    📄 Download PDF
                </button>
            </div>

            {/* ==========================
         AREA CETAK
      ========================== */}
            <div
                ref={printRef}
                className="print-area"
                style={{
                    fontSize: 12,
                    lineHeight: 1.8,
                    color: "#000",
                }}
            >
                <KopSurat />

                <h4 className="text-center mt-3">SURAT PERMOHONAN</h4>
                <p className="text-center mb-4">Nomor : {data.nomor_surat}</p>

                <p>Kepada Yth.</p>
                <p style={{ marginLeft: 20 }}>
                    <b>{data.tujuan}</b><br />
                    {data.instansi_tujuan}
                </p>

                <p>Di Tempat</p>

                <p className="mt-3">Dengan hormat,</p>

                <p style={{ textAlign: "justify" }}>
                    Sehubungan dengan <b>{data.perihal}</b>, bersama ini kami mengajukan
                    permohonan kepada Bapak/Ibu untuk <b>{data.keperluan}</b>.
                </p>

                <table style={{ marginLeft: 30, marginTop: 10 }}>
                    <tbody>
                        <tr>
                            <td style={{ width: 140 }}>Nama</td>
                            <td>: {data.nama_pemohon}</td>
                        </tr>
                        <tr>
                            <td>Jabatan</td>
                            <td>: {data.jabatan_pemohon}</td>
                        </tr>
                        <tr>
                            <td>Unit Kerja</td>
                            <td>: {data.unit_pemohon}</td>
                        </tr>
                    </tbody>
                </table>

                <p style={{ marginTop: 20, textAlign: "justify" }}>
                    Demikian surat permohonan ini kami sampaikan. Atas perhatian dan kerja
                    sama Bapak/Ibu, kami ucapkan terima kasih.
                </p>

                <div style={{ marginTop: 60, textAlign: "right" }}>
                    <p>
                        Banjarmasin,{" "}
                        {new Date(data.tanggal_surat).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                    <p>{data.jabatan_penandatangan}</p>
                    <br />
                    <p><b>{data.nama_penandatangan}</b></p>
                    <p>NIP. {data.nip_penandatangan || "-"}</p>
                </div>
            </div>
        </div>
    );
}
