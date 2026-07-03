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
  accessMatrixSeed,
  defaultMilestones,
  soForProject,
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
  type Milestone,
  type AccessRow,
} from './data'
import { CO, syncCompanies, type Company } from './theme'

// Every stored row carries a stable string id for edit/delete.
export interface WithId {
  id: string
}

export interface InvoiceItem {
  desc: string
  qty: number
  price: number
}

export type ProyekRow = Proyek & WithId
export type TenderRow = Tender & WithId
export type InvoiceRow = Invoice & WithId & { items?: InvoiceItem[] }
export type PaymentRow = Payment & WithId
export type POKeluarRow = POKeluar & WithId
export type StokRow = Stok & WithId
export type AsetRow = Aset & WithId
export type UserRowT = UserRow & WithId
export type ClientRow = Client & WithId
export type SupplierRow = Supplier & WithId
export type BankRow = Bank & WithId
export type AccessRowT = AccessRow & WithId
export type CompanyRow = Company // Company already carries an `id`

// A Sales Order is now a first-class stored entity (with editable milestones
// and its own BAST pipeline), no longer derived on the fly.
export type { Milestone }
export interface SalesOrderRow extends WithId {
  projId: string
  no: string
  scope: string
  nilai: number
  progress: number
  status: string
  target: string
  milestones: Milestone[]
  bastStep: number
}

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
  salesOrders: SalesOrderRow[]
  invoices: InvoiceRow[]
  payments: PaymentRow[]
  poKeluar: POKeluarRow[]
  stok: StokRow[]
  aset: AsetRow[]
  users: UserRowT[]
  clients: ClientRow[]
  suppliers: SupplierRow[]
  banks: BankRow[]
  companies: CompanyRow[]
  accessMatrix: AccessRowT[]
  docs: DocItem[]
  notes: NoteItem[]
}

export type CollKey =
  | 'projects'
  | 'tenders'
  | 'salesOrders'
  | 'invoices'
  | 'payments'
  | 'poKeluar'
  | 'stok'
  | 'aset'
  | 'users'
  | 'clients'
  | 'suppliers'
  | 'banks'
  | 'companies'
  | 'accessMatrix'

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

// Build the seeded Sales Orders for the static projects, each with its own
// editable milestone list and a BAST pipeline step inferred from its status.
function seedSalesOrders(): SalesOrderRow[] {
  const out: SalesOrderRow[] = []
  P.forEach((p) => {
    soForProject(p).forEach((so, i) => {
      const bastStep = so.status === 'Selesai' ? 3 : so.status === 'BAST' ? 1 : 0
      out.push({
        id: `${p.id}-${so.id}`,
        projId: p.id,
        no: so.no,
        scope: so.scope,
        nilai: so.nilai,
        progress: so.progress,
        status: so.status,
        target: so.target,
        bastStep,
        milestones: defaultMilestones().map((m, j) => ({ ...m, id: `${p.id}-${so.id}-m${j}-${i}` })),
      })
    })
  })
  return out
}

function seed(): DataState {
  return {
    projects: P.map((p) => ({ ...p })), // already has id
    tenders: withIds(seedTenders, 'tender'),
    salesOrders: seedSalesOrders(),
    invoices: withIds(seedInv, 'inv'),
    payments: withIds(seedPay, 'pay'),
    poKeluar: withIds(seedPoKeluar, 'pok'),
    stok: withIds(seedStok, 'stok'),
    aset: withIds(seedAset, 'aset'),
    users: withIds(seedUsers, 'user'),
    clients: withIds(seedClients, 'client'),
    suppliers: withIds(seedSuppliers, 'supplier'),
    banks: withIds(seedBanks, 'bank'),
    companies: Object.values(CO).map((c) => ({ ...c })),
    accessMatrix: withIds(accessMatrixSeed, 'acc'),
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
  setRows: (key: CollKey, next: WithId[]) => void
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

  // Keep the theme company registry in sync so `co()` resolves colors for any
  // company created/edited/deleted at runtime.
  useEffect(() => {
    syncCompanies(data.companies as Company[])
  }, [data.companies])

  const rows = useCallback(
    <T extends WithId>(key: CollKey) => data[key] as unknown as T[],
    [data],
  )

  const addRow = useCallback(<T extends object>(key: CollKey, row: T) => {
    // Respect an explicit id if the caller provided one (used for companies,
    // whose id is a slug, not a generated uid).
    const id = (row as { id?: string }).id || uid(key)
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

  // Replace an entire collection (used e.g. to reset the access matrix).
  const setRows = useCallback((key: CollKey, next: WithId[]) => {
    setData((prev) => ({ ...prev, [key]: next }) as DataState)
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
      setRows,
      docsFor,
      addDoc,
      removeDoc,
      notesFor,
      addNote,
      removeNote,
      resetAll,
      storageWarning,
    }),
    [data, rows, addRow, updateRow, removeRow, setRows, docsFor, addDoc, removeDoc, notesFor, addNote, removeNote, resetAll, storageWarning],
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

// Generates the next sequential document number for a company. `existing` is
// the list of current numbers of that kind; `coShort` scopes the running count
// per PT; `build(n)` formats the number for sequence n (3-digit padded).
export function makeNo(existing: string[], coShort: string, build: (seq: string) => string): string {
  const scoped = existing.filter((x) => x.includes('/' + coShort + '/') || x.includes('-' + coShort + '-'))
  const set = new Set(existing)
  let n = scoped.length + 1
  let candidate = build(String(n).padStart(3, '0'))
  while (set.has(candidate)) {
    n += 1
    candidate = build(String(n).padStart(3, '0'))
  }
  return candidate
}
