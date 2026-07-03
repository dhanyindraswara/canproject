// All dummy data for the HoldingOS prototype, ported verbatim from the
// design source. Realistic Indonesian companies, clients, documents, and
// Rupiah values. This is static demo data — no persistence.

export interface Proyek {
  id: string
  no: string
  name: string
  client: string
  co: string
  nilai: number
  termin: string
  progress: number
  status: string
  so: number
  masuk: number
  keluar: number
  bappStep?: number // BAPP pipeline step (0-4); undefined = not started
}

export interface Tender {
  stage: string
  name: string
  client: string
  co: string
  nilai: number
  deadline: string
}

export interface Invoice {
  no: string
  proj: string
  co: string
  nilai: number
  tgl: string
  due: string
  status: string
}

export interface Payment {
  no: string
  inv: string
  co: string
  nilai: number
  tgl: string
  metode: string
  bank: string
}

export interface POKeluar {
  no: string
  supplier: string
  co: string
  nilai: number
  status: string
  due: string
}

export interface Stok {
  kode: string
  nama: string
  gudang: string
  co: string
  qty: number
  min: number
  sat: string
}

export interface Aset {
  kode: string
  nama: string
  jenis: string
  co: string
  kondisi: string
  pic: string
  nilai: number
}

export interface Milestone {
  id: string
  label: string
  pct: number
  status: string
}

// A row of the (editable) access matrix — one per role, one cell per module.
export interface AccessRow {
  role: string
  dash: string
  tender: string
  proyek: string
  keuangan: string
  wh: string
  master: string
  users: string
}

export const accessMatrixSeed: AccessRow[] = [
  { role: 'Super Admin', dash: '✓', tender: '✓', proyek: '✓', keuangan: '✓', wh: '✓', master: '✓', users: '✓' },
  { role: 'CEO / Owner', dash: '✓', tender: 'R', proyek: 'R', keuangan: 'R', wh: 'R', master: '–', users: '–' },
  { role: 'Admin Proyek', dash: '–', tender: '✓', proyek: '✓', keuangan: 'R', wh: 'R', master: '–', users: '–' },
  { role: 'Finance', dash: 'R', tender: '–', proyek: 'R', keuangan: '✓', wh: '–', master: 'R', users: '–' },
  { role: 'Warehouse', dash: '–', tender: '–', proyek: 'R', keuangan: '–', wh: '✓', master: 'R', users: '–' },
  { role: 'Viewer', dash: 'R', tender: 'R', proyek: 'R', keuangan: '–', wh: 'R', master: '–', users: '–' },
]

export interface UserRow {
  nama: string
  email: string
  role: string
  scope: string[]
  aktif: boolean
}

export interface Client {
  nama: string
  tipe: string
  pic: string
  kota: string
  proyek: number
}

export interface Supplier {
  nama: string
  tipe: string
  kategori: string
  kota: string
}

export interface Bank {
  bank: string
  rek: string
  an: string
  co: string
}

export interface SalesOrder {
  id: string
  no: string
  scope: string
  nilai: number
  progress: number
  status: string
  target: string
}

export const P: Proyek[] = [
  { id: 'p1', no: 'PO-2025/KPS/014', name: 'Pengadaan Panel Distribusi 20kV', client: 'PT PLN (Persero) UID Jakarta', co: 'kps', nilai: 12500000000, termin: '3 Termin', progress: 62, status: 'Aktif', so: 5, masuk: 7800000000, keluar: 5900000000 },
  { id: 'p2', no: 'PO-2025/BCK/007', name: 'Pembangunan Gardu Induk Cikarang', client: 'PT PLN (Persero) UIP JBT', co: 'bck', nilai: 48900000000, termin: '5 Termin', progress: 41, status: 'Aktif', so: 8, masuk: 20000000000, keluar: 16800000000 },
  { id: 'p3', no: 'PO-2025/MSN/022', name: 'Supply Pipa & Fitting Kilang', client: 'PT Pertamina RU IV Cilacap', co: 'msn', nilai: 8750000000, termin: '2 Termin', progress: 88, status: 'Aktif', so: 3, masuk: 7700000000, keluar: 6100000000 },
  { id: 'p4', no: 'PO-2025/KPS/009', name: 'Pengadaan Genset 500kVA', client: 'Pemprov DKI Jakarta', co: 'kps', nilai: 6200000000, termin: '2 Termin', progress: 100, status: 'BAPP', so: 2, masuk: 6200000000, keluar: 4700000000 },
  { id: 'p5', no: 'PO-2024/BCK/031', name: 'Renovasi Kantor Wilayah', client: 'Bank BJB', co: 'bck', nilai: 15300000000, termin: '4 Termin', progress: 100, status: 'Closed', so: 4, masuk: 15300000000, keluar: 11900000000 },
  { id: 'p6', no: 'PO-2025/MSN/018', name: 'Pengadaan APD & Safety Equipment', client: 'PT Pertamina Hulu Rokan', co: 'msn', nilai: 4100000000, termin: '1 Termin', progress: 27, status: 'Aktif', so: 2, masuk: 1200000000, keluar: 980000000 },
]

