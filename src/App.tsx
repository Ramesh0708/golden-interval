import { useEffect, useMemo, useState } from 'react'
import { about } from './about.ts'
import { book, homeCopy, reviews } from './books.ts'
import { nostalgia } from './data.ts'
import { FlipBook } from './FlipBook.tsx'
import songList from './songs.json'

type Song = {
  n: number
  title: string
  film: string
  year: string
  singers: string
  lyricist: string
  composer: string
  actors: string
  artist: string
}

const songs = songList as Song[]

function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add('is-in')
        }
      },
      { threshold: 0.12 },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
}

function Nav() {
  return (
    <header className="nav">
      <a className="nav__mark" href="#top">
        <img src="/gold-logo.png" alt="Golden Era of Indian Cinema" />
      </a>
      <nav>
        <a href="#top">Home</a>
        <a href="#books">Books</a>
        <a href="#about">About</a>
      </nav>
    </header>
  )
}

export default function App() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [showSample, setShowSample] = useState(false)
  const [query, setQuery] = useState('')

  useReveal()

  const score = Object.values(checked).filter(Boolean).length
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return songs.slice(0, 80)
    return songs
      .filter((s) =>
        `${s.title} ${s.film} ${s.singers} ${s.artist} ${s.year}`
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 80)
  }, [query])

  return (
    <div id="top" className="app">
      <div className="grain" aria-hidden="true" />
      <Nav />

      <section className="hero">
        <div className="hero__stage">
          <div className="curtain curtain--left" />
          <div className="curtain curtain--right" />
          <p className="kicker">Golden Era of Indian cinema</p>
          <h1>
            The people, the music,
            <em> the magic that defined an era.</em>
          </h1>
        </div>
      </section>

      <section id="home" className="section" data-reveal>
        <header className="section__head">
          <p className="kicker">Have you ever</p>
          <h2>A checklist for people who grew up with Hindi cinema.</h2>
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
              </button>
            )
          })}
        </div>
        <p className="scoreline">
          {score === 0
            ? homeCopy.lead
            : `${score} of ${nostalgia.length} — you belong in this hall.`}
        </p>
        <div className="home-copy">
          <p>{homeCopy.p1}</p>
          <p>{homeCopy.p2}</p>
        </div>
      </section>

      <section id="books" className="section books" data-reveal>
        <header className="section__head">
          <p className="kicker">{book.kicker}</p>
          <h2>{book.title}</h2>
        </header>
        <div className="books__layout">
          <div className="books__cover">
            <div className="book-plate">
              <span>Sanjeev Kunte & Vilas Deshmukh</span>
              <h3>{book.title}</h3>
              <p>500 artists of Hindi cinema</p>
            </div>
          </div>
          <div className="books__copy">
            <p>{book.blurb}</p>
            <ul>
              {book.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="books__actions">
              <button type="button" className="btn" onClick={() => setShowSample(true)}>
                View samples
              </button>
              <a className="btn btn--ghost" href="#songs">
                Songs mentioned in this book
              </a>
              <a className="btn btn--ghost" href="#reviews">
                Reviews
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="songs" className="section" data-reveal>
        <header className="section__head">
          <p className="kicker">Songs mentioned</p>
          <h2>From Echoes of the Golden Era.</h2>
          <p>
            {songs.length} songs referenced in the book. Search by title, film,
            singer or artist. Best on a wide screen.
          </p>
        </header>
        <input
          className="song-search"
          type="search"
          placeholder="Search songs, films, singers…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="song-table-wrap">
          <table className="song-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Song</th>
                <th>Film</th>
                <th>Year</th>
                <th>Singers</th>
                <th>Artist in the book</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.n}>
                  <td>{s.n}</td>
                  <td>{s.title}</td>
                  <td>{s.film}</td>
                  <td>{s.year}</td>
                  <td>{s.singers}</td>
                  <td>{s.artist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!query && (
          <p className="fineprint">Showing the first 80. Type to search the full list.</p>
        )}
      </section>

      <section id="reviews" className="section" data-reveal>
        <header className="section__head">
          <p className="kicker">Reviews</p>
          <h2>Queries, corrections, trivia — all welcome.</h2>
          <p>
            Write to {about.email}. With your note you also give consent to
            publish it.
          </p>
        </header>
        <div className="reviews">
          {reviews.map((r) => (
            <article key={r.date + r.by} className="review">
              <p className="review__meta">
                {r.date} · {r.by}
              </p>
              <p>{r.text}</p>
              {r.reply && <p className="review__reply">Authors: {r.reply}</p>}
            </article>
          ))}
        </div>
        <p className="about__mail">
          <a href={`mailto:${about.email}`}>{about.email}</a>
        </p>
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
          Find us at <a href={`mailto:${about.email}`}>{about.email}</a>
        </p>
      </section>

      {showSample && (
        <FlipBook src={book.sampleUrl} onClose={() => setShowSample(false)} />
      )}
    </div>
  )
}
