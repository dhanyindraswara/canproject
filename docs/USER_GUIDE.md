# Panduan Pengguna — HoldingOS

Panduan pemakaian aplikasi untuk pengguna sehari-hari.
🔗 **Akses:** https://dhanyindraswara.github.io/canproject/

---

## 1. Masuk (Login)

- Buka aplikasi → isi **email** & **password** akun kamu → klik **Masuk**.
- Akun dibuat oleh admin (lihat [bagian User & Role](#9-user--akses-admin)).
- Setelah masuk, kamu mendarat di halaman sesuai **role** kamu, dan hanya menu
  yang boleh kamu akses yang muncul di sidebar.
- Keluar: klik nama/email kamu di kanan atas → **Keluar**.

> Kalau aplikasi belum dihubungkan ke Firebase, login memakai **kartu role
> demo** (mode lokal, data hanya di browser).

## 2. Header & Company Switcher

Bar atas berlaku di semua halaman:

- **Company Switcher** (kiri): filter seluruh data per perusahaan. Pilih
  **"Semua Perusahaan"** untuk mode holding (lihat semua PT sekaligus).
- **🔍 Search**: pencarian cepat (kontekstual).
- **🔔 Notifikasi**: klik lonceng → tiap notifikasi **bisa diklik** dan
  membawa kamu ke menu terkait (invoice jatuh tempo → Invoice, dll).
- **Menu user** (nama/email): **Profil saya**, **Pengaturan** (termasuk reset
  data), **Keluar**.

## 3. Dashboard Holding

Ringkasan lintas perusahaan: KPI, arus kas, revenue antar-PT, AR aging, funnel
tender, dan SO yang delay. Ikut ter-filter oleh Company Switcher.

## 4. Tender

Papan **kanban 6 tahap** (Pendaftaran → … → Menang/Kalah).

- **Tender Baru**: isi nama, client, PT, nilai, deadline, tahap → masuk papan.
- Tiap kartu punya **ikon dokumen** — klik untuk unggah/lihat dokumen tender.
- Kartu di kolom **Menang** punya tombol **Konversi jadi Proyek** → otomatis
  membuat Proyek baru (nomor PO dibuat otomatis).

## 5. Proyek

**Daftar proyek**: cari (no. PO / nama / client), filter status, pagination,
tombol **Proyek Baru**. Klik satu baris untuk membuka **Detail Proyek**:

| Tab | Isi |
| --- | --- |
| **Ringkasan** | Progress, cash in/out, margin, info kontrak |
| **Sales Order** | Daftar SO; **+ SO Baru**; klik SO → Detail SO |
| **Keuangan** | Budget vs realisasi + margin real-time |
| **Invoice** | Daftar invoice proyek; **+ Invoice Baru** |
| **Payment** | Penerimaan pembayaran; **+ Payment** (dengan upload bukti) |
| **Dokumen** | Unggah banyak file, lihat besar, unduh, hapus |
| **Review** | Catatan / evaluasi proyek (simpan histori) |
| **BAPP** | Berita Acara Penyelesaian — pipeline + **Generate PDF** |

### Detail Sales Order (SO)
Dibuka dari tab Sales Order:

- **Progress & Milestone**: tambah/edit kegiatan, ubah **% & status**;
  progress SO dihitung otomatis dari rata-rata milestone. Ganti **status SO**.
- **PO Keluar**: **+ PO Keluar** ke supplier; klik baris → detail + **Export PDF**.
- **Keuangan**: budget vs realisasi & margin SO.
- **BAST**: klik langkah pipeline untuk memperbarui status, **Generate BAST
  PDF**, dan unggah dokumen/foto serah terima.

## 6. Warehouse & Aset

- **Stok Barang**: **Tambah Stok**; tombol **+In / −Out** mengubah jumlah;
  badge "di bawah minimum"; hapus item.
- **Aset**: **Tambah Aset** (termasuk **Nilai Aset**), kondisi, penanggung
  jawab; hapus aset.

## 7. Dokumen (Arsip Pusat)

Semua dokumen dari seluruh app (proyek, tender, invoice, dll) dalam satu
tempat. Cari, unggah dokumen umum, **Lihat** (viewer besar hampir fullscreen),
**Unduh**, **Hapus**.

> **Upload & lihat dokumen** tersedia di banyak tempat (proyek, tender,
> invoice, payment, BAST/BAPP). Semua memakai viewer yang sama: gambar tampil
> pas layar, PDF mengisi penuh, ada tombol **Unduh** + tombol **Esc**/tutup.

## 8. Master Data

Data referensi grup, dengan **Tambah / Edit / Hapus**:

- **Perusahaan** — CRUD penuh + pilih warna brand (langsung nyambung ke seluruh
  badge & Company Switcher).
- **Client**, **Supplier/Subcont**, **Item/Material**, **Rekening Bank**.

## 9. User & Akses (admin)

Mengelola pengguna & hak akses.

### Menambah user baru
**Tambah User** → isi **Nama, Email, Password, Role, Scope perusahaan, Aktif**
→ **Simpan**. Aplikasi otomatis **membuat akun login Firebase** + menyimpan
role-nya. Serahkan email & password ke orangnya.

- Untuk akun yang **sudah ada** (mis. dibuat manual di Firebase Console),
  cukup Tambah User dengan email yang sama → muncul *"Role ditautkan ke akun
  yang sudah ada"*. (Email di app harus **sama persis** dengan email login.)

### Role & Matriks Hak Akses
- **Role** menentukan **landing page** + **menu yang muncul** di sidebar.
- **Matriks Hak Akses**: klik tiap sel untuk mengubah level
  (**✓** penuh / **R** read-only / **–** tidak ada). Bisa **+ Role** baru,
  hapus role, dan **Reset default**.
- **Status Aktif/Nonaktif**: klik untuk toggle — user nonaktif ditolak saat
  login berikutnya.
- **Hapus** user menghilangkannya dari app; untuk menghapus akun login-nya,
  hapus di **Firebase Console → Authentication → Users**.

## 10. Finance (Lintas Proyek)

- **Semua Invoice**: ringkasan (ditagih / dibayar / outstanding), cari, **+
  Invoice Baru** (dengan **item tagihan** → total otomatis), **Export PDF**
  per invoice, hapus.
- **Semua PO Keluar**: daftar PO lintas proyek, **+ PO Keluar Baru**, klik
  baris → detail + **Export PDF**.

## 11. Export PDF

Tombol **Generate/Export PDF** (PO, Invoice, BAST, BAPP) membuka dokumen rapi
di tab baru lalu memicu dialog cetak browser → pilih **"Save as PDF"**.
Jika popup terblokir, izinkan popup untuk situs ini.

## 12. Penyimpanan data

- **Mode Firebase (aktif):** data tersimpan di **Firestore**, dokumen di
  **Cloud Storage** — tersinkron antar perangkat (login user yang sama).
- **Mode lokal (fallback):** data di **localStorage** browser tersebut saja.
- **Pengaturan → Reset semua data** mengembalikan seluruh data ke contoh awal
  (tidak bisa dibatalkan).
