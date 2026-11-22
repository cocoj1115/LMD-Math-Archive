import { MathfieldElement } from 'mathlive'
import { useEffect, useRef } from 'react'

// Fonts are copied into /public/mathlive/fonts so they load on school networks without a CDN.
MathfieldElement.fontsDirectory = '/mathlive/fonts'
MathfieldElement.soundsDirectory = null

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

/** Editable formula (MathLive). On a laptop: type LaTeX or use the on-screen math keyboard. */
export function MathField({ value, onChange, ariaLabel }: { value: string; onChange: (latex: string) => void; ariaLabel?: string }) {
  const ref = useRef<MathfieldElement | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const mf = ref.current
    if (!mf) return
    mf.mathVirtualKeyboardPolicy = 'manual'
    mf.smartFence = true
    const handler = () => onChangeRef.current(mf.value)
    mf.addEventListener('input', handler)
    return () => mf.removeEventListener('input', handler)
  }, [])

  useEffect(() => {
    const mf = ref.current
    if (mf && mf.value !== value) mf.value = value
  }, [value])

  return <math-field ref={ref as never} aria-label={ariaLabel} />
}
