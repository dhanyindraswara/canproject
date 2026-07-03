// User & Akses — store-backed user table with add / edit / delete, an active
// toggle, per-company scope selection, and a role badge; plus a compact access
// matrix.

import { useState } from 'react'
import { useApp } from '../store'
import { allCompanies, co } from '../theme'
import { accessMatrixSeed } from '../data'
import { useData, type AccessRowT, type UserRowT } from '../dataStore'
import { createAuthUser } from '../firebase'
import { AddButton, Field, FieldRow, GhostButton, Modal, PrimaryButton, RowAction, SelectField } from '../components/Modal'

// Role options mirror the access-matrix rows so a user's role maps cleanly.
const ROLES = ['Super Admin', 'CEO / Owner', 'Admin Proyek', 'Finance', 'Warehouse', 'Viewer']

// Modules shown as columns of the access matrix (key must match AccessRow).
const MODULES = [
  { key: 'dash', label: 'Dashboard' },
  { key: 'tender', label: 'Tender' },
  { key: 'proyek', label: 'Proyek' },
  { key: 'keuangan', label: 'Keuangan' },
  { key: 'wh', label: 'Warehouse' },
  { key: 'master', label: 'Master' },
  { key: 'users', label: 'User' },
] as const

// The three access levels a cell cycles through.
const LEVELS = ['✓', 'R', '–']
const LEVEL_STYLE: Record<string, { c: string; bg: string }> = {
  '✓': { c: '#059669', bg: '#ECFDF5' },
  R: { c: '#D97706', bg: '#FFFBEB' },
  '–': { c: '#94A3B8', bg: '#F1F5F9' },
}

const ROLE_COLOR: Record<string, string> = {
  CEO: '#7C3AED',
  'Super Admin': '#1E3A8A',
  'Admin Proyek': '#2563EB',
  Finance: '#059669',
  Warehouse: '#0891B2',
  Viewer: '#64748B',
}

const th = { fontWeight: 700, padding: '12px 8px' } as const
const matrixTh = { fontWeight: 700, padding: '12px 8px' } as const

const emptyUser = { nama: '', email: '', role: 'Admin Proyek', scope: [] as string[], aktif: true, password: '' }

