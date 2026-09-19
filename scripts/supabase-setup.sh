#!/usr/bin/env bash
# One-shot cloud setup: log in, link the project, push the schema, then verify it.
#   npm run supabase:setup
# You approve the login in your browser and type the database password when asked.
# Nothing here reads, prints or stores that password beyond this one process.
set -euo pipefail
cd "$(dirname "$0")/.."

set -a
# shellcheck disable=SC1091
. ./.env.local
set +a

URL="${NEXT_PUBLIC_SUPABASE_URL:?NEXT_PUBLIC_SUPABASE_URL is missing from .env.local}"
ANON="${NEXT_PUBLIC_SUPABASE_ANON_KEY:?NEXT_PUBLIC_SUPABASE_ANON_KEY is missing from .env.local}"
REF="$(echo "$URL" | sed -E 's#https://([a-z0-9]+)\.supabase\.co.*#\1#')"

case "$URL" in
  https://*.supabase.co*) ;;
  *) echo "NEXT_PUBLIC_SUPABASE_URL is not a cloud project URL ($URL). Refusing to continue."; exit 1 ;;
esac

echo "Project ref: $REF"
echo

echo "1/4  Logging in (a browser window opens: approve it)…"
npx supabase login

echo
echo "2/4  Linking the project…"
npx supabase link --project-ref "$REF"

echo
echo "3/4  Pushing the schema: this creates all tables, policies and the media/videos buckets."
echo "     It never runs the seed and never resets anything."
npx supabase db push

echo
echo "4/4  Checking the result with the public anon key…"
for table in posts case_studies video_testimonials; do
  code="$(curl -s -o /dev/null -w '%{http_code}' "$URL/rest/v1/$table?select=id&limit=1" -H "apikey: $ANON")"
  printf '  %-20s %s %s\n' "$table" "$code" "$([ "$code" = 200 ] && echo ok || echo 'NOT READY')"
done
code="$(curl -s -o /dev/null -w '%{http_code}' "$URL/rest/v1/pages?select=slug,content,seo&limit=1" -H "apikey: $ANON")"
printf '  %-20s %s %s\n' "pages" "$code" "$([ "$code" = 200 ] && echo ok || echo 'NOT READY')"
code="$(curl -s -o /dev/null -w '%{http_code}' "$URL/rest/v1/leads?select=id&limit=1" -H "apikey: $ANON")"
printf '  %-20s %s %s\n' "leads (anon must be denied)" "$code" "$([ "$code" = 401 ] || [ "$code" = 403 ] && echo ok || echo 'CHECK THIS')"

signup="$(curl -s "$URL/auth/v1/settings" -H "apikey: $ANON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('disable_signup'))")"
echo
if [ "$signup" = "True" ]; then
  echo "Public sign-ups: OFF. Good."
else
  echo "Public sign-ups are still ON. Turn them off now:"
  echo "  https://supabase.com/dashboard/project/$REF/auth/providers  →  Email  →  disable 'Allow new users to sign up'"
fi
echo
echo "Next: Authentication → Users → Add user (your email), then tell Claude the email."
