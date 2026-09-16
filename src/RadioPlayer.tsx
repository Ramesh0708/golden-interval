import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

type YTPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  loadVideoById: (id: string) => void
  cueVideoById: (id: string) => void
  destroy: () => void
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId: string
          playerVars?: Record<string, string | number>
          events?: {
            onReady?: () => void
            onStateChange?: (e: { data: number }) => void
          }
        },
      ) => YTPlayer
      PlayerState?: { ENDED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()
  return new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(script)
    }
  })
}

export type RadioHandle = {
  play: () => void
  pause: () => void
}

export const RadioPlayer = forwardRef<RadioHandle, {
  videoId: string
  playing: boolean
  onEnded: () => void
}>(function RadioPlayer({ videoId, playing, onEnded }, ref) {
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const playingRef = useRef(playing)
  const videoRef = useRef(videoId)
  const endedRef = useRef(onEnded)

  playingRef.current = playing
  videoRef.current = videoId
  endedRef.current = onEnded

  useImperativeHandle(ref, () => ({
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
  }))

  useEffect(() => {
    let dead = false
    let player: YTPlayer | null = null

    void loadYouTubeApi().then(() => {
      if (dead || !hostRef.current || !window.YT?.Player) return
      player = new window.YT.Player(hostRef.current, {
        videoId: videoRef.current,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            playerRef.current = player
            if (playingRef.current) player?.playVideo()
            else player?.cueVideoById(videoRef.current)
          },
          onStateChange: (event) => {
            if (event.data === (window.YT?.PlayerState?.ENDED ?? 0)) {
              endedRef.current()
            }
          },
        },
      })
    })

    return () => {
      dead = true
      playerRef.current = null
      player?.destroy()
    }
  }, [])

  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    if (playingRef.current) player.loadVideoById(videoId)
    else player.cueVideoById(videoId)
  }, [videoId])

  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    if (playing) player.playVideo()
    else player.pauseVideo()
  }, [playing])

  return (
    <div className="radio__deck">
      <div ref={hostRef} className="radio__host" />
    </div>
  )
})
