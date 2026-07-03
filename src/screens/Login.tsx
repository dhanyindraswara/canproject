// Login — holding logo, email + password, and demo role cards that land the
// user on a different starting screen per role.

import { ROLES, type RoleKey, type MenuKey } from '../theme'
import { useApp } from '../store'

const LANDING_LABEL: Record<MenuKey, string> = {
  dashboard: 'Dashboard Holding',
  proyek: 'Daftar Proyek',
  invoices: 'Semua Invoice',
  warehouse: 'Stok & Aset',
  documents: 'Dokumen',
  tender: 'Tender',
  master: 'Master Data',
  users: 'User & Akses',
  po: 'Semua PO Keluar',
}

export default function Login() {
  const { login } = useApp()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(1200px 700px at 15% 10%, #1E3A8A 0%, #172554 45%, #0B1220 100%)',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 920,
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          background: '#fff',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 40px 90px -30px rgba(2,6,23,.6)',
        }}
      >
        {/* Brand panel */}
        <div
          style={{
            padding: '48px 44px',
            background: 'linear-gradient(160deg,#1E3A8A,#172554)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: '#1E3A8A',
                  fontSize: 20,
                }}
              >
                H
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-.02em' }}>HoldingOS</div>
                <div style={{ fontSize: 12, color: '#93C5FD' }}>Multi-Perusahaan Management</div>
              </div>
            </div>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: '-.02em',
                lineHeight: 1.15,
                margin: '40px 0 12px',
              }}
            >
              Satu login,
              <br />
              seluruh grup.
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#C7D2FE', maxWidth: 320, margin: 0 }}>
              Kelola tender, proyek, sales order, keuangan, dan aset lintas perusahaan dari satu
              tempat. Perusahaan sebagai filter — bukan login terpisah.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 36 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>3</div>
              <div style={{ fontSize: 12, color: '#93C5FD' }}>Perusahaan</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>14</div>
              <div style={{ fontSize: 12, color: '#93C5FD' }}>Proyek aktif</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Rp 70 M</div>
              <div style={{ fontSize: 12, color: '#93C5FD' }}>Kontrak aktif</div>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div
          style={{
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#1E3A8A',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
            }}
          >
            Masuk
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 22px', letterSpacing: '-.01em' }}>
            Selamat datang kembali
          </h2>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Email</label>
          <input
            defaultValue="hendra@holding.co.id"
            style={{
              margin: '6px 0 16px',
              padding: '12px 14px',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              fontSize: 14,
              background: '#F8FAFC',
              width: '100%',
            }}
          />
          <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Password</label>
          <input
            type="password"
            defaultValue="password"
            style={{
              margin: '6px 0 20px',
              padding: '12px 14px',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
              fontSize: 14,
              background: '#F8FAFC',
              width: '100%',
            }}
          />
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 10 }}>
            Masuk sebagai (demo role &amp; landing berbeda):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(Object.keys(ROLES) as RoleKey[]).map((k) => (
              <button
                key={k}
                onClick={() => login(k)}
                className="hv-login-role"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  background: '#fff',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
                  {ROLES[k].label}
                </span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>
                  Landing: {LANDING_LABEL[ROLES[k].land]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
