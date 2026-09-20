#!/usr/bin/env bash
# Mechanical rule enforcement — the greppable subset of .claude/rules/.
# PostToolUse hook on Edit|Write. Exit 2 = block + feed stderr back to Claude.
#
# Only checks that are DETERMINISTIC and false-positive-free belong here.
# Anything needing judgement stays prose in .claude/rules/.

set -uo pipefail
f=$(jq -r '.tool_input.file_path // empty' 2>/dev/null) || exit 0
[ -z "$f" ] || [ ! -f "$f" ] && exit 0

case "$f" in
  */node_modules/*|*/.next/*|*/.claude/*) exit 0 ;;
esac

v=()
add() { v+=("$1"); }

# ---- any file ----
case "$f" in
  *.ts|*.tsx)
    grep -qE 'from "\.\.' "$f" && add "relative ../ import → use @/ alias (04-CLIENT_SERVER)"
    grep -qE ':\s*any\b' "$f" && add "': any' type → use a real type (99-CHECKLIST M)"
    # logger.ts IS the console wrapper; lib/ and Icons.tsx ARE the sanctioned barrels
    case "$f" in
      */utils/logger.ts|utils/logger.ts) ;;
      *) grep -qE '\bconsole\.(log|error|warn|info|debug)\b' "$f" && add "console.* → use logger from @/utils/logger (04-CLIENT_SERVER)" ;;
    esac
    case "$f" in
      */lib/gsap.ts|lib/gsap.ts) ;;
      *) grep -qE 'from "gsap"|from "gsap/' "$f" && add "direct gsap import → use @/lib/gsap (04-CLIENT_SERVER)" ;;
    esac
    case "$f" in
      */lib/lenis.ts|lib/lenis.ts) ;;
      *) grep -qE 'from "lenis"' "$f" && add "direct lenis import → use @/lib/lenis (04-CLIENT_SERVER)" ;;
    esac
    case "$f" in
      */components/ui/Icons.tsx|components/ui/Icons.tsx) ;;
      *) grep -qE 'from "react-icons/' "$f" && add "direct react-icons import → use @/components/ui/Icons (04-CLIENT_SERVER)" ;;
    esac
    ;;
esac

