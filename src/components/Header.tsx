// Global header — Company Switcher (the app-wide filter), search box,
// notifications and the user menu. "Semua Perusahaan" puts the app into
// read-only holding mode.

import { useState } from 'react'
import { useApp } from '../store'
import { ALL_COMPANY, ROLES, allCompanies, co, type MenuKey } from '../theme'
import { useData } from '../dataStore'
import { GhostButton, Modal, PrimaryButton } from './Modal'

interface Notif {
  title: string
  sub: string
  dot: string
  menu: MenuKey
}

// Each notification links to the menu where the user can act on it.
const NOTIFS: Notif[] = [
  { title: 'INV-2025/BCK/019 jatuh tempo terlewat', sub: 'PT PLN UIP JBT · Rp 9,8 M', dot: '#DC2626', menu: 'invoices' },
  { title: 'SO Testing & Commissioning mendekati deadline', sub: 'Gardu Induk Cikarang · 3 hari lagi', dot: '#D97706', menu: 'proyek' },
  { title: 'BAPP Genset 500kVA menunggu tanda tangan', sub: 'PT Karya Prima Sejahtera', dot: '#7C3AED', menu: 'proyek' },
  { title: 'Stok MCCB 3P 250A di bawah minimum', sub: 'Gudang Cakung · 24/40 unit', dot: '#DC2626', menu: 'warehouse' },
]

