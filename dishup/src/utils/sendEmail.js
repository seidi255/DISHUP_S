// === URL BACKEND BARU ===
const API_URL = "https://dishub-pq1zaksl6-seidi-rahmats-projects.vercel.app/api/sendEmail";

// === Kirim email ke admin saat user meminta file ===
export async function sendEmailToAdmin({ userEmail, fileName, requestTime }) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: "dishupllj001@gmail.com", // email admin
                subject: "Permintaan Akses File",
                message: `
                    <h3>Pemberitahuan Permintaan Akses File</h3>
                    <p>Pengguna dengan email: <b>${userEmail}</b></p>
                    <p>Meminta akses ke file: <b>${fileName}</b></p>
                    <p>Waktu permintaan: ${requestTime}</p>
                    <br/>
                    <p>Silakan lakukan verifikasi pada dashboard admin.</p>
                `
            })
        });

        const data = await res.json();
        if (data.success) console.log("📨 Email terkirim ke admin");
        else console.error("❌ Gagal kirim email ke admin:", data);

    } catch (err) {
        console.error("❌ ERROR: Tidak dapat menghubungi backend email:", err);
    }
}

// === Kirim email ke user (disetujui atau ditolak) ===
export async function sendEmailToUser({ userEmail, fileName, status }) {
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                to: userEmail,
                subject: `Status Akses File Anda: ${status}`,
                message: `
                    <h3>Status Permintaan Akses File</h3>
                    <p>File: <b>${fileName}</b></p>
                    <p>Status: <b style="color:${status === "disetujui" ? "green" : "red"}">${status.toUpperCase()}</b></p>

                    ${status === "disetujui"
                        ? `<p>Anda mendapatkan akses selama <b>24 jam</b> untuk mendownload file.</p>`
                        : `<p>Silakan hubungi admin untuk info lebih lanjut.</p>`
                    }

                    <br/>
                    <p><b>Dishub LLJ</b></p>
                `
            })
        });

        const data = await res.json();
        if (data.success) console.log(`📨 Email ${status} terkirim ke user`);
        else console.error(`❌ Gagal kirim email ${status}:`, data);

    } catch (err) {
        console.error("❌ ERROR: Tidak dapat menghubungi backend email:", err);
    }
}
