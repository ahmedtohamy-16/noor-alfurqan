# Roadmap

## Done
- Hosted backend confirmed enabled and healthy; applied the missing data-access permissions to every table, which is what stopped the app from saving or loading anything.
- Added and backfilled the account email on the profile record; the signup trigger now stores email and display name.
- A taken username no longer breaks account creation: the trigger falls back to a unique variant, the sign-up form warns before sending, and the failure message is Arabic.
- The settings screen's admin check moved off the old database path onto the hosted backend.
- Verified in the running preview: signed-in data loads, protected pages redirect with a return path, wrong-password and unconfirmed-account messages, verify-email card with resend, password-reset request, sign-out, clean build.
- Removed the throwaway test accounts created while testing.
- Removed the student/teacher choice from the sign-up form; accounts are created without a role prompt and roles stay managed only in the database.

## Open
- Add Pro-only Quran topic suggestions with server-side access checks, verified verse references, and live AI verification.
- Real password sign-in has not been watched end to end: a new account must open a confirmation email first, and no readable mailbox is connected to this workspace. Blocked on: an inbox the agent can read, or the user opening one confirmation link.
