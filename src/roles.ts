// Role helpers: map the (editable) access matrix to menu visibility and the
// landing screen, and translate between the app's RoleKey and the human role
// names used by the access matrix / user records.

import type { AccessRow } from './data'
import type { MenuKey, RoleKey } from './theme'

// The role names that own a row in the access matrix (canonical).
export const ROLE_NAMES = ['Super Admin', 'CEO / Owner', 'Admin Proyek', 'Finance', 'Warehouse', 'Viewer']

// Which access-matrix column governs each menu (null = always visible).
const MENU_ACCESS: Record<MenuKey, keyof AccessRow | null> = {
  dashboard: 'dash',
  tender: 'tender',
  proyek: 'proyek',
  warehouse: 'wh',
  documents: 'proyek',
  master: 'master',
  users: 'users',
  invoices: 'keuangan',
  po: 'keuangan',
}

// Landing screen per role name.
const ROLE_LANDING: Record<string, MenuKey> = {
  'Super Admin': 'dashboard',
  'CEO / Owner': 'dashboard',
  'Admin Proyek': 'proyek',
  Finance: 'invoices',
  Warehouse: 'warehouse',
  Viewer: 'dashboard',
}

// RoleKey (app enum) → role name, used to gate the demo/local login too.
export const KEY_TO_ROLE: Record<RoleKey, string> = {
  ceo: 'CEO / Owner',
  superadmin: 'Super Admin',
  adminproyek: 'Admin Proyek',
  finance: 'Finance',
  warehouse: 'Warehouse',
}

// Role name → RoleKey (best effort; used to set app label/landing on login).
export function roleNameToKey(roleName: string): RoleKey {
  const n = roleName.toLowerCase()
  if (n.includes('super')) return 'superadmin'
  if (n.includes('ceo') || n.includes('owner')) return 'ceo'
  if (n.includes('admin') || n.includes('proyek')) return 'adminproyek'
  if (n.includes('finance') || n.includes('keuangan')) return 'finance'
  if (n.includes('warehouse') || n.includes('gudang')) return 'warehouse'
  return 'ceo'
}

// Find the matrix row for a role name, tolerating minor naming differences
// (e.g. "CEO" vs "CEO / Owner").
function matchRow(matrix: AccessRow[], roleName: string): AccessRow | undefined {
  const exact = matrix.find((r) => r.role === roleName)
  if (exact) return exact
  const n = roleName.toLowerCase()
  return matrix.find((r) => r.role.toLowerCase().includes(n) || n.includes(r.role.toLowerCase()))
}

// Is a menu visible for this role name given the current access matrix?
export function menuAllowed(matrix: AccessRow[], roleName: string, menu: MenuKey): boolean {
  if (!roleName) return true
  const col = MENU_ACCESS[menu]
  if (!col) return true
  const row = matchRow(matrix, roleName)
  if (!row) return true
  return (row[col] as string) !== '–'
}

export function landingFor(roleName: string): MenuKey {
  return ROLE_LANDING[roleName] || 'dashboard'
}
