// Finance · Semua Invoice — flat cross-project invoice list with summary
// cards. Filtered by the global company switcher, plus functional search.

import { useMemo, useState } from 'react'
import { useApp } from '../store'
import { curCoName, fmtC } from '../theme'
import { inv } from '../data'
import { CompanyBadge, StatusBadge } from '../components/ui'

const th = { fontWeight: 700, padding: '12px 8px' } as const

export default function Invoices() {
  const { state } = useApp()
  const [query, setQuery] = useState('')

  // Summary reflects the active company filter (search only narrows the table).
  const summary = useMemo(() => {
    const scoped = inv.filter((i) => state.company === 'all' || i.co === state.company)
    return {
      total: fmtC(scoped.reduce((a, b) => a + b.nilai, 0)),
      dibayar: fmtC(scoped.filter((i) => i.status === 'Dibayar').reduce((a, b) => a + b.nilai, 0)),
      outstanding: fmtC(scoped.filter((i) => i.status !== 'Dibayar').reduce((a, b) => a + b.nilai, 0)),
    }
  }, [state.company])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return inv
      .filter((i) => state.company === 'all' || i.co === state.company)
      .filter((i) => q === '' || i.no.toLowerCase().includes(q) || i.proj.toLowerCase().includes(q))
  }, [state.company, query])

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Finance · Lintas Proyek
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>
          Semua Invoice — {curCoName(state.company)}
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 18 }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Total Ditagih</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{summary.total}</div>
        </div>
        <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>Sudah Dibayar</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: '#059669' }}>{summary.dibayar}</div>
        </div>
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 12, color: '#B45309', fontWeight: 600 }}>Outstanding (AR)</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4, color: '#D97706' }}>{summary.outstanding}</div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#F1F5F9', borderRadius: 10, width: 280 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari invoice, proyek..."
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, width: '100%' }}
            />
          </div>
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
            Filter perusahaan aktif via Company Switcher di header
          </span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
              <th style={{ fontWeight: 700, padding: '12px 18px' }}>No. Invoice</th>
              <th style={th}>PT</th>
              <th style={th}>Proyek</th>
              <th style={{ ...th, textAlign: 'right' }}>Nilai</th>
              <th style={th}>Jatuh Tempo</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i, idx) => (
              <tr key={idx} style={{ borderTop: '1px solid #F1F5F9' }}>
                <td style={{ padding: '13px 18px', fontWeight: 700, fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{i.no}</td>
                <td style={{ padding: '13px 8px' }}><CompanyBadge companyId={i.co} /></td>
                <td style={{ padding: '13px 8px', fontWeight: 600, color: '#334155' }}>{i.proj}</td>
                <td style={{ padding: '13px 8px', textAlign: 'right', fontWeight: 800 }}>{fmtC(i.nilai)}</td>
                <td style={{ padding: '13px 8px', color: '#64748B' }}>{i.due}</td>
                <td style={{ padding: '13px 8px' }}><StatusBadge status={i.status} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr style={{ borderTop: '1px solid #F1F5F9' }}>
                <td colSpan={6} style={{ padding: '32px 18px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                  Tidak ada invoice yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
