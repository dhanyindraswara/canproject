// Shared modal dialog + form field primitives + the DocumentManager. These
// power every "add / edit / delete" form and the document upload/view/delete
// experience across the app, styled to match the HoldingOS prototype.

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Icon } from './ui'
import { allCompanies, co } from '../theme'
import { fileToDataUrl, formatBytes, useData, type DocItem } from '../dataStore'
import { useApp } from '../store'

/* ------------------------------ Modal shell ------------------------------ */

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  width = 560,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  width?: number
}) {
  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '48px 16px',
        overflowY: 'auto',
        zIndex: 100,
        animation: 'fadeUp .18s ease',
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 18,
          width: '100%',
          maxWidth: width,
          boxShadow: '0 30px 80px -20px rgba(2,6,23,.5)',
          animation: 'slideDown .2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '20px 24px 14px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.01em', margin: 0 }}>{title}</h2>
            {subtitle && <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} className="hv-icon-btn" style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', flex: 'none' }}>
            <Icon d="M6 6l12 12M18 6L6 18" size={18} width={2.2} />
          </button>
        </div>
        <div style={{ padding: '18px 24px' }}>{children}</div>
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid #F1F5F9' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------- Buttons -------------------------------- */

export function PrimaryButton({ children, onClick, type = 'button' }: { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="hv-btn-primary"
      style={{ background: '#1E3A8A', color: '#fff', fontSize: 13.5, fontWeight: 700, padding: '10px 18px', borderRadius: 11 }}
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="hv-menu-item-soft"
      style={{ background: '#fff', color: '#475569', fontSize: 13.5, fontWeight: 700, padding: '10px 16px', borderRadius: 11, border: '1px solid #E2E8F0' }}
    >
      {children}
    </button>
  )
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="hv-btn-primary"
      style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1E3A8A', color: '#fff', fontSize: 13.5, fontWeight: 700, padding: '10px 16px', borderRadius: 11, boxShadow: '0 6px 16px -6px rgba(30,58,138,.5)' }}
    >
      <Icon d="M12 5v14M5 12h14" size={17} width={2.4} />
      {label}
    </button>
  )
}

// Small icon-only action buttons for table rows (edit / delete).
export function RowAction({ kind, onClick, title }: { kind: 'edit' | 'delete'; onClick: () => void; title: string }) {
  const edit = kind === 'edit'
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      title={title}
      className="hv-icon-btn"
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: edit ? '#475569' : '#DC2626',
        border: '1px solid #E2E8F0',
      }}
    >
      {edit ? (
        <Icon d={['M12 20h9', 'M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z']} size={15} width={1.9} />
      ) : (
        <Icon d={['M3 6h18', 'M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2', 'M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14']} size={15} width={1.9} />
      )}
    </button>
  )
}

/* ---------------------------- Form primitives ---------------------------- */

const labelStyle: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }
const inputStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #E2E8F0',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 13.5,
  color: '#0F172A',
  outline: 'none',
  background: '#fff',
}

export function FieldRow({ children, cols = 2 }: { children: ReactNode; cols?: number }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 14, marginBottom: 14 }}>{children}</div>
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        className="hv-border-navy"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  )
}

export function NumberField({
  label,
  value,
  onChange,
  placeholder,
  suffix,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  suffix?: string
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="hv-border-navy"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder={placeholder}
          style={{ ...inputStyle, paddingRight: suffix ? 44 : 12 }}
        />
        {suffix && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>{suffix}</span>
        )}
      </div>
    </div>
  )
}

