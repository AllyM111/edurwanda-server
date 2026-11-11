# Security & bug-fix changes

## Do these after deploying
0. **Run the database migration** (adds 4 new tables, changes nothing existing):
   `npx prisma migrate deploy` then `npx prisma generate`
   (migration `20261110120000_exam_reader_and_rate_limit`).
1. **Rotate the admin password** (the old one was committed in git history). Use
   `reset-admin-password.js` with env vars (see the script header).
2. **Set `MAIN_ADMIN_EMAIL`** in your server environment (see `.env.example`).
   It replaces the email that used to be hardcoded in `routes/users.js`.
3. Optional: `npm uninstall bcrypt recharts` (unused). No new packages are required.
4. Set `CORS_ORIGINS` if your frontend domain differs from the defaults.

## Server
- Auth required (`protect` + `adminOnly`) on book/exam create/update/delete, analytics, settings
  writes; comments require login; delete only by author or admin.
- Blocked users can no longer log in or use an existing token; `lastLogin` is recorded.
- Login/register: rate limited, email normalised, password 8–72 chars, honours
  `allowRegistration`, no timing leak for unknown emails.
- Users: role/status validated; cannot demote/block/delete yourself, the main admin, or the last admin.
- Uploads: size limit, PDF/image type + PDF magic-byte check, unique Cloudinary names (no overwrites).
- Downloads: safe `Content-Disposition`, stream error handling, host allow-list,
  honours `allowBookDownloads` / `allowExamDownloads`.
- Reader: fixed bookmark/note/progress (string ids, `book-13` keys), owner-only deletes,
  no duplicate-bookmark 500s; added the missing `/view`, `/stats`, `/download` routes.
- Settings validated + `/settings/logo` and `/settings/favicon` upload routes added.
- YouTube: whitelisted fields, URL validation, once-per-visitor view counting.
- Analytics: admin only, year-aware, computed in SQL.
- Security headers, body size limit, proxy-aware IPs, real DB health check, no query logging in production,
  errors no longer leak internals, graceful shutdown.
- Removed dead/empty files and `backend-tree.txt`; admin scripts no longer contain secrets.

## Client
- Reader keys no longer double-prefixed; downloads use the configured API URL (not the old Railway URL).
- Login response (contains the JWT) is no longer logged.
- Expired/blocked sessions are logged out immediately.
- Download buttons hidden when an admin disables downloads; exam views are counted.
- Comments component moved to `components/comments/` (its imports were broken) and made login-aware.

## Added in round 2
- **Exam reading data is now saved on the server** (progress, bookmarks, notes) in new tables
  `ExamReadingProgress`, `ExamBookmark`, `ExamNote`.
- **Rate limits for login, register and comments are stored in PostgreSQL** (table `RateLimit`):
  they survive restarts and are shared by all instances. Falls back to memory if the database is
  unreachable. Expired counters are purged every 15 minutes. (The general 300 req/min limit and the
  once-per-visitor view counting stay in memory on purpose: they are high-volume and low-risk.)
- **Cloudinary files are deleted** when a book/exam/channel is deleted or its file is replaced, and when a
  create fails after uploading. Only files inside the `edurwanda/` folder of your own cloud are ever
  touched, and a file still used by another record is kept.
- **Maintenance mode is enforced**: while on, the API returns 503 for everyone except admins
  (login, public settings and health stay available), and the site shows a maintenance page.
- Client: removed dead files (`src/api/`, `AdminYoutube.jsx`) and 22 leftover `console.log` calls.

## Added in round 3
- **Uploads over 10 MB:** Cloudinary's free plan rejects files over 10 MB, so the default upload limit is now
  10 MB (`UPLOAD_MAX_MB`). The admin sees a clear message (e.g. "This file is 15.0 MB but the storage plan only
  accepts files up to 10.0 MB") instead of "Book creation failed", and the admin forms check the size before
  uploading. To allow bigger files, upgrade the Cloudinary plan (then raise `UPLOAD_MAX_MB` on the server and
  `VITE_MAX_UPLOAD_MB` on the client) or move PDFs to other storage.
- **SEO / social metadata (client):** rewritten `index.html` (title, description, canonical, robots, theme colour,
  icons + manifest, Open Graph, Twitter card, JSON-LD for Organization + WebSite search), a real
  `public/og-image.png` (the old tags pointed at a file that did not exist), `robots.txt`, `sitemap.xml`.
  Every page now sets its own title/description/canonical (`RouteMeta`, `usePageMeta`); book and exam pages
  also add Book / LearningResource structured data and use the cover as the preview image; login, register,
  search and the dashboard are `noindex`.
- **Server `/sitemap.xml`** lists every book and exam page (cached 1 hour); `robots.txt` points to it.
- Set `VITE_SITE_URL` (client) and `SITE_URL` (server) to your real public address. They default to
  `https://edurwanda-lake.vercel.app`; `public/robots.txt` and `public/sitemap.xml` are plain files, so edit the
  address there by hand if it differs.

## Known limitations
- Old exam bookmarks/notes created before this update were never saved, so there is nothing to migrate.
- Cloudinary files uploaded before this update are only cleaned up when their record is deleted/replaced.
- Maintenance state is cached for 10 seconds per server instance.
