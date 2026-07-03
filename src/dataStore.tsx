// Mutable, persisted application data for HoldingOS. The original prototype
// used static imports from `data.ts`; this store seeds from that same data
// but keeps everything in React state and mirrors it to localStorage so that
// new tenders, projects, invoices, stock, assets, master records and — most
// importantly — uploaded documents survive a page reload. Everything lives on
// the browser (base64 for files), so it stays simple and self-contained with
// no backend.

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
import {
  P,
  tenders as seedTenders,
  inv as seedInv,
  pay as seedPay,
  poKeluar as seedPoKeluar,
  stok as seedStok,
  aset as seedAset,
  users as seedUsers,
  clients as seedClients,
  suppliers as seedSuppliers,
  banks as seedBanks,
  type Proyek,
  type Tender,
  type Invoice,
  type Payment,
  type POKeluar,
  type Stok,
  type Aset,
  type UserRow,
  type Client,
  type Supplier,
  type Bank,
} from './data'

// Every stored row carries a stable string id for edit/delete.
export interface WithId {
  id: string
}

export type ProyekRow = Proyek & WithId
export type TenderRow = Tender & WithId
export type InvoiceRow = Invoice & WithId
export type PaymentRow = Payment & WithId
export type POKeluarRow = POKeluar & WithId
export type StokRow = Stok & WithId
export type AsetRow = Aset & WithId
export type UserRowT = UserRow & WithId
export type ClientRow = Client & WithId
export type SupplierRow = Supplier & WithId
export type BankRow = Bank & WithId

// An uploaded document — stored inline as a base64 data URL. `scope` ties it
// to an entity, e.g. 'proyek:p1', 'tender:t3', 'invoice:INV-...', or 'global'.
export interface DocItem {
  id: string
  scope: string
  name: string
  mime: string
  size: number
  dataUrl: string
  category: string
  note: string
  uploadedAt: string
  uploadedBy: string
}

// A free-text review/note attached to an entity (project review log, etc.).
export interface NoteItem {
  id: string
  scope: string
  text: string
  author: string
  createdAt: string
}

export interface DataState {
  projects: ProyekRow[]
  tenders: TenderRow[]
  invoices: InvoiceRow[]
  payments: PaymentRow[]
  poKeluar: POKeluarRow[]
  stok: StokRow[]
  aset: AsetRow[]
  users: UserRowT[]
  clients: ClientRow[]
  suppliers: SupplierRow[]
  banks: BankRow[]
  docs: DocItem[]
  notes: NoteItem[]
}

export type CollKey =
  | 'projects'
  | 'tenders'
  | 'invoices'
  | 'payments'
  | 'poKeluar'
  | 'stok'
  | 'aset'
  | 'users'
  | 'clients'
  | 'suppliers'
  | 'banks'

const STORAGE_KEY = 'holdingos.data.v1'
const CURRENT_USER = 'Siti Nurhaliza'

let seq = 0
// Unique id — Date.now/Math.random are fine here (browser runtime, not a
// workflow script). Combined with a counter so a burst in the same ms is safe.
export function uid(prefix = 'id'): string {
  seq += 1
  return `${prefix}-${Date.now().toString(36)}-${seq.toString(36)}`
}

function withIds<T>(rows: T[], prefix: string): (T & WithId)[] {
  return rows.map((r, i) => ({ ...r, id: `${prefix}-seed-${i}` }))
}

function seed(): DataState {
  return {
    projects: P.map((p) => ({ ...p })), // already has id
    tenders: withIds(seedTenders, 'tender'),
    invoices: withIds(seedInv, 'inv'),
    payments: withIds(seedPay, 'pay'),
    poKeluar: withIds(seedPoKeluar, 'pok'),
    stok: withIds(seedStok, 'stok'),
    aset: withIds(seedAset, 'aset'),
    users: withIds(seedUsers, 'user'),
    clients: withIds(seedClients, 'client'),
    suppliers: withIds(seedSuppliers, 'supplier'),
    banks: withIds(seedBanks, 'bank'),
    docs: [],
    notes: [],
  }
}

