import { useEffect } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'

/**
 * Page transitions. Every in-app link click runs inside document.startViewTransition, so the
 * browser cross-fades the page while elements that share a view-transition-name (a card on one
 * page, the header it opens into on the next) morph from one into the other.
 * The nav bar has its own name and no animation, so it never moves.
 * Browsers without the API (or with reduced motion) just navigate.
 */
export function ViewTransitions() {
  const navigate = useNavigate()
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement).closest('a')
      if (!a || a.target || a.hasAttribute('download')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin) return
      const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
      if (!doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return
      e.preventDefault()
      e.stopPropagation()
      const to = url.pathname + url.search + url.hash
      doc.startViewTransition(() => flushSync(() => navigate(to)))
    }
    // capture phase, so it runs before React Router's own <Link> handler
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [navigate])
  return null
}
