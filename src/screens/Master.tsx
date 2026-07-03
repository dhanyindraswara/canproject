// Master Data — reference data across the group, in five tabs: Perusahaan,
// Client, Supplier/Subcont, Item/Material, Rekening Bank. Every reference table
// supports add / edit / delete through a shared, config-driven form modal.

import { useState, type ReactNode } from 'react'
import { useApp } from '../store'
import { COMPANY_COLORS, type Company } from '../theme'
import { useData, type CollKey } from '../dataStore'
import { CompanyBadge, Tabs } from '../components/ui'
import {
  AddButton,
  CompanySelect,
  Field,
  FieldRow,
  GhostButton,
  Modal,
  NumberField,
  PrimaryButton,
  RowAction,
  SelectField,
} from '../components/Modal'

const MASTER_TABS = [
  { key: 'perusahaan', label: 'Perusahaan' },
  { key: 'client', label: 'Client' },
  { key: 'supplier', label: 'Supplier / Subcont' },
  { key: 'item', label: 'Item / Material' },
  { key: 'bank', label: 'Rekening Bank' },
]

const th = { fontWeight: 700, padding: '12px 8px' } as const
const tableWrap = { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' } as const
const pill = { fontSize: 11, fontWeight: 700, color: '#475569', background: '#F1F5F9', padding: '3px 10px', borderRadius: 20 } as const

// Field descriptor for the config-driven form.
type FieldType = 'text' | 'number' | 'company' | 'select'
interface FieldDef {
  key: string
  label: string
  type: FieldType
  options?: string[]
  placeholder?: string
}

// Per-collection form config. `coll` is the data-store key it edits.
const CONFIG: Record<string, { coll: CollKey; title: string; fields: FieldDef[] }> = {
  client: {
    coll: 'clients',
    title: 'Client',
    fields: [
      { key: 'nama', label: 'Nama Client', type: 'text', placeholder: 'PT PLN (Persero)' },
      { key: 'tipe', label: 'Tipe', type: 'select', options: ['BUMN', 'BUMD', 'Pemerintah', 'Swasta'] },
      { key: 'pic', label: 'PIC', type: 'text', placeholder: 'Nama kontak' },
      { key: 'kota', label: 'Kota', type: 'text', placeholder: 'Jakarta' },
      { key: 'proyek', label: 'Jumlah Proyek', type: 'number' },
    ],
  },
  supplier: {
    coll: 'suppliers',
    title: 'Supplier / Subcont',
    fields: [
      { key: 'nama', label: 'Nama', type: 'text', placeholder: 'PT Schneider Indonesia' },
      { key: 'tipe', label: 'Tipe', type: 'select', options: ['Supplier', 'Subcont'] },
      { key: 'kategori', label: 'Kategori', type: 'text', placeholder: 'Elektrikal' },
      { key: 'kota', label: 'Kota', type: 'text', placeholder: 'Jakarta' },
    ],
  },
  item: {
    coll: 'stok',
    title: 'Item / Material',
    fields: [
      { key: 'kode', label: 'Kode', type: 'text', placeholder: 'MTR-0012' },
      { key: 'nama', label: 'Nama Item', type: 'text', placeholder: 'Kabel NYY 4x50mm' },
      { key: 'sat', label: 'Satuan', type: 'text', placeholder: 'meter' },
      { key: 'co', label: 'Perusahaan', type: 'company' },
    ],
  },
  bank: {
    coll: 'banks',
    title: 'Rekening Bank',
    fields: [
      { key: 'bank', label: 'Nama Bank', type: 'text', placeholder: 'Bank Central Asia' },
      { key: 'rek', label: 'No. Rekening', type: 'text', placeholder: '217-1188-8841' },
      { key: 'an', label: 'Atas Nama', type: 'text', placeholder: 'PT Karya Prima Sejahtera' },
      { key: 'co', label: 'Perusahaan', type: 'company' },
    ],
  },
}

export default function Master() {
  const { state, set, toast } = useApp()
  const { rows, addRow, updateRow, removeRow } = useData()

  // editing: which tab config + row id (null = adding) + working values
  const [editing, setEditing] = useState<{ tabKey: string; id: string | null; values: Record<string, string> } | null>(null)
  // company editing (special form with a color picker)
  const [coEdit, setCoEdit] = useState<{ id: string | null; short: string; name: string; bidang: string; colorIdx: number } | null>(null)

  const companies = rows<Company & { id: string }>('companies')

  const openCompanyForm = (c?: Company) => {
    const idx = c ? Math.max(0, COMPANY_COLORS.findIndex((x) => x.color === c.color)) : companies.length % COMPANY_COLORS.length
    setCoEdit({ id: c?.id ?? null, short: c?.short ?? '', name: c?.name ?? '', bidang: c?.bidang ?? '', colorIdx: idx })
  }

  const saveCompany = () => {
    if (!coEdit) return
    if (!coEdit.name.trim() || !coEdit.short.trim()) {
      toast('Nama & kode perusahaan wajib diisi')
      return
    }
    const preset = COMPANY_COLORS[coEdit.colorIdx] || COMPANY_COLORS[0]
    if (coEdit.id) {
      updateRow('companies', coEdit.id, { short: coEdit.short.trim().toUpperCase(), name: coEdit.name.trim(), bidang: coEdit.bidang.trim(), color: preset.color, bg: preset.bg })
      toast('Perusahaan diperbarui')
    } else {
      const base = coEdit.short.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'co'
      let id = base
      let k = 1
      while (companies.some((x) => x.id === id)) id = base + ++k
      addRow('companies', { id, short: coEdit.short.trim().toUpperCase(), name: coEdit.name.trim(), bidang: coEdit.bidang.trim(), color: preset.color, bg: preset.bg })
      toast('Perusahaan ditambahkan')
    }
    setCoEdit(null)
  }

  const openForm = (tabKey: string, row?: Record<string, unknown>) => {
    const cfg = CONFIG[tabKey]
    const values: Record<string, string> = {}
    cfg.fields.forEach((f) => {
      const v = row?.[f.key]
      values[f.key] = v === undefined || v === null ? (f.type === 'company' ? 'kps' : '') : String(v)
    })
    setEditing({ tabKey, id: (row?.id as string) ?? null, values })
  }

  const saveForm = () => {
    if (!editing) return
    const cfg = CONFIG[editing.tabKey]
    const firstField = cfg.fields[0]
    if (!editing.values[firstField.key]?.trim()) {
      toast(`${firstField.label} wajib diisi`)
      return
    }
    // Coerce number fields.
    const payload: Record<string, unknown> = {}
    cfg.fields.forEach((f) => {
      payload[f.key] = f.type === 'number' ? Number(editing.values[f.key]) || 0 : editing.values[f.key]
    })
    if (editing.id) {
      updateRow(cfg.coll, editing.id, payload)
      toast(`${cfg.title} diperbarui`)
    } else {
      addRow(cfg.coll, payload)
      toast(`${cfg.title} ditambahkan`)
    }
    setEditing(null)
  }

  const del = (tabKey: string, id: string) => {
    removeRow(CONFIG[tabKey].coll, id)
    toast(`${CONFIG[tabKey].title} dihapus`)
  }

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>Master Data</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>Data referensi grup</h1>
        </div>
        {state.masterTab === 'perusahaan' ? (
          <AddButton label="Tambah Perusahaan" onClick={() => openCompanyForm()} />
        ) : (
          <AddButton label={`Tambah ${CONFIG[state.masterTab]?.title || ''}`} onClick={() => openForm(state.masterTab)} />
        )}
      </div>

      <Tabs tabs={MASTER_TABS} active={state.masterTab} onChange={(k) => set({ masterTab: k })} wrap fontSize={14} padding="11px 18px" marginBottom={20} />

      {state.masterTab === 'perusahaan' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {companies.map((c) => (
              <div key={c.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 6 }}>
                  <RowAction kind="edit" title="Edit perusahaan" onClick={() => openCompanyForm(c)} />
                  <RowAction kind="delete" title="Hapus perusahaan" onClick={() => { removeRow('companies', c.id); toast('Perusahaan dihapus') }} />
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, marginBottom: 14 }}>{c.short}</div>
                <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{c.name}</div>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>{c.bidang}</div>
              </div>
            ))}
            {companies.length === 0 && <div style={{ gridColumn: '1/-1', padding: '30px', textAlign: 'center', color: '#94A3B8', fontWeight: 600, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16 }}>Belum ada perusahaan. Klik “Tambah Perusahaan”.</div>}
          </div>
          <div style={{ fontSize: 12.5, color: '#94A3B8', marginTop: 14 }}>
            Perusahaan dipakai untuk pewarnaan &amp; filter di seluruh aplikasi. Menambah / mengubah di sini langsung tampil pada Company Switcher dan seluruh badge PT.
          </div>
        </>
      )}

      {state.masterTab === 'client' && (
        <MasterTable
          headers={['Nama Client', 'Tipe', 'PIC', 'Kota', 'Proyek']}
          aligns={['left', 'left', 'left', 'left', 'right']}
          rows={rows('clients')}
          render={(c: any) => [
            <span style={{ fontWeight: 700 }}>{c.nama}</span>,
            <span style={pill}>{c.tipe}</span>,
            <span style={{ color: '#475569' }}>{c.pic}</span>,
            <span style={{ color: '#64748B' }}>{c.kota}</span>,
            <span style={{ fontWeight: 800 }}>{c.proyek}</span>,
          ]}
          onEdit={(r) => openForm('client', r)}
          onDelete={(id) => del('client', id)}
        />
      )}

      {state.masterTab === 'supplier' && (
        <MasterTable
          headers={['Nama', 'Tipe', 'Kategori', 'Kota']}
          aligns={['left', 'left', 'left', 'left']}
          rows={rows('suppliers')}
          render={(c: any) => [
            <span style={{ fontWeight: 700 }}>{c.nama}</span>,
            <span style={pill}>{c.tipe}</span>,
            <span style={{ color: '#475569' }}>{c.kategori}</span>,
            <span style={{ color: '#64748B' }}>{c.kota}</span>,
          ]}
          onEdit={(r) => openForm('supplier', r)}
          onDelete={(id) => del('supplier', id)}
        />
      )}

      {state.masterTab === 'item' && (
        <MasterTable
          headers={['Kode', 'Nama Item', 'Satuan', 'PT']}
          aligns={['left', 'left', 'left', 'left']}
          rows={rows('stok')}
          render={(x: any) => [
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, fontWeight: 700, color: '#64748B' }}>{x.kode}</span>,
            <span style={{ fontWeight: 700 }}>{x.nama}</span>,
            <span style={{ color: '#475569' }}>{x.sat}</span>,
            <CompanyBadge companyId={x.co} />,
          ]}
          onEdit={(r) => openForm('item', r)}
          onDelete={(id) => del('item', id)}
        />
      )}

      {state.masterTab === 'bank' && (
        <MasterTable
          headers={['Bank', 'No. Rekening', 'Atas Nama', 'PT']}
          aligns={['left', 'left', 'left', 'left']}
          rows={rows('banks')}
          render={(b: any) => [
            <span style={{ fontWeight: 700 }}>{b.bank}</span>,
            <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{b.rek}</span>,
            <span style={{ color: '#475569' }}>{b.an}</span>,
            <CompanyBadge companyId={b.co} />,
          ]}
          onEdit={(r) => openForm('bank', r)}
          onDelete={(id) => del('bank', id)}
        />
      )}

      {editing && (
        <Modal
          title={`${editing.id ? 'Edit' : 'Tambah'} ${CONFIG[editing.tabKey].title}`}
          onClose={() => setEditing(null)}
          footer={
            <>
              <GhostButton onClick={() => setEditing(null)}>Batal</GhostButton>
              <PrimaryButton onClick={saveForm}>Simpan</PrimaryButton>
            </>
          }
        >
          {chunk(CONFIG[editing.tabKey].fields, 2).map((pair, ri) => (
            <FieldRow key={ri}>
              {pair.map((f) => {
                const val = editing.values[f.key] ?? ''
                const setVal = (v: string) => setEditing({ ...editing, values: { ...editing.values, [f.key]: v } })
                if (f.type === 'company') return <CompanySelect key={f.key} label={f.label} value={val || 'kps'} onChange={setVal} />
                if (f.type === 'select') return <SelectField key={f.key} label={f.label} value={val || (f.options?.[0] ?? '')} onChange={setVal} options={(f.options ?? []).map((o) => ({ value: o, label: o }))} />
                if (f.type === 'number') return <NumberField key={f.key} label={f.label} value={val} onChange={setVal} placeholder={f.placeholder} />
                return <Field key={f.key} label={f.label} value={val} onChange={setVal} placeholder={f.placeholder} />
              })}
            </FieldRow>
          ))}
        </Modal>
      )}

      {coEdit && (
        <Modal
          title={`${coEdit.id ? 'Edit' : 'Tambah'} Perusahaan`}
          onClose={() => setCoEdit(null)}
          footer={
            <>
              <GhostButton onClick={() => setCoEdit(null)}>Batal</GhostButton>
              <PrimaryButton onClick={saveCompany}>Simpan</PrimaryButton>
            </>
          }
        >
          <FieldRow>
            <Field label="Kode (mis. KPS)" value={coEdit.short} onChange={(v) => setCoEdit({ ...coEdit, short: v })} placeholder="KPS" />
            <Field label="Bidang Usaha" value={coEdit.bidang} onChange={(v) => setCoEdit({ ...coEdit, bidang: v })} placeholder="General Supplier" />
          </FieldRow>
          <div style={{ marginBottom: 14 }}>
            <Field label="Nama Perusahaan" value={coEdit.name} onChange={(v) => setCoEdit({ ...coEdit, name: v })} placeholder="PT Karya Prima Sejahtera" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Warna Brand</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COMPANY_COLORS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setCoEdit({ ...coEdit, colorIdx: i })}
                  title={p.color}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: p.bg,
                    color: p.color,
                    fontWeight: 800,
                    fontSize: 12,
                    border: coEdit.colorIdx === i ? `2px solid ${p.color}` : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {(coEdit.short || 'PT').slice(0, 3).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ---------- helpers ---------- */

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function MasterTable({
  headers,
  aligns,
  rows,
  render,
  onEdit,
  onDelete,
}: {
  headers: string[]
  aligns: ('left' | 'right')[]
  rows: any[]
  render: (row: any) => ReactNode[]
  onEdit: (row: any) => void
  onDelete: (id: string) => void
}) {
  return (
    <div style={tableWrap}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ ...(i === 0 ? { fontWeight: 700, padding: '12px 18px' } : th), textAlign: aligns[i] }}>
                {h}
              </th>
            ))}
            <th style={{ ...th, textAlign: 'center', width: 90 }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} style={{ borderTop: '1px solid #F1F5F9' }}>
              {render(row).map((cell, i) => (
                <td key={i} style={{ padding: i === 0 ? '13px 18px' : '13px 8px', textAlign: aligns[i] }}>
                  {cell}
                </td>
              ))}
              <td style={{ padding: '13px 8px' }}>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <RowAction kind="edit" title="Edit" onClick={() => onEdit(row)} />
                  <RowAction kind="delete" title="Hapus" onClick={() => onDelete(row.id)} />
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr style={{ borderTop: '1px solid #F1F5F9' }}>
              <td colSpan={headers.length + 1} style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                Belum ada data. Klik tombol “Tambah” di kanan atas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
