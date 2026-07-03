// Shared PO Keluar form + detail viewer (with Export PDF). Used both in the SO
// detail "PO Keluar" tab and the finance "Semua PO Keluar" screen.

import { useState, type ReactNode } from 'react'
import { co, fmt, fmtC } from '../theme'
import { useApp } from '../store'
import { makeNo, useData, type POKeluarRow } from '../dataStore'
import { StatusBadge } from './ui'
import { CompanySelect, Field, FieldRow, GhostButton, Modal, NumberField, PrimaryButton, SelectField } from './Modal'
import { printDocument } from '../print'

const PO_STATUSES = ['Draft', 'Dikirim', 'Diterima']

export function POFormModal({ defaultCo, onClose }: { defaultCo: string; onClose: () => void }) {
  const { toast } = useApp()
  const { rows, addRow } = useData()
  const [form, setForm] = useState({ no: '', supplier: '', co: defaultCo, nilai: '', status: 'Draft', due: '' })

  const submit = () => {
    if (!form.supplier.trim() || !form.nilai) {
      toast('Supplier & nilai wajib diisi')
      return
    }
    const short = co(form.co).short
    addRow('poKeluar', {
      no: form.no.trim() || makeNo(rows<POKeluarRow>('poKeluar').map((x) => x.no), short, (seq) => `POK-2026/${short}/${seq}`),
      supplier: form.supplier.trim(),
      co: form.co,
      nilai: Number(form.nilai) || 0,
      status: form.status,
      due: form.due.trim() || '—',
    })
    toast('PO Keluar dibuat')
    onClose()
  }

  return (
    <Modal
      title="PO Keluar Baru"
      subtitle="Terbitkan PO ke supplier / subcont"
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Batal</GhostButton>
          <PrimaryButton onClick={submit}>Simpan PO</PrimaryButton>
        </>
      }
    >
      <div style={{ marginBottom: 14 }}>
        <Field label="Supplier / Subcont" value={form.supplier} onChange={(v) => setForm({ ...form, supplier: v })} placeholder="mis. PT Schneider Indonesia" />
      </div>
      <FieldRow>
        <Field label="No. PO (opsional)" value={form.no} onChange={(v) => setForm({ ...form, no: v })} placeholder="otomatis bila kosong" />
        <CompanySelect value={form.co} onChange={(v) => setForm({ ...form, co: v })} />
      </FieldRow>
      <FieldRow>
        <NumberField label="Nilai (Rp)" value={form.nilai} onChange={(v) => setForm({ ...form, nilai: v })} placeholder="0" />
        <SelectField label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={PO_STATUSES.map((s) => ({ value: s, label: s }))} />
      </FieldRow>
      <Field label="Jatuh Tempo Bayar" value={form.due} onChange={(v) => setForm({ ...form, due: v })} placeholder="mis. 12 Jul 2026" />
    </Modal>
  )
}

function Row({ label, value, last }: { label: string; value: ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: last ? 'none' : '1px solid #F1F5F9' }}>
      <span style={{ color: '#64748B', fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 700, fontSize: 13.5 }}>{value}</span>
    </div>
  )
}

export function PODetailModal({ po, onClose }: { po: POKeluarRow; onClose: () => void }) {
  const { toast } = useApp()
  const c = co(po.co)

  const exportPdf = () => {
    const ok = printDocument({
      title: 'Purchase Order',
      docNo: po.no,
      company: c.name,
      meta: [
        { label: 'No. PO', value: po.no },
        { label: 'Perusahaan Penerbit', value: c.name },
        { label: 'Supplier / Subcont', value: po.supplier },
        { label: 'Status', value: po.status },
        { label: 'Jatuh Tempo Bayar', value: po.due },
        { label: 'Nilai Total', value: fmt(po.nilai) },
      ],
      tableTitle: 'Ringkasan',
      tableRows: [{ label: `Pengadaan sesuai PO ${po.no}`, value: fmt(po.nilai) }],
      footnote: 'Dokumen PO ini dibuat otomatis oleh HoldingOS. Sah tanpa tanda tangan basah bila diterbitkan melalui sistem.',
    })
    if (!ok) toast('Popup diblokir browser — izinkan popup untuk ekspor PDF')
  }

  return (
    <Modal
      title="Detail PO Keluar"
      subtitle={`${po.supplier} · ${c.name}`}
      onClose={onClose}
      footer={
        <>
          <GhostButton onClick={onClose}>Tutup</GhostButton>
          <PrimaryButton onClick={exportPdf}>Export PDF</PrimaryButton>
        </>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: 'ui-monospace,monospace', fontWeight: 700, color: '#94A3B8' }}>{po.no}</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 3 }}>{po.supplier}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Nilai</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1E3A8A' }}>{fmtC(po.nilai)}</div>
        </div>
      </div>
      <Row label="Perusahaan Penerbit" value={c.name} />
      <Row label="Status" value={<StatusBadge status={po.status} />} />
      <Row label="Jatuh Tempo Bayar" value={po.due} />
      <Row label="Nilai Total" value={fmt(po.nilai)} last />
    </Modal>
  )
}