function load(): DataState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw) as Partial<DataState>
    const base = seed()
    // Merge so that new collections added in future versions still get seeded.
    return { ...base, ...parsed }
  } catch {
    return seed()
  }
}

export interface DataStore {
  data: DataState
  rows: <T extends WithId>(key: CollKey) => T[]
  addRow: <T extends object>(key: CollKey, row: T) => string
  updateRow: (key: CollKey, id: string, patch: Record<string, unknown>) => void
  removeRow: (key: CollKey, id: string) => void
  // documents
  docsFor: (scope: string) => DocItem[]
  addDoc: (doc: Omit<DocItem, 'id' | 'uploadedAt' | 'uploadedBy'>) => void
  removeDoc: (id: string) => void
  // notes / reviews
  notesFor: (scope: string) => NoteItem[]
  addNote: (scope: string, text: string) => void
  removeNote: (id: string) => void
  // maintenance
  resetAll: () => void
  storageWarning: boolean
}

const Ctx = createContext<DataStore | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataState>(() => load())
  const [storageWarning, setStorageWarning] = useState(false)
  const first = useRef(true)

  // Persist on every change. If we blow the localStorage quota (large files),
  // keep working in-memory but flag a warning so the UI can surface it.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setStorageWarning(false)
    } catch {
      setStorageWarning(true)
    }
  }, [data])

  const rows = useCallback(
    <T extends WithId>(key: CollKey) => data[key] as unknown as T[],
    [data],
  )

  const addRow = useCallback(<T extends object>(key: CollKey, row: T) => {
    const id = uid(key)
    setData((prev) => ({ ...prev, [key]: [{ ...row, id }, ...(prev[key] as WithId[])] }) as DataState)
    return id
  }, [])

  const updateRow = useCallback(
    (key: CollKey, id: string, patch: Record<string, unknown>) => {
      setData(
        (prev) =>
          ({
            ...prev,
            [key]: (prev[key] as WithId[]).map((r) => (r.id === id ? { ...r, ...patch } : r)),
          }) as DataState,
      )
    },
    [],
  )

  const removeRow = useCallback((key: CollKey, id: string) => {
    setData(
      (prev) =>
        ({
          ...prev,
          [key]: (prev[key] as WithId[]).filter((r) => r.id !== id),
        }) as DataState,
    )
  }, [])

  const docsFor = useCallback((scope: string) => data.docs.filter((d) => d.scope === scope), [data.docs])

  const addDoc = useCallback((doc: Omit<DocItem, 'id' | 'uploadedAt' | 'uploadedBy'>) => {
    const full: DocItem = {
      ...doc,
      id: uid('doc'),
      uploadedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      uploadedBy: CURRENT_USER,
    }
    setData((prev) => ({ ...prev, docs: [full, ...prev.docs] }))
  }, [])

  const removeDoc = useCallback((id: string) => {
    setData((prev) => ({ ...prev, docs: prev.docs.filter((d) => d.id !== id) }))
  }, [])

  const notesFor = useCallback((scope: string) => data.notes.filter((n) => n.scope === scope), [data.notes])

  const addNote = useCallback((scope: string, text: string) => {
    const note: NoteItem = {
      id: uid('note'),
      scope,
      text,
      author: CURRENT_USER,
      createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
    }
    setData((prev) => ({ ...prev, notes: [note, ...prev.notes] }))
  }, [])

  const removeNote = useCallback((id: string) => {
    setData((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }))
  }, [])

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setData(seed())
  }, [])

  const store = useMemo<DataStore>(
    () => ({
      data,
      rows,
      addRow,
      updateRow,
      removeRow,
      docsFor,
      addDoc,
      removeDoc,
      notesFor,
      addNote,
      removeNote,
      resetAll,
      storageWarning,
    }),
    [data, rows, addRow, updateRow, removeRow, docsFor, addDoc, removeDoc, notesFor, addNote, removeNote, resetAll, storageWarning],
  )

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useData(): DataStore {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

// Reads a File as a base64 data URL for inline storage.
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB'
  if (n >= 1024) return Math.round(n / 1024) + ' KB'
  return n + ' B'
}
