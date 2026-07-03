# HoldingOS — Manajemen Multi-Perusahaan

Aplikasi manajemen & monitoring **multi-perusahaan** untuk group holding yang
bergerak di bidang general supplier, pengadaan barang/jasa, dan konstruksi.
UI dalam **Bahasa Indonesia**, tema navy enterprise, font Plus Jakarta Sans.

This is a React + Vite + TypeScript implementation of the HoldingOS design
prototype (see [`DESIGN_HANDOFF.md`](./DESIGN_HANDOFF.md) and the original
mockups under [`project/`](./project/)).

## Konsep inti

- **Single login, multi-company.** Perusahaan bukan menu/login terpisah —
  perusahaan adalah **filter global** lewat Company Switcher di header.
  Memilih "Semua Perusahaan" mengaktifkan mode holding (CEO, read-only).
- Setiap baris transaksi menampilkan **badge perusahaan** dengan warna
  konsisten (KPS biru, MSN cyan, BCK ungu).
- Navigasi **project-centric**: Tender → Proyek (PO Client) → Sales Order →
  BAST (tutup SO) → BAPP (tutup Proyek) → Invoice → Payment.

## Halaman

| Menu | Isi |
| --- | --- |
| **Login** | Pemilihan role demo — tiap role mendarat di halaman berbeda |
| **Dashboard Holding** | KPI, combo chart cash flow (filter per PT), revenue antar-perusahaan (drill-down), donut AR aging, funnel tender, tabel SO delay |
| **Tender** | Kanban 6 kolom; card "Menang" bisa dikonversi jadi Proyek |
| **Proyek** | List (search / filter status / pagination) + Detail hub (tab Ringkasan, Sales Order, Keuangan, Invoice, Payment, BAPP) |
| **SO Detail** | Tab Progress & Milestone, PO Keluar, Keuangan, BAST (stepper + checklist) |
| **Warehouse & Aset** | Stok (badge di bawah minimum, Stock In/Out) + Aset |
| **Master Data** | Perusahaan, Client, Supplier/Subcont, Item/Material, Rekening Bank |
| **User & Akses** | Tabel user + scope perusahaan + matriks hak akses |
| **Finance** | Semua Invoice & Semua PO Keluar (flat, lintas proyek) |

## Fitur fungsional

Selain filter global via Company Switcher, sudah berfungsi penuh:

- Pencarian tabel Proyek (no. PO / nama / client) dan Invoice.
- Filter status Proyek (multi-select) + pagination.
- Filter perusahaan pada Tender, Proyek, Warehouse, Invoice.

Tombol aksi (Buat BAPP, Stock In/Out, Tender Baru, dll.) memunculkan toast —
data bersifat statis (demo), belum ada persistensi.

## Menjalankan

```bash
npm install
npm run dev        # dev server (http://localhost:5173)
npm run build      # typecheck + production build ke dist/
npm run preview    # preview hasil build
```

## Struktur

```
src/
  main.tsx            # entry point
  App.tsx             # shell + routing antar screen
  store.tsx           # state global (role, company, menu, tab, toast)
  theme.ts            # token warna, map perusahaan/status/role, format Rupiah
  data.ts             # data dummy Indonesia + turunan Sales Order
  components/         # Sidebar, Header, Toast, primitif UI (badge, tabs, dsb.)
  screens/            # satu file per halaman
```
