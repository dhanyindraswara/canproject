// Design tokens, company/status/role maps and Rupiah formatters.
// Ported verbatim from the HoldingOS design prototype so colors stay
// pixel-consistent across every screen.

export interface Company {
  id: string
  short: string
  name: string
  bidang: string
  color: string
  bg: string
}

export const CO: Record<string, Company> = {
  kps: { id: 'kps', short: 'KPS', name: 'PT Karya Prima Sejahtera', bidang: 'General Supplier', color: '#2563EB', bg: '#EFF4FF' },
  msn: { id: 'msn', short: 'MSN', name: 'PT Mandiri Supply Nusantara', bidang: 'Pengadaan Barang/Jasa', color: '#0891B2', bg: '#ECFEFF' },
  bck: { id: 'bck', short: 'BCK', name: 'PT Bangun Cipta Konstruksi', bidang: 'Konstruksi', color: '#7C3AED', bg: '#F3F0FF' },
}

export type RoleKey = 'ceo' | 'superadmin' | 'adminproyek' | 'finance' | 'warehouse'
export type MenuKey =
  | 'dashboard'
  | 'tender'
  | 'proyek'
  | 'warehouse'
  | 'master'
  | 'users'
  | 'invoices'
  | 'po'

export interface Role {
  label: string
  land: MenuKey
}

export const ROLES: Record<RoleKey, Role> = {
  ceo: { label: 'CEO / Owner', land: 'dashboard' },
  superadmin: { label: 'Super Admin', land: 'dashboard' },
  adminproyek: { label: 'Admin Proyek', land: 'proyek' },
  finance: { label: 'Finance', land: 'invoices' },
  warehouse: { label: 'Warehouse', land: 'warehouse' },
}

export interface StatusStyle {
  c: string
  bg: string
}

export const ST: Record<string, StatusStyle> = {
  Aktif: { c: '#059669', bg: '#ECFDF5' },
  Berjalan: { c: '#2563EB', bg: '#EFF6FF' },
  BAST: { c: '#D97706', bg: '#FFFBEB' },
  Selesai: { c: '#059669', bg: '#ECFDF5' },
  BAPP: { c: '#7C3AED', bg: '#F5F3FF' },
  Closed: { c: '#475569', bg: '#F1F5F9' },
  Delay: { c: '#DC2626', bg: '#FEF2F2' },
  Overdue: { c: '#DC2626', bg: '#FEF2F2' },
  Dibayar: { c: '#059669', bg: '#ECFDF5' },
  Terbit: { c: '#475569', bg: '#F1F5F9' },
  Terkirim: { c: '#2563EB', bg: '#EFF6FF' },
  Menunggu: { c: '#D97706', bg: '#FFFBEB' },
  Draft: { c: '#475569', bg: '#F1F5F9' },
  Diterima: { c: '#059669', bg: '#ECFDF5' },
  Dikirim: { c: '#2563EB', bg: '#EFF6FF' },
}

const DEFAULT_STATUS: StatusStyle = { c: '#475569', bg: '#F1F5F9' }

export function stt(s: string): StatusStyle {
  return ST[s] || DEFAULT_STATUS
}

export function co(id: string): Company {
  return CO[id]
}

// "Semua Perusahaan" pseudo-company used by the header switcher.
export const ALL_COMPANY = {
  id: 'all',
  short: 'ALL',
  name: 'Semua Perusahaan',
  color: '#1E3A8A',
  bg: '#EEF2FF',
  sub: 'Mode Holding / CEO',
}

// Display name for the active company filter ("Semua Perusahaan" for 'all').
export function curCoName(company: string): string {
  return company === 'all' ? ALL_COMPANY.name : co(company).name
}

// Rupiah — full number with grouping.
export function fmt(n: number): string {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

// Rupiah — compact (M / jt) for KPI and contract values.
export function fmtC(n: number): string {
  if (n >= 1e9) return 'Rp ' + (n / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' M'
  if (n >= 1e6) return 'Rp ' + (n / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 0 }) + ' jt'
  return 'Rp ' + n.toLocaleString('id-ID')
}
