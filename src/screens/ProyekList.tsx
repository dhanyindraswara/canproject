// Proyek — list of projects (= client PO). Functional search (no/name/client),
// a status filter dropdown, and working pagination.

import { useMemo, useState } from 'react'
import { useApp } from '../store'
import { curCoName, fmtC, stt } from '../theme'
import { useData, type ProyekRow } from '../dataStore'
import { CompanyBadge, Icon, StatusBadge } from '../components/ui'
import { AddButton, CompanySelect, Field, FieldRow, GhostButton, Modal, NumberField, PrimaryButton, SelectField } from '../components/Modal'

const PAGE_SIZE = 5
const STATUSES = ['Aktif', 'BAPP', 'Closed']

const th = { fontWeight: 700, padding: '12px 8px' } as const

const emptyProyek = { no: '', name: '', client: '', co: 'kps', nilai: '', termin: '1 Termin', status: 'Aktif' }

export default function ProyekList() {
  const { state, openProyek, toast } = useApp()
  const { rows: dataRows, addRow } = useData()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyProyek)

  const projects = dataRows<ProyekRow>('projects')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return projects
      .filter((p) => state.company === 'all' || p.co === state.company)
      .filter((p) => (statusFilter.length === 0 ? true : statusFilter.includes(p.status)))
      .filter(
        (p) =>
          q === '' ||
          p.no.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q),
      )
  }, [projects, state.company, query, statusFilter])

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const curPage = Math.min(page, pageCount)
  const pageRows = rows.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE)

  const toggleStatus = (s: string) => {
    setPage(1)
    setStatusFilter((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  const submitProyek = () => {
    if (!form.name.trim() || !form.client.trim()) {
      toast('Nama proyek & client wajib diisi')
      return
    }
    addRow('projects', {
      no: form.no.trim() || `PO-2026/${form.co.toUpperCase()}/${Math.floor(100 + Math.random() * 900)}`,
      name: form.name.trim(),
      client: form.client.trim(),
      co: form.co,
      nilai: Number(form.nilai) || 0,
      termin: form.termin,
      progress: 0,
      status: form.status,
      so: 0,
      masuk: 0,
      keluar: 0,
    })
    setForm(emptyProyek)
    setFormOpen(false)
    toast('Proyek baru ditambahkan')
  }

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            Proyek
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>
            Daftar proyek (PO Client)
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
            {rows.length} proyek · {curCoName(state.company)}
          </span>
          <AddButton label="Proyek Baru" onClick={() => setFormOpen(true)} />
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
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Cari no. PO, nama proyek, client..."
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, width: '100%' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className="hv-menu-item-soft"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                fontSize: 13,
                fontWeight: 600,
                color: statusFilter.length ? '#1E3A8A' : '#475569',
                border: `1px solid ${statusFilter.length ? '#C7D2FE' : '#E2E8F0'}`,
                background: statusFilter.length ? '#EEF2FF' : '#fff',
                borderRadius: 10,
                padding: '9px 14px',
              }}
            >
              <Icon d="M4 6h16M7 12h10M10 18h4" size={15} width={2} />
              Filter{statusFilter.length ? ` (${statusFilter.length})` : ''}
            </button>
            {filterOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 44,
                  left: 0,
                  width: 200,
                  background: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  boxShadow: '0 20px 50px -20px rgba(2,6,23,.35)',
                  padding: 8,
                  animation: 'slideDown .16s ease',
                  zIndex: 30,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '.06em', padding: '6px 8px' }}>
                  Status
                </div>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className="hv-menu-item"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px', borderRadius: 8, textAlign: 'left' }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 5,
                        border: `1.5px solid ${statusFilter.includes(s) ? '#1E3A8A' : '#CBD5E1'}`,
                        background: statusFilter.includes(s) ? '#1E3A8A' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 'none',
                      }}
                    >
                      {statusFilter.includes(s) && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    <StatusBadge status={s} />
                  </button>
                ))}
                {statusFilter.length > 0 && (
                  <button
                    onClick={() => {
                      setStatusFilter([])
                      setPage(1)
                    }}
                    style={{ width: '100%', padding: '8px', fontSize: 12, fontWeight: 700, color: '#DC2626', textAlign: 'left' }}
                  >
                    Reset filter
                  </button>
                )}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: '#94A3B8' }}>Menampilkan {rows.length} hasil</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
              <th style={{ fontWeight: 700, padding: '12px 18px' }}>No. PO / Proyek</th>
              <th style={th}>PT</th>
              <th style={th}>Client</th>
              <th style={{ ...th, textAlign: 'right' }}>Nilai Kontrak</th>
              <th style={th}>Termin</th>
              <th style={{ ...th, width: 150 }}>Progress</th>
              <th style={th}>SO</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((p) => {
              const st = stt(p.status)
              return (
                <tr
                  key={p.id}
                  onClick={() => openProyek(p.id)}
                  className="hv-row"
                  style={{ borderTop: '1px solid #F1F5F9', cursor: 'pointer' }}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 11, fontFamily: 'ui-monospace,monospace' }}>{p.no}</div>
                    <div style={{ fontWeight: 700, color: '#334155', marginTop: 2 }}>{p.name}</div>
                  </td>
                  <td style={{ padding: '14px 8px' }}>
                    <CompanyBadge companyId={p.co} />
                  </td>
                  <td style={{ padding: '14px 8px', color: '#475569' }}>{p.client}</td>
                  <td style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>{fmtC(p.nilai)}</td>
                  <td style={{ padding: '14px 8px', color: '#64748B' }}>{p.termin}</td>
                  <td style={{ padding: '14px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 7, background: '#EEF2F6', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${p.progress}%`, height: '100%', background: '#1E3A8A', borderRadius: 6 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#334155' }}>{p.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 8px', fontWeight: 700, color: '#334155' }}>{p.so}</td>
                  <td style={{ padding: '14px 8px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.c }}>{p.status}</span>
                  </td>
                </tr>
              )
            })}
            {pageRows.length === 0 && (
              <tr style={{ borderTop: '1px solid #F1F5F9' }}>
                <td colSpan={8} style={{ padding: '32px 18px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                  Tidak ada proyek yang cocok dengan pencarian / filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderTop: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>
            Halaman {curPage} dari {pageCount}
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={curPage === 1}
              style={{
                width: 32,
                height: 32,
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                color: curPage === 1 ? '#CBD5E1' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: curPage === 1 ? 'default' : 'pointer',
              }}
            >
              ‹
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                style={{
                  width: 32,
                  height: 32,
                  border: `1px solid ${n === curPage ? '#1E3A8A' : '#E2E8F0'}`,
                  background: n === curPage ? '#1E3A8A' : '#fff',
                  color: n === curPage ? '#fff' : '#475569',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={curPage === pageCount}
              style={{
                width: 32,
                height: 32,
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                color: curPage === pageCount ? '#CBD5E1' : '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: curPage === pageCount ? 'default' : 'pointer',
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {formOpen && (
        <Modal
          title="Proyek Baru"
          subtitle="Tambahkan proyek / PO client"
          onClose={() => setFormOpen(false)}
          footer={
            <>
              <GhostButton onClick={() => setFormOpen(false)}>Batal</GhostButton>
              <PrimaryButton onClick={submitProyek}>Simpan Proyek</PrimaryButton>
            </>
          }
        >
          <div style={{ marginBottom: 14 }}>
            <Field label="Nama Proyek" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="mis. Pengadaan Panel Distribusi 20kV" />
          </div>
          <FieldRow>
            <Field label="No. PO / Kontrak (opsional)" value={form.no} onChange={(v) => setForm({ ...form, no: v })} placeholder="otomatis bila kosong" />
            <Field label="Client" value={form.client} onChange={(v) => setForm({ ...form, client: v })} placeholder="mis. PT PLN (Persero)" />
          </FieldRow>
          <FieldRow>
            <CompanySelect value={form.co} onChange={(v) => setForm({ ...form, co: v })} />
            <NumberField label="Nilai Kontrak (Rp)" value={form.nilai} onChange={(v) => setForm({ ...form, nilai: v })} placeholder="0" />
          </FieldRow>
          <FieldRow>
            <SelectField label="Termin" value={form.termin} onChange={(v) => setForm({ ...form, termin: v })} options={['1 Termin', '2 Termin', '3 Termin', '4 Termin', '5 Termin'].map((t) => ({ value: t, label: t }))} />
            <SelectField label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={STATUSES.map((s) => ({ value: s, label: s }))} />
          </FieldRow>
        </Modal>
      )}
    </div>
  )
}
