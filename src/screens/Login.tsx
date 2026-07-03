// Login — holding logo + sign-in. In Firebase mode it's a real Email/Password
// form; in local (demo) mode it shows the role cards that land on different
// starting screens.

import { useState, type CSSProperties } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { ROLES, type RoleKey, type MenuKey } from '../theme'
import { useApp } from '../store'
import { auth, firebaseReady } from '../firebase'

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

const inputStyle: CSSProperties = {
  margin: '6px 0 16px',
  padding: '12px 14px',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  fontSize: 14,
  background: '#F8FAFC',
  width: '100%',
  outline: 'none',
}

export default function Login() {
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const signIn = async () => {
    if (!auth) return
    setError('')
    setBusy(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      // Auth state listener (store.tsx) flips the screen to the app.
    } catch (e) {
      const code = (e as { code?: string }).code || ''
      setError(
        code.includes('invalid-cred') || code.includes('wrong-password') || code.includes('user-not-found')
          ? 'Email atau password salah.'
          : code.includes('too-many-requests')
            ? 'Terlalu banyak percobaan. Coba lagi nanti.'
            : 'Gagal masuk. Periksa koneksi & coba lagi.',
      )
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(1200px 700px at 15% 10%, #1E3A8A 0%, #172554 45%, #0B1220 100%)',
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
        <div style={{ padding: '48px 44px', background: 'linear-gradient(160deg,#1E3A8A,#172554)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1E3A8A', fontSize: 20 }}>H</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-.02em' }}>HoldingOS</div>
                <div style={{ fontSize: 12, color: '#93C5FD' }}>Multi-Perusahaan Management</div>
              </div>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1.15, margin: '40px 0 12px' }}>
              Satu login,
              <br />
              seluruh grup.
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#C7D2FE', maxWidth: 320, margin: 0 }}>
              Kelola tender, proyek, sales order, keuangan, dan aset lintas perusahaan dari satu tempat. Perusahaan sebagai filter — bukan login terpisah.
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
        <div style={{ padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '.08em' }}>Masuk</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 22px', letterSpacing: '-.01em' }}>Selamat datang kembali</h2>

          {firebaseReady ? (
            <form onSubmit={(e) => { e.preventDefault(); if (!busy) signIn() }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Email</label>
              <input className="hv-border-navy" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="nama@holdingos.co.id" autoFocus style={inputStyle} />
              <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Password</label>
              <input className="hv-border-navy" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" style={{ ...inputStyle, marginBottom: 8 }} />
              {error && (
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '9px 12px', marginBottom: 14 }}>{error}</div>
              )}
              <button
                type="submit"
                disabled={busy}
                className="hv-btn-primary"
                style={{ width: '100%', marginTop: 6, background: '#1E3A8A', color: '#fff', fontSize: 15, fontWeight: 700, padding: '13px', borderRadius: 12, boxShadow: '0 8px 20px -8px rgba(30,58,138,.6)', opacity: busy ? 0.7 : 1 }}
              >
                {busy ? 'Memproses…' : 'Masuk'}
              </button>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 14, lineHeight: 1.5 }}>
                Gunakan akun yang dibuat di Firebase Authentication. Belum punya? Tambahkan user di Firebase Console → Authentication → Users.
              </div>
            </form>
          ) : (
            <>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Email</label>
              <input defaultValue="hendra@holding.co.id" style={inputStyle} />
              <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Password</label>
              <input type="password" defaultValue="password" style={{ ...inputStyle, marginBottom: 20 }} />
              <div style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 10 }}>Masuk sebagai (demo role &amp; landing berbeda):</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(Object.keys(ROLES) as RoleKey[]).map((k) => (
                  <button key={k} onClick={() => login(k)} className="hv-login-role" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', border: '1px solid #E2E8F0', borderRadius: 12, background: '#fff', textAlign: 'left' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{ROLES[k].label}</span>
                    <span style={{ fontSize: 12, color: '#94A3B8' }}>Landing: {LANDING_LABEL[ROLES[k].land]}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
