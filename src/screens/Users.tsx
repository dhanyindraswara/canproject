// User & Akses — user table with role badge and per-company scope chips, plus
// a compact access matrix.

import { useApp } from '../store'
import { co } from '../theme'
import { users } from '../data'
import { Icon } from '../components/ui'

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

export default function Users() {
  const { toast } = useApp()

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            User &amp; Akses
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>Pengguna &amp; hak akses</h1>
        </div>
        <button
          onClick={() => toast('Form tambah user dibuka')}
          className="hv-btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1E3A8A', color: '#fff', fontSize: 14, fontWeight: 700, padding: '11px 18px', borderRadius: 12 }}
        >
          <Icon d="M12 5v14M5 12h14" size={18} width={2.4} />
          Tambah User
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden', marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
              <th style={{ fontWeight: 700, padding: '12px 18px' }}>Nama</th>
              <th style={th}>Role</th>
              <th style={th}>Scope Perusahaan</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                <td style={{ padding: '13px 18px' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{u.nama}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{u.email}</div>
                </td>
                <td style={{ padding: '13px 8px' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 11px', borderRadius: 20, color: '#fff', background: ROLE_COLOR[u.role] || '#64748B' }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '13px 8px' }}>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {u.scope.map((id) => {
                      const c = co(id)
                      return (
                        <span key={id} style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: c.bg, color: c.color }}>
                          {c.short}
                        </span>
                      )
                    })}
                  </div>
                </td>
                <td style={{ padding: '13px 8px' }}>
                  {u.aktif && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 10px', borderRadius: 20 }}>
                      Aktif
                    </span>
                  )}
                </td>
              </tr>
            ))}
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
    </div>
  )
}
