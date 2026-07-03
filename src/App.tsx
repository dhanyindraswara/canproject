// Root: shows Login before auth, otherwise the app shell (sidebar + header +
// routed content) and the toast layer. Routing mirrors the screen flags from
// the original prototype.

import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import { AppProvider, useApp } from './store'
import { DataProvider } from './dataStore'
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
  const { state } = useApp()

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
