import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { faker } from "@faker-js/faker"
import cors from "cors"
import crypto from "crypto"
import dotenv from "dotenv"
import express from "express"
import multer from "multer"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Configuration S3
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
})

const S3_BUCKET = process.env.S3_BUCKET || "book-covers"
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT

// Configuration Multer pour stocker en mémoire
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Type de fichier non autorisé. Seules les images sont acceptées."))
    }
  },
})

const coverWidth = 400
const coverHight = 600
const getCoverImage = () => faker.image.url({ category: "books", width: coverWidth, height: coverHight })

const initialBooks = [
  {
    name: "Dune",
    author: "Frank Herbert",
    editor: "Chilton Books",
    year: 1965,
    read: true,
    favorite: true,
    rating: 5,
    cover: null,
    theme: "Science-Fiction",
  },
  {
    name: "Le Meilleur des mondes",
    author: "Aldous Huxley",
    editor: "Chatto & Windus",
    year: 1932,
    read: false,
    favorite: false,
    rating: 4,
    cover: null,
    theme: "Dystopie",
  },
  {
    name: "1984",
    author: "George Orwell",
    editor: "Secker & Warburg",
    year: 1949,
    read: true,
    favorite: true,
    rating: 5,
    cover: null,
    theme: "Dystopie",
  },
  {
    name: "Fondation",
    author: "Isaac Asimov",
    editor: "Gnome Press",
    year: 1951,
    read: false,
    favorite: false,
    rating: 3,
    cover: null,
    theme: "Science-Fiction",
  },
  {
    name: "Les Misérables",
    author: "Victor Hugo",
    editor: "A. Lacroix, Verboeckhoven & Cie",
    year: 1862,
    read: false,
    favorite: false,
    rating: 4,
    cover: null,
    theme: "Classique",
  },
  {
    name: "L'Étranger",
    author: "Albert Camus",
    editor: "Gallimard",
    year: 1942,
    read: true,
    favorite: false,
    rating: 5,
    cover: null,
    theme: "Philosophique",
  },
  {
    name: "Harry Potter à l'école des sorciers",
    author: "J.K. Rowling",
    editor: "Bloomsbury",
    year: 1997,
    read: true,
    favorite: true,
    rating: 5,
    cover: null,
    theme: "Fantasy",
  },
  {
    name: "Le Seigneur des Anneaux",
    author: "J.R.R. Tolkien",
    editor: "Allen & Unwin",
    year: 1954,
    read: true,
    favorite: true,
    rating: 5,
    cover: null,
    theme: "Fantasy",
  },
  {
    name: "Neuromancien",
    author: "William Gibson",
    editor: "Ace Books",
    year: 1984,
    read: false,
    favorite: false,
    rating: 4,
    cover: null,
    theme: "Cyberpunk",
  },
  {
    name: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    editor: "Reynal & Hitchcock",
    year: 1943,
    read: true,
    favorite: true,
    rating: 5,
    cover: null,
    theme: "Conte philosophique",
  },
]

const initialNotes = [
  {
    bookId: 1,
    content: "Un classique de la SF politique et écologique.",
    dateISO: new Date("2024-05-10").toISOString(),
  },
  {
    bookId: 1,
    content: "Très dense mais fascinant.",
    dateISO: new Date("2024-05-12").toISOString(),
  },
  {
    bookId: 3,
    content: "Une vision glaçante du totalitarisme.",
    dateISO: new Date("2024-04-01").toISOString(),
  },
  {
    bookId: 5,
    content: "Des descriptions magnifiques, mais parfois un peu longues.",
    dateISO: new Date("2024-03-14").toISOString(),
  },
  {
    bookId: 7,
    content: "Idéal pour les plus jeunes lecteurs, mais plaisant à tout âge.",
    dateISO: new Date("2024-02-02").toISOString(),
  },
  {
    bookId: 8,
    content: "Un univers légendaire, épique et intemporel.",
    dateISO: new Date("2024-01-20").toISOString(),
  },
  {
    bookId: 10,
    content: "Poétique, simple et profond à la fois.",
    dateISO: new Date("2024-06-15").toISOString(),
  },
  {
    bookId: 6,
    content: "La philosophie de l'absurde à son sommet.",
    dateISO: new Date("2024-07-21").toISOString(),
  },
]