# ---- JSX/TSX components only ----
case "$f" in
  *.tsx)
    # strip comment lines first: a file may legitimately DOCUMENT the ban
    grep -vE '^\s*(//|\*|/\*)' "$f" | grep -qE 'style=\{\{' \
      && add "style={{ }} is BANNED — use Tailwind utility/arbitrary class (03-CSS_TOKENS)"
    grep -qE 'className="[^"]*\bsm:' "$f" && add "sm: prefix is BANNED (03-CSS_TOKENS)"
    grep -qE 'className="[^"]*\bz-\[' "$f" && add "arbitrary z-index → use named class from base.css (03-CSS_TOKENS)"
    grep -qE 'className="[^"]*(text|font|bg|border)-\(--' "$f" && add "raw CSS-var utility in JSX → use semantic token (03-CSS_TOKENS)"
    grep -qE 'className="[^"]*\btext-(xs|sm|base|lg|xl|[2-9]xl)\b' "$f" \
      && add "Tailwind text-size utility → use semantic class from base.css (03-CSS_TOKENS)"
    grep -qE 'className="[^"]*\btext-(gray|slate|zinc|neutral|stone|red|blue|green|yellow|indigo|purple|pink)-[0-9]' "$f" \
      && add "Tailwind palette color → use semantic token (03-CSS_TOKENS)"
    # hex is legitimate in Metadata API values (themeColor) and in raw HTML strings
    # handed to non-React libs (Leaflet divIcon) — CSS vars do not resolve there.
    # Legitimate hex: Metadata API values (need literals) and raw HTML strings handed to
    # non-React libs (Leaflet divIcon) — CSS vars do not resolve in either.
    # Map libraries (Leaflet/MapLibre) take raw HTML or style STRINGS for markers;
    # CSS custom properties do not resolve inside those, so literal hex is required.
    if ! grep -qE 'divIcon|dangerouslySetInnerHTML|maplibre|leaflet|new Marker|setIcon' "$f"; then
      if grep -E '#[0-9a-fA-F]{3,6}\b' "$f" | grep -qvE 'themeColor|background_color|theme_color'; then
        add "hardcoded hex color → use CSS variable / semantic token (03-CSS_TOKENS)"
      fi
    fi
    # next/link: only TransitionLink may import it
    case "$f" in
      */TransitionLink.tsx|TransitionLink.tsx) ;;
      *) grep -qE 'from "next/link"' "$f" && add "next/link → use @/components/ui/TransitionLink (04-CLIENT_SERVER)" ;;
    esac
    case "$f" in
      */contexts/TransitionContext.tsx|contexts/TransitionContext.tsx|*/contexts/TranslationContext.tsx|contexts/TranslationContext.tsx) ;;
      # Rendered OUTSIDE PageShell and owning their own exit animation, so
      # navigateTo has no pageRef to work with. Documented at each call site.
      */RoleGate.tsx|*/ModeSwitch.tsx) ;;
      *) grep -qE '\brouter\.push\(' "$f" && add "router.push() → use navigateTo() from TransitionContext (06-TRANSITIONS)" ;;
    esac
    case "$f" in
      */contexts/ScrollContext.tsx|contexts/ScrollContext.tsx) ;;
      *) grep -qE '\bwindow\.scrollTo\(' "$f" && add "window.scrollTo → use scrollToTop() from useScroll (06-TRANSITIONS)" ;;
    esac
    grep -qE '\btabIndex=\{[1-9]' "$f" && add "positive tabIndex → only 0 and -1 allowed (08-ACCESSIBILITY)"
    grep -qE '<(div|span)[^>]*\sonClick=' "$f" && add "<div|span onClick> → use real <button> or <a> (08-ACCESSIBILITY)"

    # ---- FUNDAMENTAL: arbitrary value where a token/scale entry already exists ----
    # Only flags values that provably duplicate an existing token. Anything with
    # clamp/calc/ch/vh/vw/% or a grid template is a legitimate arbitrary value.
    grep -qE 'className="[^"]*\brounded-\[' "$f" \
      && add "rounded-[…] → use rounded-sm|md|lg|xl|full, the tokens exist (03-CSS_TOKENS)"
    grep -qE 'className="[^"]*\btext-\[[0-9.]+(rem|px)\]' "$f" \
      && add "text-[fixed size] → use a semantic class from base.css (03-CSS_TOKENS)"

    # ---- FUNDAMENTAL: one component per file ----
    # Icons.tsx is the sanctioned icon barrel — one-line wrappers, exempt by design.
    # contexts/ legitimately exports the Context object alongside its Provider.
    case "$f" in
      */components/ui/Icons.tsx|components/ui/Icons.tsx) ;;
      */contexts/*|contexts/*) ;;
      *)
        n=$(grep -cE '^export (const|function) [A-Z][A-Za-z0-9]*\s*(=|\()' "$f" || true)
        [ "${n:-0}" -gt 1 ] && add "$n components exported from one file → split, one per file (04-CLIENT_SERVER)"
        ;;
    esac

    # ---- FUNDAMENTAL: components are render-only ----
    grep -qE '^\s+(const|let)\s+\w+\s*=\s*\[?\.{0,3}[\w.]*\s*\.(filter|sort|reduce|flatMap)\(' "$f" \
      && add "data transform inside a component → move to utils/ unless trivial+single-use+presentational (04-CLIENT_SERVER)"
    grep -qE '\b(fetch|axios)\s*\(' "$f" \
      && add "network call inside a component → move to services/ (04-CLIENT_SERVER, render-only)"
    grep -qE 'clearProps:\s*"all"' "$f" && add "clearProps:\"all\" → name the properties (05-ANIMATIONS)"
    grep -qE 'useRef\((Date\.now\(\)|Math\.random\(\)|new Date\(\))' "$f" && add "impure call during render → move into an effect (99-CHECKLIST N)"
    ;;
esac

# ---- "use client" must be line 1 if present ----
case "$f" in
  *.ts|*.tsx)
    # ignore mentions inside comments — only a real directive counts
    if grep -qE '^\s*"use client"' "$f" && [ "$(head -1 "$f" | tr -d '\r')" != '"use client"' ]; then
      add '"use client" must be the very first line (04-CLIENT_SERVER)'
    fi
    ;;
esac

# ---- banned files ----
case "$f" in
  *middleware.ts)        add "middleware.ts is BANNED → use proxy.ts at project root (99-CHECKLIST A)" ;;
  *tailwind.config.*)    add "tailwind.config is BANNED → Tailwind v4 is CSS-only (99-CHECKLIST A)" ;;
  *.module.css)          add "CSS modules are BANNED (99-CHECKLIST A)" ;;
  */styles/components.css|styles/components.css) add "components.css is BANNED → delete it (03-CSS_TOKENS)" ;;
  */app/globals.css|app/globals.css)     add "app/globals.css is BANNED → globals.css lives at project root (99-CHECKLIST A)" ;;
esac

# ---- GSAP flicker: every data-anim target must ship hidden (05-ANIMATIONS) ----
case "$f" in
  *.tsx)
    while IFS= read -r name; do
      [ -n "$name" ] && add "data-anim=\"$name\" is not hidden at first paint → add className=\"invisible\" (GSAP flicker, 05-ANIMATIONS)"
    done < <(python3 - "$f" <<'PYEOF'
import re, sys, pathlib
src = pathlib.Path(sys.argv[1]).read_text()
for m in re.finditer(r'<[A-Za-z][^>]*?data-anim="([\w-]+)"[^>]*?>', src, re.S):
    tag, name = m.group(0), m.group(1)
    if any(k in tag for k in ('invisible', 'opacity-0', 'scaleX(0)', 'scaleY(0)')):
        continue
    # An element whose nearest data-anim ancestor is already hidden inherits that
    # hiding; flagging it would force a double-hide that never reveals.
    before = src[:m.start()]
    if re.search(r'data-anim="[\w-]+"[^>]*?(?:invisible|opacity-0)', before[-4000:], re.S):
        continue
    print(name)
PYEOF
)
    ;;
