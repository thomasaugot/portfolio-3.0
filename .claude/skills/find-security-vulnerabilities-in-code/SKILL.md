---
name: find-security-vulnerabilities-in-code
description: White-box security review of SOURCE CODE - a local working tree, a repository, or a pull request. The agents read the code to model routes, sinks and authorization checks, then exploit what they find, so every issue ships with a proof-of-concept rather than a 'potential' pattern-match. Use ONLY when the target is code rather than a running service. For a deployed app use test-web-app-security; for setup and CLI flags see run-penetration-test.
license: Apache-2.0
metadata:
  author: usestrix
  homepage: https://docs.strix.ai
---

# Find security vulnerabilities in code

## Default here: manual review, no Strix, no question

Thomas decided (2026-10-28): **do not ask whether to run Strix, and do not ask for an
LLM key.** Strix bills his API account and ships the source to an LLM provider, and he
prefers the manual review. Go straight to it:

1. Split the code into two or three areas (authentication / sessions / signed tokens;
   data routes / authorization / injection / files; anything else that is large) and run
   one read-only reviewer per area in parallel.
2. Brief each with the tenancy model (where the company or tenant id comes from, any
   per-account limits), what is attacker-controlled, and what was already fixed.
3. They read the code, prove each bug offline (a small script against the pure helpers
   with fake secrets, or exact reasoning from the code), and never send a request to
   production or any live service.
4. Verify every finding yourself before fixing it, then fix the root cause, run
   `tsc`/lint/tests, and report fixed vs needs-a-decision.

Use the Strix sections below **only if Thomas explicitly asks for Strix** in that request.

White-box security review with Strix: the agents read the source to build a model of routes, sinks, and authorization checks, then attempt real exploitation. Findings come with a proof-of-concept, so the output is a short list of proven issues rather than the hundreds of "potential" hits a pattern-matching scanner produces.

Install, LLM setup, all flags, and the managed-cloud path are in the **run-penetration-test** skill.

## Run it

```bash
# Local working tree
strix -n -t ./ --scan-mode standard --max-budget 15

# A GitHub repo directly
strix -n -t https://github.com/org/app --max-budget 15

# Monorepo: point at the service that matters, not the whole tree
strix -n -t ./services/checkout --max-budget 20

# Only what a branch changed (whole-repo review is wasteful on a large repo)
strix -n -t ./ --scope-mode diff --diff-base origin/main --max-budget 10
```

A local path is mounted into the sandbox **writable**, so the agents can modify it. Run against a clean checkout.

Two things sharply improve results:

1. **Add a running instance of the app.** `-t ./ -t http://host.docker.internal:3000` lets the agents confirm exploitability against live behavior instead of reasoning about it statically — this is the difference between "this looks unsafe" and a validated finding. If nothing is running, static-only findings should be described as unconfirmed.
2. **Scope the review.** Point at the risky subtree and say what matters:
   ```bash
   strix -n -t ./services/api --max-budget 15 \
     --instruction "Focus on the authorization layer in src/auth and every route under src/routes/admin. Multi-tenant app: tenant id comes from the JWT. Flag any query that filters by object id without also filtering by tenant."
   ```
   Tenancy model, trust boundaries, and which inputs are attacker-controlled are things the agents cannot infer reliably — tell them.

## Reviewing a pull request instead of the whole repo

For diff-scoped review of a branch or PR (and blocking merges on findings), use **add-security-scanning-to-ci** — it covers diff scoping, PR comments, and SARIF upload to GitHub code scanning. The managed platform can also review PRs directly via API (**managed-pentesting-with-strix**).

## Read the results

In `strix_runs/<run>/`: `penetration_test_report.md` (start here), `vulnerabilities/*.md` (one per finding, with PoC and remediation), `vulnerabilities.json` / `.csv`, `findings.sarif` (upload to code scanning), `run.json`.

Before reporting to the user, open each finding and check the PoC actually demonstrates impact. Report file and line alongside the exploit so the fix is obvious.

Exit `0` means nothing exploitable was proven in what was analyzed — not that the codebase is clean. Check `run.json` status and cost against `--max-budget`, and note which paths went unreviewed if the run was capped.

## Complementary tooling

This is exploit-validated review, not an exhaustive inventory. Keep a dependency scanner (SCA) and secret scanning in place for complete coverage of known-CVE dependencies and committed credentials; use this for the logic, authorization, and injection bugs those tools structurally cannot find.

## Fix and verify

Hand results to **fix-security-vulnerabilities**: patch the root cause (the shared authorization helper, not the one route), then re-run Strix to prove the exploit no longer works.
