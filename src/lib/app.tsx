import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { BUILT_IN_NOTES } from './content'
import { backend, newId, now, type ClassData } from './store'
import type { Line, Note, Post, Reply, Role, Session } from './types'

const SESSION_KEY = 'visual-archive:session'
const BOOKMARK_KEY = 'visual-archive:bookmarks'

function loadSession(): Session | null {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '') as Session
  } catch {
    return null
  }
}


interface AppValue {
  session: Session | null
  start(role: Role, name: string, classCode: string): void
  signOut(): void
  loading: boolean
  error: string | null
  notes: Note[]
  posts: Post[]
  replies: Reply[]
  noteById(id: string): Note | undefined
  uploadPhoto(dataUrl: string): Promise<string>
  publishNote(n: {
    topic: string
    title: string
    kind: string
    lesson?: string
    lines: Line[]
    original_lines: Line[]
    diagram?: string
    photo_url?: string
  }): Promise<string>
  addPost(p: Pick<Post, 'topic' | 'note_id' | 'title' | 'body' | 'photo_url' | 'photo_lines' | 'voice'> & { anchor?: Post['anchor'] }): Promise<string>
  addReply(postId: string, body: string): Promise<void>
  setShareStatus(postId: string, status: Post['share_status']): Promise<void>
  addStudentWork(noteId: string, post: Post, caption: string): Promise<void>
  bookmarks: string[]
  toggleBookmark(noteId: string): void
}

const Ctx = createContext<AppValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession)
  const [data, setData] = useState<ClassData>({ notes: [], posts: [], replies: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]')
    } catch {
      return []
    }
  })

  const classCode = session?.classCode

  const refresh = useCallback(async () => {
    if (!classCode) return
    try {
      setData(await backend.load(classCode))
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [classCode])

  useEffect(() => {
    if (!classCode) return
    setLoading(true)
    refresh()
    const unsub = backend.subscribe(classCode, refresh)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      unsub()
      window.removeEventListener('focus', onFocus)
    }
  }, [classCode, refresh])

  const value = useMemo<AppValue>(() => {
    const me = () => {
      if (!session) throw new Error('No session')
      return session
    }
    const notes = [...data.notes, ...BUILT_IN_NOTES]
    return {
      session,
      loading,
      error,
      notes,
      posts: data.posts,
      replies: data.replies,
      start(role, name, code) {
        const s: Session = { role, name: name.trim() || (role === 'teacher' ? 'Teacher' : 'Student'), classCode: code.trim().toUpperCase() || 'MATH3', deviceId: newId() }
        // Per-tab session: a teacher tab and a student tab can run side by side on one laptop
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(s))
        setSession(s)
      },
      signOut() {
        sessionStorage.removeItem(SESSION_KEY)
        setSession(null)
        setData({ notes: [], posts: [], replies: [] })
      },
      noteById: (id) => notes.find((n) => n.id === id),
      uploadPhoto: (dataUrl) => backend.uploadPhoto(me().classCode, dataUrl),
      async publishNote(n) {
        const s = me()
        const id = newId()
        await backend.insert('notes', {
          id,
          class_code: s.classCode,
          topic: n.topic,
          title: n.title,
          kind: n.kind,
          lesson: n.lesson ?? null,
          lines: n.lines.map(({ type, value }) => ({ type, value })),
          original_lines: n.original_lines,
          diagram: n.diagram ?? null,
          photo_url: n.photo_url ?? null,
          student_work: [],
          created_at: now(),
          updated_at: now(),
        })
        await refresh()
        return id
      },
      async addPost(p) {
        const s = me()
        const id = newId()
        await backend.insert('posts', {
          id,
          class_code: s.classCode,
          author_name: s.name,
          author_id: s.deviceId,
          role: s.role,
          share_status: null,
          created_at: now(),
          ...p,
        })
        await refresh()
        return id
      },
      async addReply(postId, body) {
        const s = me()
        await backend.insert('replies', {
          id: newId(),
          class_code: s.classCode,
          post_id: postId,
          body,
          author_name: s.name,
          author_id: s.deviceId,
          role: s.role,
          created_at: now(),
        })
        await refresh()
      },
      async setShareStatus(postId, status) {
        await backend.update('posts', postId, { share_status: status })
        await refresh()
      },
      async addStudentWork(noteId, post, caption) {
        const note = data.notes.find((n) => n.id === noteId)
        if (!note || !post.photo_url) return
        await backend.update('notes', noteId, {
          student_work: [
            ...note.student_work,
            { post_id: post.id, photo_url: post.photo_url, caption, author: 'A classmate' },
          ],
          updated_at: now(),
        })
        await refresh()
      },
      bookmarks,
      toggleBookmark(id) {
        setBookmarks((b) => {
          const next = b.includes(id) ? b.filter((x) => x !== id) : [...b, id]
          localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next))
          return next
        })
      },
    }
  }, [session, data, loading, error, refresh, bookmarks])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside AppProvider')
  return v
}
