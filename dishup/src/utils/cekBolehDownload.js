import { apiClient } from "../apiClient";
import { toast } from "react-toastify";

/**
 * Mengecek apakah user boleh mendownload file
 * - File publik: langsung boleh
 * - Admin: selalu boleh
 * - Pegawai: boleh jika punya izin aktif (≤24 jam)
 * - Jika izin sudah lebih dari 24 jam → dihapus otomatis
 */
export async function cekBolehDownload(file) {
    try {
        // 🔹 1. Jika file publik → semua boleh download
        if (!file.private) {
            return true;
        }

        // 🔹 2. Ambil user dari token di localStorage
        const tokenRaw = localStorage.getItem('dishup_token');
        if (!tokenRaw) return false;
        let userData;
        try {
            userData = JSON.parse(atob(tokenRaw));
        } catch (e) {
            return false;
        }

        const userId = userData.id;

        // 🔹 3. Ambil role user dari API / token (sekarang bisa dari userData)
        const role = userData.role || "user";

        // 🔹 4. Admin bebas akses semua file
        if (role === "admin") return true;

        // 🔹 6. Cek izin download dari tabel izin_files via API
        const responseIzin = await apiClient.get("izin_files.php");
        if (responseIzin.status !== "success") return false;

        let izinList = responseIzin.data || [];
        izinList = izinList
            .filter(i => i.file_id == file.id && i.penerima_id == userId)
            .sort((a, b) => new Date(b.diberi_pada) - new Date(a.diberi_pada)); // descending

        // Tidak ada izin → tidak boleh download
        if (!izinList || izinList.length === 0) {
            return false;
        }

        // Ambil izin terbaru
        const izin = izinList[0];

        // 🔹 7. Jika ada duplikat izin → abaikan saja untuk read, clean up di backend sebaiknya

        // 🔹 8. Cek masa berlaku izin (≤ 24 jam)
        const now = new Date();
        const waktuIzin = new Date(izin.diberi_pada);

        const jamBerbeda = (now - waktuIzin) / (1000 * 60 * 60);

        if (jamBerbeda > 24) {
            // Hapus izin karena sudah expired (asumsi ada delete method di API files atau izin_files)
            try {
                // await apiClient.delete(`izin_files.php?id=${izin.id}`);
            } catch (e) { }
            toast.info(
                "⏰ Izin download file ini sudah kadaluarsa, silakan minta ulang."
            );
            return false;
        }

        // 🔹 9. Izin masih aktif → boleh download
        return true;
    } catch (e) {
        console.error("Gagal cek izin:", e.message);
        return false;
    }
}
