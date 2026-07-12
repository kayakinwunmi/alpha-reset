// Database table names, centralised. All tables are prefixed "ar_" so this
// app can share a Supabase project with other apps without name collisions.
// If tables are ever renamed again, this is the only code file to change
// (plus a rename migration — see supabase-migration-3.sql for the pattern).

export const T = {
  signups: "ar_signups",
  sessions: "ar_sessions",
  registrations: "ar_registrations",
  messages: "ar_messages",
  emailLog: "ar_email_log",
  emailTemplates: "ar_email_templates",
} as const;
