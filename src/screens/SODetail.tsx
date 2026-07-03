// SO detail — opened from a project. Tabs: Progress & Milestone (editable
// activities + progress), PO Keluar (create/view/export), Keuangan, and BAST
// (editable pipeline + document upload + generated BAST PDF).

import { useState, type ReactNode } from 'react'
import { useApp } from '../store'
import { co, fmt, fmtC, stt } from '../theme'
import { useData, type Milestone, type POKeluarRow, type ProyekRow, type SalesOrderRow } from '../dataStore'
import { printDocument } from '../print'
import { Icon, StatusBadge, Tabs } from '../components/ui'
import { DocumentManager, Field, FieldRow, GhostButton, Modal, NumberField, PrimaryButton, SelectField } from '../components/Modal'
import { PODetailModal, POFormModal } from '../components/PODetail'

const SO_TABS = [
  { key: 'progress', label: 'Progress & Milestone' },
  { key: 'po', label: 'PO Keluar' },
  { key: 'keuangan', label: 'Keuangan' },
  { key: 'bast', label: 'BAST' },
]

const BAST_STEP_LABELS = ['Draft', 'Diajukan', 'Ditandatangani', 'Selesai']
const MILESTONE_STATUS = ['Menunggu', 'Berjalan', 'Selesai']
const SO_STATUS = ['Berjalan', 'BAST', 'Selesai']

const th = { fontWeight: 700, padding: '11px 8px' } as const

// Auto status from a percentage.
function statusFromPct(pct: number): string {
  if (pct >= 100) return 'Selesai'
  if (pct <= 0) return 'Menunggu'
  return 'Berjalan'
}

