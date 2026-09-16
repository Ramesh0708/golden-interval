import { useEffect, useRef, useState } from 'react'
import { PageFlip } from 'page-flip'
import * as pdfjs from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

async function pdfToImages(src: string): Promise<string[]> {
  const doc = await pdfjs.getDocument({ url: src }).promise
  const images: string[] = []
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i)
    const viewport = page.getViewport({ scale: 1.35 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')
    if (!ctx) continue
    await page.render({ canvas, viewport }).promise
    images.push(canvas.toDataURL('image/jpeg', 0.86))
  }
  if (images.length % 2 === 1) images.push(images[images.length - 1] ?? '')
  return images
}

export function FlipBook({
  src,
  onClose,
}: {
  src: string
  onClose: () => void
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const flipRef = useRef<PageFlip | null>(null)
  const [status, setStatus] = useState('Opening the sample…')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') flipRef.current?.flipNext()
      if (e.key === 'ArrowLeft') flipRef.current?.flipPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    let dead = false
    const host = hostRef.current
    if (!host) return

    void pdfToImages(src)
      .then((images) => {
        if (dead || !host) return
        host.replaceChildren()
        const book = document.createElement('div')
        host.appendChild(book)
        const flip = new PageFlip(book, {
          width: 420,
          height: 594,
          size: 'stretch',
          minWidth: 280,
          maxWidth: 640,
          minHeight: 380,
          maxHeight: 820,
          showCover: true,
          maxShadowOpacity: 0.55,
          mobileScrollSupport: false,
          usePortrait: true,
          drawShadow: true,
          flippingTime: 800,
          startPage: 0,
        })
        flip.loadFromImages(images)
        flip.on('flip', (e) => setPage(Number(e.data) + 1))
        flipRef.current = flip
        setCount(flip.getPageCount())
        setPage(1)
        setStatus('')
      })
      .catch((err: unknown) =>
        setStatus(
          err instanceof Error
            ? `Could not open the sample: ${err.message}`
            : 'Could not open the sample. Try again.',
        ),
      )

    return () => {
      dead = true
      flipRef.current?.destroy()
      flipRef.current = null
    }
  }, [src])

  return (
    <div className="flip-overlay" role="dialog" aria-label="Book sample">
      <div className="flip-overlay__bar">
        <p>Echoes of the Golden Era · sample</p>
        <span>{count ? `${page} / ${count}` : status}</span>
        <div className="flip-overlay__nav">
          <button type="button" onClick={() => flipRef.current?.flipPrev()}>
            Previous page
          </button>
          <button type="button" onClick={() => flipRef.current?.flipNext()}>
            Next page
          </button>
          <button type="button" className="flip-overlay__close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      {status && <p className="flip-overlay__status">{status}</p>}
      <div ref={hostRef} className="flip-overlay__stage" />
    </div>
  )
}