export function TextArea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea
        className="hv-border-navy"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
      />
    </div>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select className="hv-border-navy" value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function CompanySelect({ label = 'Perusahaan', value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  return (
    <SelectField
      label={label}
      value={value}
      onChange={onChange}
      options={allCompanies().map((c) => ({ value: c.id, label: `${c.short} · ${c.name}` }))}
    />
  )
}

/* --------------------------- DocumentManager ---------------------------- */

const DOC_CATEGORIES = ['Kontrak / PO', 'Invoice', 'BAST / BAPP', 'Foto Lapangan', 'Sertifikat', 'Penawaran', 'Lainnya']
const MAX_FILE_BYTES = 4 * 1024 * 1024 // 4 MB per file to stay within localStorage

function isImage(mime: string) {
  return mime.startsWith('image/')
}

// Reusable document panel: upload many files, tag category + note, view and
// delete. `scope` binds documents to an entity (e.g. 'proyek:p1').
export function DocumentManager({ scope, title = 'Dokumen', accentEmpty }: { scope: string; title?: string; accentEmpty?: string }) {
  const { docsFor, addDoc, removeDoc } = useData()
  const { toast } = useApp()
  const docs = docsFor(scope)
  const [category, setCategory] = useState(DOC_CATEGORIES[0])
  const [note, setNote] = useState('')
  const [preview, setPreview] = useState<DocItem | null>(null)
  const [busy, setBusy] = useState(false)

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setBusy(true)
    let added = 0
    let skipped = 0
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_BYTES) {
        skipped += 1
        continue
      }
      try {
        const dataUrl = await fileToDataUrl(file)
        addDoc({ scope, name: file.name, mime: file.type || 'application/octet-stream', size: file.size, dataUrl, category, note })
        added += 1
      } catch {
        skipped += 1
      }
    }
    setBusy(false)
    setNote('')
    if (added) toast(`${added} dokumen tersimpan${skipped ? `, ${skipped} dilewati` : ''}`)
    else if (skipped) toast(`Gagal: file terlalu besar (maks 4 MB per file)`)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{docs.length} file tersimpan · disimpan lokal di browser ini</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="hv-border-navy" style={{ ...inputStyle, width: 160, appearance: 'auto', padding: '9px 10px' }}>
              {DOC_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <label
            className="hv-btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1E3A8A', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 16px', borderRadius: 11, cursor: 'pointer' }}
          >
            <Icon d={['M12 15V3M7 8l5-5 5 5M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2']} size={16} width={2} />
            {busy ? 'Mengunggah…' : 'Unggah Dokumen'}
            <input type="file" multiple hidden onChange={(e) => onFiles(e.target.files)} />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <input
          className="hv-border-navy"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Catatan untuk unggahan berikutnya (opsional)…"
          style={{ ...inputStyle, fontSize: 13 }}
        />
      </div>

      {docs.length === 0 ? (
        <div
          style={{
            border: '1.5px dashed #CBD5E1',
            borderRadius: 14,
            padding: '34px 16px',
            textAlign: 'center',
            color: '#94A3B8',
            background: accentEmpty || '#F8FAFC',
          }}
        >
          <Icon d={['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6']} size={30} width={1.6} style={{ color: '#CBD5E1' }} />
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 8, color: '#64748B' }}>Belum ada dokumen</div>
          <div style={{ fontSize: 12, marginTop: 2 }}>Unggah kontrak, invoice, BAST, foto lapangan, dan lainnya di sini.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
          {docs.map((d) => (
            <div key={d.id} className="hv-card" style={{ border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
              <button
                onClick={() => setPreview(d)}
                style={{ display: 'block', width: '100%', height: 108, background: '#F1F5F9', textAlign: 'center' }}
              >
                {isImage(d.mime) ? (
                  <img src={d.dataUrl} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', gap: 6 }}>
                    <Icon d={['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6']} size={30} width={1.6} />
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>{d.name.split('.').pop()?.slice(0, 5) || 'file'}</span>
                  </span>
                )}
              </button>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={d.name}>
                  {d.name}
                </div>
                <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 3 }}>
                  {d.category} · {formatBytes(d.size)}
                </div>
                <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 1 }}>{d.uploadedAt}</div>
                {d.note && <div style={{ fontSize: 11, color: '#64748B', marginTop: 5, fontStyle: 'italic' }}>“{d.note}”</div>}
                <div style={{ display: 'flex', gap: 6, marginTop: 9 }}>
                  <button onClick={() => setPreview(d)} style={{ flex: 1, fontSize: 11, fontWeight: 700, color: '#1E3A8A', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 7, padding: '6px 0' }}>
                    Lihat
                  </button>
                  <a
                    href={d.dataUrl}
                    download={d.name}
                    style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#475569', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 7, padding: '6px 0', textDecoration: 'none' }}
                  >
                    Unduh
                  </a>
                  <button
                    onClick={() => {
                      removeDoc(d.id)
                      toast('Dokumen dihapus')
                    }}
                    title="Hapus"
                    style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 7, padding: '6px 9px' }}
                  >
                    <Icon d={['M3 6h18', 'M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2', 'M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14']} size={14} width={1.9} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <Modal title={preview.name} subtitle={`${preview.category} · ${formatBytes(preview.size)} · ${preview.uploadedAt}`} onClose={() => setPreview(null)} width={720}>
          {isImage(preview.mime) ? (
            <img src={preview.dataUrl} alt={preview.name} style={{ width: '100%', borderRadius: 12, border: '1px solid #E2E8F0' }} />
          ) : preview.mime === 'application/pdf' ? (
            <iframe title={preview.name} src={preview.dataUrl} style={{ width: '100%', height: 460, border: '1px solid #E2E8F0', borderRadius: 12 }} />
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748B' }}>
              <Icon d={['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6']} size={40} width={1.5} style={{ color: '#CBD5E1' }} />
              <div style={{ fontSize: 13, marginTop: 10 }}>Pratinjau tidak tersedia untuk tipe file ini.</div>
              <a href={preview.dataUrl} download={preview.name} style={{ display: 'inline-block', marginTop: 14, background: '#1E3A8A', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 11, textDecoration: 'none' }}>
                Unduh file
              </a>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

// Compact document count badge (for tables / headers).
export function DocCountBadge({ scope }: { scope: string }) {
  const { docsFor } = useData()
  const n = docsFor(scope).length
  const c = co('kps')
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: n ? '#1E3A8A' : '#94A3B8' }}>
      <Icon d={['M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', 'M14 2v6h6']} size={13} width={1.8} style={{ color: n ? c.color : '#CBD5E1' }} />
      {n}
    </span>
  )
}
