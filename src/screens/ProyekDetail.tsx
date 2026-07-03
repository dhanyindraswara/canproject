// Proyek detail — the project hub. Tabs: Ringkasan, Sales Order, Keuangan,
// Invoice, Payment, Dokumen (upload/view/delete many files), Review (notes),
// and BAPP (the PO-closing document with a status pipeline).

import { useState, type ReactNode } from 'react'
import { useApp } from '../store'
import { co, fmtC, stt } from '../theme'
import { soForProject } from '../data'
import { useData, type InvoiceRow, type PaymentRow, type ProyekRow } from '../dataStore'
import { Icon, StatusBadge, Tabs } from '../components/ui'
import {
  AddButton,
  DocumentManager,
  Field,
  FieldRow,
  GhostButton,
  Modal,
  NumberField,
  PrimaryButton,
  RowAction,
  SelectField,
} from '../components/Modal'

const PROYEK_TABS = [
  { key: 'ringkasan', label: 'Ringkasan' },
  { key: 'so', label: 'Sales Order' },
  { key: 'keuangan', label: 'Keuangan' },
  { key: 'invoice', label: 'Invoice' },
  { key: 'payment', label: 'Payment' },
  { key: 'dokumen', label: 'Dokumen' },
  { key: 'review', label: 'Review' },
  { key: 'bapp', label: 'BAPP' },
]

const BAPP_STEP_LABELS = ['Draft', 'Diajukan', 'Ditinjau Client', 'Ditandatangani', 'Selesai']
const INVOICE_STATUSES = ['Terbit', 'Terkirim', 'Dibayar', 'Overdue']

const th = { fontWeight: 700, padding: '11px 8px' } as const

