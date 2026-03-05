import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Login from "./pages/Login";
import Daftar from "./pages/Daftar";
import PrivateRoute from "./components/PrivateRoute";
import SeksiA from "./pages/SeksiA";
import SeksiB from "./pages/SeksiB";
import SeksiC from "./pages/SeksiC";
import DashboardLayout from "./DashboardLayout";
import Profil from "./pages/Profil";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRoute from "./components/admin/AdminRoute";
import AdminPermintaan from "./pages/admin/AdminPermintaan";
import AuthCallback from "./pages/AuthCallback";
import PrintLaporanPengguna from "./pages/printsurat/PrintLaporanPengguna";
import LaporanDokumen from "./pages/admin/LaporanDokumen";
import ProtectedAdmin from "./pages/admin/ProtectedAdmin";
import LaporanSuratTugas from "./pages/laporan/LaporanSuratTugas";
import LaporanSuratPermohonan from "./pages/laporan/LaporanSuratPermohonan";
import PrintSuratTugas from "./pages/printsurat/PrintSuratTugas";
import PrintSuratPermohonan from "./pages/printsurat/PrintSuratPermohonan";
import LaporanSuratUndangan from "./pages/laporan/LaporanSuratUndangan";
import PrintSuratUndangan from "./pages/printsurat/PrintSuratUndangan";
import LaporanDistribusiDokumen from "./pages/laporan/LaporanDistribusiDokumen";
import LaporanKeamananData from "./pages/laporan/LaporanKeamananData";
import LaporanResponsAkses from "./pages/laporan/LaporanResponsAkses";
import LaporanEfisiensiSurat from "./pages/laporan/LaporanEfisiensiSurat";
import PrintRekapanSuratTugas from "./pages/printsurat/PrintRekapanSuratTugas";
import PrintRekapanSuratPermohonan from "./pages/printsurat/PrintRekapanSuratPermohonan";
import PrintRekapanSuratUndangan from "./pages/printsurat/PrintRekapanSuratUndangan";
import SIG from "./pages/SIG";
import SIGOperasional from "./pages/SIGOperasional";
import LaporanDataPJU from './pages/laporan/LaporanDataPJU';
import PrintLaporanPJU from './pages/printsurat/PrintLaporanPJU';
import LaporanDataTilang from './pages/laporan/LaporanDataTilang';
import PrintLaporanTilang from './pages/printsurat/PrintLaporanTilang';
import LaporanPJURusak from './pages/laporan/LaporanPJURusak';
import PrintLaporanPJURusak from './pages/printsurat/PrintLaporanPJURusak';
import LaporanAnalisisPJU from './pages/laporan/LaporanAnalisisPJU';
import PrintLaporanAnalisisPJU from './pages/printsurat/PrintLaporanAnalisisPJU';
import LaporanAnalisisTilang from './pages/laporan/LaporanAnalisisTilang';
import PrintLaporanAnalisisTilang from './pages/printsurat/PrintLaporanAnalisisTilang';
import LaporanInfrastrukturTerburuk from './pages/laporan/LaporanInfrastrukturTerburuk';
import PrintLaporanInfrastrukturTerburuk from './pages/printsurat/PrintLaporanInfrastrukturTerburuk';
import LaporanAuditKeamanan from './pages/laporan/LaporanAuditKeamanan';
import PrintLaporanAuditKeamanan from './pages/printsurat/PrintLaporanAuditKeamanan';
import LaporanLokasiPrioritas from './pages/laporan/LaporanLokasiPrioritas';
import PrintLaporanLokasiPrioritas from './pages/printsurat/PrintLaporanLokasiPrioritas';
// ✅ import Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman login & daftar (tidak diproteksi) */}
        <Route path="/login" element={<Login />} />
        <Route path="/daftar" element={<Daftar />} />

        {/* Semua halaman di dalam DashboardLayout diproteksi */}
        <Route
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/sig" element={<SIG />} />
          <Route path="/sig-operasional" element={<SIGOperasional />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/seksi-a" element={<SeksiA />} />
          <Route path="/seksi-b" element={<SeksiB />} />
          <Route path="/seksi-c" element={<SeksiC />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/permintaan" element={<AdminPermintaan />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/print-laporan-pengguna" element={<PrintLaporanPengguna />} />
          <Route path="/admin/laporan-dokumen" element={<ProtectedAdmin><LaporanDokumen /></ProtectedAdmin>} />
          <Route path="/laporan/surat-tugas" element={<AdminRoute><LaporanSuratTugas /></AdminRoute>} />
          <Route path="/laporan/surat-permohonan" element={<AdminRoute><LaporanSuratPermohonan /></AdminRoute>} />
          <Route path="/print/surat-tugas/:id" element={<AdminRoute><PrintSuratTugas /></AdminRoute>} />
          <Route path="/print/surat-permohonan/:id" element={<AdminRoute><PrintSuratPermohonan /></AdminRoute>} />
          <Route path="/laporan-pju" element={<AdminRoute><LaporanDataPJU /></AdminRoute>} />
          <Route path="/print/laporan-pju" element={<AdminRoute><PrintLaporanPJU /></AdminRoute>} />
          <Route path="/laporan-tilang" element={<AdminRoute><LaporanDataTilang /></AdminRoute>} />
          <Route path="/print/laporan-tilang" element={<AdminRoute><PrintLaporanTilang /></AdminRoute>} />
          <Route path="/laporan-pju-rusak" element={<AdminRoute><LaporanPJURusak /></AdminRoute>} />
          <Route path="/print/laporan-pju-rusak" element={<AdminRoute><PrintLaporanPJURusak /></AdminRoute>} />
          <Route path="/laporan-analisis-pju" element={<AdminRoute><LaporanAnalisisPJU /></AdminRoute>} />
          <Route path="/print/laporan-analisis-pju" element={<AdminRoute><PrintLaporanAnalisisPJU /></AdminRoute>} />
          <Route path="/laporan-analisis-tilang" element={<AdminRoute><LaporanAnalisisTilang /></AdminRoute>} />
          <Route path="/print/laporan-analisis-tilang" element={<AdminRoute><PrintLaporanAnalisisTilang /></AdminRoute>} />
          <Route path="/laporan-infrastruktur-terburuk" element={<AdminRoute><LaporanInfrastrukturTerburuk /></AdminRoute>} />
          <Route path="/print/laporan-infrastruktur-terburuk" element={<AdminRoute><PrintLaporanInfrastrukturTerburuk /></AdminRoute>} />
          <Route path="/laporan-audit-keamanan" element={<AdminRoute><LaporanAuditKeamanan /></AdminRoute>} />
          <Route path="/print/laporan-audit-keamanan" element={<AdminRoute><PrintLaporanAuditKeamanan /></AdminRoute>} />
          <Route path="/laporan-lokasi-prioritas" element={<AdminRoute><LaporanLokasiPrioritas /></AdminRoute>} />
          <Route path="/print/laporan-lokasi-prioritas" element={<AdminRoute><PrintLaporanLokasiPrioritas /></AdminRoute>} />
          <Route path="/laporan/surat-undangan" element={<AdminRoute><LaporanSuratUndangan /></AdminRoute>} />
          <Route path="/print/surat-undangan/:id" element={<PrintSuratUndangan />} />
          <Route path="/laporan/distribusi-dokumen" element={<LaporanDistribusiDokumen />} />
          <Route path="laporan/keamanan-data" element={<LaporanKeamananData />} />
          <Route path="laporan/respons-akses" element={<LaporanResponsAkses />} />
          <Route path="/laporan/efisiensi-surat" element={<LaporanEfisiensiSurat />} />
          <Route path="/print/rekapan-surat-tugas" element={<PrintRekapanSuratTugas />} />
          <Route path="/print/rekapan-surat-permohonan" element={<PrintRekapanSuratPermohonan />} />
          <Route path="/print/rekapan-surat-undangan" element={<PrintRekapanSuratUndangan />} />

        </Route>
      </Routes>

      {/* ✅ ToastContainer supaya semua page bisa pakai toast */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
}

export default App;