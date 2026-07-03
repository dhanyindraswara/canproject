// Tender — 6-column kanban across the tender pipeline. Cards carry the
// company badge, and "Menang" cards can be converted into a project.

import { useApp } from '../store'
import { co, curCoName, fmtC } from '../theme'
import { tenders } from '../data'
import { Icon } from '../components/ui'

const STAGES = [
  { key: 'daftar', title: 'Pendaftaran', color: '#64748B' },
  { key: 'prakualifikasi', title: 'Prakualifikasi', color: '#2563EB' },
  { key: 'harga', title: 'Pemasukan Harga', color: '#0891B2' },
  { key: 'negosiasi', title: 'Negosiasi', color: '#D97706' },
  { key: 'pengumuman', title: 'Pengumuman', color: '#7C3AED' },
  { key: 'menang', title: 'Menang / Kalah', color: '#059669' },
]

export default function Tender() {
  const { state, toast } = useApp()

  const filtered = tenders.filter((t) => state.company === 'all' || t.co === state.company)

  return (
    <div style={{ animation: 'fadeUp .3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            Tender
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.02em', margin: '6px 0 0' }}>
            Pipeline tender — {curCoName(state.company)}
          </h1>
        </div>
        <button
          onClick={() => toast('Form Tender Baru dibuka')}
          className="hv-btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#1E3A8A',
            color: '#fff',
            fontSize: 14,
            fontWeight: 700,
            padding: '11px 18px',
            borderRadius: 12,
            boxShadow: '0 6px 16px -6px rgba(30,58,138,.5)',
          }}
        >
          <Icon d="M12 5v14M5 12h14" size={18} width={2.4} />
          Tender Baru
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14, alignItems: 'start' }}>
        {STAGES.map((st) => {
          const cards = filtered.filter((t) => t.stage === st.key)
          return (
            <div
              key={st.key}
              style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '12px 11px', minHeight: 200 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '0 2px' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: st.color }} />
                <span style={{ fontSize: 12.5, fontWeight: 800, color: '#334155', flex: 1, lineHeight: 1.2 }}>{st.title}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 20, padding: '1px 8px' }}>
                  {cards.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cards.map((t, i) => {
                  const c = co(t.co)
                  return (
                    <div
                      key={i}
                      className="hv-card"
                      style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 11, padding: 12, boxShadow: '0 1px 2px rgba(2,6,23,.04)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 6, background: c.bg, color: c.color }}>{c.short}</span>
                        <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>{t.deadline}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, color: '#0F172A', marginBottom: 4 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>{t.client}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#1E3A8A' }}>{fmtC(t.nilai)}</div>
                      {st.key === 'menang' && (
                        <button
                          onClick={() => toast('Tender "' + t.name + '" dikonversi menjadi Proyek baru')}
                          className="hv-convert"
                          style={{
                            marginTop: 10,
                            width: '100%',
                            background: '#ECFDF5',
                            color: '#059669',
                            border: '1px solid #A7F3D0',
                            fontSize: 11.5,
                            fontWeight: 800,
                            padding: 8,
                            borderRadius: 9,
                          }}
                        >
                          Konversi jadi Proyek →
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
