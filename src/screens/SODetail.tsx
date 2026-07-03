// SO detail — opened from a project. Tabs: Progress & Milestone, PO Keluar,
// Keuangan, BAST (the SO-closing document with pipeline + checklist).

import { useState, type ReactNode } from 'react'
import { useApp } from '../store'
import { co, fmtC, stt } from '../theme'
import { soForProject } from '../data'
import { useData, type POKeluarRow, type ProyekRow } from '../dataStore'
import { Icon, StatusBadge, Tabs } from '../components/ui'
import { DocumentManager } from '../components/Modal'
import { PODetailModal, POFormModal } from '../components/PODetail'
import { History, Stepper } from './ProyekDetail'

const SO_TABS = [
  { key: 'progress', label: 'Progress & Milestone' },
  { key: 'po', label: 'PO Keluar' },
  { key: 'keuangan', label: 'Keuangan' },
  { key: 'bast', label: 'BAST' },
]

const MILESTONES = [
  { label: 'Kick-off & Shop Drawing', pct: 100, status: 'Selesai' },
  { label: 'Fabrikasi Material', pct: 100, status: 'Selesai' },
  { label: 'Delivery ke Lokasi', pct: 80, status: 'Berjalan' },
  { label: 'Instalasi & Wiring', pct: 45, status: 'Berjalan' },
  { label: 'Testing & Commissioning', pct: 0, status: 'Menunggu' },
]

const BAST_STEP_LABELS = ['Draft', 'Diajukan', 'Ditandatangani', 'Selesai']

const th = { fontWeight: 700, padding: '11px 8px' } as const

