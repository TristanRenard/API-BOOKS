import { faker } from "@faker-js/faker"
import cors from "cors"
import express from "express"

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const coverWidth = 400
const coverHight = 600
const getCoverImage = () => faker.image.url({ category: "books", width: coverWidth, height: coverHight })

const initialBooks = [
  {
    id: 1,
    name: "Dune",
    author: "Frank Herbert",
    editor: "Chilton Books",
    year: 1965,
    read: true,
    favorite: true,
    rating: 5,
    cover: getCoverImage(),
    theme: "Science-Fiction",
  },
  {
    id: 2,
    name: "Le Meilleur des mondes",
    author: "Aldous Huxley",
    editor: "Chatto & Windus",
    year: 1932,
    read: false,
    favorite: false,
    rating: 4,
    cover: getCoverImage(),
    theme: "Dystopie",
  },
  {
    id: 3,
    name: "1984",
    author: "George Orwell",
    editor: "Secker & Warburg",
    year: 1949,
    read: true,
    favorite: true,
    rating: 5,
    cover: getCoverImage(),
    theme: "Dystopie",
  },
  {
    id: 4,
    name: "Fondation",
    author: "Isaac Asimov",
    editor: "Gnome Press",
    year: 1951,
    read: false,
    favorite: false,
    rating: 3,
    cover: getCoverImage(),
    theme: "Science-Fiction",
  },
  {
    id: 5,
    name: "Les Misérables",
    author: "Victor Hugo",
    editor: "A. Lacroix, Verboeckhoven & Cie",
    year: 1862,
    read: false,
    favorite: false,
    rating: 4,
    cover: getCoverImage(),
    theme: "Classique",
  },
  {
    id: 6,
    name: "L'Étranger",
    author: "Albert Camus",
    editor: "Gallimard",
    year: 1942,
    read: true,
    favorite: false,
    rating: 5,
    cover: getCoverImage(),
    theme: "Philosophique",
  },
  {
    id: 7,
    name: "Harry Potter à l'école des sorciers",
    author: "J.K. Rowling",
    editor: "Bloomsbury",
    year: 1997,
    read: true,
    favorite: true,
    rating: 5,
    cover: getCoverImage(),
    theme: "Fantasy",
  },
  {
    id: 8,
    name: "Le Seigneur des Anneaux",
    author: "J.R.R. Tolkien",
    editor: "Allen & Unwin",
    year: 1954,
    read: true,
    favorite: true,
    rating: 5,
    cover: getCoverImage(),
    theme: "Fantasy",
  },
  {
    id: 9,
    name: "Neuromancien",
    author: "William Gibson",
    editor: "Ace Books",
    year: 1984,
    read: false,
    favorite: false,
    rating: 4,
    cover: getCoverImage(),
    theme: "Cyberpunk",
  },
  {
    id: 10,
    name: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    editor: "Reynal & Hitchcock",
    year: 1943,
    read: true,
    favorite: true,
    rating: 5,
    cover: getCoverImage(),
    theme: "Conte philosophique",
  },
]

const initialNotes = [
  {
    id: 1,
    bookId: 1,
    content: "Un classique de la SF politique et écologique.",
    dateISO: new Date("2024-05-10").toISOString(),
  },
  {
    id: 2,
    bookId: 1,
    content: "Très dense mais fascinant.",
    dateISO: new Date("2024-05-12").toISOString(),
  },
  {
    id: 3,
    bookId: 3,
    content: "Une vision glaçante du totalitarisme.",
    dateISO: new Date("2024-04-01").toISOString(),
  },
  {
    id: 4,
    bookId: 5,
    content: "Des descriptions magnifiques, mais parfois un peu longues.",
    dateISO: new Date("2024-03-14").toISOString(),
  },
  {
    id: 5,
    bookId: 7,
    content: "Idéal pour les plus jeunes lecteurs, mais plaisant à tout âge.",
    dateISO: new Date("2024-02-02").toISOString(),
  },
  {
    id: 6,
    bookId: 8,
    content: "Un univers légendaire, épique et intemporel.",
    dateISO: new Date("2024-01-20").toISOString(),
  },
  {
    id: 7,
    bookId: 10,
    content: "Poétique, simple et profond à la fois.",
    dateISO: new Date("2024-06-15").toISOString(),
  },
  {
    id: 8,
    bookId: 6,
    content: "La philosophie de l’absurde à son sommet.",
    dateISO: new Date("2024-07-21").toISOString(),
  },
]

/**
 * 📚 Jeu de données initial enrichi
 * Inclut des genres, auteurs variés, statuts, ratings, favoris et thèmes
 */
let books = [...initialBooks].map((book) => ({
  ...book,
  cover: getCoverImage()
}))

// 🗒️ Notes liées
let notes = [...initialNotes]

let nextBookId = books.length + 1
let nextNoteId = notes.length + 1

// 🛠️ Fonctions utilitaires
const clampRating = (val) => {
  if (val == null) return null
  const n = Number(val)
  if (Number.isNaN(n)) return null
  return Math.max(0, Math.min(5, Math.round(n)))
}

const toBool = (v) => {
  if (typeof v === "boolean") return v
  if (typeof v === "string") return v.toLowerCase() === "true"
  return Boolean(v)
}

