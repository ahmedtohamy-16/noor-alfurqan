# Plan: move everything to a Supabase project owned by tohamy.projects@gmail.com

Nothing is changed until you approve. Block, unblock and role controls stay disabled throughout (step 6).

## 1. Current state (checked this turn, read-only)

- **Everything on the backend runs on Lovable Cloud today.** Sign-in, profiles, user_roles, favorites, pro_entitlements, the post-media bucket and the moderate-content function all live in the one Cloud project.
- **No external Supabase project is connected.** Connectors linked to this project: Google Search Console only. Ahmed's LinkedIn exists in the workspace but isn't linked.
- **Data size:** 10 sign-in accounts (not 8 or 9). All of them use email and password; none use Google. 5 favorites, 0 Pro entitlements, 0 files in post-media.
- **Tables (41):** account_recovery_requests, admin_messages, admin_users, app_settings, asma_favorites, audio_generation_log, azkar, azkar_categories, blocked_users, cities, conversations, countries, course_enrollments, course_lessons, daily_wird, favorites, hadith_shares, khatmah_participants, khatmahs, messages, notification_history, notification_logs, otp_codes, pro_entitlements, profile_changes_log, profiles, push_subscriptions, quiz_attempts, quiz_questions, quizzes, quran_ai_service_state, reading_progress, reading_sessions, security_questions, tasbih_stats, teacher_files, user_azkar_progress, user_reading_settings, user_roles, user_settings, user_story_preferences. There is also the view public_profiles and the enum app_role.
- **Access rules:** 104 in total. The migration copies them unchanged from the migration files in `drizzle/migrations` and `supabase/migrations`.
- **Triggers:** on_auth_user_created (on the accounts table), plus profiles_guard_protected_columns, profiles_sync_username_search (insert and update), update_khatmahs_updated_at and update_user_story_preferences_updated_at.
- **Functions (17):** check_username_available, cleanup_expired_otps, generate_invite_code, get_email_by_username, get_khatmah_invite_code, get_usage_stats, guard_profile_protected_columns, handle_new_user, has_role, increment_hadith_share, is_reserved_username, is_username_taken, join_khatmah_by_code, list_public_profiles, normalize_username, sync_username_search, update_updated_at_column.
- **Storage buckets:** post-media (public, empty) and database_export_28_10_26 (private).
- **Edge functions (10):** hadith-api, moderate-content, prophet-story-audio, quran-topic-suggestions, register-push-token, scheduled-notifications, send-otp, send-push-notification, test-notification, verify-otp.
- **Secrets these functions use:** LOVABLE_API_KEY (AI features), FIREBASE_SERVICE_ACCOUNT, VITE_FIREBASE_VAPID_KEY (push), Api_key_testmail, Namespace, GOOGLE_SEARCH_CONSOLE_API_KEY.

## 2. What you need to create or connect

- **A new Supabase project under tohamy.projects@gmail.com.** You create it yourself on supabase.com.
  - Pick the region closest to your users, for example eu-central-1 (Frankfurt) for Egypt and the Gulf. Tell me which one you choose.
  - Pick the Free or Pro plan. Pro gives daily backups and no pausing.
- **Important limit:** Lovable Cloud can't be removed from this Lovable project, and it can't be switched to an external Supabase project. The supported route:
  1. Remix this project into a new Lovable project, or export it through GitHub.
  2. In the new copy, connect your Supabase project through Lovable's **Supabase integration** (Settings → Integrations → Supabase), signed in as tohamy.projects@gmail.com.
  3. Point the custom domains (nooralfurqan.app) at the new project when you cut over.
- **Secrets** go in only through the secure secrets form in the new project, never in chat. These are FIREBASE_SERVICE_ACCOUNT only if push stays on Firebase, and an email-provider key.
- **AI features** (Quran AI, content moderation) depend on LOVABLE_API_KEY. In an external project that key may not be provided automatically. You may need an AI provider key (for example OpenAI), and the cost would then be billed to you.

## 3. Firebase usage and replacements

`src/lib/firebase.ts` sets up Firebase sign-in, the Firestore database and push messaging. 33 files still import it or its helpers:

| Area | Files | Reads or writes in Firebase | Supabase replacement |
|---|---|---|---|
| Old sign-in and role helpers | lib/firebase.ts, useAuth.tsx (leftovers), services/userService.ts, profileService.ts | users, user_roles, profiles documents | Delete: sign-in already uses Supabase |
| Settings and theme | useUserSettings, useReadingSettings, useTheme, ReciterSelector, ReciterSettingsPanel, PrayerExportDialog | user settings documents | user_settings, user_reading_settings tables |
| Worship stats | useTasbih, useDailyWird, useReadingProgress, useReadingStats, useAdvancedStats | tasbih, wird, progress | tasbih_stats, daily_wird, reading_progress, reading_sessions |
| Favorites and bookmarks | useFavorites (Firebase fallback), useHadithBookmarks, usePinnedHadith | favorites, hadith bookmarks | favorites + new hadith_bookmarks table |
| Memorization | useMemorization | memorization documents | new memorization table |
| Pro | usePro, ProRedeemCard, ProRedeemCodeManager, ProAdminsManager | pro status, redeem codes, Pro admins | pro_entitlements + new redeem_codes table; admins via user_roles |
| Khatmah, messages, teacher | KhatmahPage, MessagesPage, TeacherDashboard, services/lessonService | khatmah, chats, lessons | existing khatmahs, conversations, messages, course_* and teacher_files tables |
| Admin | AdminPage, UserManagementPage | users list, stats | profiles, user_roles, get_usage_stats |
| Notifications | NotificationsPage, useFCMNotifications, ProphetStoriesPage | notifications; push tokens | notification_history, push_subscriptions |
| Guest data | services/guestDataService.ts | moves guest data into the account | the same tables above |
| Support | services/supportService.ts | support_tickets | new support_tickets table |