esac

# ---- structure: naming + placement of the file just written ----
# Full-tree audit lives in .claude/skills/project-structure/scripts/check_structure.py;
# this is the per-file subset so a misplaced file is caught the moment it is created.
rel="${f#"$CLAUDE_PROJECT_DIR/"}"
base=$(basename "$f")
case "$rel" in
  components/*.tsx|components/*.ts)
    echo "$base" | grep -qE '^[A-Z][A-Za-z0-9]*\.tsx?$' \
      || add "components/ must be PascalCase — got $base (04-CLIENT_SERVER)" ;;
  hooks/*)
    echo "$base" | grep -qE '^use[A-Z][A-Za-z0-9]*\.ts$' \
      || add "hooks/ must be use+camelCase — got $base (04-CLIENT_SERVER)" ;;
  contexts/*)
    echo "$base" | grep -qE '^[A-Z][A-Za-z0-9]*\.tsx?$' \
      || add "contexts/ must be PascalCase — got $base (04-CLIENT_SERVER)" ;;
  utils/*|lib/*|config/*|services/*|types/*|constants/*|i18n/*)
    echo "$base" | grep -qE '^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)*\.tsx?$' \
      || add "$(dirname "$rel")/ must be kebab-case — got $base (04-CLIENT_SERVER)" ;;
esac

# ---- structure: each folder must hold only what belongs in it ----
case "$rel" in
  hooks/*)
    grep -qE '^export (function|const) use[A-Z]' "$f" \
      || add "hooks/ must export a use* hook — $base does not (04-CLIENT_SERVER)"
    grep -qE '\b(fetch|axios)\s*\(' "$f" \
      && add "network call in hooks/ → put the request in services/, call it from the hook (04-CLIENT_SERVER)"
    ;;
  contexts/*)
    grep -qE 'createContext' "$f" \
      || add "contexts/ must create a context — $base does not (04-CLIENT_SERVER)" ;;
  types/*)
    # `export const X = {...} as const` + `type X = typeof X` is a legitimate
    # type-level pattern. Only executable declarations are wrong here.
    grep -qE '^\s*export\s+(function|class)\s' "$f" \
      && add "types/ holds type declarations only — $base exports a function/class (04-CLIENT_SERVER)" ;;
  constants/*)
    # An arrow inside a value (a .sort() comparator, a mapped literal) is fine.
    # An EXPORTED function is logic and belongs in utils/.
    grep -qE '^export (function|const [a-zA-Z][A-Za-z0-9]* = (\(|async|<))' "$f" \
      && add "constants/ holds fixed values only — $base exports a function, move it to utils/ (04-CLIENT_SERVER)"
    grep -qE '\buseState\(|\buseEffect\(|\buseRef\(' "$f" \
      && add "React hooks in constants/ → wrong folder (04-CLIENT_SERVER)"
    ;;
  utils/animations/*)
    grep -qE 'from "@/lib/gsap"|from "@/lib/lenis"' "$f" \
      || add "utils/animations/ must import GSAP/Lenis from @/lib — $base does not (05-ANIMATIONS)" ;;
  utils/*)
    grep -qE '\buseState\(|\buseEffect\(|\buseContext\(|\buseRef\(' "$f" \
      && add "React hooks in utils/ → move to hooks/ (04-CLIENT_SERVER)"
    grep -qE '^\s*return\s*\(?\s*<[A-Za-z]' "$f" \
      && add "JSX in utils/ → move to components/ (04-CLIENT_SERVER)"
    ;;
  services/*)
    grep -qE '\buseState\(|\buseEffect\(|\buseContext\(' "$f" \
      && add "React hooks in services/ → move to hooks/ (04-CLIENT_SERVER)"
    grep -qE '^\s*return\s*\(?\s*<[A-Za-z]' "$f" \
      && add "JSX in services/ → services are data access only (04-CLIENT_SERVER)"
    ;;
  config/*)
    grep -qE '^\s*return\s*\(?\s*<[A-Za-z]' "$f" \
      && add "JSX in config/ → config holds configuration values only (04-CLIENT_SERVER)" ;;
  components/*)
    # A component may declare its OWN Props/State/local shapes. An EXPORTED
    # domain type is shared by definition and belongs in types/.
    while IFS= read -r t; do
      case "$t" in
        *Props|*State|*Variant|*Size) ;;
        "") ;;
        *) add "exported type '$t' in a component → move to types/ (04-CLIENT_SERVER)" ;;
      esac
    done < <(grep -oE '^export (type|interface) [A-Z][A-Za-z0-9]*' "$f" | awk '{print $3}')
    ;;
esac

# a component file must actually live under components/
case "$rel" in
  components/*|app/*|.claude/*|contexts/*) ;;
  *.tsx)
    grep -qE '^export (const|function) [A-Z]' "$f" \
      && add "component defined outside components/ → move it ($rel) (04-CLIENT_SERVER)" ;;
esac

[ ${#v[@]} -eq 0 ] && exit 0

{
  echo "Rule violations in $f — fix before continuing:"
  for x in "${v[@]}"; do echo "  ✗ $x"; done
} >&2
exit 2