const normalizeBookInput = (payload, existing = {}) => ({
  name: payload.name ?? existing.name,
  author: payload.author ?? existing.author,
  editor: payload.editor ?? existing.editor,
  year: payload.year != null ? Number(payload.year) : existing.year,
  read: payload.read != null ? toBool(payload.read) : existing.read ?? false,
  favorite:
    payload.favorite != null
      ? toBool(payload.favorite)
      : existing.favorite ?? false,
  rating:
    payload.rating != null
      ? clampRating(payload.rating)
      : existing.rating ?? null,
  cover: payload.cover != null ? String(payload.cover) : existing.cover ?? null,
  theme: payload.theme != null ? String(payload.theme) : existing.theme ?? null,
})

const validateBookRequired = (b) => {
  if (!b.name || !b.author || !b.editor || !Number.isFinite(b.year)) {
    return "Champs requis: name, author, editor, year (numérique)."
  }
  return null
}

// 📘 ROUTES LIVRES CRUD
app.get("/books", (req, res) => {
  let result = [...books]
  const { q, author, read, favorite, theme, sort, order } = req.query

  if (q) {
    const s = q.toLowerCase()
    result = result.filter(
      (b) =>
        (b.name && b.name.toLowerCase().includes(s)) ||
        (b.author && b.author.toLowerCase().includes(s))
    )
  }

  if (author)
    result = result.filter(
      (b) => b.author.toLowerCase() === author.toLowerCase()
    )
  if (read !== undefined)
    result = result.filter((b) => b.read === toBool(read))
  if (favorite !== undefined)
    result = result.filter((b) => b.favorite === toBool(favorite))
  if (theme)
    result = result.filter(
      (b) => (b.theme || "").toLowerCase() === theme.toLowerCase()
    )

  if (sort) {
    const key =
      {
        title: "name",
        author: "author",
        theme: "theme",
        year: "year",
        rating: "rating",
      }[sort] || sort
    result.sort((a, b) =>
      (a[key] || "")
        .toString()
        .localeCompare((b[key] || "").toString(), "fr", { sensitivity: "base" })
    )
    if ((order || "").toLowerCase() === "desc") result.reverse()
  }

  res.json(result)
})

app.get("/books/:id", (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id))
  if (!book) return res.status(404).json({ error: "Livre introuvable" })
  res.json(book)
})

app.post("/books", (req, res) => {
  const incoming = normalizeBookInput(req.body)
  const err = validateBookRequired(incoming)
  if (err) return res.status(400).json({ error: err })

  const newBook = { id: nextBookId++, ...incoming }
  books.push(newBook)
  res.status(201).json(newBook)
})

app.put("/books/:id", (req, res) => {
  const idx = books.findIndex((b) => b.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: "Livre introuvable" })

  const merged = normalizeBookInput(req.body, books[idx])
  const err = validateBookRequired(merged)
  if (err) return res.status(400).json({ error: err })

  books[idx] = { id: books[idx].id, ...merged }
  res.json(books[idx])
})

app.delete("/books/:id", (req, res) => {
  const id = Number(req.params.id)
  if (!books.some((b) => b.id === id))
    return res.status(404).json({ error: "Livre introuvable" })

  books = books.filter((b) => b.id !== id)
  notes = notes.filter((n) => n.bookId !== id)
  res.json({ message: "Livre supprimé avec succès" })
})

// 🗒️ ROUTES NOTES
app.get("/books/:id/notes", (req, res) => {
  const id = Number(req.params.id)
  if (!books.some((b) => b.id === id))
    return res.status(404).json({ error: "Livre introuvable" })
  res.json(notes.filter((n) => n.bookId === id))
})

app.post("/books/:id/notes", (req, res) => {
  const id = Number(req.params.id)
  if (!books.some((b) => b.id === id))
    return res.status(404).json({ error: "Livre introuvable" })

  const content = (req.body?.content || "").trim()
  if (!content)
    return res.status(400).json({ error: 'Le champ "content" est requis.' })

  const newNote = {
    id: nextNoteId++,
    bookId: id,
    content,
    dateISO: new Date().toISOString(),
  }
  notes.push(newNote)
  res.status(201).json(newNote)
})

// 📊 ROUTE STATS
app.get("/stats", (req, res) => {
  const totalBooks = books.length
  const readCount = books.filter((b) => b.read).length
  const unreadCount = totalBooks - readCount
  const favoritesCount = books.filter((b) => b.favorite).length
  const rated = books.filter((b) => b.rating != null)
  const averageRating = rated.length
    ? rated.reduce((s, b) => s + b.rating, 0) / rated.length
    : 0

  res.json({
    totalBooks,
    readCount,
    unreadCount,
    favoritesCount,
    averageRating: Number(averageRating.toFixed(2)),
  })
})

// 🔄 RESET DATA
app.post("/reset", (req, res) => {
  books = [...initialBooks]
  notes = [...initialNotes]
  nextBookId = 11
  nextNoteId = 9
  res.json({
    message: "Données en mémoire remises à zéro (jeu enrichi conservé).",
  })
})

app.post("/resetWithFaker", (req, res) => {
  books = [...initialBooks].map((book) => ({
    ...book,
    cover: getCoverImage()
  }))
  notes = [...initialNotes]
  nextBookId = 11
  nextNoteId = 9
  res.json({
    message: "Données en mémoire remises à zéro (jeu enrichi conservé).",
  })
})

app.listen(PORT, () =>
  console.log(`✅ BookList API disponible sur http://localhost:${PORT}`)
)
