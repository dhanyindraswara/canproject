// Root: shows Login before auth, otherwise the app shell (sidebar + header +
// routed content) and the toast layer. Routing mirrors the screen flags from
// the original prototype.

import { useEffect, useRef } from 'react'
import { signOut } from 'firebase/auth'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import { AppProvider, useApp } from './store'
import { DataProvider, useData, type UserRowT } from './dataStore'
import { auth, firebaseReady } from './firebase'
import { landingFor, roleNameToKey } from './roles'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import Tender from './screens/Tender'
import ProyekList from './screens/ProyekList'
import ProyekDetail from './screens/ProyekDetail'
import SODetail from './screens/SODetail'
import Warehouse from './screens/Warehouse'
import Documents from './screens/Documents'
import Master from './screens/Master'
import Users from './screens/Users'
import Invoices from './screens/Invoices'
import POKeluar from './screens/POKeluar'

function Content() {
  const { state } = useApp()
  const { menu, detailProyek, detailSO } = state

  if (menu === 'proyek') {
    if (detailProyek && detailSO) return <SODetail />
    if (detailProyek) return <ProyekDetail />
    return <ProyekList />
  }
  switch (menu) {
    case 'dashboard':
      return <Dashboard />
    case 'tender':
      return <Tender />
    case 'warehouse':
      return <Warehouse />
    case 'documents':
      return <Documents />
    case 'master':
      return <Master />
    case 'users':
      return <Users />
    case 'invoices':
      return <Invoices />
    case 'po':
      return <POKeluar />
    default:
      return <Dashboard />
  }
}

function Shell() {
  const { state, set } = useApp()
  const { data } = useData()
  const appliedRef = useRef('')

  // Firebase mode: once signed in, resolve the user's role from the user
  // directory → set landing + role; block deactivated accounts.
  useEffect(() => {
    if (!firebaseReady) return
    if (state.screen !== 'app' || !state.userEmail) {
      appliedRef.current = ''
      return
    }
    if (appliedRef.current === state.userEmail) return
    const u = (data.users as UserRowT[]).find((x) => x.email.toLowerCase() === state.userEmail.toLowerCase())
    if (!u) return // directory not loaded yet (or no record) — retry when it changes
    appliedRef.current = state.userEmail
    if (u.aktif === false) {
      if (auth) signOut(auth).catch(() => {})
      alert('Akun Anda dinonaktifkan. Hubungi administrator.')
      return
    }
    set({ role: roleNameToKey(u.role), currentRoleName: u.role, menu: landingFor(u.role) })
  }, [state.screen, state.userEmail, data.users, set])

  if (state.screen === 'login') return <Login />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <Content />
        </main>
      </div>
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <DataProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </DataProvider>
  )
}
