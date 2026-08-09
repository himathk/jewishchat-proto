# JewishChat homepage — handoff

**State:** Tasks 1–4 of 14 complete and reviewed. Task 5 is next and its brief is already generated.
**HEAD at handoff:** `440fadd` on `master`. Working tree clean.

---

## What this is

A single design-maximal Next.js homepage for JewishChat (a WhatsApp group directory for the Jewish community), built as a **design reference** — homepage only, no other routes.

- **Plan (the source of truth):** `docs/superpowers/plans/2026-08-09-jewishchat-homepage.md` — 14 tasks, ~93 steps, complete code in every step.
- Built from an SRS at `C:\Users\mghgk\Downloads\JD-System Requirement Specification-090826-180704.pdf`. The plan's final appendix maps every SRS requirement to where it lands, so you do not need to re-read the PDF.

## Design decisions already locked (do not re-litigate)

- Next.js 16.3 App Router, TS, Tailwind v4, GSAP 3.15 (+ScrollTrigger/SplitText), Lenis, R3F/three, lucide-react.
- Primary `#1E9783`, background `#F6F6F4`. Display font **Bricolage Grotesque**, body **Geist**.
- Cultural voice is subtle/geometric — six-point lattice geometry, no literal Star of David, no Hebrew lettering.
- Composition is "command-center scroll": the hero search bar morphs into the header dock on scroll.
- Hero has a WebGL constellation that reacts to cursor and to the search query.
- **Homepage only.** All category/group links are `<a href="#" data-href="/real/url">` and must not navigate.
- **Tests only for `lib/search/score.ts`.** Everything else is verified by `tsc`, `npm run build`, and a screenshot.

## Process being used

`superpowers:subagent-driven-development` — per task: generate brief → dispatch implementer subagent → generate review package → dispatch reviewer subagent → fix findings → re-review → record in ledger.

