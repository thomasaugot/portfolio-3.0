#!/usr/bin/env python3
"""Validate a project against the house tree structure.

Usage: check_structure.py [project_root]
Exit 0 = clean, 1 = problems found.
"""
import sys, re
from pathlib import Path

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
errors, warnings = [], []

def err(m): errors.append(m)
def warn(m): warnings.append(m)

# ---------- required root files ----------
for f in ["globals.css", "proxy.ts", "tsconfig.json", "package.json", "MEMORY.md"]:
    if not (ROOT / f).exists():
        warn(f"missing root file: {f}")

# ---------- banned files/dirs ----------
BANNED = {
    "middleware.ts":        "use proxy.ts at project root",
    "tailwind.config.ts":   "Tailwind v4 is CSS-only",
    "tailwind.config.js":   "Tailwind v4 is CSS-only",
    "src":                  "no src dir — folders live at project root",
    "app/globals.css":      "globals.css belongs at project root",
    "styles/components.css":"no fallback CSS file — Tailwind or nothing",
    "messages":             'locale folder must be named "locales/"',
}
for rel, why in BANNED.items():
    if (ROOT / rel).exists():
        err(f"banned: {rel} — {why}")

for p in ROOT.rglob("*.module.css"):
    if "node_modules" not in p.parts:
        err(f"banned: {p.relative_to(ROOT)} — no CSS modules")

# ---------- required styles ----------
for f in ["theme.css", "base.css", "animations.css", "accessibility.css"]:
    if not (ROOT / "styles" / f).exists():
        err(f"missing styles/{f}")

# ---------- naming conventions ----------
PASCAL = re.compile(r"^[A-Z][A-Za-z0-9]*\.tsx?$")
# kebab-case, optionally with a dotted qualifier: app.config.ts, i18n.config.ts
KEBAB  = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)*\.tsx?$")
HOOK   = re.compile(r"^use[A-Z][A-Za-z0-9]*\.ts$")

def scan(folder, pattern, label, skip=()):
    d = ROOT / folder
    if not d.is_dir():
        return
    for p in d.rglob("*.ts*"):
        if "node_modules" in p.parts or p.name in skip:
            continue
        if not pattern.match(p.name):
            err(f"{p.relative_to(ROOT)} — {label}")

scan("components", PASCAL, "components/ must be PascalCase")
scan("hooks",      HOOK,   "hooks/ must be useCamelCase.ts")
for folder in ["utils", "lib", "config", "contexts", "services", "types", "constants", "i18n"]:
    if folder == "contexts":
        scan(folder, PASCAL, "contexts/ must be PascalCase")
    else:
        scan(folder, KEBAB, f"{folder}/ must be kebab-case")

# ---------- animation files named after behaviour, not pages ----------
pages = {p.name for p in (ROOT / "components" / "pages").iterdir()} if (ROOT / "components" / "pages").is_dir() else set()
adir = ROOT / "utils" / "animations"
if adir.is_dir():
    for p in adir.glob("*.ts"):
        stem = p.stem.split("-")[0]
        if stem in pages:
            err(f"utils/animations/{p.name} — named after a page; name it after the behaviour")

# ---------- page clients ----------
for p in (ROOT / "app").rglob("page.tsx") if (ROOT / "app").is_dir() else []:
    txt = p.read_text(encoding="utf-8", errors="ignore")
    if txt.lstrip().startswith('"use client"'):
        err(f'{p.relative_to(ROOT)} — pages are Server Components; extract to a *Client.tsx')

