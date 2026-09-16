import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  decades,
  dialogues,
  icons,
  nostalgia,
  radioQueue,
  songs,
} from './data.ts'

function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add('is-in')
        }
      },
      { threshold: 0.16 },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
}

function TheatreDoors({ onEnter }: { onEnter: () => void }) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (count === null) return
    if (count === 0) {
      const t = window.setTimeout(onEnter, 700)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => setCount(count - 1), 700)
    return () => window.clearTimeout(t)
  }, [count, onEnter])

  const opening = count === 0

  return (
    <div className={opening ? 'doors is-opening' : 'doors'} role="dialog" aria-label="Enter the theatre">
      <div className="doors__grain" />
      <div className="doors__panel doors__panel--left" />
      <div className="doors__panel doors__panel--right" />
      <div className="doors__copy">
        <p className="kicker">Single screen · Housefull</p>
        <h1 className="doors__title">
          Golden
          <em> Interval</em>
        </h1>
        <p className="doors__sub">
          A living tribute to Indian cinema’s golden years — not a brochure.
          Walk in. The lights go down.
        </p>
        {count === null ? (
          <button className="ticket" type="button" onClick={() => setCount(3)}>
            <span className="ticket__punch" />
            Admit one · The show begins
          </button>
        ) : (
          <div className="countdown" aria-live="polite">
            {count === 0 ? '∞' : count}
          </div>
        )}
      </div>
    </div>
  )
}

function Nav({ score, total }: { score: number; total: number }) {
  return (
    <header className="nav">
      <a className="nav__mark" href="#top">
        <span>GI</span>
        Golden Interval
      </a>
      <nav>
        <a href="#nostalgia">Nostalgia</a>
        <a href="#radio">Radio</a>
        <a href="#timeline">Reels</a>
        <a href="#people">People</a>
        <a href="#projector">Projector</a>
      </nav>
      <div className="nav__meter" title="Nostalgia score">
        Housefull {score}/{total}
      </div>
    </header>
  )
}

