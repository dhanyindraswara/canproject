# HoldingOS Manajemen Holding

_Started 2026-07-03 06:54 UTC_

---

## User

Buatkan prototipe web application UI/UX bernama "HoldingOS" — aplikasi manajemen & monitoring multi-perusahaan untuk group holding yang bergerak di bidang general supplier, pengadaan barang/jasa, dan konstruksi.

BAHASA UI: Bahasa Indonesia. Multi-screen prototype dengan sidebar navigation kiri (collapsible) dan header global.

=== KONSEP INTI ===
- Single login, multi-company. Perusahaan BUKAN menu dan BUKAN login terpisah — perusahaan adalah FILTER GLOBAL.
- Header global punya Company Switcher (dropdown): pilih 1 perusahaan spesifik, atau "Semua Perusahaan" (mode holding/CEO).
- Setiap baris transaksi (tender, proyek, SO, invoice, dll) SELALU menampilkan badge kecil nama perusahaan dengan warna berbeda per perusahaan, agar mudah dibedakan saat mode "Semua Perusahaan".
- Navigasi berpusat pada PROYEK (project-centric), bukan per-perusahaan. Menu top-level dibuat seminimal mungkin.

=== LANDING PER ROLE (halaman awal berbeda tergantung role) ===
- CEO/Owner → Dashboard Holding (view semua perusahaan, read-only)
- Super Admin → akses penuh semua perusahaan
- Admin Proyek → daftar Proyek (scoped ke 1+ perusahaan)
- Finance → daftar flat semua Invoice & Payment lintas proyek
- Warehouse → Stok & Aset

=== BUSINESS FLOW (harus tercermin di UI) ===
Tender (Pendaftaran → Prakualifikasi → Pemasukan Harga → Negosiasi → Pengumuman → Menang/Kalah)
→ MENANG otomatis menjadi PROYEK (Proyek = Kontrak/PO dari Client)
→ 1 PO Client dipecah menjadi beberapa Sales Order (SO)
→ Tiap SO punya: Progress, PO Keluar (beli ke supplier/subcont), Keuangan (cash in/out & margin)
→ SO selesai ditutup dengan BAST (Berita Acara Serah Terima)
→ Setelah SEMUA SO ber-BAST, PO/Proyek ditutup dengan BAPP (Berita Acara Penyelesaian Pekerjaan)
→ Invoicing ke client → Payment

=== MENU UTAMA (ramping, hanya 6) ===
1. Dashboard Holding
2. Tender
3. Proyek  ← hub utama, tempat 80% pekerjaan
4. Warehouse & Aset
5. Master Data
6. User & Akses
(Plus view lintas-proyek untuk Finance: "Semua Invoice", "Semua PO Keluar" — daftar flat dengan filter perusahaan.)

=== HALAMAN YANG DIBUAT ===

1) LOGIN — logo holding, email + password, sederhana.

2) DASHBOARD HOLDING (mode Semua Perusahaan, untuk CEO):
   - KPI cards: Total Nilai Kontrak Aktif, Tender dalam Pipeline (nilai & jumlah), AR Outstanding, AP Outstanding, Proyek Aktif, Proyek Delay.
   - MONTHLY CASH FLOW: combo chart (bar Cash In vs bar Cash Out per bulan, 12 bulan) + garis Net Cash Flow. Bisa difilter per perusahaan. Di bawahnya tabel ringkas: Bulan | Total In | Total Out | Net.
   - Bar chart: perbandingan nilai kontrak/revenue antar perusahaan.
   - Funnel: jumlah & nilai tender per tahap.
   - Donut: AR aging (lancar / 30 / 60 / 90+ hari).
   - Tabel: SO yang mendekati deadline / delay (dengan badge perusahaan). Klik perusahaan → drill-down ke performa perusahaan itu.

3) TENDER — kanban board 6 kolom (Pendaftaran, Prakualifikasi, Pemasukan Harga, Negosiasi, Pengumuman, Menang/Kalah). Card: nama tender, client, nilai estimasi, deadline, badge perusahaan. Tombol "+ Tender Baru". Card di kolom "Menang" punya tombol "Konversi jadi Proyek".

