// Warehouse & Aset — two tabs: Stok Barang (with below-minimum badge, working
// Stock In/Out that mutate quantity, and an add-item form) and Aset (with an
// add-asset form). All data is persisted via the shared data store.

import { useState } from 'react'
import { useApp } from '../store'
import { curCoName, fmtC } from '../theme'
import { useData, type AsetRow, type StokRow } from '../dataStore'
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

const WH_TABS = [
  { key: 'stok', label: 'Stok Barang' },
  { key: 'aset', label: 'Aset' },
]

const KONDISI = ['Baik', 'Perlu Servis', 'Rusak Ringan', 'Rusak Berat']
const JENIS_ASET = ['Alat Berat', 'Kendaraan', 'Peralatan', 'Elektronik', 'Lainnya']

const th = { fontWeight: 700, padding: '12px 8px' } as const

function kondisiStyle(k: string) {
  if (k === 'Baik') return { c: '#059669', bg: '#ECFDF5' }
  if (k === 'Rusak Ringan' || k === 'Rusak Berat') return { c: '#DC2626', bg: '#FEF2F2' }
  return { c: '#D97706', bg: '#FFFBEB' }
}

const emptyStok = { kode: '', nama: '', gudang: '', co: 'kps', qty: '', min: '', sat: 'unit' }
const emptyAset = { kode: '', nama: '', jenis: 'Peralatan', co: 'kps', kondisi: 'Baik', pic: '', nilai: '' }

