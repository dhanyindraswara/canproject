// Dashboard Holding — KPIs, monthly cash-flow combo chart (bar in/out + net
// line, filterable per company), revenue-per-company bars (drill-down), AR
// aging donut, tender funnel and an SO-deadline table.

import { useMemo } from 'react'
import { useApp } from '../store'
import { co, curCoName, fmtC } from '../theme'
import { P, inv, poKeluar, tenders } from '../data'
import { CompanyBadge, StatusBadge } from '../components/ui'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const CIN = [850, 920, 1100, 780, 1350, 1500, 1250, 1600, 1400, 1750, 1900, 2100]
const COUT = [700, 810, 950, 690, 1120, 1300, 1050, 1380, 1200, 1500, 1620, 1780]
const CASH_MULT: Record<string, number> = { all: 1, kps: 0.34, msn: 0.24, bck: 0.42 }

const FCOLORS = ['#1E3A8A', '#2563EB', '#0891B2', '#0EA5E9', '#38BDF8', '#059669']

// Tender funnel stages, mapped to the internal stage keys used in data.ts.
const FUNNEL_STAGES = [
  { key: 'daftar', label: 'Pendaftaran' },
  { key: 'prakualifikasi', label: 'Prakualifikasi' },
  { key: 'harga', label: 'Pemasukan Harga' },
  { key: 'negosiasi', label: 'Negosiasi' },
  { key: 'pengumuman', label: 'Pengumuman' },
  { key: 'menang', label: 'Menang' },
]

const AR_BUCKETS = [
  { label: 'Lancar (belum jatuh tempo)', color: '#059669' },
  { label: '1-30 hari', color: '#2563EB' },
  { label: '31-60 hari', color: '#D97706' },
  { label: '61-90+ hari', color: '#DC2626' },
]

// Demo "today" — the dataset is centred on Jun–Jul 2026, so AR aging is
// measured against a fixed reference date rather than the wall clock.
const TODAY = new Date(2026, 6, 3).getTime()
const ID_MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, May: 4, Jun: 5,
  Jul: 6, Agu: 7, Aug: 7, Sep: 8, Okt: 9, Oct: 9, Nov: 10, Des: 11, Dec: 11,
}

// Parses "18 Jul 2026" (or "14 May 2026") to an epoch ms, or null if unknown.
function parseIDDate(s: string): number | null {
  const m = s.trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/)
  if (!m) return null
  const mo = ID_MONTHS[m[2]]
  if (mo === undefined) return null
  return new Date(Number(m[3]), mo, Number(m[1])).getTime()
}

const SO_DEADLINE = [
  { so: 'SO-BCK007-05', proj: 'Gardu Induk Cikarang', co: 'bck', target: '05 Jul 2026', sisa: '2 hari', status: 'Delay' },
  { so: 'SO-MSN022-03', proj: 'Supply Pipa & Fitting', co: 'msn', target: '08 Jul 2026', sisa: '5 hari', status: 'Berjalan' },
  { so: 'SO-KPS014-03', proj: 'Panel Distribusi 20kV', co: 'kps', target: '12 Jul 2026', sisa: '9 hari', status: 'BAST' },
  { so: 'SO-BCK007-06', proj: 'Gardu Induk Cikarang', co: 'bck', target: '02 Jul 2026', sisa: 'Terlewat', status: 'Delay' },
  { so: 'SO-MSN018-02', proj: 'Pengadaan APD', co: 'msn', target: '15 Jul 2026', sisa: '12 hari', status: 'Berjalan' },
]

const cardBox = {
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: 18,
  padding: '20px 22px',
} as const

const th = { fontWeight: 700, padding: '7px 8px', borderBottom: '1px solid #E2E8F0' } as const