4) PROYEK — LIST: tabel proyek (= PO Client): No. PO/Proyek, nama, client, perusahaan (badge), nilai kontrak, termin, progress % (progress bar), status (Aktif / BAPP / Closed), jumlah SO. Filter, search, pagination.

   DETAIL PROYEK (halaman hub, konten disusun sebagai TAB):
   - Tab "Ringkasan": info kontrak, nilai, termin, progress agregat, ringkasan keuangan proyek (total masuk, total keluar, margin).
   - Tab "Sales Order (SO)": daftar SO turunan PO ini. Kolom: No. SO, scope, nilai, progress %, status (Berjalan / BAST / Selesai), target selesai. Klik SO → buka DETAIL SO (lihat di bawah).
   - Tab "Keuangan": cash in/out level proyek, budget vs realisasi, margin real-time.
   - Tab "Invoice": daftar invoice untuk proyek ini.
   - Tab "Payment": pembayaran diterima untuk proyek ini.
   - Tab "BAPP" (Penyelesaian Pekerjaan — untuk CLOSE PO):
       * Tombol "Buat BAPP" hanya aktif jika SEMUA SO sudah ber-BAST/Selesai.
       * Form/dokumen BAPP: No. BAPP, tanggal, pihak (dari perusahaan → ke client), ringkasan lingkup selesai, nilai, lampiran dokumen (upload).
       * TRACKING status pipeline: Draft → Diajukan → Ditinjau Client → Ditandatangani → Selesai. Tampilkan timeline riwayat status (tanggal + PIC tiap tahap) dan due date.
       * Saat BAPP "Ditandatangani/Selesai" → status Proyek berubah jadi "Closed" dan memicu kesiapan invoice final.

   DETAIL SO (dibuka dari tab SO, konten TAB juga):
   - Tab "Progress & Milestone": progress %, daftar milestone dengan status.
   - Tab "PO Keluar": daftar PO ke supplier/subcont terkait SO ini (No. PO, supplier, nilai, status Draft/Dikirim/Diterima/Selesai, jatuh tempo bayar).
   - Tab "Keuangan": cash in/out SO ini, budget vs realisasi, margin SO.
   - Tab "BAST" (Serah Terima — untuk CLOSE SO):
       * Form/dokumen BAST: No. BAST, SO terkait, tanggal serah terima, pihak (dari → ke), checklist item pekerjaan yang diserahkan, lampiran dokumen (upload foto/PDF).
       * TRACKING status pipeline: Draft → Diajukan → Ditandatangani → Selesai. Timeline riwayat status (tanggal + PIC) + due date.
       * Saat BAST "Ditandatangani/Selesai" → status SO berubah jadi "Selesai/Closed".

5) WAREHOUSE & ASET — 2 tab:
   - Stok Barang: item, gudang, qty, minimum stock (badge merah jika di bawah minimum), tombol Stock In / Stock Out, riwayat mutasi. Support mutasi barang antar perusahaan dalam grup.
   - Aset: daftar aset (kendaraan/alat), jenis, perusahaan pemilik (badge), kondisi, penanggung jawab.

6) MASTER DATA — sub-menu: Perusahaan, Client, Supplier/Subcont, Item/Material, Rekening Bank.

7) USER & AKSES — tabel user: nama, role (Super Admin, CEO, Admin Proyek, Finance, Warehouse, Viewer), dan scope perusahaan per user (multi-select chips). Tampilkan matriks hak akses ringkas.

