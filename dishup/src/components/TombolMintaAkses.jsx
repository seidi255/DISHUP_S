import { useState } from "react";
import { apiClient } from "../apiClient";
import { toast } from "react-toastify";

export default function TombolMintaAkses({ file }) {
    const [loading, setLoading] = useState(false);

    const kirimPermintaan = async () => {
        try {
            setLoading(true);
            const tokenRaw = localStorage.getItem('dishup_token');
            if (!tokenRaw) {
                toast.error("Anda belum login!");
                return;
            }
            const user = JSON.parse(atob(tokenRaw));

            const response = await apiClient.post("permintaan_akses_files.php", {
                file_id: file.id,
                peminta_id: user.id,
                email_peminta: user.email,
                pesan: `Meminta akses ke file ${file.name}`
            });
            if (response.status !== 'success') throw new Error(response.message);

            toast.success("✅ Permintaan akses dikirim ke admin");
        } catch (err) {
            toast.error("Gagal kirim permintaan: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className="btn btn-outline-primary btn-sm"
            onClick={kirimPermintaan}
            disabled={loading}
        >
            {loading ? "Mengirim..." : "📩 Minta File"}
        </button>
    );
}
