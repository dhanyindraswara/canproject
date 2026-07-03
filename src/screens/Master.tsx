// Master Data — reference data across the group, in five tabs: Perusahaan,
// Client, Supplier/Subcont, Item/Material, Rekening Bank.

import { useApp } from '../store'
import { CO } from '../theme'
import { banks, clients, stok, suppliers } from '../data'
import { CompanyBadge, Tabs } from '../components/ui'

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

export default function Master() {
  const { state, set } = useApp()

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Master Data
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>Data referensi grup</h1>
      </div>

      <Tabs
        tabs={MASTER_TABS}
        active={state.masterTab}
        onChange={(k) => set({ masterTab: k })}
        wrap
        fontSize={14}
        padding="11px 18px"
        marginBottom={20}
      />

      {state.masterTab === 'perusahaan' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {Object.values(CO).map((c) => (
            <div key={c.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, marginBottom: 14 }}>
                {c.short}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{c.name}</div>
              <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>{c.bidang}</div>
            </div>
          ))}
        </div>
      )}

      {state.masterTab === 'client' && (
        <div style={tableWrap}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
                <th style={{ fontWeight: 700, padding: '12px 18px' }}>Nama Client</th>
                <th style={th}>Tipe</th>
                <th style={th}>PIC</th>
                <th style={th}>Kota</th>
                <th style={{ ...th, textAlign: 'right' }}>Proyek</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => (
                <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '13px 18px', fontWeight: 700 }}>{c.nama}</td>
                  <td style={{ padding: '13px 8px' }}><span style={pill}>{c.tipe}</span></td>
                  <td style={{ padding: '13px 8px', color: '#475569' }}>{c.pic}</td>
                  <td style={{ padding: '13px 8px', color: '#64748B' }}>{c.kota}</td>
                  <td style={{ padding: '13px 8px', textAlign: 'right', fontWeight: 800 }}>{c.proyek}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {state.masterTab === 'supplier' && (
        <div style={tableWrap}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
                <th style={{ fontWeight: 700, padding: '12px 18px' }}>Nama</th>
                <th style={th}>Tipe</th>
                <th style={th}>Kategori</th>
                <th style={th}>Kota</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((c, i) => (
                <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '13px 18px', fontWeight: 700 }}>{c.nama}</td>
                  <td style={{ padding: '13px 8px' }}><span style={pill}>{c.tipe}</span></td>
                  <td style={{ padding: '13px 8px', color: '#475569' }}>{c.kategori}</td>
                  <td style={{ padding: '13px 8px', color: '#64748B' }}>{c.kota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {state.masterTab === 'item' && (
        <div style={tableWrap}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
                <th style={{ fontWeight: 700, padding: '12px 18px' }}>Kode</th>
                <th style={th}>Nama Item</th>
                <th style={th}>Satuan</th>
                <th style={th}>PT</th>
              </tr>
            </thead>
            <tbody>
              {stok.map((x) => (
                <tr key={x.kode} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '13px 18px', fontFamily: 'ui-monospace,monospace', fontSize: 12, fontWeight: 700, color: '#64748B' }}>{x.kode}</td>
                  <td style={{ padding: '13px 8px', fontWeight: 700 }}>{x.nama}</td>
                  <td style={{ padding: '13px 8px', color: '#475569' }}>{x.sat}</td>
                  <td style={{ padding: '13px 8px' }}><CompanyBadge companyId={x.co} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {state.masterTab === 'bank' && (
        <div style={tableWrap}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8', background: '#FAFBFC' }}>
                <th style={{ fontWeight: 700, padding: '12px 18px' }}>Bank</th>
                <th style={th}>No. Rekening</th>
                <th style={th}>Atas Nama</th>
                <th style={th}>PT</th>
              </tr>
            </thead>
            <tbody>
              {banks.map((b, i) => (
                <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '13px 18px', fontWeight: 700 }}>{b.bank}</td>
                  <td style={{ padding: '13px 8px', fontFamily: 'ui-monospace,monospace', fontSize: 12 }}>{b.rek}</td>
                  <td style={{ padding: '13px 8px', color: '#475569' }}>{b.an}</td>
                  <td style={{ padding: '13px 8px' }}><CompanyBadge companyId={b.co} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
