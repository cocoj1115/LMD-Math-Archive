import { useEffect, useRef, useState } from 'react'
import { fileToDataUrl } from '../lib/image'

/**
 * "Upload file" + "Use camera" (webcam on a laptop; rear camera on a phone/tablet).
 * Calls onPhoto with a resized JPEG data URL.
 */
export function PhotoInput({
  onPhoto,
  uploadLabel = 'Upload file',
  cameraLabel = 'Capture board',
  primary = 'none',
  dropzone = false,
  hint,
}: {
  onPhoto: (dataUrl: string) => void
  uploadLabel?: string
  cameraLabel?: string
  primary?: 'upload' | 'camera' | 'none'
  dropzone?: boolean
  hint?: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [camOpen, setCamOpen] = useState(false)
  const [over, setOver] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleFile = async (f: File | undefined | null) => {
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setErr('Please choose a photo (JPG or PNG). For PDFs, take a screenshot first.')
      return
    }
    setErr(null)
    try {
      onPhoto(await fileToDataUrl(f))
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not read that file')
    }
  }

  const buttons = (
    <div className="row">
      <button type="button" className={`pill${primary === 'upload' ? ' primary' : ''}`} onClick={() => fileRef.current?.click()}>
        {uploadLabel}
      </button>
      <button type="button" className={`pill${primary === 'camera' ? ' primary' : ''}`} onClick={() => setCamOpen(true)}>
        {cameraLabel}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )

  return (
    <>
      {dropzone ? (
        <div
          className={`dropzone${over ? ' over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setOver(false)
            handleFile(e.dataTransfer.files?.[0])
          }}
        >
          <p style={{ marginTop: 0, fontWeight: 700 }}>Drop a photo here</p>
          {hint && <p className="muted" style={{ marginTop: -6 }}>{hint}</p>}
          <div style={{ display: 'flex', justifyContent: 'center' }}>{buttons}</div>
        </div>
      ) : (
        buttons
      )}
      {err && <div className="banner warn">{err}</div>}
      {camOpen && (
        <CameraModal
          onClose={() => setCamOpen(false)}
          onCapture={(d) => {
            setCamOpen(false)
            onPhoto(d)
          }}
          onFallback={() => {
            setCamOpen(false)
            fileRef.current?.click()
          }}
        />
      )}
    </>
  )
}

function CameraModal({ onClose, onCapture, onFallback }: { onClose: () => void; onCapture: (d: string) => void; onFallback: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let cancelled = false
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        streamRef.current = s
        if (videoRef.current) videoRef.current.srcObject = s
      })
      .catch(() => setError('Camera not available. Allow camera access in the browser, or upload a photo instead.'))
    if (!navigator.mediaDevices) setError('This browser cannot open the camera. Upload a photo instead.')
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const snap = () => {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const scale = Math.min(1, 1600 / Math.max(v.videoWidth, v.videoHeight))
    const c = document.createElement('canvas')
    c.width = v.videoWidth * scale
    c.height = v.videoHeight * scale
    c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height)
    onCapture(c.toDataURL('image/jpeg', 0.88))
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Take a photo</h2>
        {error ? (
          <div className="banner warn">{error}</div>
        ) : (
          <video ref={videoRef} className="cam" autoPlay playsInline muted />
        )}
        <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
          <button className="pill" onClick={onClose}>Cancel</button>
          {error ? (
            <button className="pill primary" onClick={onFallback}>Upload a photo</button>
          ) : (
            <button className="pill primary" onClick={snap}>Take photo</button>
          )}
        </div>
      </div>
    </div>
  )
}
