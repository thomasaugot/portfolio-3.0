# WORKING-STYLE.md — How to work with Thomas

Travels with `.claude/` into every project. The other rule files in this folder define the
architecture; this one defines the working relationship.

---

## How to communicate

- **Answer in one or two lines.** Long explanations do not get read. Ship the work, say what
  changed, stop.
- **No preamble, no recap, no summary of what you are about to do.** Do it, then report.
- **Do not narrate corrections.** Fix the thing and move on; do not tally past mistakes.
- Tables and short lists over paragraphs.

## How to work

- **Decide and build. Do not ask questions you can answer yourself.** Read the code, check
  `package.json`, look at the config. Ask only when the answer genuinely changes the work and
  cannot be found.
- **Verify before saying it is done.** `npx tsc --noEmit` and `npm run lint` clean, or say
  plainly that they are not.
- **Never claim something works without running it.** Testing `--help` is not testing the tool.
- **Read the whole file before rewriting it.** Overwriting a file you have not read destroys
  work.
- **Never use a blanket find-and-replace across a codebase or a docs tree.** It rewrites
  English words, filenames and code identifiers that merely contain the search term. Match on
  a specific, anchored pattern and check the result.

## Load the matching skill BEFORE debugging, not after failing

The skills in `.claude/skills/` exist **because the bug already cost hours once**. Debugging
from scratch throws that away and walks the same dead ends.

Before touching auth, deploys, animation, project structure or design: check the skill list
and **load the matching one first**. Symptom-first debugging comes second.

Reproduce with the **real code path** — the actual login form, the actual action — never with
an admin or test endpoint that behaves differently. A test that "proves it works" against a
different code path proves nothing.

## Never

- **NEVER revert, undo, or `git checkout` my work.** Not when I reject a design, not when
  something looks broken, not to "clean up". A rejection means the NEXT attempt is different,
  never that the current one gets thrown away. If reverting seems right, say so and wait.
  This has been repeated across many sessions and is the fastest way to destroy work.
- **Never start, restart, or kill the dev server.** Thomas runs `npm run dev` himself. No run build until told to do so either. The dev server is a shared resource, and it is not your job to manage it.
- **Never touch real customer data.** Test records only, and only ones you created.
- **Never send email to a real recipient** while testing, always to thomas.augot@galagaagency.com.
- **Never assume the stack from a previous project.** Check whether it is this database, this
  host, this auth provider — a skill firing is not proof its stack applies.

## Design

- Rich and layered, never simplified to solve a problem. Removing things is not a design fix.
- Never ever use accent lines. Anywhere in the design I hate them. They are a lazy, cheap, and ugly way to separate content. Use space, color, or
  typography instead.
- Avoid horizontal row layouts as the default structure.
- Watch for the convergent defaults: centred mark, dark blurred ground, cyan glow, three equal
  cards, one giant word. Vary composition, ground, light, motion.

## Stack defaults (unless the project says otherwise)

Next.js App Router · TypeScript · Tailwind v4 (CSS-only, no config file) · GSAP via
`@/lib/gsap` — **never Framer Motion** · Lenis · hand-built UI primitives, no component
libraries · next-intl when the project has i18n.
