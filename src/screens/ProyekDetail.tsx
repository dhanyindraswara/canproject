// Proyek detail — the project hub. Tabs: Ringkasan, Sales Order, Keuangan,
// Invoice, Payment, BAPP (the PO-closing document with a status pipeline).

import type { ReactNode } from 'react'
import { useApp } from '../store'
import { co, fmtC, stt } from '../theme'
import { P, inv, pay, soFor } from '../data'
import { Icon, StatusBadge, Tabs } from '../components/ui'

const PROYEK_TABS = [
  { key: 'ringkasan', label: 'Ringkasan' },
  { key: 'so', label: 'Sales Order' },
  { key: 'keuangan', label: 'Keuangan' },
  { key: 'invoice', label: 'Invoice' },
  { key: 'payment', label: 'Payment' },
  { key: 'bapp', label: 'BAPP' },
]

const BAPP_STEP_LABELS = ['Draft', 'Diajukan', 'Ditinjau Client', 'Ditandatangani', 'Selesai']

const th = { fontWeight: 700, padding: '11px 8px' } as const

export default function ProyekDetail() {
  const { state, set, openSO } = useApp()

  const P0 = P.find((x) => x.id === state.detailProyek) || P[0]
  const pc = co(P0.co)
  const pst = stt(P0.status)
  const margin = P0.masuk - P0.keluar
  const marginPct = (P0.masuk > 0 ? Math.round((margin / P0.masuk) * 100) : 0) + '%'
  const sos = soFor(P0.id)
  const allSODone = sos.every((so) => so.status === 'Selesai')

  const bappIdx = P0.status === 'Closed' ? 4 : P0.status === 'BAPP' ? 2 : -1
  const bappExists = bappIdx >= 0
  const bappNo = 'BAPP-2025/' + pc.short + '/' + P0.no.split('/')[2]
  const bappHistory = (
    bappIdx < 0
      ? []
      : [
          { status: 'Draft dibuat', date: '20 Jun 2026 · 09:14', pic: 'Dodi Firmansyah' },
          { status: 'Diajukan ke client', date: '21 Jun 2026 · 14:30', pic: 'Dodi Firmansyah' },
          { status: 'Ditinjau client', date: '24 Jun 2026 · 10:05', pic: 'PT PLN — Ir. Bambang S.' },
        ]
  ).slice(0, bappIdx + 1)

  const pkBudget = [
    { label: 'Nilai Kontrak', v: P0.nilai, color: '#1E3A8A', w: 100 },
    { label: 'Cash In (realisasi)', v: P0.masuk, color: '#059669', w: Math.round((P0.masuk / P0.nilai) * 100) },
    { label: 'Cash Out (realisasi)', v: P0.keluar, color: '#D97706', w: Math.round((P0.keluar / P0.nilai) * 100) },
  ]

  // Invoices belonging to THIS project (matched by project name), and the
  // payments that settle those specific invoices.
  const pdInvoices = inv.filter((i) => i.proj === P0.name)
  const pdPayments = pay.filter((p) => pdInvoices.some((i) => i.no === p.inv))

  const tab = state.proyekTab

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <button
        onClick={() => set({ detailProyek: null, detailSO: null })}
        className="hv-link-navy"
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 14 }}
      >
        <Icon d="M15 18l-6-6 6-6" size={16} width={2} />
        Kembali ke daftar proyek
      </button>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 18, padding: '22px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: pc.bg, color: pc.color }}>{pc.short}</span>
              <span style={{ fontSize: 11, fontFamily: 'ui-monospace,monospace', fontWeight: 700, color: '#94A3B8' }}>{P0.no}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: pst.bg, color: pst.c }}>{P0.status}</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', margin: '0 0 4px' }}>{P0.name}</h1>
            <div style={{ fontSize: 13, color: '#64748B' }}>{P0.client} · {pc.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Nilai Kontrak</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#1E3A8A', letterSpacing: '-.02em' }}>{fmtC(P0.nilai)}</div>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <Tabs tabs={PROYEK_TABS} active={tab} onChange={(k) => set({ proyekTab: k })} />
        </div>

        {/* Ringkasan */}
        {tab === 'ringkasan' && (
          <div style={{ paddingTop: 22 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Progress Agregat</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{P0.progress}%</div>
              </div>
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>Total Cash In</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: '#059669' }}>{fmtC(P0.masuk)}</div>
              </div>
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, color: '#B45309', fontWeight: 600 }}>Total Cash Out</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: '#D97706' }}>{fmtC(P0.keluar)}</div>
              </div>
              <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, color: '#1E3A8A', fontWeight: 600 }}>Margin ({marginPct})</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: '#1E3A8A' }}>{fmtC(margin)}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Informasi Kontrak</div>
                <div style={{ fontSize: 13 }}>
                  <InfoRow label="No. PO / Kontrak" value={<span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{P0.no}</span>} />
                  <InfoRow label="Client" value={P0.client} />
                  <InfoRow label="Perusahaan Pelaksana" value={pc.name} />
                  <InfoRow label="Termin Pembayaran" value={P0.termin} />
                  <InfoRow label="Status Proyek" value={<span style={{ color: pst.c }}>{P0.status}</span>} last />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Progress Keseluruhan</div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Realisasi</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#1E3A8A' }}>{P0.progress}%</span>
                  </div>
                  <div style={{ height: 12, background: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${P0.progress}%`, height: '100%', background: 'linear-gradient(90deg,#1E3A8A,#2563EB)', borderRadius: 8 }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 12, lineHeight: 1.5 }}>
                    Progress dihitung tertimbang dari nilai &amp; capaian tiap Sales Order. Buka tab Sales Order untuk rincian per-SO.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sales Order */}
        {tab === 'so' && (
          <div style={{ paddingTop: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Sales Order turunan PO ini</div>
              <button style={softBtn}>+ SO Baru</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
                  <th style={{ fontWeight: 700, padding: '11px 14px' }}>No. SO</th>
                  <th style={th}>Scope Pekerjaan</th>
                  <th style={{ ...th, textAlign: 'right' }}>Nilai</th>
                  <th style={{ ...th, width: 130 }}>Progress</th>
                  <th style={th}>Target Selesai</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sos.map((so) => (
                  <tr key={so.id} onClick={() => openSO(so.id)} className="hv-row" style={{ borderTop: '1px solid #F1F5F9', cursor: 'pointer' }}>
                    <td style={{ padding: '13px 14px', fontWeight: 700, fontFamily: 'ui-monospace,monospace', fontSize: 12, color: '#1E3A8A' }}>{so.no}</td>
                    <td style={{ padding: '13px 8px', fontWeight: 600, color: '#334155' }}>{so.scope}</td>
                    <td style={{ padding: '13px 8px', textAlign: 'right', fontWeight: 800 }}>{fmtC(so.nilai)}</td>
                    <td style={{ padding: '13px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ flex: 1, height: 6, background: '#EEF2F6', borderRadius: 6, overflow: 'hidden' }}>
                          <div style={{ width: `${so.progress}%`, height: '100%', background: '#1E3A8A', borderRadius: 6 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800 }}>{so.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 8px', color: '#64748B' }}>{so.target}</td>
                    <td style={{ padding: '13px 8px' }}>
                      <StatusBadge status={so.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 12 }}>
              Klik baris SO untuk membuka detail (Progress, PO Keluar, Keuangan, BAST).
            </div>
          </div>
        )}

        {/* Keuangan */}
        {tab === 'keuangan' && (
          <div style={{ paddingTop: 22 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Budget vs Realisasi</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {pkBudget.map((b, i) => (
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
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Margin Real-time</div>
                <div style={{ background: 'linear-gradient(160deg,#1E3A8A,#172554)', color: '#fff', borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 13, color: '#93C5FD', fontWeight: 600 }}>Margin Proyek ({marginPct})</div>
                  <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 16px' }}>{fmtC(margin)}</div>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#93C5FD' }}>Cash In</div>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>{fmtC(P0.masuk)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#93C5FD' }}>Cash Out</div>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>{fmtC(P0.keluar)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice */}
        {tab === 'invoice' && (
          <div style={{ paddingTop: 22 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
                  <th style={{ fontWeight: 700, padding: '11px 14px' }}>No. Invoice</th>
                  <th style={{ ...th, textAlign: 'right' }}>Nilai</th>
                  <th style={th}>Tanggal</th>
                  <th style={th}>Jatuh Tempo</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pdInvoices.map((i, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '13px 14px', fontWeight: 700, fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{i.no}</td>
                    <td style={{ padding: '13px 8px', textAlign: 'right', fontWeight: 800 }}>{fmtC(i.nilai)}</td>
                    <td style={{ padding: '13px 8px', color: '#64748B' }}>{i.tgl}</td>
                    <td style={{ padding: '13px 8px', color: '#64748B' }}>{i.due}</td>
                    <td style={{ padding: '13px 8px' }}>
                      <StatusBadge status={i.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Payment */}
        {tab === 'payment' && (
          <div style={{ paddingTop: 22 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
                  <th style={{ fontWeight: 700, padding: '11px 14px' }}>No. Terima</th>
                  <th style={th}>Invoice</th>
                  <th style={{ ...th, textAlign: 'right' }}>Nilai</th>
                  <th style={th}>Tanggal</th>
                  <th style={th}>Metode</th>
                  <th style={th}>Bank</th>
                </tr>
              </thead>
              <tbody>
                {pdPayments.map((p, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '13px 14px', fontWeight: 700, fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{p.no}</td>
                    <td style={{ padding: '13px 8px', fontFamily: 'ui-monospace,monospace', fontSize: 11, color: '#64748B' }}>{p.inv}</td>
                    <td style={{ padding: '13px 8px', textAlign: 'right', fontWeight: 800, color: '#059669' }}>{fmtC(p.nilai)}</td>
                    <td style={{ padding: '13px 8px', color: '#64748B' }}>{p.tgl}</td>
                    <td style={{ padding: '13px 8px', color: '#475569' }}>{p.metode}</td>
                    <td style={{ padding: '13px 8px', color: '#64748B' }}>{p.bank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BAPP */}
        {tab === 'bapp' && (
          <div style={{ paddingTop: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Berita Acara Penyelesaian Pekerjaan (BAPP)</div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 3 }}>
                  Dokumen penutup PO/Proyek — mengubah status Proyek menjadi Closed.
                </div>
              </div>
              <BuatBappButton allSODone={allSODone} statusColor={pst.c} />
            </div>
            {allSODone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                ✓ Semua SO sudah ber-BAST — BAPP dapat dibuat.
              </div>
            )}
            {bappExists && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>Status Pipeline</div>
                  <Stepper labels={BAPP_STEP_LABELS} idx={bappIdx} lineHeight={26} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 14 }}>Dokumen BAPP</div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, fontSize: 13 }}>
                    <DocRow label="No. BAPP" value={<span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{bappNo}</span>} />
                    <DocRow label="Dari" value={pc.name} />
                    <DocRow label="Kepada" value={P0.client} />
                    <DocRow label="Nilai" value={<span style={{ color: '#1E3A8A' }}>{fmtC(P0.nilai)}</span>} last />
                    <UploadButton label="Unggah dokumen / lampiran" />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, margin: '18px 0 12px' }}>Riwayat Status</div>
                  <History items={bappHistory} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- local sub-components ---------- */

const softBtn = {
  fontSize: 12.5,
  fontWeight: 700,
  color: '#1E3A8A',
  border: '1px solid #C7D2FE',
  background: '#EEF2FF',
  borderRadius: 9,
  padding: '8px 14px',
} as const

function InfoRow({ label, value, last }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: last ? 'none' : '1px solid #F1F5F9',
      }}
    >
      <span style={{ color: '#64748B' }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  )
}

function DocRow({ label, value, last }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: last ? 'none' : '1px solid #EDF1F5',
      }}
    >
      <span style={{ color: '#64748B' }}>{label}</span>
      <span style={{ fontWeight: 800 }}>{value}</span>
    </div>
  )
}

function UploadButton({ label }: { label: string }) {
  return (
    <button
      className="hv-upload"
      style={{
        marginTop: 12,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        border: '1.5px dashed #CBD5E1',
        borderRadius: 10,
        padding: 12,
        fontSize: 12.5,
        fontWeight: 700,
        color: '#64748B',
      }}
    >
      <Icon d={['M12 15V3M7 8l5-5 5 5M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2']} size={16} width={2} />
      {label}
    </button>
  )
}

function BuatBappButton({ allSODone, statusColor }: { allSODone: boolean; statusColor: string }) {
  const { toast } = useApp()
  return (
    <button
      onClick={() =>
        allSODone
          ? toast('BAPP berhasil dibuat — status proyek → Closed')
          : toast('Belum bisa: masih ada SO yang belum ber-BAST')
      }
      className="hv-brighten"
      style={{ fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 11, background: statusColor, color: '#fff' }}
    >
      Buat BAPP
    </button>
  )
}

export function Stepper({ labels, idx, lineHeight }: { labels: string[]; idx: number; lineHeight: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {labels.map((label, i) => {
        const dotBg = i < idx ? '#059669' : i === idx ? '#1E3A8A' : '#E2E8F0'
        const dotFg = i <= idx ? '#fff' : '#94A3B8'
        const lineBg = i < idx ? '#059669' : '#E2E8F0'
        return (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: dotBg,
                  color: dotFg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  flex: 'none',
                }}
              >
                {i + 1}
              </div>
              {i < labels.length - 1 && <div style={{ width: 2, height: lineHeight, background: lineBg }} />}
            </div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>{label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function History({ items }: { items: { status: string; date: string; pic: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((h, i) => (
        <div key={i} style={{ display: 'flex', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1E3A8A', marginTop: 5, flex: 'none' }} />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>{h.status}</div>
            <div style={{ fontSize: 11, color: '#94A3B8' }}>{h.date} · {h.pic}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