export default function Warehouse() {
  const { state, set, toast } = useApp()
  const { rows, addRow, updateRow, removeRow } = useData()

  const stokRows = rows<StokRow>('stok').filter((x) => state.company === 'all' || x.co === state.company)
  const asetRows = rows<AsetRow>('aset').filter((x) => state.company === 'all' || x.co === state.company)

  const [stokOpen, setStokOpen] = useState(false)
  const [stokForm, setStokForm] = useState(emptyStok)
  const [asetOpen, setAsetOpen] = useState(false)
  const [asetForm, setAsetForm] = useState(emptyAset)
  // Stock In/Out modal: { row, dir }
  const [move, setMove] = useState<{ row: StokRow; dir: 'in' | 'out' } | null>(null)
  const [moveQty, setMoveQty] = useState('')

  const submitStok = () => {
    if (!stokForm.nama.trim()) {
      toast('Nama barang wajib diisi')
      return
    }
    addRow('stok', {
      kode: stokForm.kode.trim() || `MTR-${Math.floor(1000 + Math.random() * 9000)}`,
      nama: stokForm.nama.trim(),
      gudang: stokForm.gudang.trim() || 'Gudang Pusat',
      co: stokForm.co,
      qty: Number(stokForm.qty) || 0,
      min: Number(stokForm.min) || 0,
      sat: stokForm.sat.trim() || 'unit',
    })
    setStokForm(emptyStok)
    setStokOpen(false)
    toast('Barang ditambahkan ke stok')
  }

  const submitAset = () => {
    if (!asetForm.nama.trim()) {
      toast('Nama aset wajib diisi')
      return
    }
    addRow('aset', {
      kode: asetForm.kode.trim() || `AST-${Math.floor(100 + Math.random() * 900)}`,
      nama: asetForm.nama.trim(),
      jenis: asetForm.jenis,
      co: asetForm.co,
      kondisi: asetForm.kondisi,
      pic: asetForm.pic.trim() || '—',
      nilai: Number(asetForm.nilai) || 0,
    })
    setAsetForm(emptyAset)
    setAsetOpen(false)
    toast('Aset ditambahkan')
  }

  const applyMove = () => {
    if (!move) return
    const q = Number(moveQty) || 0
    if (q <= 0) {
      toast('Jumlah harus lebih dari 0')
      return
    }
    const next = move.dir === 'in' ? move.row.qty + q : Math.max(0, move.row.qty - q)
    updateRow('stok', move.row.id, { qty: next })
    toast(`${move.dir === 'in' ? 'Stok masuk' : 'Stok keluar'}: ${move.row.nama} → ${next} ${move.row.sat}`)
    setMove(null)
    setMoveQty('')
  }

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>Warehouse &amp; Aset</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>Stok &amp; aset — {curCoName(state.company)}</h1>
      </div>

      <Tabs tabs={WH_TABS} active={state.warehouseTab} onChange={(k) => set({ warehouseTab: k })} fontSize={14} padding="11px 18px" marginBottom={20} />

      {state.warehouseTab === 'stok' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 14 }}>
            <button
              onClick={() => toast('Form mutasi barang antar perusahaan dibuka')}
              className="hv-menu-item-soft"
              style={{ fontSize: 12.5, fontWeight: 700, color: '#1E3A8A', border: '1px solid #C7D2FE', background: '#EEF2FF', borderRadius: 9, padding: '9px 15px' }}
            >
              Mutasi antar perusahaan
            </button>
            <AddButton label="Tambah Stok" onClick={() => setStokOpen(true)} />
          </div>
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
                  <th style={{ fontWeight: 700, padding: '12px 18px' }}>Kode</th>
                  <th style={th}>Nama Barang</th>
                  <th style={th}>Gudang</th>
                  <th style={th}>PT</th>
                  <th style={{ ...th, textAlign: 'right' }}>Qty</th>
                  <th style={{ ...th, textAlign: 'right' }}>Min</th>
                  <th style={{ ...th, width: 120 }}>Level</th>
                  <th style={{ ...th, textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {stokRows.map((x) => {
                  const low = x.qty < x.min
                  return (
                    <tr key={x.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 18px', fontFamily: 'ui-monospace,monospace', fontSize: 12, fontWeight: 700, color: '#64748B' }}>{x.kode}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: '#334155' }}>{x.nama}</td>
                      <td style={{ padding: '12px 8px', color: '#64748B' }}>{x.gudang}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <CompanyBadge companyId={x.co} />
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>
                        {x.qty} <span style={{ fontWeight: 600, color: '#94A3B8', fontSize: 11 }}>{x.sat}</span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: '#94A3B8' }}>{x.min}</td>
                      <td style={{ padding: '12px 8px' }}>
                        {low && <span style={{ fontSize: 10, fontWeight: 800, color: '#DC2626', background: '#FEF2F2', padding: '3px 8px', borderRadius: 6 }}>Di bawah minimum</span>}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                          <button onClick={() => { setMove({ row: x, dir: 'in' }); setMoveQty('') }} style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 7, padding: '6px 10px' }}>+ In</button>
                          <button onClick={() => { setMove({ row: x, dir: 'out' }); setMoveQty('') }} style={{ fontSize: 11, fontWeight: 700, color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 7, padding: '6px 10px' }}>− Out</button>
                          <RowAction kind="delete" title="Hapus barang" onClick={() => { removeRow('stok', x.id); toast('Barang dihapus') }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {stokRows.length === 0 && (
                  <tr style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>Belum ada barang. Klik “Tambah Stok”.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {state.warehouseTab === 'aset' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <AddButton label="Tambah Aset" onClick={() => setAsetOpen(true)} />
          </div>
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
                  <th style={{ fontWeight: 700, padding: '12px 18px' }}>Kode</th>
                  <th style={th}>Nama Aset</th>
                  <th style={th}>Jenis</th>
                  <th style={th}>PT Pemilik</th>
                  <th style={{ ...th, textAlign: 'right' }}>Nilai Aset</th>
                  <th style={th}>Kondisi</th>
                  <th style={th}>Penanggung Jawab</th>
                  <th style={{ ...th, textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {asetRows.map((x) => {
                  const k = kondisiStyle(x.kondisi)
                  return (
                    <tr key={x.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '13px 18px', fontFamily: 'ui-monospace,monospace', fontSize: 12, fontWeight: 700, color: '#64748B' }}>{x.kode}</td>
                      <td style={{ padding: '13px 8px', fontWeight: 700, color: '#334155' }}>{x.nama}</td>
                      <td style={{ padding: '13px 8px', color: '#475569' }}>{x.jenis}</td>
                      <td style={{ padding: '13px 8px' }}>
                        <CompanyBadge companyId={x.co} />
                      </td>
                      <td style={{ padding: '13px 8px', textAlign: 'right', fontWeight: 800, color: '#0F172A' }}>{x.nilai ? fmtC(x.nilai) : '—'}</td>
                      <td style={{ padding: '13px 8px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: k.bg, color: k.c }}>{x.kondisi}</span>
                      </td>
                      <td style={{ padding: '13px 8px', color: '#475569' }}>{x.pic}</td>
                      <td style={{ padding: '13px 8px', textAlign: 'center' }}>
                        <RowAction kind="delete" title="Hapus aset" onClick={() => { removeRow('aset', x.id); toast('Aset dihapus') }} />
                      </td>
                    </tr>
                  )
                })}
                {asetRows.length === 0 && (
                  <tr style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>Belum ada aset. Klik “Tambah Aset”.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stokOpen && (
        <Modal
          title="Tambah Stok Barang"
          subtitle="Input barang / material baru ke gudang"
          onClose={() => setStokOpen(false)}
          footer={
            <>
              <GhostButton onClick={() => setStokOpen(false)}>Batal</GhostButton>
              <PrimaryButton onClick={submitStok}>Simpan Barang</PrimaryButton>
            </>
          }
        >
          <FieldRow>
            <Field label="Kode (opsional)" value={stokForm.kode} onChange={(v) => setStokForm({ ...stokForm, kode: v })} placeholder="otomatis bila kosong" />
            <Field label="Nama Barang" value={stokForm.nama} onChange={(v) => setStokForm({ ...stokForm, nama: v })} placeholder="mis. Kabel NYY 4x50mm" />
          </FieldRow>
          <FieldRow>
            <Field label="Gudang" value={stokForm.gudang} onChange={(v) => setStokForm({ ...stokForm, gudang: v })} placeholder="mis. Gudang Cakung" />
            <CompanySelect value={stokForm.co} onChange={(v) => setStokForm({ ...stokForm, co: v })} />
          </FieldRow>
          <FieldRow cols={3}>
            <NumberField label="Qty Awal" value={stokForm.qty} onChange={(v) => setStokForm({ ...stokForm, qty: v })} placeholder="0" />
            <NumberField label="Stok Minimum" value={stokForm.min} onChange={(v) => setStokForm({ ...stokForm, min: v })} placeholder="0" />
            <Field label="Satuan" value={stokForm.sat} onChange={(v) => setStokForm({ ...stokForm, sat: v })} placeholder="unit / meter / sak" />
          </FieldRow>
        </Modal>
      )}

      {asetOpen && (
        <Modal
          title="Tambah Aset"
          subtitle="Registrasi aset / peralatan perusahaan"
          onClose={() => setAsetOpen(false)}
          footer={
            <>
              <GhostButton onClick={() => setAsetOpen(false)}>Batal</GhostButton>
              <PrimaryButton onClick={submitAset}>Simpan Aset</PrimaryButton>
            </>
          }
        >
          <FieldRow>
            <Field label="Kode (opsional)" value={asetForm.kode} onChange={(v) => setAsetForm({ ...asetForm, kode: v })} placeholder="otomatis bila kosong" />
            <Field label="Nama Aset" value={asetForm.nama} onChange={(v) => setAsetForm({ ...asetForm, nama: v })} placeholder="mis. Excavator Komatsu PC200" />
          </FieldRow>
          <FieldRow>
            <SelectField label="Jenis" value={asetForm.jenis} onChange={(v) => setAsetForm({ ...asetForm, jenis: v })} options={JENIS_ASET.map((j) => ({ value: j, label: j }))} />
            <CompanySelect label="PT Pemilik" value={asetForm.co} onChange={(v) => setAsetForm({ ...asetForm, co: v })} />
          </FieldRow>
          <FieldRow>
            <SelectField label="Kondisi" value={asetForm.kondisi} onChange={(v) => setAsetForm({ ...asetForm, kondisi: v })} options={KONDISI.map((k) => ({ value: k, label: k }))} />
            <Field label="Penanggung Jawab" value={asetForm.pic} onChange={(v) => setAsetForm({ ...asetForm, pic: v })} placeholder="mis. Rudi Hartono" />
          </FieldRow>
          <NumberField label="Nilai Aset (Rp)" value={asetForm.nilai} onChange={(v) => setAsetForm({ ...asetForm, nilai: v })} placeholder="0" />
        </Modal>
      )}

      {move && (
        <Modal
          title={move.dir === 'in' ? 'Stok Masuk' : 'Stok Keluar'}
          subtitle={`${move.row.nama} · stok saat ini ${move.row.qty} ${move.row.sat}`}
          onClose={() => setMove(null)}
          width={420}
          footer={
            <>
              <GhostButton onClick={() => setMove(null)}>Batal</GhostButton>
              <PrimaryButton onClick={applyMove}>{move.dir === 'in' ? 'Tambah Stok' : 'Kurangi Stok'}</PrimaryButton>
            </>
          }
        >
          <NumberField label={`Jumlah ${move.dir === 'in' ? 'masuk' : 'keluar'}`} value={moveQty} onChange={setMoveQty} placeholder="0" suffix={move.row.sat} />
        </Modal>
      )}
    </div>
  )
}
