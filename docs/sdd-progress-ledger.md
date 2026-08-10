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

Task 9:  complete (abcde7a) — CategoryLattice + location ticker.
Task 10: complete (c7cc637) — TrendingGroups + RecentGroups.
Task 11: complete (bcd00bf) — HowItWorks pinned horizontal track + TrustSafety.
         Reduced-motion branch falls back to vertical stacking (verified), and
         the pin re-engages/disengages cleanly across breakpoints.
Task 12: complete (91805d0) — AddGroupBand + Faq + Footer.
  - REAL BUG found and fixed during Task 11 verification: Task 9's hex-offset
    grid used translate-y-8 on tiles 2/4, which useReveal silently erased —
    the reveal tween animates the same `transform` property and leaves an
    inline translate(0,0) behind on completion. Switched to top-8 (CategoryTile
    root is already position:relative). This is the second bug on this project
    that only surfaced by inspecting rendered output rather than source.
  - NOTE for anyone re-verifying: a static headless capture shows ONLY the hero,
    because every section below uses scroll-triggered reveals that never fire
    without a real scroll. Force reveals to final state (reduced-motion
    emulation or scripted scrolling) or the page will look empty and you will
    think it is broken when it is not.

Task 13: complete (b318d65) — CookieConsent + JSON-LD + metadata. JSON-LD
         validated by JSON.parse on the served HTML: 3 objects (WebSite,
         ItemList, ItemList).
Task 14: complete (d02fce3) — reduced-motion backstop + 3-breakpoint pass.
  - Reduced-motion audit across all 12 motion files found one real violation:
    CookieConsent.tsx used a bare window.matchMedia().matches instead of
    gsap.matchMedia(). Fixed. This is the THIRD time this exact constraint was
    violated on this project (Tasks 4, 6, 13) — it is the plan's most-missed rule.
  - MOBILE CAPTURE VERDICT (was open since Task 8): capture artifact, NOT an app
    bug. The plan's documented `chrome --headless --screenshot` recipe corrupts
    once page height exceeds ~8192px — a rasterizer texture-tile limit,
    independent of width. Replaced with a CDP script
    (Emulation.setDeviceMetricsOverride + Page.captureScreenshot with
    captureBeyondViewport, chunked under the limit, stitched). If anyone revives
    the CLI recipe for a full-page shot, they will hit this again.
  - Controller confirmed by reading final-desktop.png: all ten sections render
    end to end. HowItWorks appears vertically stacked in the capture because
    reduced-motion was emulated to force reveals — that is the fallback, not
    the pinned horizontal path.

## Post-plan design fix (user feedback: "empty and lifeless", esp. hero)
Diagnosis: Hero.tsx wrapped all content in max-w-4xl (896px) inside a
max-w-[1400px] container, so the right ~500px was dead by construction, and the
constellation was too low-contrast to read as anything but dust. Not a missing-
photography problem. User asked about stock photos of people; advised against
(inauthentic for this audience, implies endorsement that doesn't exist, fights
the geometric design language) and user chose the live-group-cluster option.
  8b3da25 — HeroGroupCluster + raised constellation contrast.
  3af9051 — fix after controller read the pixels: v1 shipped a 3-card fan that
    bled past the 1440px viewport edge and sliced two cards' text and badges;
    titles were ellipsized. Replaced with a 2-card staggered column, near-zero
    rotation, no overlap, full titles. Confidence bar dropped from floating
    cards (it made active-query cards ~40px taller than idle, which was the
    real root cause of the overlap).
  NOTE: this is the fourth defect on this project caught only by looking at
  rendered pixels. The pattern is now unambiguous.

## TOOLING: the in-app Browser pane cannot verify ANY animation
Measured directly: `document.visibilityState === "hidden"`, `document.hidden
=== true`, and requestAnimationFrame fires ZERO times in 500ms. GSAP's global
timeline is therefore frozen at time 0 — `gsap.globalTimeline.time()` never
advances. Consequences, all of which look exactly like app bugs:
  - Any tween sits permanently at its from-state. `tl.progress(1)` still works,
    which is how you tell a frozen ticker from a dead timeline.
  - Components that unmount at the END of an exit animation never unmount
    (CookieConsent's dismiss does nothing in the pane).
  - Elements stay offset by their from-state transform, so getBoundingClientRect
    geometry is wrong by exactly the tween's starting offset.
This cost a long debugging detour chasing a phantom bug in ChatLauncher that
did not exist. The pane is fine for DOM/state/geometry-at-rest checks; for
anything motion-dependent use headless Chrome, which composites normally.

## STATUS: all 14 tasks complete. tsc 0, build green, lint clean, 11/11 tests.
Final whole-branch review was NOT run — deliberately skipped under the user's
mid-session credit directive. The Minor findings above have never been triaged;
they are the agenda if a final review is ever run.
