import KopSurat from "../printsurat/KopSurat";

export default function PrintLaporanDokumen({ rows }) {
    const total = rows.length;
    const publik = rows.filter(r => !r.private).length;
    const privat = rows.filter(r => r.private).length;

    const handlePrint = () => window.print();

    return (
        <>
            {/* BUTTON CETAK */}
            <button
                onClick={handlePrint}
                className="btn btn-primary no-print"
            >
                🖨 Cetak Laporan
            </button>

            {/* AREA PRINT */}
            <div className="print-area">
                <KopSurat />

                <h4 style={{ textAlign: "center", marginBottom: 20 }}>
                    LAPORAN DOKUMEN / ARSIP
                </h4>

                <table width="100%" style={{ marginBottom: 15 }}>
                    <tbody>
                        <tr>
                            <td><b>Total Dokumen</b></td>
                            <td>: {total}</td>
                            <td><b>Publik</b></td>
                            <td>: {publik}</td>
                            <td><b>Private</b></td>
                            <td>: {privat}</td>
                        </tr>
                    </tbody>
                </table>

                <table border="1" width="100%" style={{ fontSize: 12 }}>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Dokumen</th>
                            <th>Jenis</th>
                            <th>Uploader</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i}>
                                <td>{i + 1}</td>
                                <td>{r.name}</td>
                                <td>{r.kategori}</td>
                                <td>{r.owner}</td>
                                <td>{r.private ? "Private" : "Publik"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ marginTop: 60, textAlign: "right" }}>
                    <p>Banjarmasin, ....................</p>
                    <p>Kepala Bidang Lalu Lintas Jalan</p>
                    <br /><br />
                    <p><b>(..............................)</b></p>
                    <p>NIP. .........................</p>
                </div>
            </div>
        </>
    );
}
