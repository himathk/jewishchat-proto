# JewishChat homepage — SDD progress ledger

Plan: D:/Work/Jewishchat/Jewishchat/docs/superpowers/plans/2026-08-09-jewishchat-homepage.md
Workdir: D:/Work/Jewishchat/Jewishchat
Branch policy: default branch from `git init` (user-approved)
Adjudication policy: plan governs on (1) narrow test scope, (2) inert href="#" links,
(3) Task 1 throwaway page.tsx. Record reviewer findings, carry to final review.

## Tasks
Task 1: complete (commits b3531e6..637e8b7, review clean after 1 fix)
  - Plan defect found+fixed: create-next-app cannot scaffold into "Jewishchat"
    (capital letter = invalid npm package name). Plan Step 1 rewritten to
    scaffold via temp lowercase dir. Result verified: flat root, name "jewishchat".
  - Plan defect found+fixed: .lattice-bg used linear-gradient (single sliver);
    only vertical stripes rendered. Rewritten to repeating-linear-gradient.
    Verified by controller with headless-Chrome pixels (637e8b7).
  - TOOLING: in-app browser screenshot tool does NOT work (pane not compositing).
    Use headless Chrome for all visual checks. Recipe added to plan Global Constraints.
  - MINOR carried to final review: Lenis CSS in globals.css is dead until Task 4.
Task 2: complete (commits 637e8b7..a281787, review clean, no Critical/Important)
  - Reviewer verified all 24 groups + 12 categories transcribed verbatim,
    referential integrity clean, load-bearing records for Task 3 correct.
  - Controller resolved reviewer's ⚠️: @/* alias is from Task 1 tsconfig; tsc exits 0.
  - MINOR carried to final review: memberCount optional in type but always populated.
  - Controller commit d3f4138 (plan doc corrections) sits outside task ranges.
Task 3: complete (commits d3f4138..068b493, review clean, no Critical/Important)
  - 11/11 tests pass (controller-confirmed, pristine). Both SRS acceptance queries
    pass with original weights: g-01 0.72 vs 0.216 runner-up; g-22 0.70 vs 0.252.
  - Reviewer hand-traced scoring against seed data independently; confirmed the
    <=3-char location-token guard actually defeats the "on" in "contractors" bug.
  - Deviation accepted: vitest.config.mts (not .ts) + import.meta.dirname, to
    silence loader warnings. Reviewer verified tsconfig includes **/*.mts.
  - MINOR carried to final review:
    * score.test.ts clamp test never drives raw>1, so Math.min(1,raw) is unexercised
    * sort tie-breakers (uniqueViews, localeCompare) untested
    * scoring weights are bare magic numbers; brief anticipates future tuning
    * query-side state abbreviations ("fl","nj") give no location signal by design
Task 4: complete (commits 068b493..6fedb22, approved on re-review after 2 Important fixes)
  - FIX 1: SmoothScroll used bare `if` for reduced-motion, violating the plan's own
    global constraint; no live OS-toggle reactivity. Rewritten to gsap.matchMedia().
  - FIX 2: useSearch returned an unmemoized results.slice(0,6), defeating
    SearchProvider's useMemo and re-rendering the WebGL canvas every keystroke.
    Now useMemo'd on [results]. Plan doc updated for both (440fadd).
  - MINOR carried to final review: gsap.ticker.lagSmoothing(0) is a global never
    restored on teardown; fonts.ready refresh not cancelled on unmount.
Task 5: complete (commits ff4bd75..a64f95d, approved; 1 Important fix applied)
  - All 8 UI primitives built verbatim from brief; tsc 0, build green.
  - Reviewer verified every Tailwind class resolves to a real @theme token or
    utility in globals.css (the risk build/tsc cannot catch).
  - USER DECISION (new, plan-wide): hand-copied rgba() shadow literals that
    duplicate @theme colors violate the plan's own "one @theme block" constraint.
    User chose FIX ALL FIVE plan-wide over "plan governs". Applied in a64f95d to
    Button.tsx, GroupCard.tsx, and plan lines 1619/2023/2273/2381/4206, using the
    color-mix(in oklab, var(--color-...) N%, transparent) pattern from .lattice-bg.
    Underscore-escaping required inside Tailwind arbitrary values; line 2381 is a
    JS template literal with computed alpha and uses real spaces. Controller
    verified the emitted CSS actually contains the classes (a malformed arbitrary
    value generates nothing and passes both tsc and build silently).
  - Controller resolved reviewer ⚠️ #1: all 12 icon values in lib/data/categories.ts
    match CATEGORY_ICONS keys exactly. Not a gap.
  - Controller resolved reviewer ⚠️ #2: no task in the plan implements a
    status-bar shim for data-href. Plan appendix line 4528 settles data-href as
    documentation of intended URL, not a browser affordance. Falls under standing
    decision (b), inert href="#" links. Recorded as Minor.
  - MINOR carried to final review:
    * Global Constraints prose claims data-href is "shown in the browser status
      bar"; browsers do not surface data-* attributes. Wording overstates it.
    * GroupCard confidence bar clamps only the lower bound (Math.max(6, ...));
      confidence > 1 would render past 100%. No caller passes out-of-range today.
    * Button drops ...rest on the <Link> branch, so href + onClick silently
      ignores the handler.