export default function Dashboard() {
  const { state, set, pickCompany } = useApp()

  const cash = useMemo(() => {
    const mult = CASH_MULT[state.cashCompany] ?? 1
    const cinF = CIN.map((v) => Math.round(v * mult))
    const coutF = COUT.map((v) => Math.round(v * mult))
    const maxV = Math.max(...cinF, ...coutF) * 1.1
    const plotH = 210
    const plotW = 780
    const padL = 8
    const gap = plotW / 12
    const bars = MONTHS.map((m, i) => {
      const inH = (cinF[i] / maxV) * plotH
      const outH = (coutF[i] / maxV) * plotH
      const gx = padL + i * gap
      return {
        label: m,
        inX: gx + gap * 0.2,
        outX: gx + gap * 0.52,
        bw: gap * 0.26,
        inY: plotH - inH,
        inH,
        outY: plotH - outH,
        outH,
      }
    })
    const netPoints = MONTHS.map((_, i) => {
      const net = cinF[i] - coutF[i]
      const x = padL + i * gap + gap * 0.46
      const y = plotH - (net / maxV) * plotH
      return `${x.toFixed(0)},${y.toFixed(0)}`
    }).join(' ')
    const netDots = MONTHS.map((_, i) => {
      const net = cinF[i] - coutF[i]
      return { x: padL + i * gap + gap * 0.46, y: plotH - (net / maxV) * plotH }
    })
    const table = MONTHS.map((m, i) => ({
      bulan: m,
      tin: fmtC(cinF[i] * 1e6),
      tout: fmtC(coutF[i] * 1e6),
      net: fmtC((cinF[i] - coutF[i]) * 1e6),
    })).slice(6, 12)
    return { bars, netPoints, netDots, table }
  }, [state.cashCompany])

  // AR aging derived from unpaid invoices, bucketed by days past the due date
  // (relative to TODAY) and filtered by the active company. Values in miliar.
  const ar = useMemo(() => {
    const vals = AR_BUCKETS.map(() => 0)
    inv
      .filter((i) => (state.company === 'all' || i.co === state.company) && i.status !== 'Dibayar')
      .forEach((i) => {
        const due = parseIDDate(i.due)
        const days = due === null ? 0 : Math.floor((TODAY - due) / 86400000)
        const b = days <= 0 ? 0 : days <= 30 ? 1 : days <= 60 ? 2 : 3
        vals[b] += i.nilai / 1e9
      })
    const total = vals.reduce((a, b) => a + b, 0)
    const circ = 2 * Math.PI * 54
    let acc = 0
    const segs = AR_BUCKETS.map((bkt, i) => {
      const pct = total > 0 ? vals[i] / total : 0
      const dash = pct * circ
      const seg = {
        color: bkt.color,
        dash: `${dash.toFixed(1)} ${(circ - dash).toFixed(1)}`,
        offset: (-acc).toFixed(1),
        label: bkt.label,
        amount: 'Rp ' + vals[i].toFixed(1) + ' M',
      }
      acc += dash
      return seg
    })
    return { segs, total }
  }, [state.company])

  // Headline KPIs, revenue-per-company and tender funnel — all derived from
  // the shared dataset and scoped to the active company filter.
  const stats = useMemo(() => {
    const coF = state.company
    const inScope = <T extends { co: string }>(arr: T[]) => arr.filter((x) => coF === 'all' || x.co === coF)
    const aktif = inScope(P).filter((p) => p.status === 'Aktif')
    const invoices = inScope(inv)
    const unpaid = invoices.filter((i) => i.status !== 'Dibayar')
    const pos = inScope(poKeluar)
    const tnd = inScope(tenders)
    const companies = new Set(aktif.map((p) => p.co))
    const delay = SO_DEADLINE.filter((s) => (coF === 'all' || s.co === coF) && s.status === 'Delay')
    return {
      kontrakAktif: aktif.reduce((a, b) => a + b.nilai, 0),
      aktifCount: aktif.length,
      companiesCount: companies.size,
      pipeline: tnd.reduce((a, b) => a + b.nilai, 0),
      tenderCount: tnd.length,
      arOutstanding: unpaid.reduce((a, b) => a + b.nilai, 0),
      overdueCount: invoices.filter((i) => i.status === 'Overdue').length,
      apOutstanding: pos.reduce((a, b) => a + b.nilai, 0),
      apCount: pos.length,
      delayCount: delay.length,
    }
  }, [state.company])

  const KPIS = useMemo(
    () => [
      { label: 'Total Nilai Kontrak Aktif', val: fmtC(stats.kontrakAktif), delta: `${stats.aktifCount} proyek aktif`, accent: '#1E3A8A' },
      { label: 'Tender dalam Pipeline', val: fmtC(stats.pipeline), delta: `${stats.tenderCount} tender aktif`, accent: '#0891B2' },
      { label: 'AR Outstanding', val: fmtC(stats.arOutstanding), delta: `${stats.overdueCount} invoice overdue`, accent: '#D97706' },
      { label: 'AP Outstanding', val: fmtC(stats.apOutstanding), delta: `${stats.apCount} PO keluar`, accent: '#7C3AED' },
      { label: 'Proyek Aktif', val: String(stats.aktifCount), delta: `lintas ${stats.companiesCount} perusahaan`, accent: '#059669' },
      { label: 'Proyek Delay', val: String(stats.delayCount), delta: 'perlu perhatian', accent: '#DC2626' },
    ],
    [stats],
  )

  const REVENUE = useMemo(() => {
    const ids = state.company === 'all' ? ['kps', 'msn', 'bck'] : [state.company]
    return ids.map((id) => ({
      co: id,
      v: Number((P.filter((p) => p.co === id).reduce((a, b) => a + b.nilai, 0) / 1e9).toFixed(1)),
    }))
  }, [state.company])

  const FUNNEL = useMemo(() => {
    const tnd = tenders.filter((t) => state.company === 'all' || t.co === state.company)
    return FUNNEL_STAGES.map((s) => {
      const items = tnd.filter((t) => t.stage === s.key)
      return { label: s.label, n: items.length, v: Number((items.reduce((a, b) => a + b.nilai, 0) / 1e9).toFixed(0)) }
    })
  }, [state.company])

  const cashCoOptions = [
    { id: 'all', label: 'Semua' },
    { id: 'kps', label: 'KPS' },
    { id: 'msn', label: 'MSN' },
    { id: 'bck', label: 'BCK' },
  ]

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Dashboard Holding
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>
          Ringkasan grup, {curCoName(state.company)}
        </h1>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, marginBottom: 20 }}>
        {KPIS.map((k, i) => (
          <div
            key={i}
            style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: '16px 16px 15px', boxShadow: '0 1px 2px rgba(2,6,23,.04)' }}
          >
            <div style={{ width: 34, height: 4, borderRadius: 3, background: k.accent, marginBottom: 12 }} />
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, lineHeight: 1.3, minHeight: 31 }}>{k.label}</div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 4px', whiteSpace: 'nowrap' }}>{k.val}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Cash flow */}
        <div style={{ ...cardBox }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Monthly Cash Flow</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>Cash In vs Cash Out · Net · 12 bulan (juta Rp)</div>
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {cashCoOptions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => set({ cashCompany: c.id })}
                  className="hv-border-navy"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 9,
                    fontSize: 12,
                    fontWeight: 700,
                    border: '1px solid #E2E8F0',
                    background: state.cashCompany === c.id ? '#EEF2FF' : '#fff',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, margin: '10px 0 6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#475569' }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: '#059669' }} />Cash In
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#475569' }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: '#D97706' }} />Cash Out
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#475569' }}>
              <span style={{ width: 16, height: 3, borderRadius: 3, background: '#1E3A8A' }} />Net Cash Flow
            </span>
          </div>
          <svg viewBox="0 0 788 230" width="100%" style={{ display: 'block', overflow: 'visible' }}>
            <line x1="0" y1="210" x2="788" y2="210" stroke="#E2E8F0" />
            {cash.bars.map((b, i) => (
              <g key={i}>
                <rect x={b.inX} y={b.inY} width={b.bw} height={b.inH} rx={2.5} fill="#059669" />
                <rect x={b.outX} y={b.outY} width={b.bw} height={b.outH} rx={2.5} fill="#D97706" />
                <text x={b.inX} y={224} fontSize={10} fill="#94A3B8" fontFamily="Plus Jakarta Sans">{b.label}</text>
              </g>
            ))}
            <polyline points={cash.netPoints} fill="none" stroke="#1E3A8A" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
            {cash.netDots.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={3} fill="#fff" stroke="#1E3A8A" strokeWidth={2} />
            ))}
          </svg>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 14, fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8' }}>
                <th style={th}>Bulan</th>
                <th style={{ ...th, textAlign: 'right' }}>Total In</th>
                <th style={{ ...th, textAlign: 'right' }}>Total Out</th>
                <th style={{ ...th, textAlign: 'right' }}>Net</th>
              </tr>
            </thead>
            <tbody>
              {cash.table.map((r, i) => (
                <tr key={i}>
                  <td style={{ padding: '7px 8px', fontWeight: 700, color: '#334155' }}>{r.bulan}</td>
                  <td style={{ padding: '7px 8px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>{r.tin}</td>
                  <td style={{ padding: '7px 8px', textAlign: 'right', color: '#D97706', fontWeight: 600 }}>{r.tout}</td>
                  <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 800, color: '#1E3A8A' }}>{r.net}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Revenue + AR donut */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...cardBox }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Revenue per Perusahaan</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Klik bar untuk drill-down</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 180, gap: 16 }}>
              {REVENUE.map((r) => {
                const c = co(r.co)
                return (
                  <button
                    key={r.co}
                    onClick={() => pickCompany(r.co)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, background: 'none' }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>Rp {r.v} M</span>
                    <span
                      className="hv-revbar"
                      style={{ width: '100%', maxWidth: 56, height: (r.v / 70) * 160, borderRadius: '8px 8px 0 0', background: c.color, transition: 'all .16s' }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 800, color: c.color }}>{c.short}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div style={{ ...cardBox }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>AR Aging</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>Piutang berdasar umur</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <svg width="132" height="132" viewBox="0 0 132 132" style={{ flex: 'none' }}>
                <g transform="rotate(-90 66 66)">
                  {ar.segs.map((a, i) => (
                    <circle key={i} cx="66" cy="66" r="54" fill="none" stroke={a.color} strokeWidth="16" strokeDasharray={a.dash} strokeDashoffset={a.offset} />
                  ))}
                </g>
                <text x="66" y="62" textAnchor="middle" fontSize="11" fill="#94A3B8" fontFamily="Plus Jakarta Sans" fontWeight="600">Total AR</text>
                <text x="66" y="80" textAnchor="middle" fontSize="15" fill="#0F172A" fontFamily="Plus Jakarta Sans" fontWeight="800">
                  Rp {ar.total.toFixed(1)} M
                </text>
              </svg>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
                {ar.segs.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: a.color, flex: 'none' }} />
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#475569' }}>{a.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#0F172A' }}>{a.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>
        {/* Funnel */}
        <div style={{ ...cardBox }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Funnel Tender</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>Jumlah &amp; nilai per tahap</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FUNNEL.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: `${100 - i * 11}%`,
                    minWidth: 130,
                    background: FCOLORS[i],
                    color: '#fff',
                    borderRadius: 8,
                    padding: '9px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{f.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{f.n}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>Rp {f.v} M</span>
              </div>
            ))}
          </div>
        </div>

        {/* SO deadline */}
        <div style={{ ...cardBox }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>SO Mendekati Deadline / Delay</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 14 }}>Klik badge perusahaan untuk drill-down</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8' }}>
                {['No. SO', 'Proyek', 'PT', 'Target', 'Sisa', 'Status'].map((h) => (
                  <th key={h} style={{ fontWeight: 700, padding: '7px 8px', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SO_DEADLINE.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '9px 8px', fontWeight: 700, color: '#334155' }}>{r.so}</td>
                  <td style={{ padding: '9px 8px', color: '#475569' }}>{r.proj}</td>
                  <td style={{ padding: '9px 8px' }}>
                    <CompanyBadge companyId={r.co} fontSize={10} onClick={() => pickCompany(r.co)} />
                  </td>
                  <td style={{ padding: '9px 8px', color: '#475569' }}>{r.target}</td>
                  <td style={{ padding: '9px 8px', fontWeight: 700, color: '#334155' }}>{r.sisa}</td>
                  <td style={{ padding: '9px 8px' }}>
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
