// Shrinks a photo before upload / OCR so it stays under serverless body limits
// and loads fast on school Wi-Fi.
export async function fileToDataUrl(file: Blob, maxSide = 1600, quality = 0.85): Promise<string> {
  const src = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('Could not open that image'))
      i.src = src
    })
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(src)
  }
}

/** Rotate a data URL by 90° clockwise (for sideways phone photos). */
export async function rotateDataUrl(dataUrl: string): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.src = dataUrl
  })
  const c = document.createElement('canvas')
  c.width = img.naturalHeight
  c.height = img.naturalWidth
  const ctx = c.getContext('2d')!
  ctx.translate(c.width, 0)
  ctx.rotate(Math.PI / 2)
  ctx.drawImage(img, 0, 0)
  return c.toDataURL('image/jpeg', 0.9)
}

/** Crop a data URL to a rectangle given in 0–1 fractions of width/height. */
export async function cropDataUrl(dataUrl: string, r: { x: number; y: number; w: number; h: number }): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.src = dataUrl
  })
  const sx = r.x * img.naturalWidth
  const sy = r.y * img.naturalHeight
  const sw = r.w * img.naturalWidth
  const sh = r.h * img.naturalHeight
  const c = document.createElement('canvas')
  c.width = Math.round(sw)
  c.height = Math.round(sh)
  c.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.9)
}
