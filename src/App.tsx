import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { about } from './about.ts'
import { book } from './books.ts'
import {
  decades,
  dialogues,
  firstWatch,
  icons,
  nostalgia,
  radioQueue,
  songs,
} from './data.ts'
import { RadioPlayer, type RadioHandle } from './RadioPlayer.tsx'

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
          Hindi cinema, 1949–1975. If you queued for the print, you already
          know the temperature. If you did not — the songs still work.
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
        <a href="#start">Start here</a>
        <a href="#radio">Radio</a>
        <a href="#nostalgia">If you were there</a>
        <a href="#timeline">Reels</a>
        <a href="#people">People</a>
        <a href="#projector">Lines</a>
        <a href="#books">Books</a>
        <a href="#about">About</a>
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
  const [showSample, setShowSample] = useState(false)
  const radioRef = useRef<RadioHandle>(null)

  useReveal()

  const score = useMemo(
    () => Object.values(checked).filter(Boolean).length,
    [checked],
  )
  const radio = radioQueue[radioIndex]
  const dialogue = dialogues[activeLine]
  const nextRequest = useCallback(() => {
    setRadioIndex((i) => (i + 1) % radioQueue.length)
  }, [])

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
          <p className="kicker">Then and now · Same songs</p>
          <h1>
            You do not need to have
            <em> queued in the rain.</em>
          </h1>
          <p className="lede">
            The Golden Era of Hindi cinema still plays — on phones, in cars, at
            weddings, in the back of a parent’s memory. This is a hall for
            people who lived it, and a map for anyone arriving late.
          </p>
          <div className="hero__row">
            <a className="btn" href="#start">
              I’m new here
            </a>
            <a className="btn btn--ghost" href="#nostalgia">
              I remember this
            </a>
          </div>
        </div>
      </section>

      <section id="start" className="section" data-reveal>
        <header className="section__head">
          <p className="kicker">First reel</p>
          <h2>Four films if you have never sat through a golden-era print.</h2>
          <p>
            No homework. No insider password. Press play on the radio below,
            then pick one of these. Each still holds up if you were born after
            the last single-screen closed.
          </p>
        </header>
        <div className="first-watch">
          {firstWatch.map((film) => (
            <article key={film.title} className="first-watch__card">
              <span>{film.year}</span>
              <h3>{film.title}</h3>
              <p>{film.why}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="nostalgia" className="section" data-reveal>
        <header className="section__head">
          <p className="kicker">If you were there</p>
          <h2>A memory card — optional, not an entrance exam.</h2>
          <p>
            Grew up with Radio Ceylon and housefull boards? Tap what is yours.
            Arriving now? Skip this and stay for the music. The era does not
            ask for your year of birth.
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
          {score === 0 &&
            'No ticks? Fine. The first reel above is for you.'}
          {score === 1 && '1 memory. The rest of the hall is still open.'}
          {score > 1 && score < 6 && `${score} memories. You have been in the queue.`}
          {score >= 6 && score < 10 && `${score} memories. You waited in the rain.`}
          {score >= 10 &&
            `${score} of ${nostalgia.length}. You lived it — now play it for someone who didn’t.`}
        </p>
      </section>

      <section id="radio" className="section radio" data-reveal>
        <div className="radio__set">
          <div className="radio__face">
            <p className="kicker">On air</p>
            <h2>Hear it before you study it.</h2>
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
                onClick={() => {
                  if (playing) {
                    radioRef.current?.pause()
                    setPlaying(false)
                  } else {
                    radioRef.current?.play()
                    setPlaying(true)
                  }
                }}
              >
                {playing ? 'Pause the hour' : 'Start the hour'}
              </button>
              <button type="button" className="dial" onClick={nextRequest}>
                Next request
              </button>
            </div>
            <p className="fineprint">
              Press start. These tracks still stop a room — on a bus, in
              headphones, or on a Sunday radio. YouTube streams the originals.
            </p>
          </div>
          <div className="radio__speaker">
            <RadioPlayer
              ref={radioRef}
              videoId={radio.youtubeId}
              playing={playing}
              onEnded={nextRequest}
            />
          </div>
        </div>
      </section>

      <section id="timeline" className="section" data-reveal>
        <header className="section__head">
          <p className="kicker">The reels</p>
          <h2>Four acts. A country learning to dream in 24 frames.</h2>
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
          <h2>Faces you already know — even if you do not know why.</h2>
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
          <h2>Six tracks that still rearrange a room — any decade.</h2>
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

      <section id="books" className="section books" data-reveal>
        <header className="section__head">
          <p className="kicker">{book.kicker}</p>
          <h2>{book.title}</h2>
          <p>{book.subtitle}</p>
        </header>
        <div className="books__layout">
          <div className="books__cover">
            <img src={book.coverUrl} alt={`${book.title} sample cover`} />
          </div>
          <div className="books__copy">
            <p>{book.blurb}</p>
            <ul>
              {book.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="books__actions">
              <button
                type="button"
                className="btn"
                onClick={() => setShowSample(true)}
              >
                View sample
              </button>
              <a className="btn btn--ghost" href={book.sampleUrl} target="_blank" rel="noreferrer">
                Open sample PDF
              </a>
              <a className="btn btn--ghost" href={book.songsUrl} target="_blank" rel="noreferrer">
                Songs in this book
              </a>
              <a className="btn btn--ghost" href={book.reviewsUrl} target="_blank" rel="noreferrer">
                Reviews
              </a>
            </div>
          </div>
        </div>
        {showSample && (
          <div className="books__sample">
            <iframe
              title={`${book.title} sample pages`}
              src={`${book.sampleUrl}#view=FitH`}
            />
          </div>
        )}
      </section>

      <section id="about" className="section about" data-reveal>
        <header className="section__head">
          <p className="kicker">{about.kicker}</p>
          <h2>{about.headline}</h2>
          <p>{about.story}</p>
        </header>
        <div className="about__people">
          {about.people.map((person) => (
            <article key={person.name} className="about__card">
              <h3>{person.name}</h3>
              <p className="about__role">{person.role}</p>
              <p>{person.bio}</p>
            </article>
          ))}
        </div>
        <p className="about__mail">
          Find us at{' '}
          <a href={`mailto:${about.email}`}>{about.email}</a>
        </p>
      </section>

      <footer className="credits">
        <p className="kicker">End credits</p>
        <h2>The interval is over. The songs are not.</h2>
        <p>
          Golden Interval is a hall for two kinds of listener: the ones who
          waited in the rain, and the ones who just pressed play. Same songs.
          Same era. No age on the ticket.
        </p>
        <p className="credits__small">2026. Play it loud. Then play it again.</p>
      </footer>
    </div>
  )
}
