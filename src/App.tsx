import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider, useApp } from './lib/app'
import { ViewTransitions } from './components/ViewTransitions'
import type { Role } from './lib/types'
import { Archive, Folder, Search, TopicMap } from './screens/Archive'
import { Discussion, NewPost } from './screens/Discussion'
import { NotePage, PrintPreview } from './screens/Note'
import { Start, Welcome } from './screens/Start'
import { Questions } from './screens/TeacherQuestions'
import { Example, TopicPage, Worksheet } from './screens/Topic'

// MathLive is large, so the teacher capture screen loads it only when needed
const Capture = lazy(() => import('./screens/TeacherCapture').then((m) => ({ default: m.Capture })))
const Published = lazy(() => import('./screens/TeacherCapture').then((m) => ({ default: m.Published })))

/**
 * /reset — wipes everything typed or posted in this browser (posts, replies, notes published from the
 * teacher view, bookmarks, the signed-in name). The built-in class materials stay. Use between test sessions.
 */
function Reset() {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!
    if (key.startsWith('visual-archive:')) keys.push(key)
  }
  keys.forEach((k) => localStorage.removeItem(k))
  sessionStorage.clear()
  // full reload so the in-memory state is rebuilt from the now-empty storage
  window.location.replace('/')
  return null
}

function Need({ role, children }: { role?: Role; children: ReactNode }) {
  const { session } = useApp()
  if (!session) return <Navigate to="/" replace />
  if (role && session.role !== role) return <Navigate to="/archive" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ViewTransitions />
        <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/reset" element={<Reset />} />
          <Route path="/welcome/:step" element={<Need role="student"><Welcome /></Need>} />
          <Route path="/map" element={<Need><TopicMap /></Need>} />
          <Route path="/search" element={<Need><Search /></Need>} />
          <Route path="/archive" element={<Need><Archive /></Need>} />
          <Route path="/folder/:id" element={<Need><Folder /></Need>} />
          <Route path="/topic/:id" element={<Need><TopicPage /></Need>} />
          <Route path="/example/:id" element={<Need><Example /></Need>} />
          <Route path="/worksheet/:id/:page" element={<Need><Worksheet /></Need>} />
          <Route path="/note/:id" element={<Need><NotePage /></Need>} />
          <Route path="/print/:id" element={<Need><PrintPreview /></Need>} />
          <Route path="/discussion" element={<Need><Discussion /></Need>} />
          <Route path="/discussion/new" element={<Need><NewPost /></Need>} />
          <Route path="/t/capture" element={<Need role="teacher"><Capture /></Need>} />
          <Route path="/t/published/:id" element={<Need role="teacher"><Published /></Need>} />
          <Route path="/t/questions" element={<Need role="teacher"><Questions /></Need>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  )
}