# ---------- error / loading boundaries ----------
app = ROOT / "app"
if app.is_dir():
    locale_dirs = [d for d in app.iterdir() if d.is_dir() and d.name.startswith("[") and "locale" in d.name]
    seg = locale_dirs[0] if locale_dirs else app
    for f, why in [
        ("error.tsx",     "a throw renders Next's default page — unstyled and untranslated"),
        ("not-found.tsx", "notFound() and unmatched routes fall through"),
    ]:
        if not (seg / f).exists():
            warn(f"missing {seg.relative_to(ROOT)}/{f} — {why}")
    if not (app / "global-error.tsx").exists():
        warn("missing app/global-error.tsx — no fallback if the root layout throws")

    # error.tsx must be a client component
    for p_ in app.rglob("error.tsx"):
        if not p_.read_text(encoding="utf-8", errors="ignore").lstrip().startswith('"use client"'):
            err(f'{p_.relative_to(ROOT)} — error boundaries must be "use client" (they receive reset)')

    # global-error must render its own html/body — it replaces the root layout
    ge = app / "global-error.tsx"
    if ge.exists():
        t = ge.read_text(encoding="utf-8", errors="ignore")
        if "<html" not in t or "<body" not in t:
            err("app/global-error.tsx — must render its own <html> and <body>")

    # loading.tsx is never used in this stack — PageLoader + TransitionOverlay own loading
    prov = ROOT / "components" / "layout" / "Providers.tsx"
    prov_txt = prov.read_text(encoding="utf-8", errors="ignore") if prov.exists() else ""
    for p_ in app.rglob("loading.tsx"):
        err(f"{p_.relative_to(ROOT)} — loading.tsx is not used in this stack; "
            "PageLoader and TransitionOverlay already own loading. Delete it.")

    # a PageLoader that exists but is not mounted kills every loaderGone-gated animation
    pl = ROOT / "components" / "layout" / "PageLoader.tsx"
    if pl.exists() and prov.exists() and "<PageLoader" not in prov_txt:
        gated = [
            q.relative_to(ROOT) for q in (ROOT / "components").rglob("*.tsx")
            if q.name != "PageLoader.tsx"
            and "useLoaderGone" in q.read_text(encoding="utf-8", errors="ignore")
        ]
        if gated:
            err("PageLoader.tsx exists but is NOT mounted in Providers.tsx — loaderGone never "
                f"fires, so these are dead: {', '.join(str(g) for g in gated[:4])}")
        else:
            warn("PageLoader.tsx exists but is not mounted in Providers.tsx — "
                 "mount it, or delete it if the project has no loader")

    # server actions
    for p_ in app.rglob("actions.ts"):
        if not p_.read_text(encoding="utf-8", errors="ignore").lstrip().startswith('"use server"'):
            err(f'{p_.relative_to(ROOT)} — must start with "use server"')

    # route handlers live only under app/api/
    for p_ in app.rglob("route.ts"):
        if "api" not in p_.relative_to(app).parts:
            warn(f"{p_.relative_to(ROOT)} — route handlers belong under app/api/")

# ---------- tests mirror source paths ----------
tdir = ROOT / "tests"
if tdir.is_dir():
    for p_ in tdir.rglob("*.test.ts*"):
        rel = p_.relative_to(tdir)
        src = ROOT / rel.parent / (p_.name.split(".test.")[0] + ".ts")
        if not src.exists() and not src.with_suffix(".tsx").exists():
            warn(f"tests/{rel} — no matching source at {rel.parent}/")

# ---------- public/ hygiene ----------
pub = ROOT / "public"
if pub.is_dir():
    allowed = {"favicon.ico", "assets", "manifest.json", "robots.txt", "sw.js"}
    for p in pub.iterdir():
        if p.name not in allowed and not p.name.startswith("icon"):
            warn(f"public/{p.name} — only favicon.ico + assets/ belong at public root")

# ---------- report ----------
for w in warnings: print(f"  ! {w}")
for e in errors:   print(f"  ✗ {e}")
if not errors and not warnings:
    print("Structure OK")
elif not errors:
    print(f"\n{len(warnings)} warning(s), no errors")
else:
    print(f"\n{len(errors)} error(s), {len(warnings)} warning(s)")
sys.exit(1 if errors else 0)