- **Data to migrate from Firebase:** probably none. Firestore returned "Database '(default)' not found" earlier, so there seems to be no Firestore data at all. First step: confirm this read-only in the Firebase console (you do it, or I check it with your approval).
- **Push notifications:** Supabase can't deliver push messages itself. Two options:
  - (a) Keep Firebase Cloud Messaging for delivery only. No user data stays in Firebase.
  - (b) Switch to standard Web Push with VAPID keys. Firebase is gone completely, but iOS and Android app wrappers need extra work.

## 4. Moving the accounts (user IDs and passwords kept)

- Supabase stores passwords as standard bcrypt hashes. So `auth.users` and `auth.identities` rows can be copied row for row:
  - The same IDs carry over.
  - The same password hashes carry over, so users log in with their current password.
  - The email-confirmed status carries over too.
- **How:**
  1. I export the 10 account rows with a read-only query.
  2. The rows go into a private file. Password hashes are never shown in chat.
  3. You run the insert script in the new project's SQL editor (needs the owner's dashboard), before the signup trigger is created.
  4. Then the profiles, user_roles and all app tables are copied with the same IDs.
- **What breaks:**
  - Everyone is signed out once, because sessions don't transfer. They sign in again with the same password.
  - Password-reset links and email codes sent before the switch stop working.
- **If the copy fails:** fall back to resetting passwords. The IDs stay the same and each user gets a password-reset email.

## 5. Risks, order, downtime, rollback

**What could break, and how it's handled:**
- **Login:** after the switch the app uses the new project's address and public key. Sign-in, refresh and sign-out are tested in the preview before the domain switch.
- **Accounts trigger (on_auth_user_created):** created after the accounts are imported, so imported accounts don't get duplicate profiles. Then a new signup is tested.
- **Username rules:** check rules, the unique index and the reserved list are recreated. Existing usernames are checked against them before import.
- **Admin role:** user_roles rows are copied with the same IDs. Read access through has_role is tested with a regular account only, because you asked me not to sign in as admin.
- **Confirmation emails:** the new project uses Supabase's default sender, which has low limits. The 6-digit code email still needs your own email domain or SMTP set up in the dashboard (you do this).
- **Google sign-in:** not set up today (all accounts use email). It needs a Google OAuth client and the redirect address added in the dashboard (you do this).
- **AI features:** need a model key (see section 2).
- **Push notifications:** see section 3.

**Order:**
1. You create the Supabase project and pick the region.
2. You confirm Firestore is empty. You choose what replaces push and AI.
3. Remix or export this project. Connect your Supabase project to the copy.
4. Recreate the schema in the new database: types, tables, permissions, access rules, functions, the view, and the triggers except the accounts trigger.
5. Import the accounts (you, in the SQL editor), then the app data with the same IDs. Then create the accounts trigger.
6. Recreate the two storage buckets (no files to copy) and their access rules.
7. Deploy the 10 edge functions and add the secrets through the secure form.
8. Move each Firebase area in section 3 over to Supabase. Delete `src/lib/firebase.ts` and the firebase package.
9. Test in the preview: sign-up, sign-in, refresh, sign-out, a protected page, password reset, username change, blocked screen, favorites, khatmah, support ticket.
10. Publish the new project, move nooralfurqan.app to it, and freeze the old project.

**Downtime:** about 15–30 minutes, only during step 5 and the domain switch. Changes made in the old app after the export would be lost, so writes are frozen during the switch.

**Rollback:** the old project isn't touched, so point the domain back at it. Accounts that signed up on the new project after the switch would need copying back manually.

**Steps you do yourself in the Supabase dashboard:**
- Create the project.
- Import the accounts.
- Set up SMTP and the email domain.
- Set up the Google OAuth client.
- Set the auth redirect addresses and the Site URL.
- Turn on backups.

## 6. Locked during the migration

The user-management block, unblock and role controls stay disabled, with the current note, until you approve otherwise.

## Open questions

1. Is a new Lovable project (remix) connected to your Supabase project acceptable? The current project can't drop Lovable Cloud.
2. Which region and plan?
3. Push notifications: keep Firebase for delivery only, or move fully to Web Push?
4. AI features: will you provide your own AI provider key, or should those features be turned off in the new project?
5. Can you confirm in the Firebase console that Firestore has no data? Or do I check it read-only with your approval?
6. Accounts: copy with password hashes (users keep their passwords), or ask everyone to reset their password?
7. Copy the leftover tables for the education platform (courses, quizzes, teacher files) and messages too, or leave them out?
