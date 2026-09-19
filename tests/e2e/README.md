# Database security checks

`security.mjs` exercises the RLS policies and the security-definer functions against a **local** Supabase
(it refuses to run against anything else). It needs Docker:

```bash
npx supabase start
npx supabase db reset
eval "$(npx supabase status -o env | grep -E '^(API_URL|ANON_KEY|SERVICE_ROLE_KEY)=' | sed 's/^/export /')"
node tests/e2e/security.mjs
```

The service-role key is only used by this script to create throwaway test users; the app itself never has it.
These checks are not part of CI (CI has no database); run them before pushing a migration.