export default function SODetail() {
  const { state, set, toast } = useApp()
  const { rows, updateRow } = useData()

  const projects = rows<ProyekRow>('projects')
  const P0 = projects.find((x) => x.id === state.detailProyek) || projects[0]
  const pc = co(P0.co)
  const sos = rows<SalesOrderRow>('salesOrders').filter((s) => s.projId === P0.id)
  const SO = sos.find((x) => x.id === state.detailSO) || sos[0]

  const [poFormOpen, setPoFormOpen] = useState(false)
  const [poDetail, setPoDetail] = useState<POKeluarRow | null>(null)
  const [msEdit, setMsEdit] = useState<{ id: string | null; label: string; pct: string; status: string } | null>(null)

  if (!SO) {
    return (
      <div style={{ animation: 'fadeUp .3s ease' }}>
        <button onClick={() => set({ detailSO: null })} className="hv-link-navy" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 14 }}>
          <Icon d="M15 18l-6-6 6-6" size={16} width={2} />
          Kembali ke {P0.name}
        </button>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 40, textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
          Sales Order tidak ditemukan. Buat SO baru dari halaman proyek.
        </div>
      </div>
    )
  }

  const pc2 = pc
  const sst = stt(SO.status)
  const milestones = SO.milestones || []

  const commitMilestones = (next: Milestone[]) => {
    const progress = next.length ? Math.round(next.reduce((a, b) => a + b.pct, 0) / next.length) : 0
    updateRow('salesOrders', SO.id, { milestones: next, progress })
  }

  const saveMilestone = () => {
    if (!msEdit) return
    if (!msEdit.label.trim()) {
      toast('Nama kegiatan wajib diisi')
      return
    }
    const pct = Math.max(0, Math.min(100, Number(msEdit.pct) || 0))
    const status = msEdit.status || statusFromPct(pct)
    if (msEdit.id) {
      commitMilestones(milestones.map((m) => (m.id === msEdit.id ? { ...m, label: msEdit.label.trim(), pct, status } : m)))
      toast('Kegiatan diperbarui')
    } else {
      commitMilestones([...milestones, { id: `${SO.id}-m-${Date.now()}`, label: msEdit.label.trim(), pct, status }])
      toast('Kegiatan ditambahkan')
    }
    setMsEdit(null)
  }

  const sdBudget = [
    { label: 'Nilai SO', v: SO.nilai, color: '#1E3A8A', w: 100 },
    { label: 'Budget PO Keluar', v: Math.round(SO.nilai * 0.72), color: '#D97706', w: 72 },
    { label: 'Realisasi Biaya', v: Math.round(SO.nilai * 0.58), color: '#0891B2', w: 58 },
  ]
  const sdMargin = Math.round(SO.nilai * 0.42)

  const bastIdx = SO.bastStep ?? 0
  const bastNo = 'BAST-2026/' + pc2.short + '/' + SO.no.split('-').pop()

  const setBastStep = (idx: number) => {
    const patch: Record<string, unknown> = { bastStep: idx }
    if (idx >= 3) patch.status = 'Selesai'
    else if (SO.status === 'Selesai') patch.status = 'BAST'
    updateRow('salesOrders', SO.id, patch)
    toast(`Status BAST: ${BAST_STEP_LABELS[idx]}`)
  }

  const generateBast = () => {
    const ok = printDocument({
      title: 'Berita Acara Serah Terima',
      docNo: bastNo,
      company: pc2.name,
      meta: [
        { label: 'No. BAST', value: bastNo },
        { label: 'No. SO', value: SO.no },
        { label: 'Proyek', value: P0.name },
        { label: 'Dari', value: pc2.name },
        { label: 'Kepada', value: P0.client },
        { label: 'Nilai SO', value: fmt(SO.nilai) },
        { label: 'Status', value: BAST_STEP_LABELS[bastIdx] },
      ],
      tableTitle: 'Item Pekerjaan Diserahkan',
      tableRows: milestones.map((m) => ({ label: m.label, value: `${m.pct}% · ${m.status}` })),
      footnote: 'Dengan ditandatanganinya BAST ini, pekerjaan pada Sales Order di atas dinyatakan diterima.',
    })
    if (!ok) toast('Popup diblokir browser — izinkan popup untuk ekspor PDF')
  }

  const tab = state.soTab

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <button onClick={() => set({ detailSO: null })} className="hv-link-navy" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 14 }}>
        <Icon d="M15 18l-6-6 6-6" size={16} width={2} />
        Kembali ke {P0.name}
      </button>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: pc2.bg, color: pc2.color }}>{pc2.short}</span>
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
                <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Progress SO (rata-rata milestone)</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#1E3A8A' }}>{SO.progress}%</span>
              </div>
              <div style={{ height: 12, background: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ width: `${SO.progress}%`, height: '100%', background: 'linear-gradient(90deg,#1E3A8A,#2563EB)', borderRadius: 8 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>Status SO:</span>
                <select
                  value={SO.status}
                  onChange={(e) => updateRow('salesOrders', SO.id, { status: e.target.value })}
                  className="hv-border-navy"
                  style={{ border: '1px solid #E2E8F0', borderRadius: 9, padding: '7px 10px', fontSize: 13, fontWeight: 700, outline: 'none' }}
                >
                  {SO_STATUS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Milestone / Kegiatan</div>
              <button onClick={() => setMsEdit({ id: null, label: '', pct: '0', status: 'Menunggu' })} style={{ fontSize: 12.5, fontWeight: 700, color: '#1E3A8A', border: '1px solid #C7D2FE', background: '#EEF2FF', borderRadius: 9, padding: '8px 14px' }}>+ Kegiatan</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {milestones.map((m) => {
                const st = stt(m.status)
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '13px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20, background: st.bg, color: st.c, minWidth: 80, textAlign: 'center' }}>{m.status}</span>
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: '#334155' }}>{m.label}</span>
                    <div style={{ width: 120, height: 7, background: '#EEF2F6', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${m.pct}%`, height: '100%', background: '#1E3A8A', borderRadius: 6 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#334155', width: 40, textAlign: 'right' }}>{m.pct}%</span>
                    <button onClick={() => setMsEdit({ id: m.id, label: m.label, pct: String(m.pct), status: m.status })} title="Update kegiatan" className="hv-icon-btn" style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', border: '1px solid #E2E8F0' }}>
                      <Icon d={['M12 20h9', 'M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z']} size={15} width={1.9} />
                    </button>
                    <button onClick={() => { commitMilestones(milestones.filter((x) => x.id !== m.id)); toast('Kegiatan dihapus') }} title="Hapus" style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', border: '1px solid #FECACA', background: '#FEF2F2' }}>
                      <Icon d={['M3 6h18', 'M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2', 'M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14']} size={14} width={1.9} />
                    </button>
                  </div>
                )
              })}
              {milestones.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontWeight: 600, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12 }}>Belum ada kegiatan. Klik “+ Kegiatan”.</div>}
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
                  <div style={{ fontSize: 12, color: '#CFFAFE' }}>Cash in/out level SO dihitung dari nilai SO dikurangi realisasi PO keluar.</div>
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
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 3 }}>Dokumen penutup SO — status pipeline dapat diperbarui di bawah. Due: {SO.target}</div>
              </div>
              <button onClick={generateBast} className="hv-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1E3A8A', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 16px', borderRadius: 11 }}>
                <Icon d={['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6']} size={16} width={1.9} />
                Generate BAST PDF
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>Status Pipeline — klik untuk memperbarui</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {BAST_STEP_LABELS.map((label, i) => {
                    const done = i < bastIdx
                    const cur = i === bastIdx
                    return (
                      <button key={i} onClick={() => setBastStep(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '11px 14px', borderRadius: 11, border: `1px solid ${cur ? '#1E3A8A' : '#E2E8F0'}`, background: cur ? '#EEF2FF' : done ? '#ECFDF5' : '#fff' }}>
                        <span style={{ width: 26, height: 26, borderRadius: '50%', flex: 'none', background: done ? '#059669' : cur ? '#1E3A8A' : '#E2E8F0', color: done || cur ? '#fff' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{done ? '✓' : i + 1}</span>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: cur ? '#1E3A8A' : '#334155' }}>{label}</span>
                      </button>
                    )
                  })}
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, fontSize: 13, marginTop: 18 }}>
                  <DocRow label="No. BAST" value={<span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{bastNo}</span>} />
                  <DocRow label="SO Terkait" value={<span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{SO.no}</span>} />
                  <DocRow label="Dari → Kepada" value={`${pc2.short} → ${P0.client}`} last />
                </div>
              </div>
              <div>
                <DocumentManager scope={`so:${SO.id}`} title="Dokumen & Foto Serah Terima" />
              </div>
            </div>
          </div>
        )}
      </div>

      {msEdit && (
        <Modal
          title={`${msEdit.id ? 'Update' : 'Tambah'} Kegiatan`}
          subtitle="Perbarui persentase & status kegiatan"
          onClose={() => setMsEdit(null)}
          width={460}
          footer={
            <>
              <GhostButton onClick={() => setMsEdit(null)}>Batal</GhostButton>
              <PrimaryButton onClick={saveMilestone}>Simpan</PrimaryButton>
            </>
          }
        >
          <div style={{ marginBottom: 14 }}>
            <Field label="Nama Kegiatan" value={msEdit.label} onChange={(v) => setMsEdit({ ...msEdit, label: v })} placeholder="mis. Delivery ke Lokasi" />
          </div>
          <FieldRow>
            <NumberField label="Progress (%)" value={msEdit.pct} onChange={(v) => setMsEdit({ ...msEdit, pct: v, status: statusFromPct(Number(v) || 0) })} placeholder="0" suffix="%" />
            <SelectField label="Status" value={msEdit.status} onChange={(v) => setMsEdit({ ...msEdit, status: v })} options={MILESTONE_STATUS.map((s) => ({ value: s, label: s }))} />
          </FieldRow>
        </Modal>
      )}

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
