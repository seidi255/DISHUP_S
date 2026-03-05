-- CREATE DATABASE
CREATE DATABASE IF NOT EXISTS db_dishup;
USE db_dishup;

-- 1. Tabel users (Pengganti auth.users dari Supabase)
CREATE TABLE users (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel profiles
CREATE TABLE profiles (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  nama VARCHAR(255),
  foto TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_profiles_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabel dokumen
CREATE TABLE dokumen (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  nama_file TEXT,
  jenis_dokumen VARCHAR(255),
  bidang VARCHAR(255),
  uploaded_by VARCHAR(36),
  ukuran_file VARCHAR(50),
  is_private BOOLEAN DEFAULT FALSE,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dokumen_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL
);

-- 4. Tabel files
CREATE TABLE files (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,
  kategori VARCHAR(255) NOT NULL,
  private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(36) NOT NULL,
  owner VARCHAR(255),
  CONSTRAINT fk_files_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Tabel izin_files
CREATE TABLE izin_files (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  file_id VARCHAR(36) NOT NULL,
  penerima_id VARCHAR(36) NOT NULL,
  diberi_oleh VARCHAR(36),
  dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  diberi_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  waktu_permohonan TIMESTAMP NULL,
  CONSTRAINT fk_izin_files_file_id FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- 6. Tabel laporan_surat
CREATE TABLE laporan_surat (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nomor_surat VARCHAR(255) NOT NULL,
  jenis_surat VARCHAR(100) NOT NULL,
  tanggal_surat DATE NOT NULL,
  perihal TEXT NOT NULL,
  nama_pegawai VARCHAR(255) NOT NULL,
  jabatan VARCHAR(255),
  tujuan VARCHAR(255),
  keterangan TEXT,
  file_scan TEXT,
  dibuat_oleh VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_laporan_surat_dibuat_oleh FOREIGN KEY (dibuat_oleh) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. Tabel permintaan_akses_files
CREATE TABLE permintaan_akses_files (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  file_id VARCHAR(36) NOT NULL,
  peminta_id VARCHAR(36) NOT NULL,
  email_peminta VARCHAR(255),
  pesan TEXT,
  status VARCHAR(50) DEFAULT 'menunggu',
  dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_permintaan_file_id FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- 8. Tabel surat_permohonan
CREATE TABLE surat_permohonan (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nomor_surat VARCHAR(255) NOT NULL,
  tanggal_surat DATE NOT NULL,
  perihal TEXT NOT NULL,
  tujuan VARCHAR(255) NOT NULL,
  instansi_tujuan VARCHAR(255) NOT NULL,
  nama_pemohon VARCHAR(255) NOT NULL,
  identitas_pemohon VARCHAR(255) NOT NULL,
  jabatan_pemohon VARCHAR(255) NOT NULL,
  unit_pemohon VARCHAR(255),
  keperluan TEXT NOT NULL,
  waktu_permohonan VARCHAR(255),
  paragraf_pembuka TEXT,
  paragraf_penutup TEXT,
  nama_penandatangan VARCHAR(255) NOT NULL,
  jabatan_penandatangan VARCHAR(255) NOT NULL,
  nip_penandatangan VARCHAR(50),
  dibuat_oleh VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sp_dibuat_oleh FOREIGN KEY (dibuat_oleh) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. Tabel surat_tugas
CREATE TABLE surat_tugas (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nomor_surat VARCHAR(255) NOT NULL,
  tanggal_surat DATE NOT NULL,
  nama_pejabat VARCHAR(255) NOT NULL,
  nip_pejabat VARCHAR(50),
  jabatan_pejabat VARCHAR(255) NOT NULL,
  nama_pegawai VARCHAR(255) NOT NULL,
  nip_pegawai VARCHAR(50),
  pangkat_golongan VARCHAR(100),
  jabatan_pegawai VARCHAR(255) NOT NULL,
  unit_kerja VARCHAR(255),
  dasar_penugasan TEXT,
  uraian_tugas TEXT NOT NULL,
  tempat_tugas VARCHAR(255),
  waktu_pelaksanaan VARCHAR(255),
  dibuat_oleh VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_st_dibuat_oleh FOREIGN KEY (dibuat_oleh) REFERENCES users(id) ON DELETE SET NULL
);

-- 10. Tabel surat_undangan
CREATE TABLE surat_undangan (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nomor_surat VARCHAR(255) NOT NULL,
  tanggal_surat DATE NOT NULL,
  perihal TEXT NOT NULL,
  tujuan VARCHAR(255),
  keterangan TEXT,
  dibuat_oleh VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  jabatan_tujuan VARCHAR(255),
  instansi_tujuan VARCHAR(255),
  hari_tanggal VARCHAR(255),
  waktu VARCHAR(100),
  tempat VARCHAR(255),
  agenda TEXT,
  CONSTRAINT fk_su_dibuat_oleh FOREIGN KEY (dibuat_oleh) REFERENCES users(id) ON DELETE SET NULL
);
