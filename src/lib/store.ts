// Data layer. Uses Supabase when VITE_SUPABASE_URL is set (teacher + student on different
// computers stay in sync). Otherwise falls back to localStorage, which syncs between tabs
// of the same browser only — handy for development.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Note, Post, Reply } from './types'

export interface ClassData {
  notes: Note[]
  posts: Post[]
  replies: Reply[]
}

type Table = keyof ClassData
type Row<T extends Table> = ClassData[T][number]

export interface Backend {
  mode: 'supabase' | 'local'
  load(classCode: string): Promise<ClassData>
  insert<T extends Table>(table: T, row: Row<T>): Promise<void>
  update<T extends Table>(table: T, id: string, patch: Partial<Row<T>>): Promise<void>
  uploadPhoto(classCode: string, dataUrl: string): Promise<string>
  subscribe(classCode: string, onChange: () => void): () => void
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function supabaseBackend(sb: SupabaseClient): Backend {
  return {
    mode: 'supabase',
    async load(classCode) {
      const [n, p, r] = await Promise.all([
        sb.from('notes').select('*').eq('class_code', classCode).order('created_at', { ascending: false }),
        sb.from('posts').select('*').eq('class_code', classCode).order('created_at', { ascending: false }),
        sb.from('replies').select('*').eq('class_code', classCode).order('created_at', { ascending: true }),
      ])
      const err = n.error || p.error || r.error
      if (err) throw new Error(err.message)
      return { notes: n.data as Note[], posts: p.data as Post[], replies: r.data as Reply[] }
    },
    async insert(table, row) {
      const { error } = await sb.from(table).insert(row as never)
      if (error) throw new Error(error.message)
    },
    async update(table, id, patch) {
      const { error } = await sb.from(table).update(patch as never).eq('id', id)
      if (error) throw new Error(error.message)
    },
    async uploadPhoto(classCode, dataUrl) {
      const blob = await (await fetch(dataUrl)).blob()
      const path = `${classCode}/${crypto.randomUUID()}.jpg`
      const { error } = await sb.storage.from('uploads').upload(path, blob, { contentType: blob.type || 'image/jpeg' })
      if (error) throw new Error(error.message)
      return sb.storage.from('uploads').getPublicUrl(path).data.publicUrl
    },
    subscribe(classCode, onChange) {
      const ch = sb.channel(`class-${classCode}`)
      for (const table of ['notes', 'posts', 'replies']) {
        ch.on('postgres_changes', { event: '*', schema: 'public', table, filter: `class_code=eq.${classCode}` }, onChange)
      }
      ch.subscribe()
      // Safety net in case realtime isn't enabled on the project
      const poll = setInterval(onChange, 8000)
      return () => {
        clearInterval(poll)
        sb.removeChannel(ch)
      }
    },
  }
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
    localStorage.setItem(k(c), JSON.stringify(d))
    bc?.postMessage(c)
  }
  return {
    mode: 'local',
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

export const backend: Backend = url && key ? supabaseBackend(createClient(url, key)) : localBackend()

export const newId = () => crypto.randomUUID()
export const now = () => new Date().toISOString()
