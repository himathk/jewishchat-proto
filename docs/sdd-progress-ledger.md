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
Task 6: complete (commits a64f95d..a57073c, approved after 1 Important fix)
  - Header, SearchField, Suggestions, QueryChips, Logo, and the morphing
    SearchDock. tsc 0, build green, lint clean.
  - Reviewer confirmed the morph's core is sound: both slot rects measured LIVE
    inside apply() via getBoundingClientRect (not cached at mount), and teardown
    kills the ScrollTrigger plus reverts the matchMedia context.
  - FIX (Important): neither SearchDock nor Header had a prefers-reduced-motion
    branch — the scrubbed fixed-element tween ran regardless of the OS setting.
    Reviewer labeled it "plan-mandated"; controller overruled that label because
    the plan contradicts ITSELF here (Global Constraints require the branch, only
    the snippet omits it). Same adjudication as Task 4's SmoothScroll bare-`if`.
    No user escalation needed. Fixed in a57073c via gsap.matchMedia() object
    conditions: dock uses {isDesktop, reduced} and the reduced branch snaps to
    the correct slot instead of scrubbing; Header zeroes its 500ms CSS transition
    duration and restores it on teardown. Plan snippets updated to match.
  - Controller verified the fix diff directly (live measurement preserved,
    teardown preserved, reduced branch is a real variant not a degenerate copy)
    rather than spending a full re-review dispatch on a narrow contained fix.
  - Controller resolved reviewer ⚠️: SmoothScroll is NOT yet mounted — app/layout.tsx
    is still the Task 1 scaffold. So the document.fonts.ready -> ScrollTrigger.refresh()
    path that re-measures the dock after Bricolage/Geist load only goes live at
    Task 8. NOT a Task 6 gap. => TASK 8 ACCEPTANCE CHECK: confirm layout.tsx
    mounts SmoothScroll, or the dock will sit on stale pre-font-load geometry.
  - MINOR carried to final review:
    * Suggestions.tsx role="listbox" without role="option" on the rows.
    * ctx.conditions is cast rather than narrowed in both components; gsap types
      it optional, so a destructure would throw if it were ever undefined.

## PROCESS CHANGE (user directive, mid-session)
User is credit-constrained and needs a working prototype this session. From
Task 7 on: NO per-task reviewer dispatches. Tasks are batched per implementer
dispatch and verified by tsc + build + lint + headless-Chrome screenshots that
the implementer reads itself. Ledger entries are one-liners. The accumulated
Minor findings above still stand for the final review if one is ever run.

Task 7: complete (61e1a26) — ConstellationField + Constellation, R3F canvas.
Task 8: complete (be4ef7e) — Hero + StatBand + real app/page.tsx; SmoothScroll
  now mounted in layout.tsx (was the Task 6 acceptance check — resolved).
  Controller confirmed by reading task8-desktop.png: header, logo, constellation,
  Bricolage headline w/ green accent, search field, chips, stat line all render.
  - Implementer added an eslint-disable for react-hooks/immutability in
    ConstellationField.tsx (intentional in-place buffer mutation). Allowed: the
    constraint bans `any` and @ts-expect-error, not this. Flag if revisited.
  - Implementer changed the mobile header "Add" to icon-only: original fit
    390.000px exactly with overflow-x:hidden, so any font-metric variance pushed
    the hamburger off-screen. Reasonable fix, not in the plan.
  - UNRESOLVED: implementer reports the headless-Chrome CLI renders mobile
    captures narrower than the requested 390px on this machine, so
    task8-mobile.png shows truncation it claims is a capture artifact, not an
    app bug. Cross-checked via CDP + getBoundingClientRect. VERIFY AT TASK 14.
