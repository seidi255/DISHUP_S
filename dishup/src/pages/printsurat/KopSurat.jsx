import logo from "../../assets/logo-dishub.jpg";

export default function KopSurat() {
    return (
        <div style={{ marginBottom: "20px" }}>

            {/* ===== BAGIAN LOGO + TEKS ===== */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
            }}>

                {/* Logo sebelah kiri */}
                <div style={{ marginRight: "15px" }}>
                    <img
                        src={logo}
                        alt="Logo Dishub"
                        style={{ width: 100 }}
                    />
                </div>

                {/* Teks Kop Surat */}
                <div>
                    <h2 style={{ margin: 0 }}>
                        PEMERINTAH PROVINSI KALIMANTAN SELATAN
                    </h2>

                    <h2 style={{ margin: 0, fontWeight: "bold" }}>
                        DINAS PERHUBUNGAN
                    </h2>

                    <p style={{ margin: "5px 0", fontSize: "14px" }}>
                        Jalan Jafri Zam-Zam Nomor 10, Banjarmasin, Kalimantan Selatan 70231 <br />
                        Jalan Pramuka Nomor 1 RT 01 RW 01, Banjarmasin, Kalimantan Selatan 70249 <br />
                        Laman <i>http://dishubprovkalsel.com</i>; Pos-el : <i>dinasperhubungankalsel@gmail.com</i>
                    </p>
                </div>
            </div>

            {/* Garis panjang penuh */}
            <hr style={{ border: "1px solid black", marginTop: "10px" }} />
        </div>
    );
}
