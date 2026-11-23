// Data layer. Stores everything in localStorage, which syncs between tabs of the same
// browser only (teacher + student need to be in the same browser).
import type { Note, Post, Reply } from './types'

export interface ClassData {
  notes: Note[]
  posts: Post[]
  replies: Reply[]
}

type Table = keyof ClassData
type Row<T extends Table> = ClassData[T][number]

export interface Backend {
  load(classCode: string): Promise<ClassData>
  insert<T extends Table>(table: T, row: Row<T>): Promise<void>
  update<T extends Table>(table: T, id: string, patch: Partial<Row<T>>): Promise<void>
  uploadPhoto(classCode: string, dataUrl: string): Promise<string>
  subscribe(classCode: string, onChange: () => void): () => void
}

function localBackend(): Backend {
  const k = (c: string) => `visual-archive:${c}`
  const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('visual-archive') : null
  const read = (c: string): ClassData => {
    try {
      return JSON.parse(localStorage.getItem(k(c)) || '') as ClassData
    } catch {
      return { notes: [], posts: [], replies: [] }
    }
  }
  const write = (c: string, d: ClassData) => {
    try {
      localStorage.setItem(k(c), JSON.stringify(d))
    } catch (e) {
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        throw new Error('Browser storage is full. Remove some saved site data, then try saving this material again.')
      }
      throw new Error('Could not save this material in browser storage. Check your browser settings and try again.')
    }
    bc?.postMessage(c)
  }
  return {
    async load(c) {
      return read(c)
    },
    async insert(table, row) {
      const c = (row as { class_code: string }).class_code
      const d = read(c)
      ;(d[table] as unknown[]).push(row)
      write(c, d)
    },
    async update(table, id, patch) {
      // find the class that owns this row
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)!
        if (!key.startsWith('visual-archive:')) continue
        const c = key.slice('visual-archive:'.length)
        const d = read(c)
        const rows = d[table] as { id: string }[]
        const idx = rows.findIndex((r) => r.id === id)
        if (idx >= 0) {
          rows[idx] = { ...rows[idx], ...patch }
          write(c, d)
          return
        }
      }
    },
    async uploadPhoto(_c, dataUrl) {
      return dataUrl // stored inline; fine for local testing
    },
    subscribe(c, onChange) {
      const onMsg = (e: MessageEvent) => e.data === c && onChange()
      const onStorage = (e: StorageEvent) => e.key === k(c) && onChange()
      bc?.addEventListener('message', onMsg)
      window.addEventListener('storage', onStorage)
      return () => {
        bc?.removeEventListener('message', onMsg)
        window.removeEventListener('storage', onStorage)
      }
    },
  }
}

export const backend: Backend = localBackend()

export const newId = () => crypto.randomUUID()
export const now = () => new Date().toISOString()