export default function Header() {
  const { state, set, go, pickCompany, toast, logout } = useApp()
  const { resetAll } = useData()
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const cur =
    state.company === 'all'
      ? { short: ALL_COMPANY.short, name: ALL_COMPANY.name, color: ALL_COMPANY.color, bg: ALL_COMPANY.bg }
      : co(state.company)

  const companyOptions = [
    {
      id: 'all',
      name: ALL_COMPANY.name,
      sub: ALL_COMPANY.sub,
      short: ALL_COMPANY.short,
      color: ALL_COMPANY.color,
      bg: ALL_COMPANY.bg,
    },
    ...allCompanies().map((c) => ({
      id: c.id,
      name: c.name,
      sub: c.bidang,
      short: c.short,
      color: c.color,
      bg: c.bg,
    })),
  ]

  return (
    <>
    <header
      style={{
        height: 64,
        flex: 'none',
        background: '#fff',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 24px',
        zIndex: 20,
        position: 'relative',
      }}
    >
      {/* Company switcher */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() =>
            set({ companyMenuOpen: !state.companyMenuOpen, notifOpen: false, userMenuOpen: false })
          }
          className="hv-border-navy"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 12px 7px 8px',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            background: '#F8FAFC',
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: cur.bg,
              color: cur.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            {cur.short}
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
            <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600 }}>Perusahaan</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                maxWidth: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {cur.name}
            </span>
          </span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {state.companyMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: 52,
              left: 0,
              width: 300,
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              boxShadow: '0 20px 50px -20px rgba(2,6,23,.35)',
              padding: 8,
              animation: 'slideDown .16s ease',
            }}
          >
            {companyOptions.map((c) => (
              <button
                key={c.id}
                onClick={() => pickCompany(c.id)}
                className="hv-menu-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  width: '100%',
                  padding: 10,
                  borderRadius: 10,
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    width: 32,
                    height: 32,
                    flex: 'none',
                    borderRadius: 8,
                    background: c.bg,
                    color: c.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {c.short}
                </span>
                <span style={{ flex: 1, lineHeight: 1.25 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{c.name}</span>
                  <span style={{ display: 'block', fontSize: 11, color: '#94A3B8' }}>{c.sub}</span>
                </span>
                {state.company === c.id && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3A8A" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      {state.company === 'all' && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#1E3A8A',
            background: '#EEF2FF',
            padding: '5px 10px',
            borderRadius: 20,
            border: '1px solid #C7D2FE',
          }}
        >
          Mode Holding · read-only lintas perusahaan
        </span>
      )}

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: '#F1F5F9',
          borderRadius: 11,
          width: 240,
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth={2} strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" />
        </svg>
        <input
          placeholder="Cari proyek, SO, invoice..."
          style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, width: '100%', color: '#0F172A' }}
        />
      </div>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() =>
            set({ notifOpen: !state.notifOpen, companyMenuOpen: false, userMenuOpen: false })
          }
          className="hv-icon-btn"
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" />
          </svg>
          <span
            style={{
              position: 'absolute',
              top: 9,
              right: 10,
              width: 8,
              height: 8,
              background: '#DC2626',
              borderRadius: '50%',
              border: '2px solid #fff',
            }}
          />
        </button>
        {state.notifOpen && (
          <div
            style={{
              position: 'absolute',
              top: 50,
              right: 0,
              width: 340,
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              boxShadow: '0 20px 50px -20px rgba(2,6,23,.35)',
              padding: 8,
              animation: 'slideDown .16s ease',
              zIndex: 30,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, padding: '8px 10px 6px' }}>Notifikasi</div>
            {NOTIFS.map((n, i) => (
              <button key={i} onClick={() => go(n.menu)} className="hv-menu-item-soft" style={{ display: 'flex', gap: 10, padding: 10, borderRadius: 10, width: '100%', textAlign: 'left' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: n.dot, marginTop: 5, flex: 'none' }} />
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{n.sub}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User menu */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() =>
            set({ userMenuOpen: !state.userMenuOpen, companyMenuOpen: false, notifOpen: false })
          }
          className="hv-menu-item"
          style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 10px 5px 5px', borderRadius: 11 }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'linear-gradient(135deg,#1E3A8A,#2563EB)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            HW
          </span>
          <span style={{ lineHeight: 1.15, textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: 13, fontWeight: 700, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{state.userEmail || 'Hendra Wijaya'}</span>
            <span style={{ display: 'block', fontSize: 11, color: '#94A3B8' }}>{ROLES[state.role].label}</span>
          </span>
        </button>
        {state.userMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: 50,
              right: 0,
              width: 200,
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: 14,
              boxShadow: '0 20px 50px -20px rgba(2,6,23,.35)',
              padding: 8,
              animation: 'slideDown .16s ease',
              zIndex: 30,
            }}
          >
            <button onClick={() => { setProfileOpen(true); set({ userMenuOpen: false }) }} className="hv-menu-item" style={menuItemStyle}>Profil saya</button>
            <button onClick={() => { setSettingsOpen(true); set({ userMenuOpen: false }) }} className="hv-menu-item" style={menuItemStyle}>Pengaturan</button>
            <div style={{ height: 1, background: '#E2E8F0', margin: '4px 0' }} />
            <button
              onClick={logout}
              className="hv-logout"
              style={{ ...menuItemStyle, fontWeight: 700, color: '#DC2626' }}
            >
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>

    {profileOpen && (
      <Modal title="Profil Saya" onClose={() => setProfileOpen(false)} width={440} footer={<PrimaryButton onClick={() => setProfileOpen(false)}>Tutup</PrimaryButton>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <span style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#1E3A8A,#2563EB)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>HW</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{state.userEmail ? state.userEmail.split('@')[0] : 'Hendra Wijaya'}</div>
            <div style={{ fontSize: 13, color: '#64748B' }}>{ROLES[state.role].label}</div>
          </div>
        </div>
        <ProfileRow label="Email" value={state.userEmail || 'hendra.wijaya@holdingos.co.id'} />
        <ProfileRow label="Role Aktif" value={ROLES[state.role].label} />
        <ProfileRow label="Perusahaan Aktif" value={state.company === 'all' ? ALL_COMPANY.name : co(state.company).name} last />
      </Modal>
    )}

    {settingsOpen && (
      <Modal title="Pengaturan" subtitle="Preferensi aplikasi & data lokal" onClose={() => setSettingsOpen(false)} width={480} footer={<GhostButton onClick={() => setSettingsOpen(false)}>Tutup</GhostButton>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800 }}>Penyimpanan Data</div>
            <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4, lineHeight: 1.5 }}>Semua data (proyek, dokumen, dll) tersimpan lokal di browser ini. Reset akan mengembalikan seluruh data ke contoh awal — tidak bisa dibatalkan.</div>
            <button
              onClick={() => {
                if (confirm('Reset semua data ke contoh awal? Tindakan ini tidak bisa dibatalkan.')) {
                  resetAll()
                  setSettingsOpen(false)
                  toast('Semua data direset ke contoh awal')
                }
              }}
              style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '9px 16px' }}
            >
              Reset semua data
            </button>
          </div>
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800 }}>Tentang</div>
            <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>HoldingOS · aplikasi manajemen & monitoring multi-perusahaan. Versi prototipe.</div>
          </div>
        </div>
      </Modal>
    )}
    </>
  )
}

function ProfileRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: last ? 'none' : '1px solid #F1F5F9' }}>
      <span style={{ fontSize: 13, color: '#64748B' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700 }}>{value}</span>
    </div>
  )
}

const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: 10,
  borderRadius: 9,
  fontSize: 13,
  fontWeight: 600,
  textAlign: 'left',
} as const