export const tenders: Tender[] = [
  { stage: 'daftar', name: 'Pengadaan Trafo Daya 60MVA', client: 'PT PLN UIP JBT', co: 'bck', nilai: 22000000000, deadline: '12 Jul 2026' },
  { stage: 'daftar', name: 'Supply Kabel NYFGbY', client: 'PT Pertamina Gas', co: 'msn', nilai: 6400000000, deadline: '15 Jul 2026' },
  { stage: 'prakualifikasi', name: 'Pembangunan Jaringan SUTM', client: 'PT PLN UID Jabar', co: 'bck', nilai: 18500000000, deadline: '09 Jul 2026' },
  { stage: 'prakualifikasi', name: 'Pengadaan Panel LV MDP', client: 'Pemkot Bandung', co: 'kps', nilai: 3200000000, deadline: '18 Jul 2026' },
  { stage: 'harga', name: 'Supply Material Mekanikal', client: 'PT Pertamina RU V', co: 'msn', nilai: 9100000000, deadline: '07 Jul 2026' },
  { stage: 'harga', name: 'Pengadaan UPS & Rectifier', client: 'PT PLN UID Jakarta', co: 'kps', nilai: 5600000000, deadline: '21 Jul 2026' },
  { stage: 'negosiasi', name: 'Renovasi Gedung Arsip', client: 'Pemprov Jabar', co: 'bck', nilai: 12800000000, deadline: '05 Jul 2026' },
  { stage: 'negosiasi', name: 'Pengadaan Genset 1000kVA', client: 'RSUD Kota Bekasi', co: 'kps', nilai: 8300000000, deadline: '10 Jul 2026' },
  { stage: 'pengumuman', name: 'Supply Compression Fitting', client: 'PT Pertamina EP', co: 'msn', nilai: 4700000000, deadline: '04 Jul 2026' },
  { stage: 'menang', name: 'Pengadaan Switchgear 20kV', client: 'PT PLN UID Banten', co: 'kps', nilai: 14200000000, deadline: 'Menang · 28 Jun' },
  { stage: 'menang', name: 'Pembangunan Gudang Logistik', client: 'PT Pupuk Kujang', co: 'bck', nilai: 19600000000, deadline: 'Menang · 25 Jun' },
]

export const inv: Invoice[] = [
  { no: 'INV-2025/KPS/041', proj: 'Pengadaan Panel Distribusi 20kV', co: 'kps', nilai: 4200000000, tgl: '18 Jun 2026', due: '18 Jul 2026', status: 'Terkirim' },
  { no: 'INV-2025/BCK/019', proj: 'Pembangunan Gardu Induk Cikarang', co: 'bck', nilai: 9800000000, tgl: '02 Jun 2026', due: '02 Jul 2026', status: 'Overdue' },
  { no: 'INV-2025/MSN/033', proj: 'Supply Pipa & Fitting Kilang', co: 'msn', nilai: 3850000000, tgl: '21 Jun 2026', due: '21 Jul 2026', status: 'Dibayar' },
  { no: 'INV-2025/KPS/038', proj: 'Pengadaan Genset 500kVA', co: 'kps', nilai: 3100000000, tgl: '10 Jun 2026', due: '10 Jul 2026', status: 'Dibayar' },
  { no: 'INV-2025/MSN/029', proj: 'Pengadaan APD & Safety Equipment', co: 'msn', nilai: 1200000000, tgl: '24 Jun 2026', due: '24 Jul 2026', status: 'Terbit' },
  { no: 'INV-2025/BCK/017', proj: 'Pembangunan Gardu Induk Cikarang', co: 'bck', nilai: 6500000000, tgl: '14 May 2026', due: '14 Jun 2026', status: 'Dibayar' },
]

