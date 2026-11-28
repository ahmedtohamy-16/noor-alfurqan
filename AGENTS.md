# Noor Al-Furqan — Project Rules

## Accounts and backend
- Supabase Auth is the only account system; Firebase Auth is not used for users. Keep sign-up, sign-in, password reset and route protection on it so one identity owns every screen.
- Firebase remains only for legacy Firestore data paths (settings, social, memorization, Pro, bookmarks) until they are migrated. Do not add new features that store user identity there.
- Every table created in `public` must be followed in the same migration by explicit `GRANT`s to the roles its policies allow (`anon` only for public-read tables), because the Data API grants no default privileges on `public` — RLS alone leaves the app unable to read or write the table.
- `public.profiles` stores `email`, `username` and `display_name`, written by the `handle_new_user()` signup trigger. Read profile fields from that table rather than auth metadata so admin screens and search work.
- Usernames are `[a-z0-9_]{3,20}`, not reserved (`is_reserved_username`), and unique on `lower(username)`, enforced by CHECK constraints and a unique index; clients check availability via the `check_username_available` RPC. The signup trigger must fall back to a derived valid unique username instead of raising, because a constraint violation inside it aborts account creation with an unreadable 500.
- Username login resolves the account email through the `get_email_by_username` RPC (security definer); the client must surface lookup failures as a generic invalid-credentials error so responses never reveal whether a username exists. Client-side username rules (Zod) live in `src/lib/usernameRules.ts` and must stay in sync with the database constraints.
- Other users' profiles are read only through the `public_profiles` view (security_invoker; id, username, display_name); `anon` has column SELECT on only those three columns, and signed-in users have column UPDATE on `username`, `display_name`, `is_blocked`, with the `guard_profile_protected_columns` trigger rejecting non-admin `is_blocked` changes and any `id`/`email` change, so private fields never leak or change.
- Blocking is `profiles.is_blocked`, set by admins only; `ProtectedRoute` shows a blocked screen instead of the page.
- Roles live only in `public.user_roles` and are read through `has_role()`; never derive privileges from user-editable metadata.
- Paid Quran AI access is verified server-side against `public.pro_entitlements`; only trusted admin/payment paths write subscriptions, because legacy client Pro flags cannot authorize billed AI.
- Quran AI generates references only; render verse text from the runtime Quran corpus and discard invalid references to avoid invented scripture.
- Quran topic model calls stay in the authenticated Edge Function using request-local Responses SDK helpers; provider denials are persisted server-side to prevent repeated blocked calls.

## Verification
- Mobile navigation uses the shared portalled MobileMenu sheet, outside sticky/backdrop-filter ancestors, to avoid clipped overlays and keep controls consistent.
- Use displayFormat for time-based greetings and Arabic count labels; numeral-only displays use the arabic-digits fallback font to avoid missing glyphs.
- Auth changes must be exercised in the running preview (sign-up, sign-in, refresh, sign-out, protected route, password reset), not only type-checked.
- Database state is shared between the preview and the published app, so temporary auth settings must be reverted in the same turn they are changed.
- Quran ayah audio comes from everyayah.com (CORS-enabled, SSSAAA.mp3) via `getAyahAudioUrl`; stop/advance logic lives in `src/lib/playbackRules.ts` and the player uses one shared audio element, so modes, repeats and background playback stay consistent.
- Downloaded ayah audio is stored on-device (IndexedDB blobs + localStorage metadata) by `src/lib/ayahDownloads.ts`, shown on /downloads; all ayah/range download buttons queue through it so status, retry and delete stay in one place.
- Same-surah range downloads decode one verse at a time and encode one continuous MP3 in a worker; enforce device storage limits across concurrent queue jobs and await IndexedDB transaction completion before marking files saved.
- Audio storage quotas are synchronized globally from the signed-in user's Supabase pro_entitlements, never legacy Firebase flags or persisted client overrides; subscription expiry/sign-out lowers the limit without deleting existing files.
- Surah reading position uses the first ayah crossing the line beneath the sticky reading bar and runtime corpus page/juz metadata, so its page indicator follows scrolling rather than the surah's starting page.
- Ayah menus open on a completed stationary pointer gesture, not pointer-down, and dismiss on scroll/touchmove/wheel so scrolling never opens or carries a verse menu.
- Dhikr catalogue icons use an explicit subject-based mapping per section, avoiding shared keyword matches that give related sections identical glyphs.
- Daily azkar are derived from the bundled source with stable morning/existing IDs and a separate evening ID; only documented evening variants are applied and mismatched recordings are omitted to preserve text/audio accuracy and existing progress.
- Dhikr reading renders Quran excerpts as separate blocks with global Quran font/size settings and a safe minimum line height so vowel marks cannot collide between lines.
- The daily wird reminder is shown by `WirdReminderScheduler` (rules in `src/lib/wirdReminderRules.ts`) while the app is open; it fires once per day, so settings toggles always have a real effect without a server push job.
- Reading stats count a mushaf page only after it stays visible for a dwell time in SurahPage, so opening a surah alone never records reading.
- Hadiths use shared CSV mapping; snapshot hydration is display-only to preserve saved records.
- PWA uses guarded generateSW and a separate messaging scope to protect previews and pushes.
- Shared numeral/location/reference rules keep UI and notifications consistent; verse hearts resolve the runtime corpus and retain existing storage.
- Image exporters share one branding URL to avoid hosting-domain leaks.
- Personal preferences/progress use account-scoped user_state RPCs and useSyncedState with batched changed-field writes; legacy wrappers bridge only an explicit personal allowlist, never roles, Pro or shared content.
- Prayer screens and notification jobs share _shared/prayerTimeRules with location-zone dates and absolute instants, so device timezones cannot change the prayer schedule.
- Partial Quran text downloads are read explicitly from CacheStorage; only a verified complete corpus may back the generic loader, to prevent incomplete scripture views.
- Profile avatars use private UID-scoped storage and signed URLs; identity/ban guards remain authoritative.

- All verse exporters share verseShareImage and locally loaded Quran/UI fonts; render the same full-text canvas for preview and download to prevent truncation, shaping drift or layout divergence.
