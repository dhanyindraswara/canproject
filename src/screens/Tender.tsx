// Tender — 6-column kanban across the tender pipeline. Cards carry the
// company badge and documents. "Tender Baru" opens a real form, and "Menang"
// cards can be converted into an actual project (added to the Proyek list).

import { useState } from 'react'
import { useApp } from '../store'
import { co, curCoName, fmtC } from '../theme'
import { useData, type TenderRow } from '../dataStore'
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
  SelectField,
} from '../components/Modal'

const STAGES = [
  { key: 'daftar', title: 'Pendaftaran', color: '#64748B' },
  { key: 'prakualifikasi', title: 'Prakualifikasi', color: '#2563EB' },
  { key: 'harga', title: 'Pemasukan Harga', color: '#0891B2' },
  { key: 'negosiasi', title: 'Negosiasi', color: '#D97706' },
  { key: 'pengumuman', title: 'Pengumuman', color: '#7C3AED' },
  { key: 'menang', title: 'Menang / Kalah', color: '#059669' },
]

const emptyForm = { name: '', client: '', co: 'kps', nilai: '', deadline: '', stage: 'daftar' }

export default function Tender() {
  const { state, toast } = useApp()
  const { rows, addRow, removeRow } = useData()
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [docTender, setDocTender] = useState<TenderRow | null>(null)

  const tenders = rows<TenderRow>('tenders')
  const filtered = tenders.filter((t) => state.company === 'all' || t.co === state.company)

  const submit = () => {
    if (!form.name.trim() || !form.client.trim()) {
      toast('Nama tender & client wajib diisi')
      return
    }
    addRow('tenders', {
      name: form.name.trim(),
      client: form.client.trim(),
      co: form.co,
      nilai: Number(form.nilai) || 0,
      deadline: form.deadline.trim() || 'TBD',
      stage: form.stage,
    })
    setForm(emptyForm)
    setFormOpen(false)
    toast('Tender baru ditambahkan ke pipeline')
  }

  const convert = (t: TenderRow) => {
    const suffix = t.co.toUpperCase()
    addRow('projects', {
      no: `PO-2026/${suffix}/${Math.floor(100 + Math.random() * 900)}`,
      name: t.name,
      client: t.client,
      co: t.co,
      nilai: t.nilai,
      termin: '1 Termin',
      progress: 0,
      status: 'Aktif',
      so: 0,
      masuk: 0,
      keluar: 0,
    })
    removeRow('tenders', t.id)
    toast(`"${t.name}" dikonversi menjadi Proyek baru`)
  }

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>Tender</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>Pipeline tender — {curCoName(state.company)}</h1>
        </div>
        <AddButton label="Tender Baru" onClick={() => setFormOpen(true)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, alignItems: 'start' }}>
        {STAGES.map((st) => {
          const cards = filtered.filter((t) => t.stage === st.key)
          return (
            <div key={st.key} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '12px 11px', minHeight: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '0 2px' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: st.color }} />
                <span style={{ fontSize: 12.5, fontWeight: 800, color: '#334155', flex: 1, lineHeight: 1.2 }}>{st.title}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, padding: '1px 8px' }}>{cards.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cards.map((t) => {
                  const c = co(t.co)
                  return (
                    <div key={t.id} className="hv-card" style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 11, padding: 12, boxShadow: '0 1px 2px rgba(2,6,23,.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 6, background: c.bg, color: c.color }}>{c.short}</span>
                        <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>{t.deadline}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, color: '#0F172A', marginBottom: 4 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>{t.client}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1E3A8A' }}>{fmtC(t.nilai)}</div>
                        <button onClick={() => setDocTender(t)} title="Dokumen tender" style={{ display: 'flex', alignItems: 'center' }}>
                          <DocCountBadge scope={`tender:${t.id}`} />
                        </button>
                      </div>
                      {st.key === 'menang' && (
                        <button onClick={() => convert(t)} className="hv-convert" style={{ marginTop: 10, width: '100%', background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', fontSize: 11.5, fontWeight: 800, padding: 8, borderRadius: 9 }}>
                          Konversi jadi Proyek →
                        </button>
                      )}
                    </div>
                  )
                })}
                {cards.length === 0 && <div style={{ fontSize: 11, color: '#CBD5E1', textAlign: 'center', padding: '14px 0', fontWeight: 600 }}>—</div>}
              </div>
            </div>
          )
        })}
      </div>

      {formOpen && (
        <Modal
          title="Tender Baru"
          subtitle="Tambahkan tender ke pipeline pengadaan"
          onClose={() => setFormOpen(false)}
          footer={
            <>
              <GhostButton onClick={() => setFormOpen(false)}>Batal</GhostButton>
              <PrimaryButton onClick={submit}>Simpan Tender</PrimaryButton>
            </>
          }
        >
          <div style={{ marginBottom: 14 }}>
            <Field label="Nama Tender / Paket" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="mis. Pengadaan Trafo Daya 60MVA" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <Field label="Client / Owner" value={form.client} onChange={(v) => setForm({ ...form, client: v })} placeholder="mis. PT PLN UIP JBT" />
          </div>
          <FieldRow>
            <CompanySelect value={form.co} onChange={(v) => setForm({ ...form, co: v })} />
            <NumberField label="Nilai Estimasi (Rp)" value={form.nilai} onChange={(v) => setForm({ ...form, nilai: v })} placeholder="0" />
          </FieldRow>
          <FieldRow>
            <Field label="Deadline / Batas" value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} placeholder="mis. 15 Jul 2026" />
            <SelectField label="Tahap" value={form.stage} onChange={(v) => setForm({ ...form, stage: v })} options={STAGES.map((s) => ({ value: s.key, label: s.title }))} />
          </FieldRow>
        </Modal>
      )}

      {docTender && (
        <Modal title={`Dokumen — ${docTender.name}`} subtitle={docTender.client} onClose={() => setDocTender(null)} width={760}>
          <DocumentManager scope={`tender:${docTender.id}`} title="Dokumen Tender" />
        </Modal>
      )}
    </div>
  )
}
