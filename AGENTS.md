# Noor Al-Furqan — Project Rules

## Accounts and backend
- Supabase Auth is the only account system; Firebase Auth is not used for users. Keep sign-up, sign-in, password reset and route protection on it so one identity owns every screen.
- Firebase remains only for legacy Firestore data paths (settings, social, memorization, Pro, bookmarks) until they are migrated. Do not add new features that store user identity there.
- Every table created in `public` must be followed in the same migration by explicit `GRANT`s to the roles its policies allow (`anon` only for public-read tables), because the Data API grants no default privileges on `public` — RLS alone leaves the app unable to read or write the table.
- `public.profiles` stores `email`, `username` and `display_name`, written by the `handle_new_user()` signup trigger. Read profile fields from that table rather than auth metadata so admin screens and search work.
- Usernames are unique at the database level on the normalized form: `profiles.username_search` (unique index) is maintained by the signup trigger and compared through `public.normalize_username` (lowercase, trim, strip Arabic diacritics, unify alef/ya). The trigger must fall back to a derived unique username instead of raising, and the sign-up form pre-checks availability through the `is_username_taken` RPC — a unique-violation inside the trigger aborts account creation with an unreadable 500.
- Username login resolves the account email through the `get_email_by_username` RPC (security definer); the client must surface lookup failures as a generic invalid-credentials error so responses never reveal whether a username exists. Client-side username format rules live in `src/lib/usernameRules.ts` and must stay in sync with `normalize_username`.
- Roles live only in `public.user_roles` and are read through `has_role()`; never derive privileges from user-editable metadata.
- Paid Quran AI access is verified server-side against `public.pro_entitlements`; only trusted admin/payment paths write subscriptions, because legacy client Pro flags cannot authorize billed AI.
- Quran AI generates references only; render verse text from the runtime Quran corpus and discard invalid references to avoid invented scripture.
- Quran topic model calls stay in the authenticated Edge Function using request-local Responses SDK helpers; provider denials are persisted server-side to prevent repeated blocked calls.

## Verification
- Auth changes must be exercised in the running preview (sign-up, sign-in, refresh, sign-out, protected route, password reset), not only type-checked.
- Database state is shared between the preview and the published app, so temporary auth settings must be reverted in the same turn they are changed.
