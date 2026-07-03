// Finance · Semua PO Keluar — flat cross-project list of outgoing POs to
// suppliers/subcontractors. Create new POs, click a row to view detail and
// export it to PDF.

import { useState } from 'react'
import { useApp } from '../store'
import { curCoName, fmtC } from '../theme'
import { useData, type POKeluarRow } from '../dataStore'
import { CompanyBadge, StatusBadge } from '../components/ui'
import { AddButton } from '../components/Modal'
import { PODetailModal, POFormModal } from '../components/PODetail'

const th = { fontWeight: 700, padding: '12px 8px' } as const

export default function POKeluar() {
  const { state } = useApp()
  const { rows } = useData()
  const [formOpen, setFormOpen] = useState(false)
  const [detail, setDetail] = useState<POKeluarRow | null>(null)

  const list = rows<POKeluarRow>('poKeluar').filter((p) => state.company === 'all' || p.co === state.company)

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>Finance · Lintas Proyek</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>Semua PO Keluar — {curCoName(state.company)}</h1>
        </div>
        <AddButton label="PO Keluar Baru" onClick={() => setFormOpen(true)} />
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
            {list.map((p) => (
              <tr key={p.id} onClick={() => setDetail(p)} className="hv-row" style={{ borderTop: '1px solid #F1F5F9', cursor: 'pointer' }}>
                <td style={{ padding: '13px 18px', fontWeight: 700, fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{p.no}</td>
                <td style={{ padding: '13px 8px' }}><CompanyBadge companyId={p.co} /></td>
                <td style={{ padding: '13px 8px', fontWeight: 600, color: '#334155' }}>{p.supplier}</td>
                <td style={{ padding: '13px 8px', textAlign: 'right', fontWeight: 800 }}>{fmtC(p.nilai)}</td>
                <td style={{ padding: '13px 8px' }}><StatusBadge status={p.status} /></td>
                <td style={{ padding: '13px 8px', color: '#64748B' }}>{p.due}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr style={{ borderTop: '1px solid #F1F5F9' }}>
                <td colSpan={6} style={{ padding: '32px 18px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>Belum ada PO Keluar. Klik “PO Keluar Baru”.</td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: '#94A3B8', padding: '12px 18px', borderTop: '1px solid #F1F5F9' }}>Klik baris PO untuk melihat detail &amp; export PDF.</div>
      </div>

      {formOpen && <POFormModal defaultCo={state.company === 'all' ? 'kps' : state.company} onClose={() => setFormOpen(false)} />}
      {detail && <PODetailModal po={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}
