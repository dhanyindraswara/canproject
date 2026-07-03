// Finance · Semua Invoice — flat cross-project invoice list with summary
// cards. Add new invoices, attach/view documents per invoice, and delete.

import { useMemo, useState } from 'react'
import { useApp } from '../store'
import { co, curCoName, fmt, fmtC } from '../theme'
import { printDocument } from '../print'
import { useData, type InvoiceRow } from '../dataStore'
import { CompanyBadge, StatusBadge } from '../components/ui'
import {
  AddButton,
  CompanySelect,
  DocCountBadge,
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

const th = { fontWeight: 700, padding: '12px 8px' } as const
const INVOICE_STATUSES = ['Terbit', 'Terkirim', 'Dibayar', 'Overdue']
const emptyForm = { no: '', co: 'kps', proj: '', nilai: '', tgl: '', due: '', status: 'Terbit' }

export default function Invoices() {
  const { state, toast } = useApp()
  const { rows, addRow, removeRow } = useData()
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [docInv, setDocInv] = useState<InvoiceRow | null>(null)

  const invoices = rows<InvoiceRow>('invoices')

  const summary = useMemo(() => {
    const scoped = invoices.filter((i) => state.company === 'all' || i.co === state.company)
    return {
      total: fmtC(scoped.reduce((a, b) => a + b.nilai, 0)),
      dibayar: fmtC(scoped.filter((i) => i.status === 'Dibayar').reduce((a, b) => a + b.nilai, 0)),
      outstanding: fmtC(scoped.filter((i) => i.status !== 'Dibayar').reduce((a, b) => a + b.nilai, 0)),
    }
  }, [invoices, state.company])

  const rowsView = useMemo(() => {
    const q = query.trim().toLowerCase()
    return invoices
      .filter((i) => state.company === 'all' || i.co === state.company)
      .filter((i) => q === '' || i.no.toLowerCase().includes(q) || i.proj.toLowerCase().includes(q))
  }, [invoices, state.company, query])

  const submit = () => {
    if (!form.proj.trim() || !form.nilai) {
      toast('Proyek & nilai wajib diisi')
      return
    }
    addRow('invoices', {
      no: form.no.trim() || `INV-2026/${co(form.co).short}/${Math.floor(100 + Math.random() * 900)}`,
      proj: form.proj.trim(),
      co: form.co,
      nilai: Number(form.nilai) || 0,
      tgl: form.tgl.trim() || new Date().toLocaleDateString('id-ID', { dateStyle: 'medium' }),
      due: form.due.trim() || '—',
      status: form.status,
    })
    setForm(emptyForm)
    setFormOpen(false)
    toast('Invoice baru diterbitkan')
  }

  const exportInvoice = (i: InvoiceRow) => {
    const ok = printDocument({
      title: 'Invoice',
      docNo: i.no,
      company: co(i.co).name,
      meta: [
        { label: 'No. Invoice', value: i.no },
        { label: 'Proyek', value: i.proj },
        { label: 'Tanggal Terbit', value: i.tgl },
        { label: 'Jatuh Tempo', value: i.due },
        { label: 'Status', value: i.status },
        { label: 'Nilai Tagihan', value: fmt(i.nilai) },
      ],
      tableTitle: 'Rincian Tagihan',
      tableRows: [{ label: `Penagihan proyek: ${i.proj}`, value: fmt(i.nilai) }],
      footnote: 'Invoice ini diterbitkan melalui HoldingOS. Mohon lakukan pembayaran sebelum tanggal jatuh tempo.',
    })
    if (!ok) toast('Popup diblokir browser — izinkan popup untuk ekspor PDF')
  }

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>Finance · Lintas Proyek</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>Semua Invoice — {curCoName(state.company)}</h1>
        </div>
        <AddButton label="Invoice Baru" onClick={() => setFormOpen(true)} />
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
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari invoice, proyek..." style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, width: '100%' }} />
          </div>
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Filter perusahaan aktif via Company Switcher di header</span>
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
              <th style={{ ...th, textAlign: 'center' }}>Dok</th>
              <th style={{ ...th, textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rowsView.map((i) => (
              <tr key={i.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                <td style={{ padding: '13px 18px', fontWeight: 700, fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{i.no}</td>
                <td style={{ padding: '13px 8px' }}><CompanyBadge companyId={i.co} /></td>
                <td style={{ padding: '13px 8px', fontWeight: 600, color: '#334155' }}>{i.proj}</td>
                <td style={{ padding: '13px 8px', textAlign: 'right', fontWeight: 800 }}>{fmtC(i.nilai)}</td>
                <td style={{ padding: '13px 8px', color: '#64748B' }}>{i.due}</td>
                <td style={{ padding: '13px 8px' }}><StatusBadge status={i.status} /></td>
                <td style={{ padding: '13px 8px', textAlign: 'center' }}>
                  <button onClick={() => setDocInv(i)} title="Dokumen invoice"><DocCountBadge scope={`invoice:${i.id}`} /></button>
                </td>
                <td style={{ padding: '13px 8px' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                    <button onClick={() => exportInvoice(i)} title="Export PDF" style={{ fontSize: 11, fontWeight: 700, color: '#1E3A8A', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 7, padding: '6px 10px' }}>PDF</button>
                    <RowAction kind="delete" title="Hapus invoice" onClick={() => { removeRow('invoices', i.id); toast('Invoice dihapus') }} />
                  </div>
                </td>
              </tr>
            ))}
            {rowsView.length === 0 && (
              <tr style={{ borderTop: '1px solid #F1F5F9' }}>
                <td colSpan={8} style={{ padding: '32px 18px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>Tidak ada invoice yang cocok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <Modal
          title="Invoice Baru"
          subtitle="Terbitkan invoice lintas proyek"
          onClose={() => setFormOpen(false)}
          footer={
            <>
              <GhostButton onClick={() => setFormOpen(false)}>Batal</GhostButton>
              <PrimaryButton onClick={submit}>Terbitkan Invoice</PrimaryButton>
            </>
          }
        >
          <div style={{ marginBottom: 14 }}>
            <Field label="Proyek" value={form.proj} onChange={(v) => setForm({ ...form, proj: v })} placeholder="Nama proyek terkait" />
          </div>
          <FieldRow>
            <Field label="No. Invoice (opsional)" value={form.no} onChange={(v) => setForm({ ...form, no: v })} placeholder="otomatis bila kosong" />
            <CompanySelect value={form.co} onChange={(v) => setForm({ ...form, co: v })} />
          </FieldRow>
          <FieldRow>
            <NumberField label="Nilai (Rp)" value={form.nilai} onChange={(v) => setForm({ ...form, nilai: v })} placeholder="0" />
            <SelectField label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={INVOICE_STATUSES.map((s) => ({ value: s, label: s }))} />
          </FieldRow>
          <FieldRow>
            <Field label="Tanggal Terbit" value={form.tgl} onChange={(v) => setForm({ ...form, tgl: v })} placeholder="mis. 03 Jul 2026" />
            <Field label="Jatuh Tempo" value={form.due} onChange={(v) => setForm({ ...form, due: v })} placeholder="mis. 02 Agu 2026" />
          </FieldRow>
        </Modal>
      )}

      {docInv && (
        <Modal title={`Dokumen — ${docInv.no}`} subtitle={docInv.proj} onClose={() => setDocInv(null)} width={760}>
          <DocumentManager scope={`invoice:${docInv.id}`} title="Dokumen Invoice" />
        </Modal>
      )}
    </div>
  )
}