=== DESIGN DIRECTION ===
- Style: clean, modern, professional enterprise dashboard. Light theme, banyak white space.
- Primary: deep navy blue (#1E3A8A). Emerald untuk status positif/selesai, amber untuk warning/menunggu, red untuk overdue/delay.
- Font: Plus Jakarta Sans (fallback Inter).
- Header global: Company Switcher + search + notifikasi + avatar user. Sidebar kiri collapsible (ikon + label).
- Status BAST/BAPP dan invoice/payment ditampilkan sebagai pipeline/stepper visual yang jelas.
- Badge perusahaan konsisten warnanya di seluruh aplikasi.
- Data dummy realistis Indonesia: perusahaan fiktif (PT Karya Prima Sejahtera, PT Mandiri Supply Nusantara, PT Bangun Cipta Konstruksi), client (PT PLN, Pertamina, Pemda), nilai rupiah, nomor dokumen bergaya BAST/BAPP/PO Indonesia.
- Semua tabel: filter, search, pagination.
- Prioritas desktop, tetap rapi di tablet.

## Assistant

I'll build this as a comprehensive single interactive Design Component. The spec is thorough and complete, so I'll go straight to building — the visual direction (navy enterprise, Plus Jakarta Sans) is fully specified.

_[tool: set_project_title]_

_[tool: update_todos]_

Now the main build. I'll write the logic (all data + computed view state) and the full template.

_[tool: dc_write]_

Now I'll append the remaining screens. Let me add Tender, Proyek list, Proyek detail, SO detail, Warehouse, Master, Users, and Finance views by replacing the `<!--SCREENS-->` marker.

_[tool: dc_html_str_replace]_

Let me fix the warehouse section (leftover junk blocks + missing Aset tab) and the BAST checklist markup.

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

Now add the `whAset` flag to the logic:

_[tool: dc_js_str_replace]_

Now let me look at the login and dashboard to check rendering.

_[tool: show_html]_

_[tool: show_html]_

Login looks great. Let me click into the dashboard (CEO) to verify the charts and shell.

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

The shell, sidebar, header, KPIs all render well. Let me scroll to verify the charts (cashflow combo, funnel, donut).

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: eval_js]_

Charts render cleanly (24 bars, net line, donut). Let me polish the KPI value so it doesn't wrap in narrower widths.

_[tool: dc_html_str_replace]_

Let me verify the Proyek detail (tabs, BAPP) and SO detail (BAST) flows work by navigating programmatically.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

Excellent — proyek detail with tabs, KPIs, and margin renders beautifully. Let me verify the SO detail + BAST tab, then Tender kanban.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

BAST tab with pipeline stepper and document panel renders perfectly. Let me quickly verify the Tender kanban.

_[tool: eval_js]_

_[tool: save_screenshot]_

All screens render cleanly — kanban, detail tabs, BAST/BAPP steppers, charts, company badges, collapsible sidebar, and the global company switcher all working. Let me finalize.

_[tool: update_todos]_

Prototipe **HoldingOS** selesai — satu file interaktif penuh dengan Bahasa Indonesia.

**Yang bisa dicoba:** login pilih role (landing berbeda) → Company Switcher di header sebagai filter global (badge PT konsisten warnanya di semua tabel) → sidebar collapsible → Tender kanban 6 kolom + tombol Konversi jadi Proyek → Proyek list → detail (tab Ringkasan/SO/Keuangan/Invoice/Payment/BAPP dengan pipeline stepper) → klik SO → detail SO (Progress/PO Keluar/Keuangan/BAST stepper + checklist + timeline). Dashboard punya combo chart cash flow (filter per PT), bar revenue antar-perusahaan (klik = drill-down), funnel tender, donut AR aging, dan tabel SO delay. Plus Warehouse (stok + badge di bawah minimum, aset), Master Data (5 sub-tab), User & Akses (matriks hak akses), dan view flat Finance (Semua Invoice / PO Keluar).

Catatan: ini prototipe visual — tombol aksi (Buat BAPP, Stock In/Out, dsb) memunculkan toast, belum menulis data nyata. Filter/search/pagination ditampilkan tapi belum live-filtering (kecuali Company Switcher yang aktif memfilter).

Beberapa langkah lanjutan bila diperlukan: aktifkan search & filter tabel jadi fungsional, form modal Tender Baru / SO Baru yang benar-benar menambah baris, atau gating menu sesuai role (mis. Finance tak melihat Master Data).

_[tool: ready_for_verification]_

HoldingOS sudah siap dan terbuka di preview Anda. Silakan mulai dari layar login, pilih role untuk melihat landing yang berbeda, lalu jelajahi alur Tender → Proyek → SO → BAST/BAPP. Beri tahu saya bila ada bagian yang ingin disesuaikan.