export const pay: Payment[] = [
  { no: 'RCV-2025/0092', inv: 'INV-2025/MSN/033', co: 'msn', nilai: 3850000000, tgl: '28 Jun 2026', metode: 'Transfer', bank: 'BCA 217-xxx-8841' },
  { no: 'RCV-2025/0088', inv: 'INV-2025/KPS/038', co: 'kps', nilai: 3100000000, tgl: '19 Jun 2026', metode: 'Transfer', bank: 'Mandiri 140-xxx-2210' },
  { no: 'RCV-2025/0079', inv: 'INV-2025/BCK/017', co: 'bck', nilai: 6500000000, tgl: '20 Jun 2026', metode: 'Giro', bank: 'BNI 088-xxx-5512' },
]

export const poKeluar: POKeluar[] = [
  { no: 'POK-2025/KPS/061', supplier: 'PT Schneider Indonesia', co: 'kps', nilai: 2100000000, status: 'Diterima', due: '05 Jul 2026' },
  { no: 'POK-2025/KPS/058', supplier: 'CV Sinar Elektrindo', co: 'kps', nilai: 640000000, status: 'Dikirim', due: '12 Jul 2026' },
  { no: 'POK-2025/KPS/055', supplier: 'PT Panel Nusantara', co: 'kps', nilai: 1350000000, status: 'Draft', due: '—' },
]

export const stok: Stok[] = [
  { kode: 'MTR-0012', nama: 'Kabel NYY 4x50mm', gudang: 'Gudang Cakung', co: 'kps', qty: 320, min: 150, sat: 'meter' },
  { kode: 'MTR-0031', nama: 'MCCB 3P 250A', gudang: 'Gudang Cakung', co: 'kps', qty: 24, min: 40, sat: 'unit' },
  { kode: 'MTR-0088', nama: 'Pipa Galvanis 6"', gudang: 'Gudang Cilacap', co: 'msn', qty: 180, min: 80, sat: 'batang' },
  { kode: 'MTR-0102', nama: 'Semen PCC 50kg', gudang: 'Gudang Cikarang', co: 'bck', qty: 640, min: 300, sat: 'sak' },
  { kode: 'MTR-0119', nama: 'Besi Beton D16', gudang: 'Gudang Cikarang', co: 'bck', qty: 95, min: 200, sat: 'batang' },
  { kode: 'MTR-0044', nama: 'Safety Helmet SNI', gudang: 'Gudang Duri', co: 'msn', qty: 410, min: 100, sat: 'pcs' },
]

export const aset: Aset[] = [
  { kode: 'AST-001', nama: 'Excavator Komatsu PC200', jenis: 'Alat Berat', co: 'bck', kondisi: 'Baik', pic: 'Rudi Hartono', nilai: 1850000000 },
  { kode: 'AST-004', nama: 'Truck Hino Dutra', jenis: 'Kendaraan', co: 'kps', kondisi: 'Baik', pic: 'Agus Salim', nilai: 420000000 },
  { kode: 'AST-009', nama: 'Genset Portable 50kVA', jenis: 'Peralatan', co: 'msn', kondisi: 'Perlu Servis', pic: 'Bayu Prakoso', nilai: 175000000 },
  { kode: 'AST-012', nama: 'Concrete Mixer', jenis: 'Alat Berat', co: 'bck', kondisi: 'Baik', pic: 'Rudi Hartono', nilai: 95000000 },
  { kode: 'AST-015', nama: 'Forklift Toyota 3T', jenis: 'Peralatan', co: 'kps', kondisi: 'Rusak Ringan', pic: 'Agus Salim', nilai: 310000000 },
]

export const users: UserRow[] = [
  { nama: 'Bpk. Hendra Wijaya', email: 'hendra@holding.co.id', role: 'CEO', scope: ['kps', 'msn', 'bck'], aktif: true },
  { nama: 'Siti Nurhaliza', email: 'siti.admin@holding.co.id', role: 'Super Admin', scope: ['kps', 'msn', 'bck'], aktif: true },
  { nama: 'Dodi Firmansyah', email: 'dodi.pm@kps.co.id', role: 'Admin Proyek', scope: ['kps'], aktif: true },
  { nama: 'Rina Wulandari', email: 'rina.pm@bck.co.id', role: 'Admin Proyek', scope: ['bck', 'msn'], aktif: true },
  { nama: 'Andi Setiawan', email: 'andi.fin@holding.co.id', role: 'Finance', scope: ['kps', 'msn', 'bck'], aktif: true },
  { nama: 'Bayu Prakoso', email: 'bayu.wh@msn.co.id', role: 'Warehouse', scope: ['msn'], aktif: true },
  { nama: 'Tono Sudarto', email: 'tono.view@holding.co.id', role: 'Viewer', scope: ['kps', 'bck'], aktif: false },
]

