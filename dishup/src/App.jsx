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
import LupaPassword from "./pages/LupaPassword";
import ResetPassword from "./pages/ResetPassword";
import LaporanSuratTugas from "./pages/laporan/LaporanSuratTugas";
import LaporanSuratPermohonan from "./pages/laporan/LaporanSuratPermohonan";
import PrintSuratTugas from "./pages/printsurat/PrintSuratTugas";
import PrintSuratPermohonan from "./pages/printsurat/PrintSuratPermohonan";
import LaporanSuratUndangan from "./pages/laporan/LaporanSuratUndangan";
import PrintSuratUndangan from "./pages/printsurat/PrintSuratUndangan";
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
        {/* Halaman login & daftar & lupa password (tidak diproteksi) */}
        <Route path="/login" element={<Login />} />
        <Route path="/daftar" element={<Daftar />} />
        <Route path="/lupa-password" element={<LupaPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
          <Route path="/admin/permintaan" element={<AdminRoute><AdminPermintaan /></AdminRoute>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/print-laporan-pengguna" element={<PrintLaporanPengguna />} />
          <Route path="/laporan/surat-tugas" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><LaporanSuratTugas /></AdminRoute>} />
          <Route path="/laporan/surat-permohonan" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><LaporanSuratPermohonan /></AdminRoute>} />
          <Route path="/print/surat-tugas/:id" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><PrintSuratTugas /></AdminRoute>} />
          <Route path="/print/surat-permohonan/:id" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><PrintSuratPermohonan /></AdminRoute>} />
          <Route path="/laporan-pju" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><LaporanDataPJU /></AdminRoute>} />
          <Route path="/print/laporan-pju" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><PrintLaporanPJU /></AdminRoute>} />
          <Route path="/laporan-tilang" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><LaporanDataTilang /></AdminRoute>} />
          <Route path="/print/laporan-tilang" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><PrintLaporanTilang /></AdminRoute>} />
          <Route path="/laporan-pju-rusak" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><LaporanPJURusak /></AdminRoute>} />
          <Route path="/print/laporan-pju-rusak" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><PrintLaporanPJURusak /></AdminRoute>} />
          <Route path="/laporan-analisis-pju" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><LaporanAnalisisPJU /></AdminRoute>} />
          <Route path="/print/laporan-analisis-pju" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><PrintLaporanAnalisisPJU /></AdminRoute>} />
          <Route path="/laporan-analisis-tilang" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><LaporanAnalisisTilang /></AdminRoute>} />
          <Route path="/print/laporan-analisis-tilang" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><PrintLaporanAnalisisTilang /></AdminRoute>} />
          <Route path="/laporan-infrastruktur-terburuk" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><LaporanInfrastrukturTerburuk /></AdminRoute>} />
          <Route path="/print/laporan-infrastruktur-terburuk" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><PrintLaporanInfrastrukturTerburuk /></AdminRoute>} />
          <Route path="/laporan-audit-keamanan" element={<AdminRoute><LaporanAuditKeamanan /></AdminRoute>} />
          <Route path="/print/laporan-audit-keamanan" element={<AdminRoute><PrintLaporanAuditKeamanan /></AdminRoute>} />
          <Route path="/laporan-lokasi-prioritas" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><LaporanLokasiPrioritas /></AdminRoute>} />
          <Route path="/print/laporan-lokasi-prioritas" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><PrintLaporanLokasiPrioritas /></AdminRoute>} />
          <Route path="/laporan/surat-undangan" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><LaporanSuratUndangan /></AdminRoute>} />
          <Route path="/print/surat-undangan/:id" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><PrintSuratUndangan /></AdminRoute>} />
          <Route path="/print/rekapan-surat-tugas" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><PrintRekapanSuratTugas /></AdminRoute>} />
          <Route path="/print/rekapan-surat-permohonan" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><PrintRekapanSuratPermohonan /></AdminRoute>} />
          <Route path="/print/rekapan-surat-undangan" element={<AdminRoute allowedRoles={["admin", "pegawai"]}><PrintRekapanSuratUndangan /></AdminRoute>} />

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