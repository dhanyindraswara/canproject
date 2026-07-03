// Warehouse & Aset — two tabs: Stok Barang (with below-minimum badge and
// Stock In/Out) and Aset (company-owned equipment/vehicles).

import { useApp } from '../store'
import { curCoName } from '../theme'
import { aset, stok } from '../data'
import { CompanyBadge, Tabs } from '../components/ui'

const WH_TABS = [
  { key: 'stok', label: 'Stok Barang' },
  { key: 'aset', label: 'Aset' },
]

const th = { fontWeight: 700, padding: '12px 8px' } as const

function kondisiStyle(k: string) {
  if (k === 'Baik') return { c: '#059669', bg: '#ECFDF5' }
  if (k === 'Rusak Ringan') return { c: '#DC2626', bg: '#FEF2F2' }
  return { c: '#D97706', bg: '#FFFBEB' }
}

export default function Warehouse() {
  const { state, set, toast } = useApp()

  const stokRows = stok.filter((x) => state.company === 'all' || x.co === state.company)
  const asetRows = aset.filter((x) => state.company === 'all' || x.co === state.company)

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Warehouse &amp; Aset
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>
          Stok &amp; aset — {curCoName(state.company)}
        </h1>
      </div>

      <Tabs
        tabs={WH_TABS}
        active={state.warehouseTab}
        onChange={(k) => set({ warehouseTab: k })}
        fontSize={14}
        padding="11px 18px"
        marginBottom={20}
      />

      {state.warehouseTab === 'stok' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button
              onClick={() => toast('Form mutasi barang antar perusahaan dibuka')}
              style={{ fontSize: 12.5, fontWeight: 700, color: '#1E3A8A', border: '1px solid #C7D2FE', background: '#EEF2FF', borderRadius: 9, padding: '9px 15px' }}
            >
              Mutasi antar perusahaan
            </button>
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
                    <tr key={x.kode} style={{ borderTop: '1px solid #F1F5F9' }}>
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
                        {low && (
                          <span style={{ fontSize: 10, fontWeight: 800, color: '#DC2626', background: '#FEF2F2', padding: '3px 8px', borderRadius: 6 }}>
                            Di bawah minimum
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button onClick={() => toast('Stock In: ' + x.nama)} style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 7, padding: '6px 10px' }}>
                            + In
                          </button>
                          <button onClick={() => toast('Stock Out: ' + x.nama)} style={{ fontSize: 11, fontWeight: 700, color: '#D97706', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 7, padding: '6px 10px' }}>
                            − Out
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {state.warehouseTab === 'aset' && (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
                <th style={{ fontWeight: 700, padding: '12px 18px' }}>Kode</th>
                <th style={th}>Nama Aset</th>
                <th style={th}>Jenis</th>
                <th style={th}>PT Pemilik</th>
                <th style={th}>Kondisi</th>
                <th style={th}>Penanggung Jawab</th>
              </tr>
            </thead>
            <tbody>
              {asetRows.map((x) => {
                const k = kondisiStyle(x.kondisi)
                return (
                  <tr key={x.kode} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '13px 18px', fontFamily: 'ui-monospace,monospace', fontSize: 12, fontWeight: 700, color: '#64748B' }}>{x.kode}</td>
                    <td style={{ padding: '13px 8px', fontWeight: 700, color: '#334155' }}>{x.nama}</td>
                    <td style={{ padding: '13px 8px', color: '#475569' }}>{x.jenis}</td>
                    <td style={{ padding: '13px 8px' }}>
                      <CompanyBadge companyId={x.co} />
                    </td>
                    <td style={{ padding: '13px 8px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: k.bg, color: k.c }}>{x.kondisi}</span>
                    </td>
                    <td style={{ padding: '13px 8px', color: '#475569' }}>{x.pic}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
