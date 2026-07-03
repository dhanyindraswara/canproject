// Left navigation — collapsible, project-centric top-level menu plus a
// Finance cross-project section. Active item is highlighted in navy.

import { useApp } from '../store'
import type { MenuKey } from '../theme'
import { useData, type AccessRowT } from '../dataStore'
import { KEY_TO_ROLE, menuAllowed } from '../roles'
import { Icon } from './ui'

interface NavItem {
  key: MenuKey
  label: string
  icon: string
}

const MENUS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard Holding', icon: 'M3 12h7V3H3zM14 21h7v-9h-7zM14 3v6h7V3zM3 21h7v-6H3z' },
  { key: 'tender', label: 'Tender', icon: 'M5 4h4v16H5zM11 4h4v10h-4zM17 4h4v13h-4z' },
  { key: 'proyek', label: 'Proyek', icon: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { key: 'warehouse', label: 'Warehouse & Aset', icon: 'M3 9l9-5 9 5v9a1 1 0 01-1 1H4a1 1 0 01-1-1zM9 21v-8h6v8' },
  { key: 'documents', label: 'Dokumen', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M9 13h6M9 17h6' },
  { key: 'master', label: 'Master Data', icon: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3' },
  { key: 'users', label: 'User & Akses', icon: 'M17 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9.5 11a4 4 0 100-8 4 4 0 000 8z' },
]

const FINANCE_MENUS: NavItem[] = [
  { key: 'invoices', label: 'Semua Invoice', icon: 'M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h6' },
  { key: 'po', label: 'Semua PO Keluar', icon: 'M4 4h2l2.6 12.4a1 1 0 001 .8h8.7a1 1 0 001-.8L21 7H7M9 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z' },
]

function NavButton({ item }: { item: NavItem }) {
  const { state, go } = useApp()
  const active = state.menu === item.key
  const labelShow = !state.collapsed
  return (
    <button
      onClick={() => go(item.key)}
      className="hv-nav"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 12px',
        borderRadius: 11,
        background: active ? '#1E3A8A' : 'transparent',
        color: active ? '#ffffff' : '#94A3B8',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon d={item.icon} size={20} style={{ flex: 'none' }} />
      {labelShow && <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>}
    </button>
  )
}

export default function Sidebar() {
  const { state, set } = useApp()
  const { rows } = useData()
  const labelShow = !state.collapsed

  // Effective role name drives which menus are visible (via the access matrix).
  const roleName = state.currentRoleName || KEY_TO_ROLE[state.role] || ''
  const matrix = rows<AccessRowT>('accessMatrix')
  const mainMenus = MENUS.filter((m) => menuAllowed(matrix, roleName, m.key))
  const financeMenus = FINANCE_MENUS.filter((m) => menuAllowed(matrix, roleName, m.key))
  return (
    <aside
      style={{
        width: state.collapsed ? 72 : 244,
        flex: 'none',
        background: '#0F172A',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .2s ease',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '0 18px',
          borderBottom: '1px solid #1E293B',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            flex: 'none',
            borderRadius: 9,
            background: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 17,
          }}
        >
          H
        </div>
        {labelShow && (
          <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-.01em', whiteSpace: 'nowrap' }}>
            HoldingOS
          </div>
        )}
      </div>

      <nav
        style={{
          flex: 1,
          padding: '14px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          overflowY: 'auto',
        }}
      >
        {mainMenus.map((m) => (
          <NavButton key={m.key} item={m} />
        ))}
        {financeMenus.length > 0 && <div style={{ height: 1, background: '#1E293B', margin: '12px 4px' }} />}
        {labelShow && financeMenus.length > 0 && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              padding: '4px 12px 6px',
            }}
          >
            Finance · Lintas Proyek
          </div>
        )}
        {financeMenus.map((m) => (
          <NavButton key={m.key} item={m} />
        ))}
      </nav>

      <div style={{ padding: '14px 12px', borderTop: '1px solid #1E293B' }}>
        <button
          onClick={() => set({ collapsed: !state.collapsed })}
          className="hv-collapse"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px',
            borderRadius: 11,
            color: '#94A3B8',
            width: '100%',
          }}
        >
          <Icon d="M4 6h16M4 12h16M4 18h16" size={20} style={{ flex: 'none' }} />
          {labelShow && <span style={{ fontSize: 14, fontWeight: 600 }}>Ciutkan menu</span>}
        </button>
      </div>
    </aside>
  )
}
