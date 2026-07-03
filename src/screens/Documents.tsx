// Documents — a central vault for every file uploaded anywhere in the app
// (projects, tenders, invoices, SOs) plus a general upload area. Keeps all
// company documents in one simple, searchable place, stored locally.

import { useMemo, useState } from 'react'
import { useData, formatBytes, type DocItem, type InvoiceRow, type ProyekRow, type TenderRow } from '../dataStore'
import { Icon } from '../components/ui'
import { DocumentManager, DocViewer } from '../components/Modal'

const th = { fontWeight: 700, padding: '12px 8px' } as const

export default function Documents() {
  const { data, rows, removeDoc, storageWarning } = useData()
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState<DocItem | null>(null)

  const projects = rows<ProyekRow>('projects')
  const tenders = rows<TenderRow>('tenders')
  const invoices = rows<InvoiceRow>('invoices')

  // Turn a scope string into a friendly source label.
  const resolveScope = (scope: string): string => {
    if (scope === 'global') return 'Umum'
    const [kind, id] = scope.split(':')
    if (kind === 'proyek') {
      const p = projects.find((x) => x.id === id)
      return (p ? p.name : 'Proyek') + (scope.endsWith(':bapp') ? ' · BAPP' : '')
    }
    if (kind === 'tender') return 'Tender · ' + (tenders.find((x) => x.id === id)?.name ?? '—')
    if (kind === 'invoice') return 'Invoice · ' + (invoices.find((x) => x.id === id)?.no ?? '—')
    if (kind === 'so') return 'Sales Order'
    return scope
  }

  const allDocs = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.docs.filter(
      (d) => q === '' || d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q) || resolveScope(d.scope).toLowerCase().includes(q),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.docs, query, projects, tenders, invoices])

  const totalSize = data.docs.reduce((a, b) => a + b.size, 0)

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>Arsip Dokumen</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>Pusat Dokumen Perusahaan</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 18 }}>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Total Dokumen</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{data.docs.length}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Total Ukuran</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{formatBytes(totalSize)}</div>
        </div>
        <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 12, color: '#1E3A8A', fontWeight: 600 }}>Penyimpanan</div>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 6, color: '#1E3A8A', lineHeight: 1.4 }}>Tersimpan lokal di browser ini</div>
        </div>
      </div>

      {storageWarning && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
          ⚠ Penyimpanan browser hampir penuh — beberapa dokumen terbaru mungkin tidak tersimpan permanen. Hapus file lama atau unduh untuk cadangan.
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20, marginBottom: 18 }}>
        <DocumentManager scope="global" title="Unggah Dokumen Umum" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 14, fontWeight: 800, flex: 1 }}>Semua Dokumen ({allDocs.length})</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#F1F5F9', borderRadius: 10, width: 280 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari dokumen, kategori, sumber..." style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, width: '100%' }} />
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
              <th style={{ fontWeight: 700, padding: '12px 18px' }}>Nama File</th>
              <th style={th}>Kategori</th>
              <th style={th}>Sumber</th>
              <th style={{ ...th, textAlign: 'right' }}>Ukuran</th>
              <th style={th}>Diunggah</th>
              <th style={{ ...th, textAlign: 'center', width: 150 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {allDocs.map((d) => (
              <tr key={d.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px 18px', fontWeight: 700, color: '#0F172A' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon d={['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6']} size={15} width={1.8} style={{ color: '#94A3B8', flex: 'none' }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>{d.name}</span>
                  </span>
                </td>
                <td style={{ padding: '12px 8px' }}><span style={{ fontSize: 11, fontWeight: 700, color: '#475569', background: '#F1F5F9', padding: '3px 10px', borderRadius: 20 }}>{d.category}</span></td>
                <td style={{ padding: '12px 8px', color: '#475569' }}>{resolveScope(d.scope)}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#64748B' }}>{formatBytes(d.size)}</td>
                <td style={{ padding: '12px 8px', color: '#94A3B8', fontSize: 12 }}>{d.uploadedAt}</td>
                <td style={{ padding: '12px 8px' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button onClick={() => setPreview(d)} style={{ fontSize: 11, fontWeight: 700, color: '#1E3A8A', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 7, padding: '6px 10px' }}>Lihat</button>
                    <a href={d.dataUrl} download={d.name} style={{ fontSize: 11, fontWeight: 700, color: '#475569', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 7, padding: '6px 10px', textDecoration: 'none' }}>Unduh</a>
                    <button onClick={() => removeDoc(d.id)} title="Hapus" style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 7, padding: '6px 9px' }}>
                      <Icon d={['M3 6h18', 'M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2', 'M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14']} size={13} width={1.9} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {allDocs.length === 0 && (
              <tr style={{ borderTop: '1px solid #F1F5F9' }}>
                <td colSpan={6} style={{ padding: '34px 18px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                  {data.docs.length === 0 ? 'Belum ada dokumen. Unggah lewat area di atas atau dari halaman proyek / tender / invoice.' : 'Tidak ada dokumen yang cocok dengan pencarian.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {preview && (
        <DocViewer doc={preview} subtitle={`${preview.category} · ${formatBytes(preview.size)} · ${resolveScope(preview.scope)}`} onClose={() => setPreview(null)} />
      )}
    </div>
  )
}
