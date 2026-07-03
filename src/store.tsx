// Global application state for HoldingOS, mirroring the `state` object of the
// original DesignComponent. A single context holds navigation, the active
// company filter, tab selections and the toast — everything the header and
// screens read/write.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { ROLES, type MenuKey, type RoleKey } from './theme'
import { auth, firebaseReady } from './firebase'

export interface AppState {
  // navigation
  screen: 'login' | 'app'
  role: RoleKey
  menu: MenuKey
  company: string // 'all' | company id
  collapsed: boolean

  // header dropdowns
  companyMenuOpen: boolean
  notifOpen: boolean
  userMenuOpen: boolean

  // drill-down + tabs
  detailProyek: string | null
  proyekTab: string
  detailSO: string | null
  soTab: string
  warehouseTab: string
  masterTab: string
  cashCompany: string

  userEmail: string // signed-in user's email (Firebase mode)
  currentRoleName: string // resolved role name (access-matrix key); '' = unknown

  toast: string
}

const initialState: AppState = {
  screen: 'login',
  role: 'ceo',
  menu: 'dashboard',
  company: 'all',
  collapsed: false,
  companyMenuOpen: false,
  notifOpen: false,
  userMenuOpen: false,
  detailProyek: null,
  proyekTab: 'ringkasan',
  detailSO: null,
  soTab: 'progress',
  warehouseTab: 'stok',
  masterTab: 'perusahaan',
  cashCompany: 'all',
  userEmail: '',
  currentRoleName: '',
  toast: '',
}

export interface AppStore {
  state: AppState
  set: (patch: Partial<AppState>) => void
  // action helpers (mirror the source's handlers)
  login: (role: RoleKey) => void
  logout: () => void
  go: (menu: MenuKey) => void
  pickCompany: (id: string) => void
  openProyek: (id: string) => void
  openSO: (id: string) => void
  toast: (msg: string) => void
}

const Ctx = createContext<AppStore | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Firebase mode: reflect auth state into the app (gate login/app screens).
  useEffect(() => {
    if (!firebaseReady || !auth) return
    const unsub = onAuthStateChanged(auth, (user) => {
      setState((prev) =>
        user
          ? { ...prev, screen: 'app', userEmail: user.email ?? '', menu: prev.screen === 'app' ? prev.menu : ROLES[prev.role].land }
          : { ...prev, screen: 'login', userEmail: '' },
      )
    })
    return unsub
  }, [])

  const set = useCallback((patch: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  const toast = useCallback((msg: string) => {
    setState((prev) => ({ ...prev, toast: msg }))
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => {
      setState((prev) => ({ ...prev, toast: '' }))
    }, 2600)
  }, [])

  const store = useMemo<AppStore>(
    () => ({
      state,
      set,
      toast,
      login: (role) =>
        setState((prev) => ({
          ...prev,
          screen: 'app',
          role,
          menu: ROLES[role].land,
          detailProyek: null,
          detailSO: null,
        })),
      logout: () => {
        if (firebaseReady && auth) {
          signOut(auth).catch(() => {})
          setState((prev) => ({ ...prev, userMenuOpen: false }))
        } else {
          setState((prev) => ({ ...prev, screen: 'login', userMenuOpen: false }))
        }
      },
      go: (menu) =>
        setState((prev) => ({
          ...prev,
          menu,
          detailProyek: null,
          detailSO: null,
          companyMenuOpen: false,
          userMenuOpen: false,
          notifOpen: false,
        })),
      pickCompany: (id) => setState((prev) => ({ ...prev, company: id, companyMenuOpen: false })),
      openProyek: (id) =>
        setState((prev) => ({ ...prev, detailProyek: id, proyekTab: 'ringkasan', detailSO: null })),
      openSO: (id) => setState((prev) => ({ ...prev, detailSO: id, soTab: 'progress' })),
    }),
    [state, set, toast],
  )

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useApp(): AppStore {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