export default function ProyekDetail() {
  const { state, set, openSO, toast } = useApp()
  const { rows, addRow, removeRow, notesFor, addNote, removeNote } = useData()

  const projects = rows<ProyekRow>('projects')
  const P0 = projects.find((x) => x.id === state.detailProyek) || projects[0]
  const pc = co(P0.co)
  const pst = stt(P0.status)
  const margin = P0.masuk - P0.keluar
  const marginPct = (P0.masuk > 0 ? Math.round((margin / P0.masuk) * 100) : 0) + '%'
  const sos = soForProject(P0)
  const allSODone = sos.every((so) => so.status === 'Selesai')

  const scope = `proyek:${P0.id}`

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
    { label: 'Cash In (realisasi)', v: P0.masuk, color: '#059669', w: P0.nilai ? Math.round((P0.masuk / P0.nilai) * 100) : 0 },
    { label: 'Cash Out (realisasi)', v: P0.keluar, color: '#D97706', w: P0.nilai ? Math.round((P0.keluar / P0.nilai) * 100) : 0 },
  ]

  // Invoices belonging to THIS project (matched by project name), and the
  // payments that settle those specific invoices — read live from the store.
  const pdInvoices = rows<InvoiceRow>('invoices').filter((i) => i.proj === P0.name)
  const pdPayments = rows<PaymentRow>('payments').filter((p) => pdInvoices.some((i) => i.no === p.inv))
  const notes = notesFor(scope)

  const [invOpen, setInvOpen] = useState(false)
  const [invForm, setInvForm] = useState({ no: '', nilai: '', tgl: '', due: '', status: 'Terbit' })
  const [noteText, setNoteText] = useState('')

  const submitInvoice = () => {
    if (!invForm.nilai) {
      toast('Nilai invoice wajib diisi')
      return
    }
    addRow('invoices', {
      no: invForm.no.trim() || `INV-2026/${pc.short}/${Math.floor(100 + Math.random() * 900)}`,
      proj: P0.name,
      co: P0.co,
      nilai: Number(invForm.nilai) || 0,
      tgl: invForm.tgl.trim() || new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' }),
      due: invForm.due.trim() || '—',
      status: invForm.status,
    })
    setInvForm({ no: '', nilai: '', tgl: '', due: '', status: 'Terbit' })
    setInvOpen(false)
    toast('Invoice baru dibuat untuk proyek ini')
  }

  const saveNote = () => {
    if (!noteText.trim()) return
    addNote(scope, noteText.trim())
    setNoteText('')
    toast('Catatan review tersimpan')
  }

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
          <Tabs tabs={PROYEK_TABS} active={tab} onChange={(k) => set({ proyekTab: k })} wrap />
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
              <button onClick={() => toast('Fitur SO Baru menyusul — SO saat ini diturunkan otomatis dari nilai PO')} style={softBtn}>+ SO Baru</button>
            </div>
            {sos.length === 0 ? (
              <EmptyLine text="Belum ada Sales Order untuk proyek ini." />
            ) : (
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
            )}
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 12 }}>Klik baris SO untuk membuka detail (Progress, PO Keluar, Keuangan, BAST).</div>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Invoice proyek ini</div>
              <AddButton label="Invoice Baru" onClick={() => setInvOpen(true)} />
            </div>
            {pdInvoices.length === 0 ? (
              <EmptyLine text="Belum ada invoice. Klik “Invoice Baru” untuk menerbitkan." />
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
                    <th style={{ fontWeight: 700, padding: '11px 14px' }}>No. Invoice</th>
                    <th style={{ ...th, textAlign: 'right' }}>Nilai</th>
                    <th style={th}>Tanggal</th>
                    <th style={th}>Jatuh Tempo</th>
                    <th style={th}>Status</th>
                    <th style={{ ...th, textAlign: 'center', width: 60 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pdInvoices.map((i) => (
                    <tr key={i.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '13px 14px', fontWeight: 700, fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{i.no}</td>
                      <td style={{ padding: '13px 8px', textAlign: 'right', fontWeight: 800 }}>{fmtC(i.nilai)}</td>
                      <td style={{ padding: '13px 8px', color: '#64748B' }}>{i.tgl}</td>
                      <td style={{ padding: '13px 8px', color: '#64748B' }}>{i.due}</td>
                      <td style={{ padding: '13px 8px' }}>
                        <StatusBadge status={i.status} />
                      </td>
                      <td style={{ padding: '13px 8px', textAlign: 'center' }}>
                        <RowAction kind="delete" title="Hapus invoice" onClick={() => { removeRow('invoices', i.id); toast('Invoice dihapus') }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Payment */}
        {tab === 'payment' && (
          <div style={{ paddingTop: 22 }}>
            {pdPayments.length === 0 ? (
              <EmptyLine text="Belum ada pembayaran diterima untuk invoice proyek ini." />
            ) : (
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
                  {pdPayments.map((p) => (
                    <tr key={p.id} style={{ borderTop: '1px solid #F1F5F9' }}>
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
            )}
          </div>
        )}

        {/* Dokumen */}
        {tab === 'dokumen' && (
          <div style={{ paddingTop: 22 }}>
            <DocumentManager scope={scope} title="Dokumen Proyek" />
          </div>
        )}

        {/* Review / Catatan */}
        {tab === 'review' && (
          <div style={{ paddingTop: 22 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>Catatan & Review Proyek</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <textarea
                className="hv-border-navy"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Tulis catatan review, evaluasi progres, atau keputusan rapat…"
                rows={2}
                style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', fontSize: 13.5, outline: 'none', resize: 'vertical', lineHeight: 1.5 }}
              />
              <PrimaryButton onClick={saveNote}>Simpan</PrimaryButton>
            </div>
            {notes.length === 0 ? (
              <EmptyLine text="Belum ada catatan review. Tambahkan yang pertama di atas." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {notes.map((n) => (
                  <div key={n.id} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '13px 16px', display: 'flex', gap: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1E3A8A', marginTop: 6, flex: 'none' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>{n.author} · {n.createdAt}</div>
                    </div>
                    <RowAction kind="delete" title="Hapus catatan" onClick={() => { removeNote(n.id); toast('Catatan dihapus') }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BAPP */}
        {tab === 'bapp' && (
          <div style={{ paddingTop: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Berita Acara Penyelesaian Pekerjaan (BAPP)</div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 3 }}>Dokumen penutup PO/Proyek — mengubah status Proyek menjadi Closed.</div>
              </div>
              <BuatBappButton projId={P0.id} allSODone={allSODone} statusColor={pst.c} closed={P0.status === 'Closed'} />
            </div>
            {allSODone && P0.status !== 'Closed' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                ✓ Semua SO sudah ber-BAST — BAPP dapat dibuat.
              </div>
            )}
            {bappExists && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 24 }}>
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
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, margin: '18px 0 12px' }}>Riwayat Status</div>
                  <History items={bappHistory} />
                </div>
              </div>
            )}
            <DocumentManager scope={`${scope}:bapp`} title="Lampiran BAPP & Berita Acara" />
          </div>
        )}
      </div>

      {invOpen && (
        <Modal
          title="Invoice Baru"
          subtitle={`Terbitkan invoice untuk ${P0.name}`}
          onClose={() => setInvOpen(false)}
          footer={
            <>
              <GhostButton onClick={() => setInvOpen(false)}>Batal</GhostButton>
              <PrimaryButton onClick={submitInvoice}>Terbitkan Invoice</PrimaryButton>
            </>
          }
        >
          <FieldRow>
            <Field label="No. Invoice (opsional)" value={invForm.no} onChange={(v) => setInvForm({ ...invForm, no: v })} placeholder="otomatis bila kosong" />
            <NumberField label="Nilai (Rp)" value={invForm.nilai} onChange={(v) => setInvForm({ ...invForm, nilai: v })} placeholder="0" />
          </FieldRow>
          <FieldRow>
            <Field label="Tanggal Terbit" value={invForm.tgl} onChange={(v) => setInvForm({ ...invForm, tgl: v })} placeholder="mis. 03 Jul 2026" />
            <Field label="Jatuh Tempo" value={invForm.due} onChange={(v) => setInvForm({ ...invForm, due: v })} placeholder="mis. 02 Agu 2026" />
          </FieldRow>
          <SelectField label="Status" value={invForm.status} onChange={(v) => setInvForm({ ...invForm, status: v })} options={INVOICE_STATUSES.map((s) => ({ value: s, label: s }))} />
        </Modal>
      )}
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

function EmptyLine({ text }: { text: string }) {
  return (
    <div style={{ padding: '28px 18px', textAlign: 'center', color: '#94A3B8', fontWeight: 600, fontSize: 13, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12 }}>
      {text}
    </div>
  )
}

function InfoRow({ label, value, last }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: last ? 'none' : '1px solid #F1F5F9' }}>
      <span style={{ color: '#64748B' }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  )
}

function DocRow({ label, value, last }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: last ? 'none' : '1px solid #EDF1F5' }}>
      <span style={{ color: '#64748B' }}>{label}</span>
      <span style={{ fontWeight: 800 }}>{value}</span>
    </div>
  )
}

function BuatBappButton({ projId, allSODone, statusColor, closed }: { projId: string; allSODone: boolean; statusColor: string; closed: boolean }) {
  const { toast } = useApp()
  const { updateRow } = useData()
  if (closed) {
    return <span style={{ fontSize: 12.5, fontWeight: 700, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '8px 14px' }}>✓ Proyek Closed</span>
  }
  return (
    <button
      onClick={() =>
        allSODone
          ? (updateRow('projects', projId, { status: 'Closed', progress: 100 }), toast('BAPP dibuat — status proyek → Closed'))
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
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: dotBg, color: dotFg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flex: 'none' }}>
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