Skill dir: `C:\Users\mghgk\.claude\plugins\cache\claude-plugins-official\superpowers\6.1.1\skills\subagent-driven-development\`

```bash
# generate a task brief
scripts/task-brief docs/superpowers/plans/2026-08-09-jewishchat-homepage.md N /path/to/task-N-brief.md
# package a diff for the reviewer (BASE = commit before the task)
scripts/review-package BASE HEAD
```

Prompt templates: `implementer-prompt.md`, `task-reviewer-prompt.md` in that skill dir.

**Ledger (read this first):** `C:\Users\mghgk\AppData\Local\Temp\claude\D--Work-Jewishchat-Jewishchat\7ee025a5-f148-4592-9f5f-da4826670af1\scratchpad\sdd\progress.md`
Briefs and implementer reports live in the same folder. If that temp folder is gone, `git log` is the recovery map and briefs regenerate from the plan.

## Two standing decisions from the user

1. Commit to the default `master` branch — approved, do not branch.
2. **Plan governs** over the reviewer rubric on three recurring findings; record them and carry to the final review rather than stopping: (a) narrow test scope, (b) inert `href="#"` links, (c) Task 1's throwaway `page.tsx` that Task 8 replaces.

## Critical gotcha: screenshots

**The in-app browser screenshot tool does not work here** — the Browser pane does not composite frames, so `computer{action:"screenshot"}` times out. Use headless Chrome instead:

```bash
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --hide-scrollbars --virtual-time-budget=8000 --window-size=1440,2400 --screenshot="D:\Work\Jewishchat\Jewishchat\docs\screenshots\NAME.png" http://localhost:3000
```

Then **Read the PNG**. This is not optional diligence — checking computed styles instead of pixels already let one real visual bug through (see below). Dev server: `npm run dev` (port 3000), or the `jewishchat` config in `.claude/launch.json`.

## Plan defects found and already fixed

The plan file has been corrected for all of these; they are recorded so you don't re-derive them.

1. `create-next-app` cannot scaffold into `Jewishchat` — the capital letter is an invalid npm package name. Plan now scaffolds via a temp lowercase dir.
2. `.lattice-bg` used `linear-gradient` with a 1px stop, which draws one sliver, not a repeating rule — only vertical stripes rendered. Now `repeating-linear-gradient`. **Caught only by looking at pixels.**
3. `SmoothScroll` used a bare `if` for reduced-motion, violating the plan's own global constraint and losing live OS-toggle reactivity. Now `gsap.matchMedia()`.
4. `useSearch` returned an unmemoized `results.slice(0, 6)`, defeating `SearchProvider`'s `useMemo` and re-rendering the WebGL canvas on every keystroke. Now memoized.
5. Search scoring: location tokens ≤3 chars were dropped and matching made word-boundary anchored, because `"contractors"` contains `"on"` and would silently resolve the location to Toronto.

## Completed tasks

| Task | Commits | Result |
|---|---|---|
| 1 — Scaffold, tokens, typography | `b3531e6`..`637e8b7` | Approved after 1 fix |
| 2 — Types and seed data | `a281787` | Approved clean |
| 3 — Search scoring (TDD) | `068b493` | Approved clean, 11/11 tests |
| 4 — Motion foundation, providers | `d543ef8`..`6fedb22` | Approved after 2 fixes |

Verified working: design tokens, Bricolage/Geist loading, triangular lattice, 12 categories + 24 groups seeded, `searchGroups` passing both SRS acceptance queries (`g-01` for the Lakewood roofing query, `g-22` for the Florida business-forum query), GSAP/Lenis/reveal/search-context foundation.

## Remaining tasks 5–14

Each is fully specified in the plan with complete code. In order:

5. UI primitives (Button, Badge, LatticeBackdrop, SectionHeading, categoryIcons, CategoryTile, GroupCard, FilterChips)
6. Header, SearchField, Suggestions, morphing SearchDock, QueryChips, Logo
7. Constellation WebGL hero (`ConstellationField`, `Constellation`)
8. Hero + StatBand + first real page composition ← **first task where the page actually renders; take a screenshot here**
9. CategoryLattice + location ticker
10. TrendingGroups + RecentGroups
11. HowItWorks (pinned horizontal) + TrustSafety
12. AddGroupBand + Faq + Footer
13. CookieConsent + JSON-LD schema + metadata
14. Reduced-motion backstop, 3-breakpoint verification, screenshots, final build

Then: final whole-branch review (`superpowers:requesting-code-review`, most capable model, `review-package $(git merge-base master HEAD) HEAD` — or first commit `b3531e6` as base), triaging the Minor findings listed in the ledger.

**Task 5's brief is already generated** at `…/scratchpad/sdd/task-5-brief.md`. If that temp dir is gone, regenerate with `scripts/task-brief`.

## Minor findings carried to the final review

- `score.test.ts` clamp test never drives `raw > 1`, so `Math.min(1, raw)` is unexercised — the test would pass with the clamp deleted.
- Sort tie-breakers (`uniqueViews`, `localeCompare`) untested.
- Scoring weights are bare magic numbers; the plan anticipates future tuning.
- Query-side state abbreviations (`"fl"`, `"nj"`) give no location signal — by design, but undocumented for users.
- `gsap.ticker.lagSmoothing(0)` is a global never restored on teardown.
- `document.fonts.ready` refresh not cancelled on unmount.
- `memberCount` optional in the type but populated on all 24 records.
- Lenis CSS in `globals.css` was dead until Task 4 (now live).

## Per-task checklist for whoever continues

1. `scripts/task-brief <plan> N <brief-path>`
2. Dispatch implementer (model: sonnet) with: brief path, one line of scene-setting, interfaces from earlier tasks, report-file path.
3. `scripts/review-package <BASE> <HEAD>` where BASE is the commit **before** the task (never `HEAD~1` — tasks can be multi-commit).
4. Dispatch reviewer (model: sonnet) with brief path, report path, diff path, and the plan's Global Constraints verbatim.
5. Fix Critical/Important in one fix dispatch, then re-review.
6. Append a line to the ledger: `Task N: complete (commits <base7>..<head7>, review clean)`.
7. Verify visually with headless Chrome from Task 8 onward.