export const clients: Client[] = [
  { nama: 'PT PLN (Persero)', tipe: 'BUMN', pic: 'Ir. Bambang S.', kota: 'Jakarta', proyek: 3 },
  { nama: 'PT Pertamina (Persero)', tipe: 'BUMN', pic: 'Dwi Cahyono', kota: 'Cilacap', proyek: 3 },
  { nama: 'Pemprov DKI Jakarta', tipe: 'Pemerintah', pic: 'Drs. Sukarno', kota: 'Jakarta', proyek: 1 },
  { nama: 'Bank BJB', tipe: 'BUMD', pic: 'Lestari Ayu', kota: 'Bandung', proyek: 1 },
]

export const suppliers: Supplier[] = [
  { nama: 'PT Schneider Indonesia', tipe: 'Supplier', kategori: 'Elektrikal', kota: 'Jakarta' },
  { nama: 'CV Sinar Elektrindo', tipe: 'Supplier', kategori: 'Kabel & Aksesoris', kota: 'Bekasi' },
  { nama: 'PT Beton Perkasa', tipe: 'Subcont', kategori: 'Sipil', kota: 'Cikarang' },
  { nama: 'PT Panel Nusantara', tipe: 'Supplier', kategori: 'Panel', kota: 'Tangerang' },
]

export const banks: Bank[] = [
  { bank: 'Bank Central Asia', rek: '217-1188-8841', an: 'PT Karya Prima Sejahtera', co: 'kps' },
  { bank: 'Bank Mandiri', rek: '140-0022-2210', an: 'PT Mandiri Supply Nusantara', co: 'msn' },
  { bank: 'Bank Negara Indonesia', rek: '088-5512-0091', an: 'PT Bangun Cipta Konstruksi', co: 'bck' },
]

// Default milestone template used when seeding / creating a Sales Order.
export function defaultMilestones(): Omit<Milestone, 'id'>[] {
  return [
    { label: 'Kick-off & Shop Drawing', pct: 100, status: 'Selesai' },
    { label: 'Fabrikasi Material', pct: 100, status: 'Selesai' },
    { label: 'Delivery ke Lokasi', pct: 80, status: 'Berjalan' },
    { label: 'Instalasi & Wiring', pct: 45, status: 'Berjalan' },
    { label: 'Testing & Commissioning', pct: 0, status: 'Menunggu' },
  ]
}

// Derives the Sales Orders for a given project — mirrors soFor() in the source.
export function soFor(projId: string): SalesOrder[] {
  const p = P.find((x) => x.id === projId) || P[0]
  return soForProject(p)
}

// Same derivation but from a project object (works for store-created projects
// that aren't part of the static `P` seed array).
export function soForProject(p: Proyek): SalesOrder[] {
  const suffix = p.no.split('/')[2]
  const list: SalesOrder[] = [
    { id: 'so1', no: 'SO-' + suffix + '-01', scope: 'Fabrikasi & Supply Panel Utama', nilai: Math.round(p.nilai * 0.42), progress: 100, status: 'Selesai', target: '20 Jun 2026' },
    { id: 'so2', no: 'SO-' + suffix + '-02', scope: 'Instalasi & Wiring di Lokasi', nilai: Math.round(p.nilai * 0.28), progress: 74, status: 'Berjalan', target: '25 Jul 2026' },
    { id: 'so3', no: 'SO-' + suffix + '-03', scope: 'Testing & Commissioning', nilai: Math.round(p.nilai * 0.18), progress: 35, status: 'BAST', target: '12 Agu 2026' },
    { id: 'so4', no: 'SO-' + suffix + '-04', scope: 'Dokumentasi & Training', nilai: Math.round(p.nilai * 0.12), progress: 10, status: 'Berjalan', target: '30 Agu 2026' },
  ]
  return list.slice(0, Math.max(2, Math.min(4, p.so)))
}