export default function SODetail() {
  const { state, set } = useApp()
  const { rows } = useData()

  const projects = rows<ProyekRow>('projects')
  const P0 = projects.find((x) => x.id === state.detailProyek) || projects[0]
  const pc = co(P0.co)
  const sos = soForProject(P0)
  const SO = sos.find((x) => x.id === state.detailSO) || sos[0]

  const [poFormOpen, setPoFormOpen] = useState(false)
  const [poDetail, setPoDetail] = useState<POKeluarRow | null>(null)
  const sst = stt(SO.status)

  const sdBudget = [
    { label: 'Nilai SO', v: SO.nilai, color: '#1E3A8A', w: 100 },
    { label: 'Budget PO Keluar', v: Math.round(SO.nilai * 0.72), color: '#D97706', w: 72 },
    { label: 'Realisasi Biaya', v: Math.round(SO.nilai * 0.58), color: '#0891B2', w: 58 },
  ]
  const sdMargin = Math.round(SO.nilai * 0.42)

  const bastIdx = SO.status === 'Selesai' ? 3 : SO.status === 'BAST' ? 1 : 0
  const bastNo = 'BAST-2025/' + pc.short + '/' + SO.no.split('-')[1]
  // The prototype renders every checklist row as delivered (green check),
  // so we keep the same fixed list for visual parity.
  const bastChecklist = [
    'Serah terima unit sesuai spesifikasi',
    'Dokumen manual & garansi lengkap',
    'Hasil testing & commissioning',
    'Training operasional selesai',
  ]
  const bastHistory = [
    { status: 'Draft dibuat', date: '18 Jun 2026 · 08:40', pic: 'Dodi Firmansyah' },
    { status: 'Diajukan', date: '19 Jun 2026 · 16:12', pic: 'Dodi Firmansyah' },
    { status: 'Ditandatangani', date: '20 Jun 2026 · 11:00', pic: 'PT PLN — Ir. Bambang S.' },
  ].slice(0, bastIdx + 1)

  const tab = state.soTab

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <button
        onClick={() => set({ detailSO: null })}
        className="hv-link-navy"
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 14 }}
      >
        <Icon d="M15 18l-6-6 6-6" size={16} width={2} />
        Kembali ke {P0.name}
      </button>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: pc.bg, color: pc.color }}>{pc.short}</span>
              <span style={{ fontSize: 11, fontFamily: 'ui-monospace,monospace', fontWeight: 700, color: '#94A3B8' }}>{SO.no}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: sst.bg, color: sst.c }}>{SO.status}</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', margin: '0 0 4px' }}>{SO.scope}</h1>
            <div style={{ fontSize: 13, color: '#64748B' }}>Bagian dari proyek: {P0.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Nilai SO</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#1E3A8A', letterSpacing: '-.02em' }}>{fmtC(SO.nilai)}</div>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <Tabs tabs={SO_TABS} active={tab} onChange={(k) => set({ soTab: k })} />
        </div>

        {/* Progress & Milestone */}
        {tab === 'progress' && (
          <div style={{ paddingTop: 22 }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: 18, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Progress SO</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#1E3A8A' }}>{SO.progress}%</span>
              </div>
              <div style={{ height: 12, background: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ width: `${SO.progress}%`, height: '100%', background: 'linear-gradient(90deg,#1E3A8A,#2563EB)', borderRadius: 8 }} />
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Milestone</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MILESTONES.map((m, i) => {
                const st = stt(m.status)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '13px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20, background: st.bg, color: st.c, minWidth: 80, textAlign: 'center' }}>{m.status}</span>
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: '#334155' }}>{m.label}</span>
                    <div style={{ width: 120, height: 7, background: '#EEF2F6', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${m.pct}%`, height: '100%', background: '#1E3A8A', borderRadius: 6 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#334155', width: 36, textAlign: 'right' }}>{m.pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PO Keluar */}
        {tab === 'po' && (
          <div style={{ paddingTop: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>PO Keluar ke Supplier / Subcont</div>
              <button style={softBtn} onClick={() => setPoFormOpen(true)}>+ PO Keluar</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
                  <th style={{ fontWeight: 700, padding: '11px 14px' }}>No. PO</th>
                  <th style={th}>Supplier / Subcont</th>
                  <th style={{ ...th, textAlign: 'right' }}>Nilai</th>
                  <th style={th}>Status</th>
                  <th style={th}>Jatuh Tempo Bayar</th>
                </tr>
              </thead>
              <tbody>
                {rows<POKeluarRow>('poKeluar').map((p) => (
                  <tr key={p.id} onClick={() => setPoDetail(p)} className="hv-row" style={{ borderTop: '1px solid #F1F5F9', cursor: 'pointer' }}>
                    <td style={{ padding: '13px 14px', fontWeight: 700, fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{p.no}</td>
                    <td style={{ padding: '13px 8px', fontWeight: 600, color: '#334155' }}>{p.supplier}</td>
                    <td style={{ padding: '13px 8px', textAlign: 'right', fontWeight: 800 }}>{fmtC(p.nilai)}</td>
                    <td style={{ padding: '13px 8px' }}>
                      <StatusBadge status={p.status} />
                    </td>
                    <td style={{ padding: '13px 8px', color: '#64748B' }}>{p.due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 12 }}>Klik baris PO untuk melihat detail &amp; export PDF.</div>
          </div>
        )}

        {/* Keuangan */}
        {tab === 'keuangan' && (
          <div style={{ paddingTop: 22 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Budget vs Realisasi (SO)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {sdBudget.map((b, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{b.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: b.color }}>{fmtC(b.v)}</span>
                      </div>
                      <div style={{ height: 10, background: '#F1F5F9', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${b.w}%`, height: '100%', background: b.color, borderRadius: 6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Margin SO</div>
                <div style={{ background: 'linear-gradient(160deg,#0891B2,#0E7490)', color: '#fff', borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 13, color: '#A5F3FC', fontWeight: 600 }}>Estimasi Margin (42%)</div>
                  <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 4px' }}>{fmtC(sdMargin)}</div>
                  <div style={{ fontSize: 12, color: '#CFFAFE' }}>
                    Cash in/out level SO dihitung dari nilai SO dikurangi realisasi PO keluar.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BAST */}
        {tab === 'bast' && (
          <div style={{ paddingTop: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Berita Acara Serah Terima (BAST)</div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 3 }}>
                  Dokumen penutup SO — mengubah status SO menjadi Selesai. Due: {SO.target}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>Status Pipeline</div>
                <div style={{ marginBottom: 22 }}>
                  <Stepper labels={BAST_STEP_LABELS} idx={bastIdx} lineHeight={24} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Riwayat Status</div>
                <History items={bastHistory} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>Dokumen BAST</div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, fontSize: 13 }}>
                  <DocRow label="No. BAST" value={<span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{bastNo}</span>} />
                  <DocRow label="SO Terkait" value={<span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{SO.no}</span>} />
                  <DocRow label="Dari → Kepada" value={`${pc.short} → Client`} />
                  <div style={{ padding: '12px 0 6px' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 8 }}>Checklist item diserahkan</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {bastChecklist.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 5,
                              background: '#059669',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flex: 'none',
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </span>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 18 }}>
                  <DocumentManager scope={`so:${SO.id}`} title="Dokumen & Foto Serah Terima" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {poFormOpen && <POFormModal defaultCo={P0.co} onClose={() => setPoFormOpen(false)} />}
      {poDetail && <PODetailModal po={poDetail} onClose={() => setPoDetail(null)} />}
    </div>
  )
}

const softBtn = {
  fontSize: 12.5,
  fontWeight: 700,
  color: '#1E3A8A',
  border: '1px solid #C7D2FE',
  background: '#EEF2FF',
  borderRadius: 9,
  padding: '8px 14px',
} as const

function DocRow({ label, value, last }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: last ? 'none' : '1px solid #EDF1F5' }}>
      <span style={{ color: '#64748B' }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  )
}