let books = initialBooks.map((book, index) => ({
  ...book,
  id: index + 1,
  cover: getCoverImage()
}))

let notes = initialNotes.map((note, index) => ({
  ...note,
  id: index + 1,
}))

let nextBookId = books.length + 1
let nextNoteId = notes.length + 1

// Fonctions utilitaires
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
  name: payload.name ?? existing.name ?? "",
  author: payload.author ?? existing.author ?? "",
  editor: payload.editor ?? existing.editor ?? "",
  year: payload.year != null ? Number(payload.year) : existing.year ?? 0,
  read: payload.read != null ? toBool(payload.read) : existing.read ?? false,
  favorite: payload.favorite != null ? toBool(payload.favorite) : existing.favorite ?? false,
  rating: payload.rating != null ? clampRating(payload.rating) : existing.rating ?? null,
  cover: payload.cover != null ? String(payload.cover) : existing.cover ?? null,
  theme: payload.theme != null ? String(payload.theme) : existing.theme ?? null,
})

const validateBookRequired = (b) => {
  if (!b.name || !b.author || !b.editor || !Number.isFinite(b.year)) {
    return "Champs requis: name, author, editor, year (numérique)."
  }
  return null
}

// ENDPOINT UPLOAD
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier fourni" })
    }

    const file = req.file
    const fileExtension = file.originalname.split(".").pop() || "jpg"
    const fileName = `${crypto.randomUUID()}.${fileExtension}`

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    })

    await s3Client.send(command)

    const fileUrl = `${S3_PUBLIC_URL}/${S3_BUCKET}/${fileName}`

    res.status(201).json({
      message: "Image uploadée avec succès",
      url: fileUrl,
      fileName,
    })
  } catch (error) {
    console.error("Erreur lors de l'upload:", error)
    res.status(500).json({
      error: "Erreur lors de l'upload du fichier",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    })
  }
})

// ROUTES LIVRES CRUD
app.get("/books", (req, res) => {
  let result = [...books]
  const { q, author, read, favorite, theme, sort, order } = req.query

  if (q && typeof q === "string") {
    const s = q.toLowerCase()
    result = result.filter(
      (b) =>
        (b.name && b.name.toLowerCase().includes(s)) ||
        (b.author && b.author.toLowerCase().includes(s))
    )
  }

  if (author && typeof author === "string")
    result = result.filter(
      (b) => b.author.toLowerCase() === author.toLowerCase()
    )
  if (read !== undefined)
    result = result.filter((b) => b.read === toBool(read))
  if (favorite !== undefined)
    result = result.filter((b) => b.favorite === toBool(favorite))
  if (theme && typeof theme === "string")
    result = result.filter(
      (b) => (b.theme || "").toLowerCase() === theme.toLowerCase()
    )

  if (sort && typeof sort === "string") {
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

// ROUTES NOTES
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

// ROUTE STATS
app.get("/stats", (req, res) => {
  const totalBooks = books.length
  const readCount = books.filter((b) => b.read).length
  const unreadCount = totalBooks - readCount
  const favoritesCount = books.filter((b) => b.favorite).length
  const rated = books.filter((b) => b.rating != null)
  const averageRating = rated.length
    ? rated.reduce((s, b) => s + (b.rating || 0), 0) / rated.length
    : 0

  res.json({
    totalBooks,
    readCount,
    unreadCount,
    favoritesCount,
    averageRating: Number(averageRating.toFixed(2)),
  })
})

// RESET DATA
app.post("/reset", (req, res) => {
  books = initialBooks.map((book, index) => ({
    ...book,
    id: index + 1,
  }))
  notes = initialNotes.map((note, index) => ({
    ...note,
    id: index + 1,
  }))
  nextBookId = 11
  nextNoteId = 9
  res.json({
    message: "Données en mémoire remises à zéro (jeu enrichi conservé).",
  })
})

app.post("/resetWithFaker", (req, res) => {
  books = initialBooks.map((book, index) => ({
    ...book,
    id: index + 1,
    cover: getCoverImage()
  }))
  notes = initialNotes.map((note, index) => ({
    ...note,
    id: index + 1,
  }))
  nextBookId = 11
  nextNoteId = 9
  res.json({
    message: "Données en mémoire remises à zéro (jeu enrichi conservé).",
  })
})

app.listen(PORT, () =>
  console.log(`✅ BookList API disponible sur http://localhost:${PORT}`)
)