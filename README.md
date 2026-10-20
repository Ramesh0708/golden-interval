# Golden Interval

**The people, the music, the housefull.** A cinematic tribute to the Golden Era of Hindi cinema and its music, built around the books of Sanjeev Kunte and Vilas, two friends from Pune.

## Features
- Home page with nostalgia sections and scroll-reveal animations
- Book showcase with reviews and a flip-through sample (page-flip + PDF.js)
- Searchable song list (title, film, year, singers, lyricist, composer, actors) from `src/songs.json`
- About section on the authors

## Tech stack
React 19, TypeScript, Vite 7, `page-flip`, `pdfjs-dist`.

## Run locally
```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and build to dist/
npm run preview   # preview the production build
```

## Content
Copy and data live in `src/` (`about.ts`, `books.ts`, `data.ts`, `songs.json`). Images and sample pages live in `public/`.
