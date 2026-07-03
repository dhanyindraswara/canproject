// User & Akses — store-backed user table with add / edit / delete, an active
// toggle, per-company scope selection, and a role badge; plus a compact access
// matrix.

import { useState } from 'react'
import { useApp } from '../store'
import { allCompanies, co } from '../theme'
import { useData, type UserRowT } from '../dataStore'
import { AddButton, Field, FieldRow, GhostButton, Modal, PrimaryButton, RowAction, SelectField } from '../components/Modal'

const ROLES = ['CEO', 'Super Admin', 'Admin Proyek', 'Finance', 'Warehouse', 'Viewer']

const ROLE_COLOR: Record<string, string> = {
  CEO: '#7C3AED',
  'Super Admin': '#1E3A8A',
  'Admin Proyek': '#2563EB',
  Finance: '#059669',
  Warehouse: '#0891B2',
  Viewer: '#64748B',
}

const ACCESS_MATRIX = [
  { role: 'Super Admin', dash: '✓', tender: '✓', proyek: '✓', keuangan: '✓', wh: '✓', master: '✓', users: '✓' },
  { role: 'CEO / Owner', dash: '✓', tender: 'R', proyek: 'R', keuangan: 'R', wh: 'R', master: '–', users: '–' },
  { role: 'Admin Proyek', dash: '–', tender: '✓', proyek: '✓', keuangan: 'R', wh: 'R', master: '–', users: '–' },
  { role: 'Finance', dash: 'R', tender: '–', proyek: 'R', keuangan: '✓', wh: '–', master: 'R', users: '–' },
  { role: 'Warehouse', dash: '–', tender: '–', proyek: 'R', keuangan: '–', wh: '✓', master: 'R', users: '–' },
  { role: 'Viewer', dash: 'R', tender: 'R', proyek: 'R', keuangan: '–', wh: 'R', master: '–', users: '–' },
]

const th = { fontWeight: 700, padding: '12px 8px' } as const
const matrixTh = { fontWeight: 700, padding: '12px 8px' } as const
const matrixTd = { padding: '12px 8px', fontWeight: 800, color: '#334155' } as const

const emptyUser = { nama: '', email: '', role: 'Admin Proyek', scope: [] as string[], aktif: true }

export default function Users() {
  const { toast } = useApp()
  const { rows, addRow, updateRow, removeRow } = useData()
  const users = rows<UserRowT>('users')

  const [edit, setEdit] = useState<{ id: string | null; nama: string; email: string; role: string; scope: string[]; aktif: boolean } | null>(null)

  const openForm = (u?: UserRowT) => {
    setEdit(u ? { id: u.id, nama: u.nama, email: u.email, role: u.role, scope: [...u.scope], aktif: u.aktif } : { id: null, ...emptyUser })
  }

  const toggleScope = (id: string) => {
    if (!edit) return
    setEdit({ ...edit, scope: edit.scope.includes(id) ? edit.scope.filter((x) => x !== id) : [...edit.scope, id] })
  }

  const save = () => {
    if (!edit) return
    if (!edit.nama.trim() || !edit.email.trim()) {
      toast('Nama & email wajib diisi')
      return
    }
    const payload = { nama: edit.nama.trim(), email: edit.email.trim(), role: edit.role, scope: edit.scope, aktif: edit.aktif }
    if (edit.id) {
      updateRow('users', edit.id, payload)
      toast('User diperbarui')
    } else {
      addRow('users', payload)
      toast('User ditambahkan')
    }
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
                    <RowAction kind="delete" title="Hapus user" onClick={() => { removeRow('users', u.id); toast('User dihapus') }} />
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

      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Matriks Hak Akses (ringkas)</div>
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'center' }}>
          <thead>
            <tr style={{ color: '#94A3B8', background: '#FAFBFC' }}>
              <th style={{ fontWeight: 700, padding: '12px 16px', textAlign: 'left' }}>Role</th>
              <th style={matrixTh}>Dashboard</th>
              <th style={matrixTh}>Tender</th>
              <th style={matrixTh}>Proyek</th>
              <th style={matrixTh}>Keuangan</th>
              <th style={matrixTh}>Warehouse</th>
              <th style={matrixTh}>Master</th>
              <th style={matrixTh}>User</th>
            </tr>
          </thead>
          <tbody>
            {ACCESS_MATRIX.map((m, i) => (
              <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700 }}>{m.role}</td>
                <td style={matrixTd}>{m.dash}</td>
                <td style={matrixTd}>{m.tender}</td>
                <td style={matrixTd}>{m.proyek}</td>
                <td style={matrixTd}>{m.keuangan}</td>
                <td style={matrixTd}>{m.wh}</td>
                <td style={matrixTd}>{m.master}</td>
                <td style={matrixTd}>{m.users}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', gap: 18, padding: '12px 16px', borderTop: '1px solid #F1F5F9', fontSize: 12, color: '#64748B' }}>
          <span><b style={{ color: '#334155' }}>✓</b> Akses penuh</span>
          <span><b style={{ color: '#334155' }}>R</b> Read-only</span>
          <span><b style={{ color: '#334155' }}>–</b> Tidak ada akses</span>
        </div>
      </div>

      {edit && (
        <Modal
          title={`${edit.id ? 'Edit' : 'Tambah'} User`}
          onClose={() => setEdit(null)}
          footer={
            <>
              <GhostButton onClick={() => setEdit(null)}>Batal</GhostButton>
              <PrimaryButton onClick={save}>Simpan</PrimaryButton>
            </>
          }
        >
          <FieldRow>
            <Field label="Nama" value={edit.nama} onChange={(v) => setEdit({ ...edit, nama: v })} placeholder="Nama lengkap" />
            <Field label="Email" value={edit.email} onChange={(v) => setEdit({ ...edit, email: v })} placeholder="nama@holding.co.id" />
          </FieldRow>
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
