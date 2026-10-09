# Backend – admin, API and database

Next.js 15 + Auth.js (next-auth v5) + Prisma + Neon PostgreSQL + Cloudinary.

```bash
npm install
cp .env.example .env
npm run db:migrate && npm run db:seed
npm run dev          # http://localhost:3001  (admin at /admin)
npm run lint && npm run build && npm run start
```

## Environment (`.env`)
See `.env.example` – every variable is commented. Key points:
- `DATABASE_URL` = Neon **pooled** string, `DIRECT_URL` = Neon **direct** string (used by migrations).
- `AUTH_SECRET` must be a long random value; `AUTH_URL` must be the public URL of this backend.
- `FRONTEND_API_KEY` / `REVALIDATE_SECRET` must match the frontend's `BACKEND_API_KEY` / `REVALIDATE_SECRET`.

## Routes
| Route | Access |
|---|---|
| `/admin/login`, `/admin`, `/admin/enquiries`, `/admin/enquiries/[id]`, `/admin/messages`, `/admin/projects`, `/admin/projects/new`, `/admin/projects/[id]`, `/admin/gallery` | signed-in admin |
| `POST /api/admin/upload-signature` | signed-in admin |
| `GET /api/public/projects`, `GET /api/public/gallery` | public, read-only |
| `POST /api/public/enquiries` | frontend only (`x-api-key`) |
| `/api/auth/*` | Auth.js |
| `GET /api/health` | public |

## Database
`prisma/schema.prisma`, migration in `prisma/migrations/`. Models: Enquiry, ContactSubmission, Project, ProjectImage, GalleryImage, AdminUser. Use `npm run db:studio` to browse data.
