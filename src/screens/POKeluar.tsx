// Finance · Semua PO Keluar — flat cross-project list of outgoing POs to
// suppliers/subcontractors.

import { useApp } from '../store'
import { curCoName, fmtC } from '../theme'
import { poKeluar } from '../data'
import { CompanyBadge, StatusBadge } from '../components/ui'

const th = { fontWeight: 700, padding: '12px 8px' } as const

export default function POKeluar() {
  const { state } = useApp()

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Finance · Lintas Proyek
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>
          Semua PO Keluar — {curCoName(state.company)}
        </h1>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
              <th style={{ fontWeight: 700, padding: '12px 18px' }}>No. PO</th>
              <th style={th}>PT</th>
              <th style={th}>Supplier / Subcont</th>
              <th style={{ ...th, textAlign: 'right' }}>Nilai</th>
              <th style={th}>Status</th>
              <th style={th}>Jatuh Tempo</th>
            </tr>
          </thead>
          <tbody>
            {poKeluar.map((p, i) => (
              <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                <td style={{ padding: '13px 18px', fontWeight: 700, fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{p.no}</td>
                <td style={{ padding: '13px 8px' }}><CompanyBadge companyId={p.co} /></td>
                <td style={{ padding: '13px 8px', fontWeight: 600, color: '#334155' }}>{p.supplier}</td>
                <td style={{ padding: '13px 8px', textAlign: 'right', fontWeight: 800 }}>{fmtC(p.nilai)}</td>
                <td style={{ padding: '13px 8px' }}><StatusBadge status={p.status} /></td>
                <td style={{ padding: '13px 8px', color: '#64748B' }}>{p.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
