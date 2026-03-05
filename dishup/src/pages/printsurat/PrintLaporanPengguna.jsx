import { useEffect, useState } from "react";
import { apiClient } from "../../apiClient";
import KopSurat from "./KopSurat";

export default function PrintLaporanPengguna() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUsers = async () => {
            const response = await apiClient.get("auth.php?action=list_users");

            if (response.status !== 'success') {
                console.error("Gagal memuat data pengguna:", response.message);
            }

            let data = response.data || [];
            // Order by role ascending
            data.sort((a, b) => a.role.localeCompare(b.role));

            setUsers(data);
            setLoading(false);
        };

        loadUsers();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <p style={{ textAlign: "center", marginTop: 50 }}>
                Memuat laporan...
            </p>
        );
    }

    return (
        <div
            className="print-area"
            style={{ padding: "40px 60px", fontFamily: "Arial" }}
        >
            {/* ================= TOMBOL PRINT ================= */}
            <div className="no-print" style={{ textAlign: "right", marginBottom: 20 }}>
                <button
                    onClick={handlePrint}
                    style={{
                        background: "#0d6efd",
                        color: "#fff",
                        border: "none",
                        padding: "10px 18px",
                        borderRadius: 6,
                        fontSize: 14,
                        cursor: "pointer",
                    }}
                >
                    🖨 Print / Save PDF
                </button>
            </div>

            {/* ================= KOP SURAT ================= */}
            <KopSurat />

            {/* ================= JUDUL ================= */}
            <h2 style={{ textAlign: "center", marginTop: 20 }}>
                LAPORAN DATA PENGGUNA SISTEM
            </h2>

            {/* ================= TABEL ================= */}
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginTop: 30,
                    fontSize: 14,
                }}
            >
                <thead>
                    <tr>
                        <th style={th}>No</th>
                        <th style={th}>Nama</th>
                        <th style={th}>Email</th>
                        <th style={th}>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center", padding: 10 }}>
                                Data tidak tersedia
                            </td>
                        </tr>
                    ) : (
                        users.map((u, i) => (
                            <tr key={i}>
                                <td style={tdCenter}>{i + 1}</td>
                                <td style={td}>{u.nama || "-"}</td>
                                <td style={td}>{u.email}</td>
                                <td style={tdCenter}>{u.role}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* ================= DESKRIPSI ================= */}
            <p style={{ marginTop: 30, textAlign: "justify", fontSize: 14 }}>
                Laporan ini berisi data pengguna sistem berdasarkan peran sebagai
                bahan evaluasi pengelolaan dan pembagian hak akses pada Sistem
                Manajemen Dokumen Bidang Lalu Lintas Jalan.
            </p>

            {/* ================= TTD ================= */}
            <div style={{ marginTop: 80, textAlign: "right" }}>
                <p>Banjarmasin, {new Date().toLocaleDateString("id-ID")}</p>
                <p><b>Kepala Bidang Lalu Lintas Jalan</b></p>

                <br /><br /><br />

                <p><b>_______________________________</b></p>
                <p>NIP: _____________________________</p>
            </div>

            {/* ================= FOOTER ================= */}
            <p style={{ marginTop: 40, fontSize: 12 }}>
                Dicetak oleh: Administrator Sistem
            </p>
        </div>
    );
}

/* ===== STYLE TABEL ===== */
const th = {
    border: "1px solid black",
    padding: 8,
    textAlign: "center",
    background: "#f2f2f2",
};

const td = {
    border: "1px solid black",
    padding: 8,
};

const tdCenter = {
    border: "1px solid black",
    padding: 8,
    textAlign: "center",
};