export default function App() {
  const [entered, setEntered] = useState(false)
  const enter = useCallback(() => setEntered(true), [])
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [radioIndex, setRadioIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [activeLine, setActiveLine] = useState(0)

  useReveal()

  const score = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked],
  )
  const radio = radioQueue[radioIndex]
  const dialogue = dialogues[activeLine]

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setRadioIndex((i) => (i + 1) % radioQueue.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [playing])

  return (
    <div id="top" className={entered ? 'app is-live' : 'app'}>
      {!entered && <TheatreDoors onEnter={enter} />}

      <div className="grain" aria-hidden="true" />
      <div className="sprockets sprockets--left" aria-hidden="true" />
      <div className="sprockets sprockets--right" aria-hidden="true" />

      <Nav score={score} total={nostalgia.length} />

      <section className="hero">
        <div className="hero__stage">
          <div className="curtain curtain--left" />
          <div className="curtain curtain--right" />
          <p className="kicker">1949 — 1975 · The last great interval</p>
          <h1>
            The people, the music,
            <em> the magic that still refuses to fade.</em>
          </h1>
          <p className="lede">
            Your friend’s site is a warm scrapbook. This is the theatre itself:
            a curtain, a radio, a checklist that remembers you, and a projector
            that still knows the lines.
          </p>
          <div className="hero__row">
            <a className="btn" href="#nostalgia">
              Take your seat
            </a>
            <p className="hero__aside">
              Built as a challenge. Stay for the aftertaste.
            </p>
          </div>
        </div>
      </section>

      <section id="nostalgia" className="section" data-reveal>
        <header className="section__head">
          <p className="kicker">Have you ever</p>
          <h2>A bingo card for people who grew up in the dark.</h2>
          <p>
            Tap every memory that is yours. The housefull meter in the corner
            keeps score — because nostalgia, honestly, is a competitive sport.
          </p>
        </header>
        <div className="bingo">
          {nostalgia.map((item) => {
            const on = Boolean(checked[item.id])
            return (
              <button
                key={item.id}
                type="button"
                className={on ? 'card is-on' : 'card'}
                onClick={() =>
                  setChecked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                }
              >
                <span className="card__mark">{on ? '✓' : '+'}</span>
                <strong>{item.q}</strong>
                <small>{item.hint}</small>
              </button>
            )
          })}
        </div>
        <p className="scoreline">
          {score === 0 && 'The reel is blank. Punch a few holes.'}
          {score === 1 && '1 hit. You have been in the queue.'}
          {score > 1 && score < 6 && `${score} hits. You have been in the queue.`}
          {score >= 6 && score < 10 && `${score} hits. You waited in the rain.`}
          {score >= 10 &&
            `${score} of ${nostalgia.length}. Sit down. This was made for you.`}
        </p>
      </section>

      <section id="radio" className="section radio" data-reveal>
        <div className="radio__set">
          <div className="radio__face">
            <p className="kicker">On air</p>
            <h2>Radio Ceylon never really signed off.</h2>
            <p className="radio__now">
              <span>Now playing</span>
              <strong>
                #{radio.rank} · {radio.title}
              </strong>
              <em>{radio.show}</em>
            </p>
            <div className="radio__dials">
              <button
                type="button"
                className={playing ? 'dial is-on' : 'dial'}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? 'Pause the hour' : 'Start the hour'}
              </button>
              <button
                type="button"
                className="dial"
                onClick={() =>
                  setRadioIndex((i) => (i + 1) % radioQueue.length)
                }
              >
                Next request
              </button>
            </div>
            <p className="fineprint">
              Titles only — no stolen audio. Put on your own record. We will
              keep the lights amber.
            </p>
          </div>
          <div className="radio__speaker" aria-hidden="true">
            <div className={playing ? 'eq is-on' : 'eq'}>
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} style={{ animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="timeline" className="section" data-reveal>
        <header className="section__head">
          <p className="kicker">The reels</p>
          <h2>Four acts. One country learning to dream in 24 frames.</h2>
        </header>
        <div className="reels">
          {decades.map((d) => (
            <article key={d.year} className="reel">
              <span>{d.year}</span>
              <h3>{d.title}</h3>
              <p>{d.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="people" className="section" data-reveal>
        <header className="section__head">
          <p className="kicker">Constellation</p>
          <h2>Not a Wikipedia dump. A dressing room of ghosts who still work.</h2>
        </header>
        <div className="constellation">
          {icons.map((person) => (
            <article key={person.name} className="star">
              <h3>{person.name}</h3>
              <p className="star__role">{person.role}</p>
              <p>{person.line}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="songs" className="section" data-reveal>
        <header className="section__head">
          <p className="kicker">The songbook</p>
          <h2>Six tracks that still rearrange a room.</h2>
        </header>
        <ol className="songbook">
          {songs.map((s, i) => (
            <li key={s.title}>
              <span className="songbook__n">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <strong>{s.title}</strong>
                <em>{s.film}</em>
                <p>{s.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="projector" className="section projector" data-reveal>
        <header className="section__head">
          <p className="kicker">The projector</p>
          <h2>Click a line. Watch it hit the screen.</h2>
        </header>
        <div className="projector__grid">
          <div className="screen" aria-live="polite">
            <p className="screen__line">“{dialogue.line}”</p>
            <p className="screen__film">{dialogue.film}</p>
            <p className="screen__gloss">{dialogue.gloss}</p>
          </div>
          <div className="cues">
            {dialogues.map((d, i) => (
              <button
                key={d.line}
                type="button"
                className={i === activeLine ? 'cue is-on' : 'cue'}
                onClick={() => setActiveLine(i)}
              >
                {d.film}
              </button>
            ))}
          </div>
        </div>
      </section>

      <footer className="credits">
        <p className="kicker">End credits</p>
        <h2>This was never going to be a WordPress theme with a sitar still.</h2>
        <p>
          Golden Interval is an original tribute — cinematic, interactive, a
          little arrogant on purpose. No books for sale. No dead social icons.
          Just the era, staged the way it deserves.
        </p>
        <p className="credits__small">
          Made for a dare. 2026. Play it loud. Then play it again.
        </p>
      </footer>
    </div>
  )
}
