npm install
npm run start

🔗 Endpoints
Livres

GET /books

Query optionnelles :

q=... (recherche dans name/author)

author=...

read=true|false

favorite=true|false

theme=...

sort=title|author|theme|year|rating + order=asc|desc

GET /books/:id

POST /books

PUT /books/:id

DELETE /books/:id

Notes d’un livre

GET /books/:id/notes

POST /books/:id/notes (body: { "content": "..." })

(optionnel) DELETE /books/:id/notes/:noteId

Statistiques

GET /stats → { totalBooks, readCount, unreadCount, favoritesCount, averageRating }

Outil formateur (optionnel)

POST /reset → réinitialise les données en mémoire