export default function Users() {
  const { toast } = useApp()
  const { rows, addRow, updateRow, removeRow, setRows, cloudMode } = useData()
  const users = rows<UserRowT>('users')
  const matrix = rows<AccessRowT>('accessMatrix')

  const [edit, setEdit] = useState<{ id: string | null; nama: string; email: string; role: string; scope: string[]; aktif: boolean; password: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [roleName, setRoleName] = useState('')
  const [roleOpen, setRoleOpen] = useState(false)

  // Cycle a matrix cell: ✓ → R → – → ✓
  const cycleCell = (row: AccessRowT, key: string) => {
    const cur = (row as unknown as Record<string, string>)[key] ?? '–'
    const next = LEVELS[(LEVELS.indexOf(cur) + 1) % LEVELS.length]
    updateRow('accessMatrix', row.id, { [key]: next })
  }

  const addRole = () => {
    if (!roleName.trim()) {
      toast('Nama role wajib diisi')
      return
    }
    addRow('accessMatrix', { role: roleName.trim(), dash: '–', tender: '–', proyek: '–', keuangan: '–', wh: '–', master: '–', users: '–' })
    setRoleName('')
    setRoleOpen(false)
    toast('Role ditambahkan — atur aksesnya di matriks')
  }

  const resetMatrix = () => {
    setRows('accessMatrix', accessMatrixSeed.map((r, i) => ({ ...r, id: `acc-seed-${i}` })))
    toast('Matriks direset ke default')
  }

  const openForm = (u?: UserRowT) => {
    setEdit(u ? { id: u.id, nama: u.nama, email: u.email, role: u.role, scope: [...u.scope], aktif: u.aktif, password: '' } : { id: null, ...emptyUser })
  }

  const toggleScope = (id: string) => {
    if (!edit) return
    setEdit({ ...edit, scope: edit.scope.includes(id) ? edit.scope.filter((x) => x !== id) : [...edit.scope, id] })
  }

  const save = async () => {
    if (!edit) return
    if (!edit.nama.trim() || !edit.email.trim()) {
      toast('Nama & email wajib diisi')
      return
    }
    const payload = { nama: edit.nama.trim(), email: edit.email.trim(), role: edit.role, scope: edit.scope, aktif: edit.aktif }
    if (edit.id) {
      updateRow('users', edit.id, payload)
      toast('User diperbarui')
      setEdit(null)
      return
    }
    // Adding: in Firebase mode also create the real login account.
    if (cloudMode) {
      if (edit.password.length < 6) {
        toast('Password minimal 6 karakter')
        return
      }
      setSaving(true)
      try {
        await createAuthUser(edit.email.trim(), edit.password)
      } catch (e) {
        setSaving(false)
        const code = (e as { code?: string }).code || ''
        toast(code.includes('email-already') ? 'Email sudah terdaftar di Firebase' : code.includes('invalid-email') ? 'Format email tidak valid' : 'Gagal membuat akun login')
        return
      }
      setSaving(false)
    }
    addRow('users', payload)
    toast(cloudMode ? 'User + akun login dibuat' : 'User ditambahkan')
    setEdit(null)
  }

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>User &amp; Akses</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>Pengguna &amp; hak akses</h1>
        </div>
        <AddButton label="Tambah User" onClick={() => openForm()} />
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
              <th style={{ fontWeight: 700, padding: '12px 18px' }}>Nama</th>
              <th style={th}>Role</th>
              <th style={th}>Scope Perusahaan</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                <td style={{ padding: '13px 18px' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{u.nama}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{u.email}</div>
                </td>
                <td style={{ padding: '13px 8px' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 11px', borderRadius: 20, color: '#fff', background: ROLE_COLOR[u.role] || '#64748B' }}>{u.role}</span>
                </td>
                <td style={{ padding: '13px 8px' }}>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {u.scope.map((id) => {
                      const c = co(id)
                      return (
                        <span key={id} style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: c.bg, color: c.color }}>{c.short}</span>
                      )
                    })}
                    {u.scope.length === 0 && <span style={{ fontSize: 11, color: '#CBD5E1' }}>—</span>}
                  </div>
                </td>
                <td style={{ padding: '13px 8px' }}>
                  <button
                    onClick={() => { updateRow('users', u.id, { aktif: !u.aktif }); toast(u.aktif ? 'User dinonaktifkan' : 'User diaktifkan') }}
                    title="Klik untuk mengubah status"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 11px',
                      borderRadius: 20,
                      border: '1px solid',
                      color: u.aktif ? '#059669' : '#94A3B8',
                      background: u.aktif ? '#ECFDF5' : '#F1F5F9',
                      borderColor: u.aktif ? '#A7F3D0' : '#E2E8F0',
                    }}
                  >
                    {u.aktif ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td style={{ padding: '13px 8px' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <RowAction kind="edit" title="Edit user" onClick={() => openForm(u)} />
                    <RowAction kind="delete" title="Hapus user" onClick={() => { removeRow('users', u.id); toast(cloudMode ? 'User dihapus (hapus juga akunnya di Firebase Console → Auth)' : 'User dihapus') }} />
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr style={{ borderTop: '1px solid #F1F5F9' }}>
                <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>Belum ada user. Klik “Tambah User”.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 15, fontWeight: 800 }}>Matriks Hak Akses — klik sel untuk mengubah</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={resetMatrix} className="hv-menu-item-soft" style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', border: '1px solid #E2E8F0', background: '#fff', borderRadius: 9, padding: '8px 14px' }}>Reset default</button>
          <button onClick={() => setRoleOpen(true)} style={{ fontSize: 12.5, fontWeight: 700, color: '#1E3A8A', border: '1px solid #C7D2FE', background: '#EEF2FF', borderRadius: 9, padding: '8px 14px' }}>+ Role</button>
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'center' }}>
          <thead>
            <tr style={{ color: '#94A3B8', background: '#FAFBFC' }}>
              <th style={{ fontWeight: 700, padding: '12px 16px', textAlign: 'left' }}>Role</th>
              {MODULES.map((m) => (
                <th key={m.key} style={matrixTh}>{m.label}</th>
              ))}
              <th style={{ ...matrixTh, textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>{row.role}</td>
                {MODULES.map((m) => {
                  const val = (row as unknown as Record<string, string>)[m.key] ?? '–'
                  const s = LEVEL_STYLE[val] || LEVEL_STYLE['–']
                  return (
                    <td key={m.key} style={{ padding: '8px' }}>
                      <button
                        onClick={() => cycleCell(row, m.key)}
                        title="Klik untuk ubah akses"
                        style={{ width: 34, height: 30, borderRadius: 8, fontWeight: 800, fontSize: 14, color: s.c, background: s.bg, border: '1px solid transparent' }}
                      >
                        {val}
                      </button>
                    </td>
                  )
                })}
                <td style={{ padding: '8px' }}>
                  <RowAction kind="delete" title="Hapus role" onClick={() => { removeRow('accessMatrix', row.id); toast('Role dihapus') }} />
                </td>
              </tr>
            ))}
            {matrix.length === 0 && (
              <tr style={{ borderTop: '1px solid #F1F5F9' }}>
                <td colSpan={MODULES.length + 2} style={{ padding: '28px', color: '#94A3B8', fontWeight: 600 }}>Belum ada role. Klik “+ Role”, atau “Reset default”.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ display: 'flex', gap: 18, padding: '12px 16px', borderTop: '1px solid #F1F5F9', fontSize: 12, color: '#64748B' }}>
          <span><b style={{ color: '#059669' }}>✓</b> Akses penuh</span>
          <span><b style={{ color: '#D97706' }}>R</b> Read-only</span>
          <span><b style={{ color: '#94A3B8' }}>–</b> Tidak ada akses</span>
        </div>
      </div>

      {roleOpen && (
        <Modal
          title="Tambah Role"
          subtitle="Buat role baru, lalu atur aksesnya di matriks"
          onClose={() => setRoleOpen(false)}
          width={420}
          footer={
            <>
              <GhostButton onClick={() => setRoleOpen(false)}>Batal</GhostButton>
              <PrimaryButton onClick={addRole}>Tambah</PrimaryButton>
            </>
          }
        >
          <Field label="Nama Role" value={roleName} onChange={setRoleName} placeholder="mis. Manajer Proyek" />
        </Modal>
      )}

      {edit && (
        <Modal
          title={`${edit.id ? 'Edit' : 'Tambah'} User`}
          onClose={() => setEdit(null)}
          footer={
            <>
              <GhostButton onClick={() => setEdit(null)}>Batal</GhostButton>
              <PrimaryButton onClick={save}>{saving ? 'Membuat akun…' : 'Simpan'}</PrimaryButton>
            </>
          }
        >
          <FieldRow>
            <Field label="Nama" value={edit.nama} onChange={(v) => setEdit({ ...edit, nama: v })} placeholder="Nama lengkap" />
            <Field label="Email" value={edit.email} onChange={(v) => setEdit({ ...edit, email: v })} placeholder="nama@holding.co.id" />
          </FieldRow>
          {cloudMode && !edit.id && (
            <div style={{ marginBottom: 14 }}>
              <Field label="Password akun login" type="password" value={edit.password} onChange={(v) => setEdit({ ...edit, password: v })} placeholder="min. 6 karakter" />
              <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 4 }}>Akun login Firebase dibuat otomatis dengan email &amp; password ini.</div>
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <SelectField label="Role" value={edit.role} onChange={(v) => setEdit({ ...edit, role: v })} options={ROLES.map((r) => ({ value: r, label: r }))} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Scope Perusahaan</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {allCompanies().map((c) => {
                const on = edit.scope.includes(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleScope(c.id)}
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      padding: '7px 12px',
                      borderRadius: 9,
                      border: `1.5px solid ${on ? c.color : '#E2E8F0'}`,
                      background: on ? c.bg : '#fff',
                      color: on ? c.color : '#94A3B8',
                    }}
                  >
                    {c.short}
                  </button>
                )
              })}
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={edit.aktif} onChange={(e) => setEdit({ ...edit, aktif: e.target.checked })} style={{ width: 16, height: 16 }} />
            User aktif
          </label>
        </Modal>
      )}
    </div>
  )
}
