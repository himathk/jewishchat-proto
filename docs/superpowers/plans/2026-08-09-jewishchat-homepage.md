# JewishChat Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single, design-maximal Next.js homepage for JewishChat — a WhatsApp group directory for the Jewish community — that surfaces every piece of content the SRS assigns to the public directory home page.

**Architecture:** One route (`/`) composed of ten sections. A `SearchProvider` context holds the query and scored results; a fixed-position `SearchDock` morphs from hero-anchored to header-anchored on scroll via GSAP ScrollTrigger reading two live slot rects. An R3F constellation canvas behind the hero reacts to both cursor and query. All scroll motion is registered through a single `gsap.matchMedia()` so breakpoint and reduced-motion variants share one lifecycle.

**Tech Stack:** Next.js 16.3 (App Router) · React 19.2 · TypeScript 5 · Tailwind CSS 4.3 · GSAP 3.15 (ScrollTrigger + SplitText) · Lenis 1.3 · Three.js 0.185 via @react-three/fiber 9.7 + drei 10.7 · Vitest · lucide-react

---

## Global Constraints

- **Scope is the homepage only.** Build `app/page.tsx` and nothing else. No category routes, no group detail pages, no auth pages, no API routes, no catch-all placeholder. Category and group links render as `<a href="#">` with the SRS-shaped URL shown in the browser status bar via `data-href` — they must not navigate.
- **Purpose is design reference.** Visual quality, motion quality, and composition are the deliverable. Do not add analytics, auth, persistence, or backend integration.
- **Primary colour is exactly `#1E9783`. Page background is exactly `#F6F6F4`.** All other palette values in Task 1 are read from a palette image and are approximations — they live in one `@theme` block so they can be corrected in one edit.
- **Display font is Bricolage Grotesque. Body/UI font is Geist.** No other font families.
- **Cultural voice is subtle and geometric.** Jewish identity is expressed through six-point/triangular lattice geometry, mosaic tile rhythms, and a seven-column layout motif. No literal Star of David icons, no Hebrew lettering, no religious imagery.
- **Test scope is deliberately narrow.** Only `lib/search/score.ts` gets unit tests — it is pure logic and a silent bug there would break the centerpiece interaction. Every other task is verified by `npx tsc --noEmit`, `npm run build`, and a browser render check. This is an intentional deviation from full TDD, taken because the user scoped this to design only.
- **Every animation must have a `prefers-reduced-motion` branch** registered inside `gsap.matchMedia()`, not an `if` statement.
- **No `any` types.** No `@ts-expect-error`. `npx tsc --noEmit` must exit 0 at the end of every task.
- **Commit after every task** with a `feat:` or `chore:` prefixed message.
- **Visual verification uses headless Chrome, not the browser screenshot tool.** The in-app Browser pane does not composite frames in this environment, so `computer{action:"screenshot"}` times out. Capture real pixels with the installed Chrome instead, then read the PNG:

  ```bash
  "/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --hide-scrollbars --virtual-time-budget=8000 --window-size=1440,2400 --screenshot="D:\Work\Jewishchat\Jewishchat\docs\screenshots\NAME.png" http://localhost:3000
  ```

  `--virtual-time-budget` lets fonts, GSAP intro timelines, and the WebGL canvas settle before the frame is taken. Raise `--window-size` height to capture more of the page; scroll-triggered sections below the fold need a taller window or a scripted scroll. Checking computed styles is not a substitute — it confirms CSS parsed, not that anything is visible.

---

## File Structure

| File | Responsibility |
|---|---|
| `app/layout.tsx` | Font variables, `<html>` metadata, JSON-LD injection, mounts `SmoothScroll` + `CookieConsent` |
| `app/page.tsx` | Composes `SearchProvider` → `Header` → sections → `SearchDock` |
| `app/globals.css` | `@theme` design tokens, base resets, lattice utilities |
| `types/index.ts` | `Category`, `Group`, `GroupMetrics`, `Faq`, `PlatformStat` |
| `lib/data/categories.ts` | 12 seed categories |
| `lib/data/groups.ts` | 24 seed groups |
| `lib/data/faqs.ts` | 6 SRS-derived FAQ entries |
| `lib/data/stats.ts` | Platform stat-band figures |
| `lib/search/score.ts` | Query parsing + confidence scoring + ordering (pure) |
| `lib/search/score.test.ts` | Vitest suite for the above |
| `lib/search/useSearch.ts` | Debounced hook wrapping `searchGroups` |
| `lib/motion/gsap.ts` | Single `registerPlugin` call + `useMatchMedia` helper |
| `lib/motion/useReveal.ts` | Shared scroll-reveal hook |
| `lib/seo/schema.ts` | `WebSite` + `ItemList` JSON-LD builders |
| `lib/utils/cn.ts` | `clsx` + `tailwind-merge` |
| `lib/utils/format.ts` | Compact number + relative date formatting |
| `components/providers/SmoothScroll.tsx` | Lenis instance wired to `gsap.ticker` |
| `components/providers/SearchProvider.tsx` | Query/results context shared by dock and constellation |
| `components/layout/Header.tsx` | Logo, category nav, header search slot, Add Group CTA, auth links |
| `components/layout/Footer.tsx` | Category columns, legal links, lattice backdrop |
| `components/layout/CookieConsent.tsx` | SRS §3.14 consent banner with `localStorage` persistence |
| `components/hero/Hero.tsx` | Headline, sub-copy, hero search slot, query chips, scroll cue |
| `components/hero/Constellation.tsx` | R3F `<Canvas>` wrapper, visibility gating, mobile fallback |
| `components/hero/ConstellationField.tsx` | Instanced nodes + line segments + cursor/query reactions |
| `components/hero/SearchDock.tsx` | The morphing fixed search bar |
| `components/hero/Suggestions.tsx` | Type-ahead dropdown (FR-AI-03) |
| `components/hero/QueryChips.tsx` | Natural-language example chips (FR-AI-02) |
| `components/sections/StatBand.tsx` | Count-up platform metrics |
| `components/sections/CategoryLattice.tsx` | 12 category tiles in a hex-offset grid (FR-CM-02) |
| `components/sections/TrendingGroups.tsx` | Metric-ranked group cards + filter chips (FR-ME-01, FR-AI-04) |
| `components/sections/HowItWorks.tsx` | Pinned horizontal find-flow + submit-flow (FR-GL-02) |
| `components/sections/TrustSafety.tsx` | Verification, reporting, thresholds, infrastructure |
| `components/sections/RecentGroups.tsx` | Newest listings |
| `components/sections/AddGroupBand.tsx` | Full-bleed Add Group CTA (FR-GL-01) |
| `components/sections/Faq.tsx` | Accordion |
| `components/ui/Button.tsx` | Variant-based button/link |
| `components/ui/Badge.tsx` | Category, location, and status pills |
| `components/ui/SectionHeading.tsx` | Eyebrow + Bricolage display heading + masked wipe |
| `components/ui/LatticeBackdrop.tsx` | Shared SVG triangular-lattice motif |
| `components/ui/GroupCard.tsx` | Group tile with initials avatar + locked-link state (FR-GV-04) |
| `components/ui/CategoryTile.tsx` | Magnetic-hover category tile |
| `components/ui/FilterChips.tsx` | Group-size / category filters |

---

## Task 1: Scaffold, design tokens, and typography

**Files:**
- Create: `D:\Work\Jewishchat\Jewishchat` (Next.js scaffold)
- Modify: `app/globals.css`, `app/layout.tsx`, `app/page.tsx`
- Create: `lib/utils/cn.ts`

**Interfaces:**
- Consumes: nothing
- Produces: CSS custom properties `--color-brand-green`, `--color-brand-deep`, `--color-brand-soft`, `--color-brand-softer`, `--color-ink-1`…`--color-ink-4`, `--color-surface-bg`, `--color-surface-card`, `--color-surface-line`, `--color-surface-line-strong`, `--color-state-{success,error,warning,info}`, `--color-state-bg-{success,error,warning,info}`, `--font-display`, `--font-sans`; and `cn(...classes: ClassValue[]): string`

- [ ] **Step 1: Scaffold the app in place**

The directory `D:\Work\Jewishchat\Jewishchat` already exists and contains only `docs/`. Scaffold into it with `.`.

Flag notes, verified against `create-next-app@16.3.0 --help`: there is **no** `--turbopack` flag (Turbopack is the Next 16 default), the skip-install flag is `--skip-install` not `--no-install`, and `--src-dir` is opt-in so it is simply omitted.

Scaffolding into `.` directly **fails**: `create-next-app` derives the package name from the directory name, and `Jewishchat` has a capital letter, which npm rejects as an invalid package name. There is no flag to override the derived name. Scaffold into a temporary lowercase directory and move the files across:

```bash
cd "D:/Work/Jewishchat" && npx --yes create-next-app@16.3.0 jc-scaffold --typescript --tailwind --app --eslint --import-alias "@/*" --skip-install --disable-git --yes && (cd jc-scaffold && tar cf - .) | (cd Jewishchat && tar xf -) && rm -rf jc-scaffold
```

Expected: `D:/Work/Jewishchat/Jewishchat` now holds `app/`, `package.json` (with `"name": "jewishchat"`), `tsconfig.json`, `postcss.config.mjs`, and `eslint.config.mjs` alongside the pre-existing `docs/`. No `node_modules` yet.

- [ ] **Step 2: Confirm the scaffold is not inside `src/`**

`--yes` reuses saved preferences, which on this machine may include a `src/` directory from earlier projects. Every path in this plan assumes a flat root.

```bash
cd "D:/Work/Jewishchat/Jewishchat" && ls app/layout.tsx
```

Expected: the file exists. If instead `src/app/layout.tsx` exists, flatten it:

```bash
cd "D:/Work/Jewishchat/Jewishchat" && mv src/app app && rmdir src
```

- [ ] **Step 3: Pin dependencies and install**

TypeScript 7 is published but Next 16 is validated against TypeScript 5; pin to 5 to avoid tooling surprises.

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npm install gsap@3.15.0 lenis@1.3.26 three@0.185.1 @react-three/fiber@9.7.0 @react-three/drei@10.7.8 lucide-react@1.31.0 clsx@2.1.1 tailwind-merge@3.6.0 geist@1.7.2 && npm install -D typescript@^5 @types/three@^0.185.0 vitest@^4
```

Expected: install completes, no peer-dependency errors.

- [ ] **Step 4: Initialise git and make the baseline commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && git init && git add -A && git commit -m "chore: scaffold Next.js app with design dependencies"
```

- [ ] **Step 5: Write the design tokens**

Replace the entire contents of `app/globals.css`:

```css
@import "tailwindcss";

@theme {
  /* Typography — Bricolage Grotesque display, Geist body */
  --font-display: var(--font-bricolage), ui-sans-serif, system-ui, sans-serif;
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;

  /* Brand — only --color-brand-green is authoritative (#1E9783) */
  --color-brand-green: #1e9783;
  --color-brand-deep: #0e6e5c;
  --color-brand-soft: #e9f2ef;
  --color-brand-softer: #f1f8f5;

  /* Ink */
  --color-ink-1: #12211e;
  --color-ink-2: #3a4a45;
  --color-ink-3: #75857f;
  --color-ink-4: #9eada7;
  --color-ink-on-gradient: #0e1a18;

  /* Surface — --color-surface-bg is authoritative (#F6F6F4) */
  --color-surface-bg: #f6f6f4;
  --color-surface-card: #ffffff;
  --color-surface-line: #e9e9e7;
  --color-surface-line-strong: #dadad8;

  /* State */
  --color-state-success: #1e9783;
  --color-state-error: #c24a4e;
  --color-state-warning: #c0902a;
  --color-state-info: #4e7fc6;

  --color-state-bg-success: #eaf7f3;
  --color-state-bg-error: #fbe1e4;
  --color-state-bg-warning: #fbf0d6;
  --color-state-bg-info: #e7edfb;

  /* Motion */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-quint: cubic-bezier(0.83, 0, 0.17, 1);

  /* Layout — the seven-column motif */
  --spacing-gutter: 1.5rem;
}

@layer base {
  html {
    background-color: var(--color-surface-bg);
    color: var(--color-ink-1);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  body {
    font-family: var(--font-sans);
    overflow-x: hidden;
  }

  ::selection {
    background-color: var(--color-brand-green);
    color: #ffffff;
  }

  /* Lenis */
  html.lenis,
  html.lenis body {
    height: auto;
  }
  .lenis.lenis-smooth {
    scroll-behavior: auto !important;
  }
}

@layer utilities {
  /* Display type — Bricolage variable axes */
  .font-display {
    font-family: var(--font-display);
    font-variation-settings: "wdth" 100, "opsz" 48;
    letter-spacing: -0.03em;
  }
  .font-display-tight {
    font-family: var(--font-display);
    font-variation-settings: "wdth" 92, "opsz" 96;
    letter-spacing: -0.045em;
  }

  /* The seven-column motif: content grid used by every section */
  .grid-seven {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: var(--spacing-gutter);
  }

  /* Triangular lattice: two 60° diagonals crossed with horizontals.
     Must be repeating-linear-gradient — a plain linear-gradient with a 1px
     colour stop draws ONE sliver along the gradient axis, not a repeating
     rule, so the diagonals vanish and only the axis-aligned lines survive. */
  .lattice-bg {
    background-image:
      repeating-linear-gradient(
        60deg,
        transparent 0 55px,
        color-mix(in oklab, var(--color-brand-green) 9%, transparent) 55px 56px
      ),
      repeating-linear-gradient(
        -60deg,
        transparent 0 55px,
        color-mix(in oklab, var(--color-brand-green) 9%, transparent) 55px 56px
      ),
      repeating-linear-gradient(
        0deg,
        transparent 0 47px,
        color-mix(in oklab, var(--color-brand-green) 7%, transparent) 47px 48px
      );
  }

  /* Clip-mask used by SplitText line reveals */
  .reveal-mask {
    clip-path: inset(0 0 100% 0);
  }

  .text-balance {
    text-wrap: balance;
  }
}
```

- [ ] **Step 6: Wire the fonts in the root layout**

Replace `app/layout.tsx` entirely:

```tsx
import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

// `wght` is the default axis and must NOT be listed in `axes`.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["opsz", "wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JewishChat — Find the WhatsApp groups your community is already in",
  description:
    "A curated directory of WhatsApp groups for Jewish businesses, shuls, learning, chesed and community life. Ask in plain language and get ranked results.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${GeistSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Add the class-merge utility**

Create `lib/utils/cn.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes));
}
```

- [ ] **Step 8: Reduce the homepage to a token proof**

Replace `app/page.tsx` entirely:

```tsx
export default function Home() {
  return (
    <main className="lattice-bg min-h-dvh px-6 py-24">
      <h1 className="font-display-tight text-ink-1 text-6xl md:text-8xl">
        JewishChat
      </h1>
      <p className="text-ink-3 mt-4 max-w-md text-lg">
        Geist body copy. Token proof only — replaced in Task 8.
      </p>
      <div className="mt-10 flex gap-3">
        <span className="bg-brand-green size-12 rounded-xl" />
        <span className="bg-brand-deep size-12 rounded-xl" />
        <span className="bg-brand-soft size-12 rounded-xl" />
        <span className="bg-state-bg-info size-12 rounded-xl" />
      </div>
    </main>
  );
}
```

- [ ] **Step 9: Verify types and build**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npx tsc --noEmit && npm run build
```

Expected: `tsc` exits 0 with no output; build reports `/` as a static route.

- [ ] **Step 10: Verify in the browser**

Start the dev server with the `preview_start` tool (create `.claude/launch.json` with a `jewishchat` config on port 3000 running `npm run dev`), then confirm: the `JewishChat` heading renders in Bricolage Grotesque (not a fallback), the body text in Geist, the page background is `#F6F6F4`, the four swatches show teal / deep teal / pale mint / pale blue, and a faint triangular lattice is visible.

- [ ] **Step 11: Commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && git add -A && git commit -m "feat: design tokens, Bricolage + Geist typography, lattice motif"
```

---

## Task 2: Types and seed data

**Files:**
- Create: `types/index.ts`, `lib/data/categories.ts`, `lib/data/groups.ts`, `lib/data/faqs.ts`, `lib/data/stats.ts`, `lib/utils/format.ts`

**Interfaces:**
- Consumes: nothing
- Produces: types `Category`, `GroupMetrics`, `Group`, `Faq`, `PlatformStat`; constants `CATEGORIES: Category[]`, `GROUPS: Group[]`, `FAQS: Faq[]`, `PLATFORM_STATS: PlatformStat[]`; helpers `categoryById(id: string): Category | undefined`, `groupsByCategory(categoryId: string): Group[]`, `formatCompact(n: number): string`, `formatRelativeDate(iso: string): string`

- [ ] **Step 1: Define the domain types**

Create `types/index.ts`. Field names mirror the SRS entities so a real API can drop in unchanged.

```ts
export type Category = {
  id: string;
  name: string;
  /** FR-CM-02: public URL is domain/{slug} */
  slug: string;
  description: string;
  /** lucide-react icon name */
  icon: string;
  groupCount: number;
};

/** FR-ME-01 */
export type GroupMetrics = {
  totalViews: number;
  uniqueViews: number;
  totalClicks: number;
  uniqueClicks: number;
};

export type Group = {
  id: string;
  name: string;
  /** FR-GL-05: public URL is domain/{categorySlug}/{slug} */
  slug: string;
  shortDescription: string;
  about?: string;
  categoryId: string;
  additionalCategoryIds: string[];
  location: string;
  memberCount?: number;
  /** FR-GL-02 step 4: placeholder avatar when no photo uploaded */
  initials: string;
  /** FR-GV-04: link visible to authenticated users only */
  loginRestricted: boolean;
  /** FR-GS-02: suspended groups are never shown publicly */
  status: "active" | "suspended";
  metrics: GroupMetrics;
  createdAt: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
};

export type PlatformStat = {
  id: string;
  value: number;
  suffix?: string;
  label: string;
};
```

- [ ] **Step 2: Seed the categories**

Create `lib/data/categories.ts`:

```ts
import type { Category } from "@/types";

export const CATEGORIES: Category[] = [
  {
    id: "c-business",
    name: "Business & Trades",
    slug: "business-trades",
    description: "Contractors, suppliers, and service providers serving the community.",
    icon: "Briefcase",
    groupCount: 412,
  },
  {
    id: "c-torah",
    name: "Torah & Learning",
    slug: "torah-learning",
    description: "Daily shiurim, chavrusa matching, and study groups.",
    icon: "BookOpen",
    groupCount: 638,
  },
  {
    id: "c-shuls",
    name: "Shuls & Minyanim",
    slug: "shuls-minyanim",
    description: "Minyan times, davening updates, and shul announcements.",
    icon: "Landmark",
    groupCount: 521,
  },
  {
    id: "c-realestate",
    name: "Real Estate",
    slug: "real-estate",
    description: "Rentals, sales, and listings across communities.",
    icon: "Building2",
    groupCount: 287,
  },
  {
    id: "c-jobs",
    name: "Jobs & Parnassa",
    slug: "jobs-parnassa",
    description: "Openings, freelance work, and hiring boards.",
    icon: "BriefcaseBusiness",
    groupCount: 244,
  },
  {
    id: "c-chesed",
    name: "Chesed & Tzedakah",
    slug: "chesed-tzedakah",
    description: "Volunteering, gemachs, and mutual aid networks.",
    icon: "HeartHandshake",
    groupCount: 356,
  },
  {
    id: "c-simchas",
    name: "Simchas & Events",
    slug: "simchas-events",
    description: "Weddings, bar mitzvahs, and community events.",
    icon: "PartyPopper",
    groupCount: 198,
  },
  {
    id: "c-food",
    name: "Food & Kashrus",
    slug: "food-kashrus",
    description: "Kosher restaurants, caterers, and hashgacha alerts.",
    icon: "UtensilsCrossed",
    groupCount: 309,
  },
  {
    id: "c-marketplace",
    name: "Marketplace",
    slug: "marketplace",
    description: "Buy, sell, and trade within the community.",
    icon: "Tags",
    groupCount: 467,
  },
  {
    id: "c-shidduchim",
    name: "Shidduchim",
    slug: "shidduchim",
    description: "Shadchanim, singles networks, and resource groups.",
    icon: "Users",
    groupCount: 132,
  },
  {
    id: "c-travel",
    name: "Travel & Aliyah",
    slug: "travel-aliyah",
    description: "Flights, hosting, and moving to Eretz Yisrael.",
    icon: "Plane",
    groupCount: 176,
  },
  {
    id: "c-health",
    name: "Health & Wellness",
    slug: "health-wellness",
    description: "Practitioners, support groups, and referrals.",
    icon: "Stethoscope",
    groupCount: 221,
  },
];

export function categoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
```

- [ ] **Step 3: Seed the groups**

Create `lib/data/groups.ts`. Note groups `g-01` and `g-22` are tuned to satisfy the two natural-language queries the SRS names in FR-AI-02, and `g-24` is `suspended` so Task 3 can prove suspended groups are filtered out.

```ts
import type { Group } from "@/types";

export const GROUPS: Group[] = [
  {
    id: "g-01",
    name: "Lakewood Contractors Network",
    slug: "lakewood-contractors-network",
    shortDescription:
      "Vetted roofing, plumbing, and general contractors serving Lakewood. Financing options posted weekly.",
    about:
      "Members share quotes, licensing checks, and financing referrals for home projects across Ocean County.",
    categoryId: "c-business",
    additionalCategoryIds: ["c-realestate"],
    location: "Lakewood, NJ",
    memberCount: 1240,
    initials: "LC",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 48210, uniqueViews: 21840, totalClicks: 9120, uniqueClicks: 6410 },
    createdAt: "2026-02-11T09:00:00.000Z",
  },
  {
    id: "g-02",
    name: "Brooklyn Roofing & Siding Pros",
    slug: "brooklyn-roofing-siding-pros",
    shortDescription:
      "Licensed roofing contractors covering Boro Park, Flatbush, and Williamsburg. Quotes and financing referrals.",
    categoryId: "c-business",
    additionalCategoryIds: [],
    location: "Brooklyn, NY",
    memberCount: 480,
    initials: "BR",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 19430, uniqueViews: 8890, totalClicks: 3120, uniqueClicks: 2240 },
    createdAt: "2026-03-04T09:00:00.000Z",
  },
  {
    id: "g-03",
    name: "Daf Yomi Live",
    slug: "daf-yomi-live",
    shortDescription:
      "Daily Daf shiur links, siyum schedules, and audio recordings posted each morning.",
    categoryId: "c-torah",
    additionalCategoryIds: [],
    location: "Jerusalem",
    memberCount: 8900,
    initials: "DY",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 132400, uniqueViews: 71200, totalClicks: 41800, uniqueClicks: 29600 },
    createdAt: "2026-01-08T09:00:00.000Z",
  },
  {
    id: "g-04",
    name: "Chavrusa Connect",
    slug: "chavrusa-connect",
    shortDescription:
      "Find a learning partner by seder, sugya, and time zone. New matches posted daily.",
    categoryId: "c-torah",
    additionalCategoryIds: [],
    location: "Monsey, NY",
    memberCount: 2100,
    initials: "CC",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 38900, uniqueViews: 17300, totalClicks: 8400, uniqueClicks: 5900 },
    createdAt: "2026-02-19T09:00:00.000Z",
  },
  {
    id: "g-05",
    name: "Minyan Finder Lakewood",
    slug: "minyan-finder-lakewood",
    shortDescription:
      "Real-time minyan times for shacharis, mincha, and maariv across 200+ batei midrash.",
    categoryId: "c-shuls",
    additionalCategoryIds: [],
    location: "Lakewood, NJ",
    memberCount: 5600,
    initials: "MF",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 96700, uniqueViews: 44100, totalClicks: 28900, uniqueClicks: 19400 },
    createdAt: "2026-01-22T09:00:00.000Z",
  },
  {
    id: "g-06",
    name: "Boro Park Minyanim",
    slug: "boro-park-minyanim",
    shortDescription:
      "Live davening updates, late minyanim, and yom tov schedules for Boro Park.",
    categoryId: "c-shuls",
    additionalCategoryIds: [],
    location: "Brooklyn, NY",
    memberCount: 3400,
    initials: "BP",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 61200, uniqueViews: 28700, totalClicks: 16800, uniqueClicks: 11200 },
    createdAt: "2026-03-15T09:00:00.000Z",
  },
  {
    id: "g-07",
    name: "Jerusalem Rentals & Sublets",
    slug: "jerusalem-rentals-sublets",
    shortDescription:
      "Short and long term rentals in Nachlaot, Rechavia, and Katamon. Owner-posted listings only.",
    categoryId: "c-realestate",
    additionalCategoryIds: ["c-travel"],
    location: "Jerusalem",
    memberCount: 4750,
    initials: "JR",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 74300, uniqueViews: 33100, totalClicks: 19600, uniqueClicks: 13400 },
    createdAt: "2026-02-02T09:00:00.000Z",
  },
  {
    id: "g-08",
    name: "Lakewood Home Listings",
    slug: "lakewood-home-listings",
    shortDescription:
      "New homes, resales, and rentals posted by local agents and owners across Lakewood.",
    categoryId: "c-realestate",
    additionalCategoryIds: [],
    location: "Lakewood, NJ",
    memberCount: 2980,
    initials: "LH",
    loginRestricted: true,
    status: "active",
    metrics: { totalViews: 52800, uniqueViews: 24900, totalClicks: 12100, uniqueClicks: 8700 },
    createdAt: "2026-04-01T09:00:00.000Z",
  },
  {
    id: "g-09",
    name: "Frum Jobs Board",
    slug: "frum-jobs-board",
    shortDescription:
      "Full-time, part-time, and remote openings for the community. New roles posted daily.",
    categoryId: "c-jobs",
    additionalCategoryIds: [],
    location: "Brooklyn, NY",
    memberCount: 6300,
    initials: "FJ",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 118900, uniqueViews: 52400, totalClicks: 34200, uniqueClicks: 22800 },
    createdAt: "2026-01-14T09:00:00.000Z",
  },
  {
    id: "g-10",
    name: "Tech Parnassa Network",
    slug: "tech-parnassa-network",
    shortDescription:
      "Developers, designers, and product managers sharing referrals, contracts, and remote openings.",
    categoryId: "c-jobs",
    additionalCategoryIds: ["c-business"],
    location: "Remote",
    memberCount: 1870,
    initials: "TP",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 31400, uniqueViews: 14200, totalClicks: 7300, uniqueClicks: 5100 },
    createdAt: "2026-03-27T09:00:00.000Z",
  },
  {
    id: "g-11",
    name: "Bikur Cholim Volunteers",
    slug: "bikur-cholim-volunteers",
    shortDescription:
      "Coordinating hospital visits, meals, and transport for families in need across Baltimore.",
    categoryId: "c-chesed",
    additionalCategoryIds: ["c-health"],
    location: "Baltimore, MD",
    memberCount: 920,
    initials: "BC",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 22600, uniqueViews: 10400, totalClicks: 4900, uniqueClicks: 3600 },
    createdAt: "2026-02-25T09:00:00.000Z",
  },
  {
    id: "g-12",
    name: "Lakewood Gemach Directory",
    slug: "lakewood-gemach-directory",
    shortDescription:
      "Every gemach in town: baby gear, medical equipment, simcha supplies, and seforim.",
    categoryId: "c-chesed",
    additionalCategoryIds: ["c-marketplace"],
    location: "Lakewood, NJ",
    memberCount: 3150,
    initials: "LG",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 57100, uniqueViews: 26300, totalClicks: 14700, uniqueClicks: 10200 },
    createdAt: "2026-01-30T09:00:00.000Z",
  },
  {
    id: "g-13",
    name: "Simcha Hall Availability",
    slug: "simcha-hall-availability",
    shortDescription:
      "Last-minute hall openings, band availability, and vendor recommendations across Rockland.",
    categoryId: "c-simchas",
    additionalCategoryIds: ["c-business"],
    location: "Monsey, NY",
    memberCount: 1410,
    initials: "SH",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 27800, uniqueViews: 12900, totalClicks: 6200, uniqueClicks: 4400 },
    createdAt: "2026-04-09T09:00:00.000Z",
  },
  {
    id: "g-14",
    name: "Miami Community Events",
    slug: "miami-community-events",
    shortDescription:
      "Shiurim, melava malkas, and family events across Miami Beach, Aventura, and Surfside.",
    categoryId: "c-simchas",
    additionalCategoryIds: [],
    location: "Miami, FL",
    memberCount: 2240,
    initials: "MC",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 41300, uniqueViews: 19100, totalClicks: 9800, uniqueClicks: 6900 },
    createdAt: "2026-03-08T09:00:00.000Z",
  },
  {
    id: "g-15",
    name: "Kosher Miami Eats",
    slug: "kosher-miami-eats",
    shortDescription:
      "New restaurant openings, hashgacha changes, and takeout deals across South Florida.",
    categoryId: "c-food",
    additionalCategoryIds: [],
    location: "Miami, FL",
    memberCount: 3880,
    initials: "KM",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 68400, uniqueViews: 31200, totalClicks: 18300, uniqueClicks: 12600 },
    createdAt: "2026-02-14T09:00:00.000Z",
  },
  {
    id: "g-16",
    name: "Hashgacha Alerts",
    slug: "hashgacha-alerts",
    shortDescription:
      "Verified kashrus alerts and product recalls from recognised certifying agencies.",
    categoryId: "c-food",
    additionalCategoryIds: [],
    location: "Brooklyn, NY",
    memberCount: 7200,
    initials: "HA",
    loginRestricted: true,
    status: "active",
    metrics: { totalViews: 104700, uniqueViews: 48600, totalClicks: 26400, uniqueClicks: 18100 },
    createdAt: "2026-01-19T09:00:00.000Z",
  },
  {
    id: "g-17",
    name: "Monsey Marketplace",
    slug: "monsey-marketplace",
    shortDescription:
      "Buy, sell, and trade furniture, seforim, strollers, and household items locally.",
    categoryId: "c-marketplace",
    additionalCategoryIds: [],
    location: "Monsey, NY",
    memberCount: 5020,
    initials: "MM",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 89200, uniqueViews: 40800, totalClicks: 23100, uniqueClicks: 15900 },
    createdAt: "2026-02-06T09:00:00.000Z",
  },
  {
    id: "g-18",
    name: "London Frum Marketplace",
    slug: "london-frum-marketplace",
    shortDescription:
      "Golders Green and Hendon classifieds. Free listings, private sellers only, no dealers.",
    categoryId: "c-marketplace",
    additionalCategoryIds: [],
    location: "London, UK",
    memberCount: 1660,
    initials: "LF",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 29400, uniqueViews: 13700, totalClicks: 6800, uniqueClicks: 4700 },
    createdAt: "2026-04-16T09:00:00.000Z",
  },
  {
    id: "g-19",
    name: "Shidduch Resource Network",
    slug: "shidduch-resource-network",
    shortDescription:
      "Shadchanim, resume circulation guidelines, and community shidduch initiatives.",
    categoryId: "c-shidduchim",
    additionalCategoryIds: [],
    location: "Lakewood, NJ",
    memberCount: 2450,
    initials: "SR",
    loginRestricted: true,
    status: "active",
    metrics: { totalViews: 44900, uniqueViews: 20600, totalClicks: 10300, uniqueClicks: 7200 },
    createdAt: "2026-03-19T09:00:00.000Z",
  },
  {
    id: "g-20",
    name: "Aliyah Planning Group",
    slug: "aliyah-planning-group",
    shortDescription:
      "Nefesh B'Nefesh timelines, shipping, klita advice, and neighbourhood comparisons.",
    categoryId: "c-travel",
    additionalCategoryIds: ["c-realestate"],
    location: "Beit Shemesh",
    memberCount: 4110,
    initials: "AP",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 71800, uniqueViews: 32400, totalClicks: 17200, uniqueClicks: 11800 },
    createdAt: "2026-01-27T09:00:00.000Z",
  },
  {
    id: "g-21",
    name: "Kosher Travel Deals",
    slug: "kosher-travel-deals",
    shortDescription:
      "Flight fares, kosher meal tips, and Pesach programme openings posted as they drop.",
    categoryId: "c-travel",
    additionalCategoryIds: [],
    location: "Toronto, ON",
    memberCount: 1930,
    initials: "KT",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 33600, uniqueViews: 15400, totalClicks: 8100, uniqueClicks: 5600 },
    createdAt: "2026-04-22T09:00:00.000Z",
  },
  {
    id: "g-22",
    name: "Frum Business Forum Florida",
    slug: "frum-business-forum-florida",
    shortDescription:
      "Networking forum for business owners across South Florida. Monthly meetups and referrals.",
    about:
      "Open to owners and senior operators. Members post deal flow, vendor reviews, and hiring needs.",
    categoryId: "c-business",
    additionalCategoryIds: ["c-jobs"],
    location: "Boca Raton, FL",
    memberCount: 1120,
    initials: "FB",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 26100, uniqueViews: 12200, totalClicks: 5700, uniqueClicks: 4100 },
    createdAt: "2026-03-31T09:00:00.000Z",
  },
  {
    id: "g-23",
    name: "Community Health Referrals",
    slug: "community-health-referrals",
    shortDescription:
      "Vetted specialists, second opinions, and insurance navigation from local askanim.",
    categoryId: "c-health",
    additionalCategoryIds: ["c-chesed"],
    location: "Brooklyn, NY",
    memberCount: 2760,
    initials: "CH",
    loginRestricted: false,
    status: "active",
    metrics: { totalViews: 49700, uniqueViews: 22800, totalClicks: 11400, uniqueClicks: 8000 },
    createdAt: "2026-02-28T09:00:00.000Z",
  },
  {
    id: "g-24",
    name: "Manchester Support Circle",
    slug: "manchester-support-circle",
    shortDescription:
      "Peer support for families managing chronic illness. Moderated and confidential.",
    categoryId: "c-health",
    additionalCategoryIds: [],
    location: "Manchester, UK",
    memberCount: 640,
    initials: "MS",
    loginRestricted: true,
    // FR-GS-02: suspended groups must never appear publicly.
    status: "suspended",
    metrics: { totalViews: 8900, uniqueViews: 4100, totalClicks: 1600, uniqueClicks: 1100 },
    createdAt: "2026-04-27T09:00:00.000Z",
  },
];

/** FR-GS-02 — the only list any public surface should render. */
export const PUBLIC_GROUPS: Group[] = GROUPS.filter((g) => g.status === "active");

export function groupsByCategory(categoryId: string): Group[] {
  return PUBLIC_GROUPS.filter(
    (g) => g.categoryId === categoryId || g.additionalCategoryIds.includes(categoryId),
  );
}
```

- [ ] **Step 4: Seed FAQs and stats**

Create `lib/data/faqs.ts`:

```ts
import type { Faq } from "@/types";

export const FAQS: Faq[] = [
  {
    id: "f-1",
    question: "Do I need an account to browse?",
    answer:
      "No. Anyone can search the directory and open group pages. An account is only needed to add a group, to report a listing, or to open links whose owner restricted them to signed-in members.",
  },
  {
    id: "f-2",
    question: "What do I need to list a group?",
    answer:
      "A verified email address and a verified WhatsApp number. You will receive a six-digit code by email, then a second code on WhatsApp. Once both are confirmed your listing publishes to the directory immediately.",
  },
  {
    id: "f-3",
    question: "How does the search actually work?",
    answer:
      "Ask the way you would ask a friend — \u201Croofing contractors in Lakewood with financing\u201D. The query is parsed for topic, place, and group size, and every result carries a confidence score. Results are ordered by that score, highest first.",
  },
  {
    id: "f-4",
    question: "Can I hide my group link from the public?",
    answer:
      "Yes. Turn on \u201Crestrict to signed-in members\u201D when you submit. The listing stays fully visible and searchable, but the join link only appears to signed-in members.",
  },
  {
    id: "f-5",
    question: "How are listings moderated?",
    answer:
      "Any signed-in member can report a group for a broken link or inappropriate content. Reports are reviewed by moderators, and a listing that passes the report threshold is suspended automatically pending review.",
  },
  {
    id: "f-6",
    question: "What happens to a group that gets suspended?",
    answer:
      "It disappears from the directory and from search results straight away. The owner can correct the listing and resubmit it with a note to the moderation team.",
  },
];
```

Create `lib/data/stats.ts`:

```ts
import type { PlatformStat } from "@/types";

export const PLATFORM_STATS: PlatformStat[] = [
  { id: "s-groups", value: 3961, label: "Groups listed" },
  { id: "s-categories", value: 12, label: "Categories" },
  { id: "s-members", value: 412, suffix: "k", label: "Members reached" },
  { id: "s-cities", value: 46, label: "Cities worldwide" },
];
```

- [ ] **Step 5: Add formatting helpers**

Create `lib/utils/format.ts`:

```ts
export function formatCompact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const k = n / 1000;
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  const m = n / 1_000_000;
  return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, "")}m`;
}

/** Deterministic relative date against a fixed "now" so SSR and client agree. */
const NOW = new Date("2026-08-09T00:00:00.000Z").getTime();

export function formatRelativeDate(iso: string): string {
  const days = Math.floor((NOW - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}
```

The fixed `NOW` matters: a live `Date.now()` would produce different strings on server and client and trigger a hydration mismatch.

- [ ] **Step 6: Verify types**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && git add -A && git commit -m "feat: domain types and seed directory data"
```

---

## Task 3: Conversational search scoring (TDD)

This is the one task with real tests. `searchGroups` powers the hero type-ahead, the constellation's query reaction, and the ordering guarantee in FR-AI-06.

**Files:**
- Create: `vitest.config.ts`, `lib/search/score.ts`, `lib/search/score.test.ts`
- Modify: `package.json` (test script)

**Interfaces:**
- Consumes: `Group` from `@/types`, `PUBLIC_GROUPS` from `@/lib/data/groups`, `CATEGORIES`/`categoryById` from `@/lib/data/categories`
- Produces:
  - `type ParsedQuery = { terms: string[]; location: string | null; minMembers: number | null }`
  - `parseQuery(raw: string): ParsedQuery`
  - `type ScoredGroup = { group: Group; confidence: number }`
  - `searchGroups(raw: string, groups?: Group[]): ScoredGroup[]`

- [ ] **Step 1: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node", include: ["lib/**/*.test.ts"] },
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
});
```

Add to the `scripts` block of `package.json`:

```json
"test": "vitest run"
```

- [ ] **Step 2: Write the failing tests**

Create `lib/search/score.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseQuery, searchGroups } from "./score";
import { GROUPS } from "@/lib/data/groups";

describe("parseQuery", () => {
  it("extracts a location named in the query", () => {
    expect(parseQuery("roofing contractors in Lakewood").location).toBe("lakewood");
  });

  it("extracts a member-count floor from 'over N members'", () => {
    expect(parseQuery("business forums with over 100 members").minMembers).toBe(100);
  });

  it("extracts a member-count floor from 'N+'", () => {
    expect(parseQuery("groups with 500+ members").minMembers).toBe(500);
  });

  it("drops stopwords from the term list", () => {
    expect(parseQuery("find me a group for roofing")).toMatchObject({
      terms: ["roofing"],
    });
  });
});

describe("searchGroups", () => {
  it("returns nothing for an empty query", () => {
    expect(searchGroups("")).toEqual([]);
    expect(searchGroups("   ")).toEqual([]);
  });

  it("never returns a suspended group (FR-GS-02)", () => {
    const results = searchGroups("support circle manchester chronic illness", GROUPS);
    expect(results.some((r) => r.group.id === "g-24")).toBe(false);
  });

  it("orders results by descending confidence (FR-AI-06)", () => {
    const results = searchGroups("kosher food in Miami");
    expect(results.length).toBeGreaterThan(1);
    for (let i = 1; i < results.length; i += 1) {
      expect(results[i - 1].confidence).toBeGreaterThanOrEqual(results[i].confidence);
    }
  });

  it("ranks the Lakewood roofing group first for the SRS example query", () => {
    const results = searchGroups("Roofing Contractors in Lakewood with financing");
    expect(results[0].group.id).toBe("g-01");
  });

  it("ranks the Florida business forum first for the SRS example query", () => {
    const results = searchGroups("Business forums in Florida with over 100 members");
    expect(results[0].group.id).toBe("g-22");
  });

  it("demotes groups that fall below an explicit member floor", () => {
    const results = searchGroups("marketplace with over 3000 members");
    const monsey = results.find((r) => r.group.id === "g-17"); // 5020 members
    const london = results.find((r) => r.group.id === "g-18"); // 1660 members
    expect(monsey).toBeDefined();
    expect(london).toBeDefined();
    expect(monsey!.confidence).toBeGreaterThan(london!.confidence);
  });

  it("clamps confidence to the 0..1 range", () => {
    for (const r of searchGroups("lakewood contractors network roofing financing")) {
      expect(r.confidence).toBeGreaterThan(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    }
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npm test
```

Expected: FAIL — `Failed to resolve import "./score"`.

- [ ] **Step 4: Implement the scorer**

Create `lib/search/score.ts`:

```ts
import type { Group } from "@/types";
import { CATEGORIES } from "@/lib/data/categories";
import { PUBLIC_GROUPS } from "@/lib/data/groups";

export type ParsedQuery = {
  terms: string[];
  location: string | null;
  minMembers: number | null;
};

export type ScoredGroup = {
  group: Group;
  confidence: number;
};

const STOPWORDS = new Set([
  "a", "an", "the", "in", "for", "with", "of", "and", "or", "to", "me", "my",
  "i", "is", "are", "near", "around", "over", "under", "more", "than", "at",
  "group", "groups", "chat", "chats", "whatsapp", "find", "finding", "looking",
  "look", "want", "need", "join", "show", "any", "some", "that", "who", "please",
  "members", "member", "people",
]);

/**
 * Every distinct place name in the directory, longest first.
 *
 * Tokens of three characters or fewer are dropped deliberately. The state
 * abbreviations ("nj", "ny", "fl", "on") would otherwise match as substrings
 * of ordinary words — "contractors" contains "on", which would silently set
 * the location to Toronto and wreck the ranking. Full state names are added
 * separately and resolved through STATE_ALIASES.
 */
const LOCATION_TOKENS: string[] = (() => {
  const tokens = new Set<string>();
  for (const g of PUBLIC_GROUPS) {
    for (const part of g.location.toLowerCase().split(/[,/]/)) {
      const t = part.trim();
      if (t.length > 3) tokens.add(t);
    }
  }
  // Regional aliases the directory implies but never spells out.
  tokens.add("florida");
  tokens.add("new jersey");
  tokens.add("new york");
  return [...tokens].sort((a, b) => b.length - a.length);
})();

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const STATE_ALIASES: Record<string, string[]> = {
  florida: ["fl"],
  "new jersey": ["nj"],
  "new york": ["ny"],
};

function normalise(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9+\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function parseQuery(raw: string): ParsedQuery {
  const text = normalise(raw);
  if (!text) return { terms: [], location: null, minMembers: null };

  let minMembers: number | null = null;
  const overMatch = text.match(/(?:over|more than|at least|above)\s+(\d[\d,]*)/);
  const plusMatch = text.match(/(\d[\d,]*)\s*\+/);
  if (overMatch) minMembers = Number(overMatch[1].replace(/,/g, ""));
  else if (plusMatch) minMembers = Number(plusMatch[1].replace(/,/g, ""));

  // Word-boundary matched, so "monsey" cannot match inside a longer word.
  const location =
    LOCATION_TOKENS.find((loc) => new RegExp(`\\b${escapeRegExp(loc)}\\b`).test(text)) ?? null;

  const consumed = new Set<string>();
  if (location) for (const w of location.split(" ")) consumed.add(w);

  const terms = text
    .split(" ")
    .filter((w) => w.length > 1 && !STOPWORDS.has(w) && !consumed.has(w) && !/^\d[\d,]*\+?$/.test(w));

  return { terms, location, minMembers };
}

/** Does this group sit in the parsed location? */
function matchesLocation(group: Group, location: string): boolean {
  const groupLoc = group.location.toLowerCase();
  if (groupLoc.includes(location)) return true;
  const aliases = STATE_ALIASES[location];
  return aliases ? aliases.some((a) => groupLoc.endsWith(` ${a}`)) : false;
}

function haystacks(group: Group): { name: string; body: string; category: string } {
  const category = CATEGORIES.find((c) => c.id === group.categoryId);
  const extras = group.additionalCategoryIds
    .map((id) => CATEGORIES.find((c) => c.id === id)?.name ?? "")
    .join(" ");
  return {
    name: group.name.toLowerCase(),
    body: `${group.shortDescription} ${group.about ?? ""}`.toLowerCase(),
    category: `${category?.name ?? ""} ${category?.description ?? ""} ${extras}`.toLowerCase(),
  };
}

function scoreGroup(group: Group, parsed: ParsedQuery, fullText: string): number {
  const { name, body, category } = haystacks(group);
  let raw = 0;

  if (fullText.length > 3 && name.includes(fullText)) raw += 0.45;

  for (const term of parsed.terms) {
    if (name.includes(term)) raw += 0.22;
    else if (category.includes(term)) raw += 0.16;
    else if (body.includes(term)) raw += 0.1;
  }

  if (parsed.location) {
    if (matchesLocation(group, parsed.location)) raw += 0.3;
    else raw *= 0.45;
  }

  if (parsed.minMembers !== null) {
    if ((group.memberCount ?? 0) >= parsed.minMembers) raw += 0.18;
    else raw *= 0.35;
  }

  return Math.min(1, raw);
}

export function searchGroups(raw: string, groups: Group[] = PUBLIC_GROUPS): ScoredGroup[] {
  const parsed = parseQuery(raw);
  if (!parsed.terms.length && !parsed.location && parsed.minMembers === null) return [];

  const fullText = normalise(raw);

  return groups
    .filter((g) => g.status === "active") // FR-GS-02
    .map((group) => ({ group, confidence: scoreGroup(group, parsed, fullText) }))
    .filter((r) => r.confidence > 0.05)
    .sort(
      (a, b) =>
        b.confidence - a.confidence ||
        b.group.metrics.uniqueViews - a.group.metrics.uniqueViews ||
        a.group.name.localeCompare(b.group.name),
    );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npm test
```

Expected: PASS — 11 tests across 2 suites (4 in `parseQuery`, 7 in `searchGroups`).

If the two SRS example-query tests fail, the fix is to adjust the weights in `scoreGroup`, not the assertions — those two queries come verbatim from FR-AI-02 and are the acceptance criteria for the whole feature.

- [ ] **Step 6: Add the debounced hook**

Create `lib/search/useSearch.ts`:

```ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { searchGroups, type ScoredGroup } from "./score";

export function useSearch(query: string, delay = 80) {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), delay);
    return () => clearTimeout(t);
  }, [query, delay]);

  const results: ScoredGroup[] = useMemo(() => searchGroups(debounced), [debounced]);

  // Memoised deliberately. A fresh `results.slice(0, 6)` on every render would
  // change SearchProvider's context identity on every keystroke — re-rendering
  // every consumer, including the WebGL canvas, before the debounce even fires.
  const suggestions = useMemo(() => results.slice(0, 6), [results]);

  return {
    results,
    suggestions,
    isSearching: debounced.trim().length > 0,
  };
}
```

- [ ] **Step 7: Verify types and commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npx tsc --noEmit && npm test && git add -A && git commit -m "feat: conversational search scoring with confidence ordering"
```

---

## Task 4: Motion foundation and shared state

**Files:**
- Create: `lib/motion/gsap.ts`, `lib/motion/useReveal.ts`, `components/providers/SmoothScroll.tsx`, `components/providers/SearchProvider.tsx`

**Interfaces:**
- Consumes: `useSearch` from `@/lib/search/useSearch`, `ScoredGroup` from `@/lib/search/score`
- Produces:
  - `registerGsap(): void`, re-exports `gsap`, `ScrollTrigger`, `SplitText`, `useIsomorphicLayoutEffect`
  - `useReveal<T extends HTMLElement>(options?): React.RefObject<T | null>`
  - `<SmoothScroll>{children}</SmoothScroll>`
  - `<SearchProvider>{children}</SearchProvider>` and `useSearchContext(): SearchContextValue` where `SearchContextValue = { query: string; setQuery: (q: string) => void; results: ScoredGroup[]; suggestions: ScoredGroup[]; isSearching: boolean; focused: boolean; setFocused: (f: boolean) => void }`

- [ ] **Step 1: Central GSAP registration**

One module owns `registerPlugin` so no component registers twice. Create `lib/motion/gsap.ts`:

```ts
"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, useLayoutEffect } from "react";

let registered = false;

export function registerGsap(): void {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  registered = true;
}

/** useLayoutEffect warns during SSR; fall back to useEffect on the server. */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export { gsap, ScrollTrigger, SplitText };
```

`SplitText` and `ScrollTrigger` both ship inside the public `gsap@3.15.0` package — verified against the published tarball. No Club GSAP licence is needed.

- [ ] **Step 2: The shared reveal hook**

Every section uses this rather than hand-rolling ScrollTriggers. Create `lib/motion/useReveal.ts`:

```ts
"use client";

import { useRef } from "react";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "./gsap";

type RevealOptions = {
  selector?: string;
  y?: number;
  stagger?: number;
  start?: string;
};

export function useReveal<T extends HTMLElement>(options: RevealOptions = {}) {
  const { selector = "[data-reveal]", y = 28, stagger = 0.07, start = "top 82%" } = options;
  const ref = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };
        const targets = gsap.utils.toArray<HTMLElement>(selector, root);
        if (!targets.length) return;

        if (reduced) {
          gsap.set(targets, { opacity: 1, y: 0 });
          return;
        }

        gsap.fromTo(
          targets,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger,
            ease: "power3.out",
            scrollTrigger: { trigger: root, start },
          },
        );
      },
    );

    return () => mm.revert();
  }, [selector, y, stagger, start]);

  return ref;
}
```

- [ ] **Step 3: Lenis smooth scroll wired to the GSAP ticker**

Lenis must drive `ScrollTrigger.update` or scroll-linked animations will lag behind the smoothed scroll position. Create `components/providers/SmoothScroll.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/motion/gsap";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerGsap();

    // Trigger positions measured before Bricolage and Geist load are wrong,
    // because the swapped-in metrics change every heading's height.
    void document.fonts.ready.then(() => ScrollTrigger.refresh());

    const mm = gsap.matchMedia();

    // Registered through matchMedia rather than a bare `if` so that toggling
    // the OS setting mid-session creates or destroys Lenis live — the same
    // way useReveal reacts. A one-shot `.matches` check in a []-deps effect
    // would strand smooth scrolling on until the next reload.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);

      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      return () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    });

    return () => mm.revert();
  }, []);

  return <>{children}</>;
}
```

- [ ] **Step 4: Shared search state**

The dock, the suggestions list, and the constellation all read one query. Create `components/providers/SearchProvider.tsx`:

```tsx
"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useSearch } from "@/lib/search/useSearch";
import type { ScoredGroup } from "@/lib/search/score";

type SearchContextValue = {
  query: string;
  setQuery: (q: string) => void;
  results: ScoredGroup[];
  suggestions: ScoredGroup[];
  isSearching: boolean;
  focused: boolean;
  setFocused: (f: boolean) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const { results, suggestions, isSearching } = useSearch(query);

  const value = useMemo<SearchContextValue>(
    () => ({ query, setQuery, results, suggestions, isSearching, focused, setFocused }),
    [query, results, suggestions, isSearching, focused],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchContext(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearchContext must be used inside <SearchProvider>");
  return ctx;
}
```

- [ ] **Step 5: Verify and commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npx tsc --noEmit && git add -A && git commit -m "feat: GSAP registration, Lenis scroll, reveal hook, search context"
```

---

## Task 5: UI primitives

Everything visual downstream composes these. Getting the card and tile right here is most of the design.

**Files:**
- Create: `components/ui/Button.tsx`, `components/ui/Badge.tsx`, `components/ui/SectionHeading.tsx`, `components/ui/LatticeBackdrop.tsx`, `components/ui/categoryIcons.ts`, `components/ui/CategoryTile.tsx`, `components/ui/GroupCard.tsx`, `components/ui/FilterChips.tsx`

**Interfaces:**
- Consumes: `cn`, `formatCompact`, `formatRelativeDate`, `Category`, `Group`, `CATEGORIES`, `categoryById`
- Produces:
  - `<Button variant="primary"|"secondary"|"ghost" size="sm"|"md"|"lg" href?: string>`
  - `<Badge tone="brand"|"neutral"|"lock">`
  - `<SectionHeading eyebrow title description? align?="left"|"center">`
  - `<LatticeBackdrop className? />`
  - `CATEGORY_ICONS: Record<string, LucideIcon>`
  - `<CategoryTile category: Category />`
  - `<GroupCard group: Group confidence?: number showDate?: boolean className?: string />`
  - `<FilterChips options={{id,label}[]} active onChange />`

- [ ] **Step 1: Button**

Create `components/ui/Button.tsx`:

```tsx
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-green text-white shadow-[0_1px_2px_color-mix(in_oklab,var(--color-ink-1)_10%,transparent),0_8px_24px_-8px_color-mix(in_oklab,var(--color-brand-green)_55%,transparent)] hover:bg-brand-deep",
  secondary:
    "bg-surface-card text-ink-1 border border-surface-line-strong hover:border-brand-green/50 hover:text-brand-deep",
  ghost: "text-ink-2 hover:text-brand-deep hover:bg-brand-soft",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-[52px] px-7 text-[15px]",
};

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium",
    "transition-all duration-300 ease-[var(--ease-out-expo)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
    "active:scale-[0.97]",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  // Scope note: no routes exist beyond "/", so links are inert by design.
  if (href) {
    return (
      <Link href="#" data-href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Badge**

Create `components/ui/Badge.tsx`:

```tsx
import { cn } from "@/lib/utils/cn";

type Tone = "brand" | "neutral" | "lock";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand-deep",
  neutral: "bg-surface-bg text-ink-3 border border-surface-line",
  lock: "bg-state-bg-warning text-state-warning",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-tight whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Lattice backdrop**

The shared geometric motif — a triangular lattice with a six-point vertex where three axes cross. Create `components/ui/LatticeBackdrop.tsx`:

```tsx
import { cn } from "@/lib/utils/cn";

export function LatticeBackdrop({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id="jc-lattice"
          width="56"
          height="97"
          patternUnits="userSpaceOnUse"
          patternTransform="translate(0 0)"
        >
          <path
            d="M28 0 L56 16.17 L56 48.5 L28 64.67 L0 48.5 L0 16.17 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <path d="M28 0 L28 64.67 M0 16.17 L56 48.5 M56 16.17 L0 48.5" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="jc-lattice-fade" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="jc-lattice-mask">
          <rect width="100%" height="100%" fill="url(#jc-lattice-fade)" />
        </mask>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#jc-lattice)"
        mask="url(#jc-lattice-mask)"
        className="text-brand-green/25"
      />
    </svg>
  );
}
```

- [ ] **Step 4: Section heading with a masked line reveal**

Create `components/ui/SectionHeading.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { gsap, SplitText, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };
        const heading = root.querySelector<HTMLElement>("[data-split]");
        if (!heading) return;

        if (reduced) {
          gsap.set(root.children, { opacity: 1, y: 0 });
          return;
        }

        const split = new SplitText(heading, {
          type: "lines",
          linesClass: "overflow-hidden",
        });
        const inner = new SplitText(split.lines, { type: "lines" });

        gsap.from(inner.lines, {
          yPercent: 118,
          duration: 1.05,
          stagger: 0.08,
          ease: "power4.out",
          scrollTrigger: { trigger: root, start: "top 84%" },
        });

        gsap.from(root.querySelectorAll("[data-fade]"), {
          opacity: 0,
          y: 18,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: { trigger: root, start: "top 84%" },
        });

        return () => {
          inner.revert();
          split.revert();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}
    >
      <p
        data-fade
        className="text-brand-green mb-4 text-[11px] font-semibold tracking-[0.18em] uppercase"
      >
        {eyebrow}
      </p>
      <h2
        data-split
        className="font-display-tight text-ink-1 text-balance text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.02]"
      >
        {title}
      </h2>
      {description ? (
        <p data-fade className="text-ink-3 mt-5 text-[17px] leading-relaxed text-balance">
          {description}
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 5: Category icon map**

A static map keeps icons tree-shakeable — no dynamic `import()` by name. Create `components/ui/categoryIcons.ts`:

```ts
import {
  BookOpen,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  HeartHandshake,
  Landmark,
  PartyPopper,
  Plane,
  Stethoscope,
  Tags,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  HeartHandshake,
  Landmark,
  PartyPopper,
  Plane,
  Stethoscope,
  Tags,
  Users,
  UtensilsCrossed,
};
```

- [ ] **Step 6: Category tile with magnetic hover**

Create `components/ui/CategoryTile.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { CATEGORY_ICONS } from "./categoryIcons";
import { formatCompact } from "@/lib/utils/format";
import type { Category } from "@/types";

export function CategoryTile({ category }: { category: Category }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const Icon = CATEGORY_ICONS[category.icon];

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    // Magnetic pull only on pointer-precise devices with motion allowed.
    mm.add("(hover: hover) and (prefers-reduced-motion: no-preference)", () => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo(((e.clientX - (r.left + r.width / 2)) / r.width) * 14);
        yTo(((e.clientY - (r.top + r.height / 2)) / r.height) * 14);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <Link
      ref={ref}
      href="#"
      data-href={`/${category.slug}`}
      data-reveal
      className="group border-surface-line bg-surface-card hover:border-brand-green/45 relative flex flex-col justify-between overflow-hidden rounded-[22px] border p-6 transition-colors duration-500 will-change-transform"
    >
      {/* Mint wash that grows from the icon on hover */}
      <span className="bg-brand-softer pointer-events-none absolute -top-16 -left-16 size-40 scale-0 rounded-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[3.2]" />

      <div className="relative">
        <span className="bg-brand-soft text-brand-deep group-hover:bg-brand-green mb-5 inline-flex size-12 items-center justify-center rounded-[14px] transition-colors duration-500 group-hover:text-white">
          {Icon ? <Icon size={21} strokeWidth={1.7} /> : null}
        </span>
        <h3 className="font-display text-ink-1 text-[17px] leading-snug">{category.name}</h3>
        <p className="text-ink-3 mt-2 text-[13.5px] leading-relaxed">{category.description}</p>
      </div>

      <div className="relative mt-6 flex items-center justify-between">
        <span className="text-ink-4 text-[12px] font-medium">
          {formatCompact(category.groupCount)} groups
        </span>
        <ArrowUpRight
          size={17}
          className="text-ink-4 group-hover:text-brand-green -translate-x-1 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
        />
      </div>
    </Link>
  );
}
```

- [ ] **Step 7: Group card**

Carries the initials placeholder (FR-GL-02 step 4), the members-only lock state (FR-GV-04), and an optional confidence meter (FR-AI-06). Create `components/ui/GroupCard.tsx`:

```tsx
import Link from "next/link";
import { ArrowUpRight, Lock, MapPin, Users } from "lucide-react";
import { Badge } from "./Badge";
import { categoryById } from "@/lib/data/categories";
import { formatCompact, formatRelativeDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Group } from "@/types";

export function GroupCard({
  group,
  confidence,
  showDate = false,
  className,
}: {
  group: Group;
  confidence?: number;
  showDate?: boolean;
  className?: string;
}) {
  const category = categoryById(group.categoryId);

  return (
    <Link
      href="#"
      data-href={`/${category?.slug ?? "group"}/${group.slug}`}
      data-reveal
      className={cn(
        "group border-surface-line bg-surface-card hover:border-brand-green/45 relative flex flex-col rounded-[22px] border p-5 transition-all duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_color-mix(in_oklab,var(--color-ink-1)_35%,transparent)]",
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* FR-GL-02 step 4: initials placeholder when no photo was uploaded */}
        <span className="bg-brand-soft text-brand-deep font-display grid size-11 shrink-0 place-items-center rounded-[13px] text-[15px] tracking-tight">
          {group.initials}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-ink-1 truncate text-[15.5px] leading-snug">
            {group.name}
          </h3>
          <p className="text-ink-4 mt-1 flex items-center gap-1 text-[12px]">
            <MapPin size={12} strokeWidth={1.8} />
            {group.location}
          </p>
        </div>

        <ArrowUpRight
          size={16}
          className="text-ink-4 group-hover:text-brand-green shrink-0 -translate-x-1 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
        />
      </div>

      <p className="text-ink-3 mt-3.5 line-clamp-2 text-[13.5px] leading-relaxed">
        {group.shortDescription}
      </p>

      {typeof confidence === "number" ? (
        <div className="mt-4">
          <div className="text-ink-4 mb-1.5 flex items-center justify-between text-[10.5px] font-medium tracking-wide uppercase">
            <span>Relevance</span>
            <span className="text-brand-deep">{Math.round(confidence * 100)}%</span>
          </div>
          <div className="bg-surface-line h-[3px] overflow-hidden rounded-full">
            <div
              className="bg-brand-green h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out-expo)]"
              style={{ width: `${Math.max(6, Math.round(confidence * 100))}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {category ? <Badge tone="brand">{category.name}</Badge> : null}
        {group.memberCount ? (
          <Badge tone="neutral">
            <Users size={11} strokeWidth={1.9} />
            {formatCompact(group.memberCount)}
          </Badge>
        ) : null}
        {/* FR-GV-04: owner restricted the join link to signed-in members */}
        {group.loginRestricted ? (
          <Badge tone="lock">
            <Lock size={10} strokeWidth={2.1} />
            Members only
          </Badge>
        ) : null}
        {showDate ? (
          <span className="text-ink-4 ml-auto text-[11.5px]">
            {formatRelativeDate(group.createdAt)}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
```

- [ ] **Step 8: Filter chips**

Create `components/ui/FilterChips.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils/cn";

export type FilterOption = { id: string; label: string };

export function FilterChips({
  options,
  active,
  onChange,
  className,
}: {
  options: FilterOption[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={active === o.id}
          className={cn(
            "h-9 rounded-full px-4 text-[13px] font-medium transition-all duration-300",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green",
            active === o.id
              ? "bg-ink-1 text-white"
              : "border-surface-line-strong text-ink-2 hover:border-brand-green/50 hover:text-brand-deep border bg-transparent",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 9: Verify and commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npx tsc --noEmit && git add -A && git commit -m "feat: UI primitives — button, badge, heading, lattice, cards, chips"
```

---

## Task 6: Header, search field, and the morphing dock

The signature interaction. On `lg` and up a single fixed search bar interpolates between two measured slots as the hero scrolls away. Below `lg` there is no morph — a static field lives in the hero and the header shows a compact search button.

**Files:**
- Create: `components/hero/SearchField.tsx`, `components/hero/Suggestions.tsx`, `components/hero/SearchDock.tsx`, `components/hero/QueryChips.tsx`, `components/layout/Header.tsx`, `components/ui/Logo.tsx`

**Interfaces:**
- Consumes: `useSearchContext`, `gsap`/`ScrollTrigger`/`registerGsap`/`useIsomorphicLayoutEffect`, `Button`, `GroupCard` data helpers
- Produces:
  - `HERO_SLOT_ID = "search-slot-hero"`, `HEADER_SLOT_ID = "search-slot-header"`, `HERO_SECTION_ID = "hero"` exported from `components/hero/SearchDock.tsx`
  - `<SearchField />`, `<Suggestions />`, `<SearchDock />`, `<QueryChips />`, `<Header />`, `<Logo size?: number />`

- [ ] **Step 1: The logo mark**

A hexagon subdivided into six triangles — the six-point lattice abstracted, not a literal Magen David. Create `components/ui/Logo.tsx`:

```tsx
export function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z"
        className="fill-brand-soft"
      />
      <path
        d="M16 2 L28 9 L16 16 Z M28 9 L28 23 L16 16 Z M28 23 L16 30 L16 16 Z"
        className="fill-brand-green"
      />
      <path
        d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z M16 2 L16 30 M4 9 L28 23 M28 9 L4 23"
        className="stroke-brand-deep"
        strokeWidth="1"
        strokeLinejoin="round"
        fill="none"
        opacity="0.45"
      />
    </svg>
  );
}
```

- [ ] **Step 2: The search field**

One presentational component serving both the mobile inline bar and the desktop dock. There is no `compact` variant — the field reads `--dock-progress` (0 in the hero, 1 when docked in the header) and interpolates itself. The mobile instance never has the variable set, so the `, 0` fallback keeps it at full size.

Create `components/hero/SearchField.tsx`:

```tsx
"use client";

import { Search, Sparkles, X } from "lucide-react";
import { useSearchContext } from "@/components/providers/SearchProvider";

export function SearchField() {
  const { query, setQuery, setFocused } = useSearchContext();

  return (
    <div className="border-surface-line bg-surface-card flex h-full w-full items-center gap-3 rounded-full border px-5">
      <Search size={19} strokeWidth={1.9} className="text-brand-green shrink-0" />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        // Delay the blur so a click on a suggestion lands before the list unmounts.
        onBlur={() => window.setTimeout(() => setFocused(false), 140)}
        placeholder="Ask for what you need — “roofing contractors in Lakewood with financing”"
        aria-label="Search WhatsApp groups"
        className="text-ink-1 placeholder:text-ink-4 min-w-0 flex-1 bg-transparent outline-none"
        style={{ fontSize: "calc(16.5px - 3px * var(--dock-progress, 0))" }}
      />

      {query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="text-ink-4 hover:text-ink-2 shrink-0 transition-colors"
        >
          <X size={17} strokeWidth={2} />
        </button>
      ) : null}

      {/* Fades out as the field docks — the header has its own CTA. */}
      <span
        className="bg-brand-green hidden h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-white sm:inline-flex"
        style={{ opacity: "calc(1 - var(--dock-progress, 0) * 2.2)" }}
      >
        <Sparkles size={13} strokeWidth={2} />
        Search
      </span>
    </div>
  );
}
```

- [ ] **Step 3: The type-ahead dropdown**

FR-AI-03, showing the confidence score from FR-AI-06 on every row. Create `components/hero/Suggestions.tsx`:

```tsx
"use client";

import Link from "next/link";
import { CornerDownLeft, SearchX } from "lucide-react";
import { useSearchContext } from "@/components/providers/SearchProvider";
import { categoryById } from "@/lib/data/categories";
import { formatCompact } from "@/lib/utils/format";

export function Suggestions() {
  const { suggestions, isSearching, focused, results } = useSearchContext();

  if (!focused || !isSearching) return null;

  return (
    <div
      role="listbox"
      className="border-surface-line bg-surface-card absolute top-[calc(100%+10px)] right-0 left-0 z-50 overflow-hidden rounded-[22px] border shadow-[0_28px_70px_-30px_color-mix(in_oklab,var(--color-ink-1)_45%,transparent)]"
    >
      {suggestions.length === 0 ? (
        <div className="text-ink-3 flex items-center gap-3 px-5 py-6 text-sm">
          <SearchX size={17} strokeWidth={1.8} className="text-ink-4" />
          No groups match that yet — try a place, a trade, or a topic.
        </div>
      ) : (
        <>
          <p className="text-ink-4 border-surface-line border-b px-5 py-2.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase">
            {results.length} matches · ranked by relevance
          </p>
          <ul>
            {suggestions.map(({ group, confidence }) => {
              const category = categoryById(group.categoryId);
              return (
                <li key={group.id}>
                  <Link
                    href="#"
                    data-href={`/${category?.slug ?? "group"}/${group.slug}`}
                    className="hover:bg-brand-softer flex items-center gap-3.5 px-5 py-3 transition-colors"
                  >
                    <span className="bg-brand-soft text-brand-deep font-display grid size-9 shrink-0 place-items-center rounded-[11px] text-[13px]">
                      {group.initials}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="text-ink-1 block truncate text-[14px] font-medium">
                        {group.name}
                      </span>
                      <span className="text-ink-4 block truncate text-[12px]">
                        {category?.name} · {group.location}
                        {group.memberCount ? ` · ${formatCompact(group.memberCount)} members` : ""}
                      </span>
                    </span>

                    <span className="flex shrink-0 items-center gap-2">
                      <span className="bg-surface-line hidden h-[3px] w-14 overflow-hidden rounded-full sm:block">
                        <span
                          className="bg-brand-green block h-full rounded-full"
                          style={{ width: `${Math.max(8, Math.round(confidence * 100))}%` }}
                        />
                      </span>
                      <span className="text-brand-deep w-8 text-right text-[11.5px] font-semibold">
                        {Math.round(confidence * 100)}%
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="text-ink-4 border-surface-line flex items-center gap-2 border-t px-5 py-2.5 text-[11.5px]">
            <CornerDownLeft size={12} strokeWidth={2} />
            Press enter to see every match
          </p>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: The morphing dock**

Both slot rects are measured live on every scroll update, so the tween self-corrects on resize and needs no cached geometry. Create `components/hero/SearchDock.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { SearchField } from "./SearchField";
import { Suggestions } from "./Suggestions";

export const HERO_SLOT_ID = "search-slot-hero";
export const HEADER_SLOT_ID = "search-slot-header";
export const HERO_SECTION_ID = "hero";

export function SearchDock() {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const dock = ref.current;
    if (!dock) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { isDesktop, reduced } = ctx.conditions as { isDesktop: boolean; reduced: boolean };
        if (!isDesktop) return;

        const heroSlot = document.getElementById(HERO_SLOT_ID);
        const headerSlot = document.getElementById(HEADER_SLOT_ID);
        const hero = document.getElementById(HERO_SECTION_ID);
        if (!heroSlot || !headerSlot || !hero) return;

        // Interpolate the fixed dock between the two slots' live viewport rects.
        // Measuring both every frame means resize needs no cached geometry.
        const apply = (p: number) => {
          const a = heroSlot.getBoundingClientRect();
          const b = headerSlot.getBoundingClientRect();
          const lift = 1 - p;
          gsap.set(dock, {
            left: a.left + (b.left - a.left) * p,
            top: a.top + (b.top - a.top) * p,
            width: a.width + (b.width - a.width) * p,
            height: a.height + (b.height - a.height) * p,
            borderRadius: 9999,
            // Big drop shadow in the hero, none once it sits in the header bar.
            boxShadow: `0 ${20 * lift}px ${60 * lift}px -30px color-mix(in oklab, var(--color-ink-1) ${45 * lift}%, transparent)`,
          });
          dock.style.setProperty("--dock-progress", p.toFixed(4));
        };

        if (reduced) {
          // No scrubbed interpolation for reduced-motion: the dock still ends
          // up in the right slot for the current scroll position, it just
          // snaps there instead of resizing and moving continuously as the
          // page scrolls. Both rects are still measured live, so it self-
          // corrects on resize the same as the full-motion branch.
          const snap = (self: ScrollTrigger) => apply(self.progress < 1 ? 0 : 1);

          const st = ScrollTrigger.create({
            trigger: hero,
            start: "top top",
            end: "bottom top+=120",
            onUpdate: snap,
            onRefresh: snap,
          });

          apply(st.progress < 1 ? 0 : 1);

          return () => st.kill();
        }

        const st = ScrollTrigger.create({
          trigger: hero,
          start: "top top",
          end: "bottom top+=120",
          scrub: true,
          onUpdate: (self) => apply(self.progress),
          onRefresh: (self) => apply(self.progress),
        });

        apply(0);

        return () => st.kill();
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-auto fixed z-50 hidden lg:block"
      style={{ left: 0, top: 0, width: 0, height: 0 }}
    >
      <div className="relative h-full w-full">
        <SearchField />
        <Suggestions />
      </div>
    </div>
  );
}
```

Note the dock is rendered as a direct child of the page root, never inside an element GSAP transforms — a transformed ancestor would become the containing block for `position: fixed` and break the interpolation.

- [ ] **Step 5: Natural-language example chips**

FR-AI-02's example queries, verbatim where the SRS gives them. Create `components/hero/QueryChips.tsx`:

```tsx
"use client";

import { ArrowUpRight } from "lucide-react";
import { useSearchContext } from "@/components/providers/SearchProvider";

const EXAMPLES = [
  "Roofing contractors in Lakewood with financing",
  "Business forums in Florida with over 100 members",
  "Daf Yomi shiurim in Jerusalem",
  "Gemachs in Lakewood",
  "Kosher restaurants in Miami",
];

export function QueryChips() {
  const { setQuery } = useSearchContext();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-ink-4 mr-1 text-[12.5px]">Try</span>
      {EXAMPLES.map((example) => (
        <button
          key={example}
          type="button"
          onClick={() => setQuery(example)}
          className="group border-surface-line-strong text-ink-2 hover:border-brand-green/55 hover:text-brand-deep hover:bg-brand-softer inline-flex items-center gap-1.5 rounded-full border bg-white/60 px-3.5 py-1.5 text-[12.5px] backdrop-blur-sm transition-all duration-300"
        >
          {example}
          <ArrowUpRight
            size={12}
            strokeWidth={2}
            className="text-ink-4 group-hover:text-brand-green transition-colors"
          />
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: The header**

Create `components/layout/Header.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Menu, Plus, Search, X } from "lucide-react";
import { gsap, ScrollTrigger, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { HEADER_SLOT_ID, HERO_SECTION_ID } from "@/components/hero/SearchDock";
import { CATEGORIES } from "@/lib/data/categories";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };

        // The backdrop-blur/border fade is a 500ms CSS transition driven by the
        // is-stuck class below; skip it for reduced-motion so the header still
        // reflects the right state for the scroll position, it just doesn't
        // animate into it.
        el.style.transitionDuration = reduced ? "0ms" : "";

        // Active from 40px of scroll to the bottom of the document.
        const st = ScrollTrigger.create({
          trigger: `#${HERO_SECTION_ID}`,
          start: "top top-=40",
          end: "max",
          onToggle: (self) => el.classList.toggle("is-stuck", self.isActive),
        });

        return () => {
          st.kill();
          el.style.transitionDuration = "";
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <header
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-0 z-40 h-[72px] transition-all duration-500 lg:h-[78px]",
        "[&.is-stuck]:bg-surface-bg/80 [&.is-stuck]:border-surface-line [&.is-stuck]:border-b [&.is-stuck]:backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-6 px-5 md:px-8">
        <Link href="#" data-href="/" className="flex shrink-0 items-center gap-2.5">
          <Logo />
          <span className="font-display text-ink-1 text-[19px] tracking-tight">JewishChat</span>
        </Link>

        {/* Docking target for the desktop search bar — reserves space only. */}
        <div
          id={HEADER_SLOT_ID}
          aria-hidden="true"
          className="mx-auto hidden h-11 w-full max-w-[440px] lg:block"
        />

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <Link
            href="#categories"
            className="text-ink-2 hover:text-brand-deep hover:bg-brand-soft rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors"
          >
            Categories
          </Link>
          <Link
            href="#trending"
            className="text-ink-2 hover:text-brand-deep hover:bg-brand-soft rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors"
          >
            Trending
          </Link>
          <Link
            href="#"
            data-href="/login"
            className="text-ink-2 hover:text-brand-deep hover:bg-brand-soft rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors"
          >
            Log in
          </Link>
          {/* FR-GL-01: Add Group is prominent for guests and signed-in users alike */}
          <Button href="/add-group" size="sm" className="ml-2">
            <Plus size={15} strokeWidth={2.3} />
            Add a group
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <a
            href={`#${HERO_SECTION_ID}`}
            aria-label="Search groups"
            className="border-surface-line-strong text-ink-2 grid size-10 place-items-center rounded-full border"
          >
            <Search size={16} strokeWidth={1.9} />
          </a>
          <Button href="/add-group" size="sm" className="px-3.5">
            <Plus size={15} strokeWidth={2.3} />
            Add
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="border-surface-line-strong text-ink-2 grid size-10 place-items-center rounded-full border"
          >
            {open ? <X size={16} strokeWidth={2} /> : <Menu size={16} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-surface-line bg-surface-bg/95 max-h-[70dvh] overflow-y-auto border-y px-5 py-5 backdrop-blur-xl lg:hidden">
          <p className="text-ink-4 mb-3 text-[10.5px] font-semibold tracking-[0.16em] uppercase">
            Categories
          </p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  href="#"
                  data-href={`/${c.slug}`}
                  className="text-ink-2 block py-2 text-[14px]"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-surface-line mt-4 flex gap-2 border-t pt-4">
            <Button href="/login" variant="secondary" size="sm" className="flex-1">
              Log in
            </Button>
            <Button href="/register" size="sm" className="flex-1">
              Create account
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
```

- [ ] **Step 7: Verify types**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npx tsc --noEmit
```

Expected: exits 0. The header and dock are not yet mounted — Task 8 composes them.

- [ ] **Step 8: Commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && git add -A && git commit -m "feat: header, search field, type-ahead, and scroll-morphing search dock"
```

---

## Task 7: The constellation hero canvas

150 drifting nodes joined by faint threads. Nodes repel the cursor. When a query matches, the nodes belonging to matching groups — and the wider cluster for each matching category — brighten to brand green and draw toward the centre.

**Files:**
- Create: `components/hero/ConstellationField.tsx`, `components/hero/Constellation.tsx`

**Interfaces:**
- Consumes: `useSearchContext`, `PUBLIC_GROUPS`, `CATEGORIES`, `LatticeBackdrop`
- Produces: `<Constellation />` — self-contained, absolutely positioned, no props

- [ ] **Step 1: The field**

Drift and repulsion are computed on the CPU so nodes and the lines joining them can never diverge. 150 nodes is far too few for that to matter. Create `components/hero/ConstellationField.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSearchContext } from "@/components/providers/SearchProvider";
import { CATEGORIES } from "@/lib/data/categories";
import { PUBLIC_GROUPS } from "@/lib/data/groups";

const NODE_COUNT = 150;
const MAX_LINKS = 320;
const REPEL_RADIUS = 2.4;

const COLOR_IDLE = new THREE.Color("#9EADA7");
const COLOR_ACTIVE = new THREE.Color("#1E9783");
const LINE_IDLE = new THREE.Color("#CFE2DC");
const LINE_ACTIVE = new THREE.Color("#1E9783");

/** Deterministic PRNG so the layout is identical on every mount. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type FieldData = {
  base: Float32Array;
  seeds: Float32Array;
  /** Category id each node belongs to — drives cluster activation. */
  categoryIds: string[];
  /** Group id for the first 24 nodes, null for ambient nodes. */
  groupIds: (string | null)[];
  links: number[];
};

function buildField(): FieldData {
  const rand = mulberry32(0x1e9783);
  const base = new Float32Array(NODE_COUNT * 3);
  const seeds = new Float32Array(NODE_COUNT);
  const categoryIds: string[] = [];
  const groupIds: (string | null)[] = [];

  // 12 hub centres, one per category, spread across a shallow slab.
  const hubs = CATEGORIES.map((_, i) => {
    const angle = (i / CATEGORIES.length) * Math.PI * 2;
    const radius = 3.6 + rand() * 2.6;
    return [Math.cos(angle) * radius * 1.65, Math.sin(angle) * radius * 0.82, (rand() - 0.5) * 3.4];
  });

  for (let i = 0; i < NODE_COUNT; i += 1) {
    const catIndex = i % CATEGORIES.length;
    const hub = hubs[catIndex];
    base[i * 3 + 0] = hub[0] + (rand() - 0.5) * 3.6;
    base[i * 3 + 1] = hub[1] + (rand() - 0.5) * 2.4;
    base[i * 3 + 2] = hub[2] + (rand() - 0.5) * 1.8;
    seeds[i] = rand() * Math.PI * 2;
    categoryIds.push(CATEGORIES[catIndex].id);
    groupIds.push(PUBLIC_GROUPS[i] ? PUBLIC_GROUPS[i].id : null);
  }

  // Join each node to its two nearest neighbours, capped.
  const links: number[] = [];
  for (let i = 0; i < NODE_COUNT && links.length < MAX_LINKS * 2; i += 1) {
    const dists: { j: number; d: number }[] = [];
    for (let j = 0; j < NODE_COUNT; j += 1) {
      if (i === j) continue;
      const dx = base[i * 3] - base[j * 3];
      const dy = base[i * 3 + 1] - base[j * 3 + 1];
      const dz = base[i * 3 + 2] - base[j * 3 + 2];
      dists.push({ j, d: dx * dx + dy * dy + dz * dz });
    }
    dists.sort((a, b) => a.d - b.d);
    for (const { j } of dists.slice(0, 2)) {
      if (i < j) links.push(i, j);
    }
  }

  return { base, seeds, categoryIds, groupIds, links };
}

export function ConstellationField() {
  const { results, isSearching } = useSearchContext();
  const field = useMemo(buildField, []);
  const { viewport } = useThree();

  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Mutable per-frame buffers.
  const buffers = useMemo(() => {
    const linkCount = field.links.length / 2;
    return {
      live: new Float32Array(field.base),
      pointColors: new Float32Array(NODE_COUNT * 3),
      pointSizes: new Float32Array(NODE_COUNT),
      active: new Float32Array(NODE_COUNT),
      target: new Float32Array(NODE_COUNT),
      linePositions: new Float32Array(linkCount * 2 * 3),
      lineColors: new Float32Array(linkCount * 2 * 3),
    };
  }, [field]);

  // Recompute activation targets whenever the query results change.
  // useEffect, not useMemo — this writes to a buffer, it does not derive a value.
  useEffect(() => {
    const top = results.slice(0, 10);
    const groupHits = new Set(top.map((r) => r.group.id));
    const categoryHits = new Set(top.map((r) => r.group.categoryId));

    for (let i = 0; i < NODE_COUNT; i += 1) {
      const gid = field.groupIds[i];
      if (!isSearching) buffers.target[i] = 0;
      else if (gid && groupHits.has(gid)) buffers.target[i] = 1;
      else if (categoryHits.has(field.categoryIds[i])) buffers.target[i] = 0.45;
      else buffers.target[i] = 0;
    }
  }, [results, isSearching, field, buffers]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { live, active, target, pointColors, pointSizes, linePositions, lineColors } = buffers;

    const mx = (state.pointer.x * viewport.width) / 2;
    const my = (state.pointer.y * viewport.height) / 2;
    const ease = Math.min(1, delta * 4);
    const color = new THREE.Color();

    for (let i = 0; i < NODE_COUNT; i += 1) {
      active[i] += (target[i] - active[i]) * ease;
      const a = active[i];
      const seed = field.seeds[i];

      let x = field.base[i * 3] + Math.sin(t * 0.24 + seed) * 0.34;
      let y = field.base[i * 3 + 1] + Math.cos(t * 0.19 + seed * 1.7) * 0.28;
      let z = field.base[i * 3 + 2] + Math.sin(t * 0.15 + seed * 0.6) * 0.2;

      // Active nodes drift toward the centre of the field.
      x -= x * a * 0.34;
      y -= y * a * 0.34;

      // Cursor repulsion in the z=0 plane.
      const dx = x - mx;
      const dy = y - my;
      const dist = Math.hypot(dx, dy);
      if (dist < REPEL_RADIUS && dist > 0.0001) {
        const push = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * 0.85;
        x += (dx / dist) * push;
        y += (dy / dist) * push;
      }

      live[i * 3] = x;
      live[i * 3 + 1] = y;
      live[i * 3 + 2] = z;

      color.copy(COLOR_IDLE).lerp(COLOR_ACTIVE, a);
      pointColors[i * 3] = color.r;
      pointColors[i * 3 + 1] = color.g;
      pointColors[i * 3 + 2] = color.b;
      pointSizes[i] = 5 + a * 11;
    }

    // Rebuild line vertices from the live node positions.
    for (let k = 0; k < field.links.length; k += 2) {
      const i = field.links[k];
      const j = field.links[k + 1];
      const strength = Math.max(active[i], active[j]);
      color.copy(LINE_IDLE).lerp(LINE_ACTIVE, strength);

      for (const [slot, node] of [
        [k, i],
        [k + 1, j],
      ] as const) {
        linePositions[slot * 3] = live[node * 3];
        linePositions[slot * 3 + 1] = live[node * 3 + 1];
        linePositions[slot * 3 + 2] = live[node * 3 + 2];
        lineColors[slot * 3] = color.r;
        lineColors[slot * 3 + 1] = color.g;
        lineColors[slot * 3 + 2] = color.b;
      }
    }

    const pg = pointsRef.current?.geometry;
    if (pg) {
      pg.attributes.position.needsUpdate = true;
      pg.attributes.color.needsUpdate = true;
      pg.attributes.size.needsUpdate = true;
    }
    const lg = linesRef.current?.geometry;
    if (lg) {
      lg.attributes.position.needsUpdate = true;
      lg.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[buffers.linePositions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[buffers.lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.5} />
      </lineSegments>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[buffers.live, 3]} />
          <bufferAttribute attach="attributes-color" args={[buffers.pointColors, 3]} />
          <bufferAttribute attach="attributes-size" args={[buffers.pointSizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          vertexShader={`
            attribute float size;
            varying vec3 vColor;
            void main() {
              vColor = color;
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = size * (14.0 / -mv.z);
              gl_Position = projectionMatrix * mv;
            }
          `}
          fragmentShader={`
            varying vec3 vColor;
            void main() {
              float d = length(gl_PointCoord - vec2(0.5));
              if (d > 0.5) discard;
              float alpha = smoothstep(0.5, 0.06, d);
              gl_FragColor = vec4(vColor, alpha * 0.92);
            }
          `}
          vertexColors
        />
      </points>
    </group>
  );
}
```

- [ ] **Step 2: The canvas wrapper**

Mounts only on `lg` and up, pauses when scrolled out of view, and renders a single frame under reduced motion. Create `components/hero/Constellation.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ConstellationField } from "./ConstellationField";
import { LatticeBackdrop } from "@/components/ui/LatticeBackdrop";

export function Constellation() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1024px)");

    const sync = () => {
      setReduced(motion.matches);
      setEnabled(wide.matches);
    };
    sync();

    motion.addEventListener("change", sync);
    wide.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      wide.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(host);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Mint wash sitting under everything */}
      <div className="from-brand-softer via-surface-bg to-surface-bg absolute inset-0 bg-gradient-to-b" />
      <div className="bg-brand-soft/70 absolute top-[-18%] left-1/2 size-[52rem] -translate-x-1/2 rounded-full blur-[120px]" />

      {enabled ? (
        <Canvas
          camera={{ position: [0, 0, 15], fov: 46 }}
          dpr={[1, 1.75]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          frameloop={reduced ? "demand" : visible ? "always" : "never"}
          className="absolute inset-0"
        >
          <ConstellationField />
        </Canvas>
      ) : (
        <LatticeBackdrop />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify types**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npx tsc --noEmit
```

Expected: exits 0.

If `bufferAttribute` reports an `args` type error, confirm `@types/three@0.185.0` is installed — R3F 9 derives its JSX types from it.

- [ ] **Step 4: Commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && git add -A && git commit -m "feat: WebGL constellation hero reacting to cursor and query"
```

---

## Task 8: Hero, stat band, and first real page composition

At the end of this task the homepage renders for the first time: header, constellation, headline, working search with type-ahead, and the stat band.

**Files:**
- Create: `components/hero/Hero.tsx`, `components/sections/StatBand.tsx`
- Modify: `app/page.tsx`, `app/layout.tsx`

**Interfaces:**
- Consumes: `Constellation`, `SearchField`, `QueryChips`, `HERO_SLOT_ID`, `HERO_SECTION_ID`, `PLATFORM_STATS`, `SmoothScroll`, `SearchProvider`, `Header`, `SearchDock`
- Produces: `<Hero />`, `<StatBand />`

- [ ] **Step 1: The hero**

Create `components/hero/Hero.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { ArrowDown, ShieldCheck } from "lucide-react";
import { gsap, SplitText, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { Constellation } from "./Constellation";
import { SearchField } from "./SearchField";
import { Suggestions } from "./Suggestions";
import { QueryChips } from "./QueryChips";
import { HERO_SECTION_ID, HERO_SLOT_ID } from "./SearchDock";

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx) => {
        const { reduced } = ctx.conditions as { motion: boolean; reduced: boolean };
        const items = root.querySelectorAll("[data-hero-item]");
        const heading = root.querySelector<HTMLElement>("[data-hero-title]");

        if (reduced || !heading) {
          gsap.set(items, { opacity: 1, y: 0 });
          return;
        }

        const outer = new SplitText(heading, { type: "lines", linesClass: "overflow-hidden" });
        const inner = new SplitText(outer.lines, { type: "lines" });

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.from(inner.lines, { yPercent: 120, duration: 1.15, stagger: 0.09 })
          .from(items, { opacity: 0, y: 26, duration: 0.9, stagger: 0.11 }, "-=0.75");

        return () => {
          tl.kill();
          inner.revert();
          outer.revert();
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={ref}
      id={HERO_SECTION_ID}
      className="relative flex min-h-dvh flex-col justify-center overflow-hidden pt-[104px] pb-16 lg:pt-[132px]"
    >
      <Constellation />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 md:px-8">
        <div className="max-w-4xl">
          <span
            data-hero-item
            className="border-brand-green/25 text-brand-deep mb-7 inline-flex items-center gap-2 rounded-full border bg-white/70 px-3.5 py-1.5 text-[12px] font-medium backdrop-blur-sm"
          >
            <ShieldCheck size={13} strokeWidth={2} />
            Every listing submitted by a verified member
          </span>

          <h1
            data-hero-title
            className="font-display-tight text-ink-1 text-balance text-[clamp(2.6rem,7vw,5.75rem)] leading-[0.94]"
          >
            Find the group your community is{" "}
            <span className="text-brand-green">already in</span>.
          </h1>

          <p
            data-hero-item
            className="text-ink-2 mt-7 max-w-2xl text-[clamp(1rem,1.5vw,1.2rem)] leading-relaxed"
          >
            A directory of WhatsApp groups for Jewish business, learning, shuls, chesed and
            everyday community life. Ask the way you would ask a friend — every result comes
            back ranked by how well it actually fits.
          </p>

          {/* Desktop: reserved space the fixed SearchDock docks into. */}
          <div
            id={HERO_SLOT_ID}
            aria-hidden="true"
            data-hero-item
            className="mt-10 hidden h-[68px] w-full max-w-[760px] lg:block"
          />

          {/* Mobile and tablet: the field lives inline, no morph. */}
          <div data-hero-item className="relative mt-9 h-[60px] w-full lg:hidden">
            <SearchField />
            <Suggestions />
          </div>

          <div data-hero-item className="mt-6">
            <QueryChips />
          </div>

          <p data-hero-item className="text-ink-4 mt-8 text-[12.5px]">
            Free to browse · No account needed to search · 3,961 groups across 46 cities
          </p>
        </div>
      </div>

      <a
        href="#categories"
        aria-label="Scroll to categories"
        className="text-ink-4 hover:text-brand-green absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] tracking-[0.16em] uppercase transition-colors lg:flex"
      >
        Browse
        <ArrowDown size={14} strokeWidth={1.8} className="animate-bounce" />
      </a>
    </section>
  );
}
```

- [ ] **Step 2: The stat band**

Numbers count up on enter. The final value is rendered server-side so there is no layout shift and no hydration mismatch. Create `components/sections/StatBand.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { PLATFORM_STATS } from "@/lib/data/stats";

export function StatBand() {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const root = ref.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const nodes = gsap.utils.toArray<HTMLElement>("[data-count]", root);
      const tweens = nodes.map((node) => {
        const end = Number(node.dataset.count ?? "0");
        const proxy = { v: 0 };
        return gsap.to(proxy, {
          v: end,
          duration: 1.7,
          ease: "power3.out",
          scrollTrigger: { trigger: root, start: "top 88%" },
          onUpdate: () => {
            node.textContent = Math.round(proxy.v).toLocaleString("en-US");
          },
        });
      });

      return () => tweens.forEach((t) => t.kill());
    });

    return () => mm.revert();
  }, []);

  return (
    <div
      ref={ref}
      className="border-surface-line bg-surface-card/60 relative z-10 border-y backdrop-blur-sm"
    >
      <dl className="mx-auto grid max-w-[1400px] grid-cols-2 px-5 md:px-8 lg:grid-cols-4">
        {PLATFORM_STATS.map((stat, i) => (
          <div
            key={stat.id}
            className={`border-surface-line py-8 lg:py-10 ${i % 2 === 1 ? "border-l pl-6" : "pr-6"} ${i < 2 ? "border-b lg:border-b-0" : ""} ${i === 2 ? "lg:border-l lg:pl-6" : ""}`}
          >
            <dd className="font-display-tight text-ink-1 text-[clamp(1.9rem,3.4vw,2.9rem)] leading-none">
              <span data-count={stat.value}>{stat.value.toLocaleString("en-US")}</span>
              {stat.suffix ? <span className="text-brand-green">{stat.suffix}</span> : null}
            </dd>
            <dt className="text-ink-3 mt-2.5 text-[13px]">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
```

- [ ] **Step 3: Mount the smooth-scroll provider**

In `app/layout.tsx`, import `SmoothScroll` and wrap the body content:

```tsx
import { SmoothScroll } from "@/components/providers/SmoothScroll";
```

and change the body to:

```tsx
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
```

- [ ] **Step 4: Compose the page**

Replace `app/page.tsx` entirely. Sections added in later tasks slot in below `StatBand`.

```tsx
import { SearchProvider } from "@/components/providers/SearchProvider";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/hero/Hero";
import { SearchDock } from "@/components/hero/SearchDock";
import { StatBand } from "@/components/sections/StatBand";

export default function Home() {
  return (
    <SearchProvider>
      <Header />
      {/* SearchDock is a root-level sibling on purpose: a transformed ancestor
          would become the containing block for its `position: fixed`. */}
      <SearchDock />
      <main>
        <Hero />
        <StatBand />
      </main>
    </SearchProvider>
  );
}
```

- [ ] **Step 5: Verify types and build**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npx tsc --noEmit && npm run build
```

Expected: both exit 0.

- [ ] **Step 6: Verify in the browser at 1440×900**

Start the dev server and check every item:

1. The headline renders in Bricolage Grotesque with `already in` in `#1E9783`.
2. A constellation of teal-and-grey dots joined by faint lines drifts behind the hero.
3. Moving the cursor across the hero pushes nearby dots away.
4. Typing `roofing contractors in Lakewood with financing` shows a dropdown whose first row is **Lakewood Contractors Network** with a relevance percentage.
5. Typing that query also brightens a cluster of constellation nodes to brand green and pulls them toward the centre.
6. Clicking a query chip fills the field and updates results.
7. Scrolling down: the search bar shrinks and travels up until it sits centred in the header, and the header gains a blurred background and bottom border.
8. Scrolling back up returns it to the hero position smoothly.
9. Console shows no errors and no hydration warnings.

- [ ] **Step 7: Verify at 390×844**

Resize to mobile and confirm: no `<canvas>` is mounted (the SVG lattice renders instead), the search field sits inline in the hero with no morph, the header shows the search / Add / menu buttons, and the mobile menu opens with all 12 categories.

- [ ] **Step 8: Commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && git add -A && git commit -m "feat: hero section, stat band, and page composition"
```

---

## Task 9: Category lattice and location ticker

**Files:**
- Create: `components/sections/CategoryLattice.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `CATEGORIES`, `CategoryTile`, `SectionHeading`, `useReveal`, `Button`
- Produces: `<CategoryLattice />`

- [ ] **Step 1: Build the section**

The hex offset — alternating columns pushed down — is the lattice motif applied to layout. Create `components/sections/CategoryLattice.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryTile } from "@/components/ui/CategoryTile";
import { Button } from "@/components/ui/Button";
import { useReveal } from "@/lib/motion/useReveal";
import { CATEGORIES } from "@/lib/data/categories";
import { PUBLIC_GROUPS } from "@/lib/data/groups";

const LOCATIONS = [...new Set(PUBLIC_GROUPS.map((g) => g.location))];

export function CategoryLattice() {
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.045, y: 34 });
  const tickerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const track = tickerRef.current;
    if (!track) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The row is rendered twice; scroll one full copy then reset.
      const tween = gsap.to(track, {
        xPercent: -50,
        duration: 38,
        ease: "none",
        repeat: -1,
      });
      return () => tween.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="categories" className="relative py-24 lg:py-36">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            eyebrow="Browse the directory"
            title="Twelve corners of community life."
            description="Every group is filed under a main category and can carry additional ones, so a contractor's group turns up under both trades and real estate."
          />
          <Button href="/categories" variant="secondary" size="md" className="mb-1">
            All categories
            <ArrowRight size={15} strokeWidth={2} />
          </Button>
        </div>

        <div
          ref={gridRef}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:[&>*:nth-child(4n+2)]:translate-y-8 lg:[&>*:nth-child(4n+4)]:translate-y-8"
        >
          {CATEGORIES.map((category) => (
            <CategoryTile key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* Location ticker */}
      <div className="mt-24 lg:mt-36">
        <p className="text-ink-4 mx-auto mb-6 max-w-[1400px] px-5 text-[10.5px] font-semibold tracking-[0.18em] uppercase md:px-8">
          Active in
        </p>
        <div className="relative overflow-hidden">
          <div className="from-surface-bg pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r to-transparent" />
          <div className="from-surface-bg pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l to-transparent" />
          <div ref={tickerRef} className="flex w-max gap-3">
            {[...LOCATIONS, ...LOCATIONS].map((location, i) => (
              <span
                key={`${location}-${i}`}
                className="border-surface-line text-ink-2 font-display shrink-0 rounded-full border bg-white px-6 py-3 text-[15px] whitespace-nowrap"
              >
                {location}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Mount it**

In `app/page.tsx`, add the import and place `<CategoryLattice />` directly after `<StatBand />`:

```tsx
import { CategoryLattice } from "@/components/sections/CategoryLattice";
```

- [ ] **Step 3: Verify**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npx tsc --noEmit && npm run build
```

Then in the browser confirm: 12 tiles in 4 columns on desktop with columns 2 and 4 offset downward, tiles fading up in sequence on scroll, the mint wash sweeping across a tile on hover with the tile pulling gently toward the cursor, and the location ticker scrolling continuously with no visible seam.

- [ ] **Step 4: Commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && git add -A && git commit -m "feat: category lattice with hex-offset grid and location ticker"
```

---

## Task 10: Trending and recently listed groups

**Files:**
- Create: `components/sections/TrendingGroups.tsx`, `components/sections/RecentGroups.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `PUBLIC_GROUPS`, `GroupCard`, `SectionHeading`, `FilterChips`, `useReveal`, `Button`
- Produces: `<TrendingGroups />`, `<RecentGroups />`

- [ ] **Step 1: Trending, ranked by engagement metrics**

Ordering comes from `metrics.uniqueViews` (FR-ME-01); the chips are the group-size filter from FR-AI-04. Create `components/sections/TrendingGroups.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GroupCard } from "@/components/ui/GroupCard";
import { FilterChips, type FilterOption } from "@/components/ui/FilterChips";
import { Button } from "@/components/ui/Button";
import { useReveal } from "@/lib/motion/useReveal";
import { PUBLIC_GROUPS } from "@/lib/data/groups";

// FR-AI-04: group-size filters. Location filtering is Phase 2 in the SRS.
const SIZE_FILTERS: FilterOption[] = [
  { id: "all", label: "All sizes" },
  { id: "s", label: "Under 1k" },
  { id: "m", label: "1k – 3k" },
  { id: "l", label: "3k+" },
];

function inBand(count: number | undefined, band: string): boolean {
  const n = count ?? 0;
  if (band === "s") return n < 1000;
  if (band === "m") return n >= 1000 && n < 3000;
  if (band === "l") return n >= 3000;
  return true;
}

export function TrendingGroups() {
  const [band, setBand] = useState("all");
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.05 });

  const groups = useMemo(
    () =>
      PUBLIC_GROUPS.filter((g) => inBand(g.memberCount, band))
        .sort((a, b) => b.metrics.uniqueViews - a.metrics.uniqueViews)
        .slice(0, 8),
    [band],
  );

  return (
    <section id="trending" className="bg-brand-softer/60 relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            eyebrow="Most active right now"
            title="Where the community is talking this week."
            description="Ranked by unique views and join-link clicks over the last seven days."
          />
          <Button href="/trending" variant="secondary" size="md" className="mb-1">
            <TrendingUp size={15} strokeWidth={2} />
            See the full ranking
          </Button>
        </div>

        <FilterChips
          options={SIZE_FILTERS}
          active={band}
          onChange={setBand}
          className="mt-10"
        />

        <div
          ref={gridRef}
          key={band}
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>

        {groups.length === 0 ? (
          <p className="text-ink-3 mt-8 text-sm">No groups in that size band yet.</p>
        ) : null}

        <div className="mt-12 flex justify-center">
          <Button href="/directory" size="lg">
            Browse all 3,961 groups
            <ArrowRight size={16} strokeWidth={2} />
          </Button>
        </div>
      </div>
    </section>
  );
}
```

The `key={band}` on the grid remounts it when the filter changes, so `useReveal` re-runs and the new cards animate in rather than appearing instantly.

- [ ] **Step 2: Recently listed**

A horizontally scrollable row on small screens, a four-column grid on desktop. Create `components/sections/RecentGroups.tsx`:

```tsx
"use client";

import { Clock } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GroupCard } from "@/components/ui/GroupCard";
import { useReveal } from "@/lib/motion/useReveal";
import { PUBLIC_GROUPS } from "@/lib/data/groups";

const RECENT = [...PUBLIC_GROUPS]
  .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  .slice(0, 4);

export function RecentGroups() {
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.06 });

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <SectionHeading
          eyebrow="Just listed"
          title="Fresh from the community."
          description="Listings publish the moment a verified member submits them — no queue, no waiting."
        />

        <div ref={gridRef} className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RECENT.map((group) => (
            <GroupCard key={group.id} group={group} showDate />
          ))}
        </div>

        <p className="text-ink-4 mt-8 flex items-center gap-2 text-[12.5px]">
          <Clock size={13} strokeWidth={1.8} />
          Suspended listings are removed from the directory and from search results immediately.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Mount both**

In `app/page.tsx`, add after `<CategoryLattice />`:

```tsx
import { TrendingGroups } from "@/components/sections/TrendingGroups";
import { RecentGroups } from "@/components/sections/RecentGroups";
```

placing `<TrendingGroups />` then `<RecentGroups />`.

- [ ] **Step 4: Verify**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npx tsc --noEmit && npm run build
```

In the browser confirm: eight cards ordered by unique views, size chips filtering and re-animating the grid, `Lakewood Home Listings` and `Hashgacha Alerts` showing an amber **Members only** badge, `Manchester Support Circle` appearing nowhere on the page, cards lifting with the arrow sliding in on hover, and the Just listed row showing relative dates.

- [ ] **Step 5: Commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && git add -A && git commit -m "feat: trending groups with size filters and recently listed row"
```

---

## Task 11: How it works, and the trust band

`HowItWorks` pins and scrolls horizontally on desktop. `TrustSafety` is the page's one dark section — a deliberate rhythm break before the closing call to action.

**Files:**
- Create: `components/sections/HowItWorks.tsx`, `components/sections/TrustSafety.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `gsap`/`ScrollTrigger`, `SectionHeading`, `useReveal`, `LatticeBackdrop`, `Button`
- Produces: `<HowItWorks />`, `<TrustSafety />`

- [ ] **Step 1: How it works**

The four submission steps mirror FR-GL-02 exactly: group details, categorisation, number verification, photo. Create `components/sections/HowItWorks.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { Camera, Link2, MessageSquare, ShieldCheck, Tags } from "lucide-react";
import { gsap, ScrollTrigger, registerGsap, useIsomorphicLayoutEffect } from "@/lib/motion/gsap";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import type { LucideIcon } from "lucide-react";

type Step = { icon: LucideIcon; title: string; body: string };

const STEPS: Step[] = [
  {
    icon: Link2,
    title: "Paste the group link",
    body: "Drop in the WhatsApp invite link with a name and a short description. Duplicate links are caught before you submit — the URL is normalised first, so extra query parameters never sneak a second copy in.",
  },
  {
    icon: Tags,
    title: "Categorise it",
    body: "Pick a main category, add secondary ones, and set the location. Say whether the join link should be public or reserved for signed-in members.",
  },
  {
    icon: ShieldCheck,
    title: "Verify your number",
    body: "A code arrives on WhatsApp. Verifying proves the listing came from a real person — it is the one thing standing between the directory and spam.",
  },
  {
    icon: Camera,
    title: "Add a photo, or skip",
    body: "Upload a square image, or skip it and the listing shows a clean initials avatar. You can add the photo later from My Groups.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const mm = gsap.matchMedia();

    // Pin and pan only where there is room and motion is welcome.
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 120);

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance() + window.innerHeight * 0.5}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:flex lg:min-h-dvh lg:flex-col lg:justify-center lg:py-0"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8">
        <SectionHeading
          eyebrow="Listing a group"
          title="Four steps, about two minutes."
          description="Verified submissions publish instantly. Nothing sits in a moderation queue waiting for someone to notice it."
        />
      </div>

      <div className="mt-14 lg:mt-20">
        <div
          ref={trackRef}
          className="flex flex-col gap-4 px-5 md:px-8 lg:w-max lg:flex-row lg:gap-6 lg:pr-[12vw] lg:pl-[max(1.25rem,calc((100vw-1400px)/2+2rem))]"
        >
          {STEPS.map((step, i) => (
            <article
              key={step.title}
              className="border-surface-line bg-surface-card relative flex flex-col justify-between rounded-[26px] border p-8 lg:h-[26rem] lg:w-[24rem] lg:shrink-0"
            >
              <div>
                <span className="text-brand-green/25 font-display-tight block text-[3.5rem] leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="bg-brand-soft text-brand-deep mt-6 inline-flex size-12 items-center justify-center rounded-[15px]">
                  <step.icon size={21} strokeWidth={1.7} />
                </span>
                <h3 className="font-display text-ink-1 mt-5 text-[20px] leading-snug">
                  {step.title}
                </h3>
                <p className="text-ink-3 mt-3 text-[14px] leading-relaxed">{step.body}</p>
              </div>
            </article>
          ))}

          <article className="bg-brand-green relative flex flex-col justify-between overflow-hidden rounded-[26px] p-8 text-white lg:h-[26rem] lg:w-[24rem] lg:shrink-0">
            <MessageSquare
              size={140}
              strokeWidth={0.6}
              className="absolute -right-8 -bottom-8 text-white/15"
            />
            <div className="relative">
              <h3 className="font-display-tight text-[28px] leading-[1.05]">
                Your group, in front of the people looking for it.
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-white/85">
                Each listing gets its own indexed page and a clean URL, so it turns up in search
                long after you post it.
              </p>
            </div>
            <Button href="/add-group" variant="secondary" size="lg" className="relative mt-8 w-fit">
              Add a group
            </Button>
          </article>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: The trust band**

Create `components/sections/TrustSafety.tsx`:

```tsx
"use client";

import { Flag, Gauge, ShieldCheck, Siren } from "lucide-react";
import { LatticeBackdrop } from "@/components/ui/LatticeBackdrop";
import { useReveal } from "@/lib/motion/useReveal";
import type { LucideIcon } from "lucide-react";

type Pillar = { icon: LucideIcon; title: string; body: string };

const PILLARS: Pillar[] = [
  {
    icon: ShieldCheck,
    title: "Verified submitters only",
    body: "Every listing comes from an account that confirmed both an email address and a WhatsApp number. Unverified accounts cannot submit at all.",
  },
  {
    icon: Flag,
    title: "Reporting that goes somewhere",
    body: "Signed-in members can report a broken link or inappropriate content. Moderators see every report filed against a group together, on one screen.",
  },
  {
    icon: Gauge,
    title: "Thresholds, not guesswork",
    body: "Once a listing passes its report threshold it is suspended automatically, pending review — no waiting for someone to be at a desk.",
  },
  {
    icon: Siren,
    title: "Protected infrastructure",
    body: "Traffic sits behind a WAF with DDoS mitigation, every public form is captcha-protected, and OTP requests are rate-limited by IP.",
  },
];

export function TrustSafety() {
  const gridRef = useReveal<HTMLDivElement>({ stagger: 0.08, y: 32 });

  return (
    <section className="bg-ink-1 relative overflow-hidden py-24 text-white lg:py-32">
      <LatticeBackdrop className="text-brand-green/60 opacity-40" />

      <div className="relative mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="text-brand-green mb-4 text-[11px] font-semibold tracking-[0.18em] uppercase">
            Trust &amp; safety
          </p>
          <h2 className="font-display-tight text-balance text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.02]">
            An open directory only works if someone is minding it.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-white/65">
            Anyone can list a group, which is the point — so the safeguards sit around the
            listing, not in front of it.
          </p>
        </div>

        <div ref={gridRef} className="mt-16 grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              data-reveal
              className="bg-ink-1 relative p-7 ring-1 ring-white/10"
            >
              <span className="text-brand-green bg-brand-green/12 inline-flex size-11 items-center justify-center rounded-[13px]">
                <pillar.icon size={20} strokeWidth={1.7} />
              </span>
              <h3 className="font-display mt-5 text-[16.5px] leading-snug">{pillar.title}</h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/55">{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Mount both**

In `app/page.tsx`, add `<HowItWorks />` and `<TrustSafety />` after `<RecentGroups />`:

```tsx
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TrustSafety } from "@/components/sections/TrustSafety";
```

- [ ] **Step 4: Verify**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npx tsc --noEmit && npm run build
```

In the browser at 1440×900 confirm: the How it works section pins at the top of the viewport, the five cards pan horizontally as you scroll, the section releases cleanly and the next section follows with no gap or jump, and the dark trust band renders with a visible lattice and four hairline-separated pillars. Then narrow to 1023px and confirm the pin is gone and the cards stack vertically.

Resizing the window mid-pin is the failure case to watch — `invalidateOnRefresh: true` recomputes the pan distance, so the section must still release at the right scroll position after a resize.

- [ ] **Step 5: Commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && git add -A && git commit -m "feat: pinned how-it-works track and dark trust band"
```

---

## Task 12: Add-group band, FAQ, and footer

**Files:**
- Create: `components/sections/AddGroupBand.tsx`, `components/sections/Faq.tsx`, `components/layout/Footer.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `FAQS`, `CATEGORIES`, `Button`, `Logo`, `LatticeBackdrop`, `SectionHeading`, `useReveal`
- Produces: `<AddGroupBand />`, `<Faq />`, `<Footer />`

- [ ] **Step 1: The add-group band**

The second prominent Add Group entry point required by FR-GL-01. Create `components/sections/AddGroupBand.tsx`:

```tsx
"use client";

import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LatticeBackdrop } from "@/components/ui/LatticeBackdrop";
import { useReveal } from "@/lib/motion/useReveal";

export function AddGroupBand() {
  const ref = useReveal<HTMLDivElement>({ stagger: 0.09, y: 30 });

  return (
    <section className="px-5 py-24 md:px-8 lg:py-32">
      <div className="bg-brand-green relative mx-auto max-w-[1400px] overflow-hidden rounded-[32px] px-8 py-16 text-white md:px-14 lg:py-24">
        <LatticeBackdrop className="text-white/50 opacity-45" />
        <div className="absolute -right-24 -bottom-32 size-[34rem] rounded-full bg-white/[0.07] blur-2xl" />

        <div ref={ref} className="relative max-w-3xl">
          <p
            data-reveal
            className="mb-5 text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase"
          >
            Run a group?
          </p>
          <h2
            data-reveal
            className="font-display-tight text-balance text-[clamp(2.1rem,5vw,4rem)] leading-[0.98]"
          >
            List it once. Let the right people find it for years.
          </h2>
          <p data-reveal className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/80">
            Your listing gets its own indexed page, a clean permanent URL, and a place in every
            relevant search. Keep the join link public, or reserve it for signed-in members —
            your call.
          </p>

          <div data-reveal className="mt-10 flex flex-wrap gap-3">
            <Button href="/add-group" variant="secondary" size="lg">
              <Plus size={17} strokeWidth={2.2} />
              Add a group
            </Button>
            <Button
              href="/register"
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/12 hover:text-white"
            >
              Create an account
              <ArrowRight size={16} strokeWidth={2} />
            </Button>
          </div>

          <p data-reveal className="mt-7 text-[12.5px] text-white/60">
            You will verify an email address and a WhatsApp number before your first listing
            publishes.
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: The FAQ**

The `grid-rows-[0fr]` → `grid-rows-[1fr]` transition animates to auto height in pure CSS — no GSAP, no measuring. Create `components/sections/Faq.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQS } from "@/lib/data/faqs";
import { cn } from "@/lib/utils/cn";

export function Faq() {
  const [open, setOpen] = useState<string | null>(FAQS[0].id);

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 md:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-24">
        <SectionHeading
          eyebrow="Questions"
          title="The things people ask first."
          description="Everything else lives in the help centre."
        />

        <div className="border-surface-line border-t">
          {FAQS.map((faq) => {
            const isOpen = open === faq.id;
            return (
              <div key={faq.id} className="border-surface-line border-b">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span
                    className={cn(
                      "font-display text-[17px] leading-snug transition-colors duration-300",
                      isOpen ? "text-brand-deep" : "text-ink-1 group-hover:text-brand-deep",
                    )}
                  >
                    {faq.question}
                  </span>
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-out-expo)]",
                      isOpen
                        ? "border-brand-green bg-brand-green rotate-45 text-white"
                        : "border-surface-line-strong text-ink-3 group-hover:border-brand-green/50",
                    )}
                  >
                    <Plus size={15} strokeWidth={2.1} />
                  </span>
                </button>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)]",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="text-ink-3 max-w-xl pr-12 pb-7 text-[14.5px] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: The footer**

Create `components/layout/Footer.tsx`:

```tsx
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LatticeBackdrop } from "@/components/ui/LatticeBackdrop";
import { CATEGORIES } from "@/lib/data/categories";

const DIRECTORY_LINKS = [
  { label: "Browse all groups", href: "/directory" },
  { label: "Trending this week", href: "/trending" },
  { label: "Just listed", href: "/recent" },
  { label: "Add a group", href: "/add-group" },
];

const ACCOUNT_LINKS = [
  { label: "Log in", href: "/login" },
  { label: "Create account", href: "/register" },
  { label: "My groups", href: "/my-groups" },
  { label: "Profile", href: "/profile" },
];

const LEGAL_LINKS = [
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
  { label: "Cookie policy", href: "/cookies" },
  { label: "Report a listing", href: "/report" },
];

function LinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-ink-4 mb-4 text-[10.5px] font-semibold tracking-[0.16em] uppercase">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href="#"
              data-href={link.href}
              className="text-ink-2 hover:text-brand-deep text-[13.5px] transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-surface-line bg-surface-card relative overflow-hidden border-t">
      <LatticeBackdrop className="text-brand-green/40 opacity-50" />

      <div className="relative mx-auto max-w-[1400px] px-5 py-16 md:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div className="max-w-sm">
            <Link href="#" data-href="/" className="flex items-center gap-2.5">
              <Logo size={32} />
              <span className="font-display text-ink-1 text-[20px] tracking-tight">
                JewishChat
              </span>
            </Link>
            <p className="text-ink-3 mt-5 text-[14px] leading-relaxed">
              A community-run directory of WhatsApp groups for Jewish business, learning, chesed
              and everyday life.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <p className="text-ink-4 mb-4 text-[10.5px] font-semibold tracking-[0.16em] uppercase">
                Categories
              </p>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-1">
                {CATEGORIES.map((c) => (
                  <li key={c.id}>
                    <Link
                      href="#"
                      data-href={`/${c.slug}`}
                      className="text-ink-2 hover:text-brand-deep text-[13.5px] transition-colors"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <LinkColumn title="Directory" links={DIRECTORY_LINKS} />
            <LinkColumn title="Account" links={ACCOUNT_LINKS} />
            <LinkColumn title="Legal" links={LEGAL_LINKS} />
          </div>
        </div>

        <div className="border-surface-line mt-14 flex flex-col gap-3 border-t pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-4 text-[12.5px]">
            © 2026 JewishChat. All rights reserved.
          </p>
          <p className="text-ink-4 text-[12.5px]">
            Not affiliated with, endorsed by, or connected to WhatsApp or Meta.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

That disclaimer is not decoration — a directory of WhatsApp links needs to be unambiguous about not being a Meta property.

- [ ] **Step 4: Mount all three**

In `app/page.tsx`, add after `<TrustSafety />`:

```tsx
import { AddGroupBand } from "@/components/sections/AddGroupBand";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/layout/Footer";
```

Order: `<AddGroupBand />`, `<Faq />` inside `<main>`, then `<Footer />` after `</main>`.

- [ ] **Step 5: Verify**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npx tsc --noEmit && npm run build
```

In the browser confirm: the green band renders as a rounded full-bleed card with a visible white lattice, the FAQ opens with a smooth height transition and the plus rotating to a cross, only one FAQ is open at a time, and the footer shows all 12 categories plus the three link columns.

- [ ] **Step 6: Commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && git add -A && git commit -m "feat: add-group band, FAQ accordion, and footer"
```

---

## Task 13: Cookie consent and structured data

**Files:**
- Create: `components/layout/CookieConsent.tsx`, `lib/seo/schema.ts`
- Modify: `app/layout.tsx`, `app/page.tsx`

**Interfaces:**
- Consumes: `Button`, `PUBLIC_GROUPS`, `CATEGORIES`, `categoryById`
- Produces: `<CookieConsent />`, `buildWebsiteSchema(): object`, `buildCategoryListSchema(): object`, `buildItemListSchema(): object`

- [ ] **Step 1: The consent banner**

SRS §3.14: inform the user of the cookie types in use and require acknowledgement before non-essential cookies are set. Create `components/layout/CookieConsent.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "jc-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Read storage after mount only — reading during render would desync SSR.
  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY)) return;
    const t = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!visible || !el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" },
    );
    return () => tween.kill();
  }, [visible]);

  const decide = (choice: "all" | "essential") => {
    window.localStorage.setItem(STORAGE_KEY, choice);
    const el = ref.current;
    if (!el) {
      setVisible(false);
      return;
    }
    gsap.to(el, {
      opacity: 0,
      y: 20,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => setVisible(false),
    });
  };

  if (!visible) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="border-surface-line bg-surface-card fixed right-4 bottom-4 left-4 z-[60] rounded-[22px] border p-5 shadow-[0_28px_70px_-28px_color-mix(in_oklab,var(--color-ink-1)_50%,transparent)] sm:right-6 sm:bottom-6 sm:left-auto sm:max-w-[26rem]"
    >
      <span className="bg-brand-soft text-brand-deep mb-4 inline-flex size-10 items-center justify-center rounded-[12px]">
        <Cookie size={19} strokeWidth={1.8} />
      </span>

      <h2 className="font-display text-ink-1 text-[16px]">Cookies on JewishChat</h2>
      <p className="text-ink-3 mt-2 text-[13px] leading-relaxed">
        We use essential cookies to keep the site working, and optional ones to understand which
        groups people find useful. Nothing optional is set until you say yes.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => decide("all")}>
          Accept all
        </Button>
        <Button variant="secondary" size="sm" onClick={() => decide("essential")}>
          Essential only
        </Button>
      </div>

      <Link
        href="#"
        data-href="/cookies"
        className="text-ink-4 hover:text-brand-deep mt-4 inline-block text-[12px] underline underline-offset-2 transition-colors"
      >
        Read the cookie policy
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Structured data**

Create `lib/seo/schema.ts`:

```ts
import { CATEGORIES, categoryById } from "@/lib/data/categories";
import { PUBLIC_GROUPS } from "@/lib/data/groups";

const SITE_URL = "https://jewishchat.example";

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JewishChat",
    url: SITE_URL,
    description:
      "A directory of WhatsApp groups for Jewish business, learning, shuls, chesed and community life.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildItemListSchema() {
  const top = [...PUBLIC_GROUPS]
    .sort((a, b) => b.metrics.uniqueViews - a.metrics.uniqueViews)
    .slice(0, 8);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Most active WhatsApp groups this week",
    numberOfItems: top.length,
    itemListElement: top.map((group, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: group.name,
      description: group.shortDescription,
      url: `${SITE_URL}/${categoryById(group.categoryId)?.slug ?? "group"}/${group.slug}`,
    })),
  };
}

export function buildCategoryListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Group categories",
    numberOfItems: CATEGORIES.length,
    itemListElement: CATEGORIES.map((category, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: category.name,
      description: category.description,
      url: `${SITE_URL}/${category.slug}`,
    })),
  };
}
```

- [ ] **Step 3: Inject the schema and mount the banner**

In `app/page.tsx`, import the builders and render the JSON-LD at the top of the returned tree:

```tsx
import {
  buildCategoryListSchema,
  buildItemListSchema,
  buildWebsiteSchema,
} from "@/lib/seo/schema";
```

and immediately inside `<SearchProvider>`:

```tsx
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            buildWebsiteSchema(),
            buildCategoryListSchema(),
            buildItemListSchema(),
          ]),
        }}
      />
```

In `app/layout.tsx`, import `CookieConsent` and render it inside `<SmoothScroll>` after `{children}`:

```tsx
import { CookieConsent } from "@/components/layout/CookieConsent";
```

```tsx
        <SmoothScroll>
          {children}
          <CookieConsent />
        </SmoothScroll>
```

- [ ] **Step 4: Extend the metadata**

Replace the `metadata` export in `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://jewishchat.example"),
  title: {
    default: "JewishChat — Find the WhatsApp groups your community is already in",
    template: "%s · JewishChat",
  },
  description:
    "A directory of WhatsApp groups for Jewish business, learning, shuls, chesed and everyday community life. Ask in plain language and get results ranked by relevance.",
  keywords: [
    "Jewish WhatsApp groups",
    "frum WhatsApp groups",
    "community directory",
    "Lakewood",
    "Boro Park",
    "Jerusalem",
  ],
  openGraph: {
    type: "website",
    siteName: "JewishChat",
    title: "Find the group your community is already in",
    description:
      "3,961 WhatsApp groups across 46 cities — business, learning, shuls, chesed and community life.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "JewishChat",
    description: "Find the WhatsApp group your community is already in.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};
```

- [ ] **Step 5: Verify**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npx tsc --noEmit && npm run build
```

In the browser: hard-reload with `localStorage` cleared and confirm the consent card slides up after roughly a second, that choosing either option dismisses it, and that reloading does not bring it back. Then confirm in DevTools that the page `<head>`/body contains a `<script type="application/ld+json">` holding three objects, and validate the JSON parses.

- [ ] **Step 6: Commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && git add -A && git commit -m "feat: cookie consent banner, JSON-LD schema, and page metadata"
```

---

## Task 14: Responsive, reduced-motion, and performance pass

The whole page exists now. This task hardens it.

**Files:**
- Modify: `app/globals.css`, and any component found failing a check below

**Interfaces:**
- Consumes: everything built so far
- Produces: no new API — a verified page

- [ ] **Step 1: Add the reduced-motion stylesheet backstop**

GSAP handles its own animations, but CSS transitions and the marquee need a stop too. Append to the `@layer base` block in `app/globals.css`:

```css
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
```

- [ ] **Step 2: Verify the reduced-motion path end to end**

In the browser devtools, emulate `prefers-reduced-motion: reduce`, reload, and confirm every one of these:

1. All text is visible immediately — nothing is stuck at `opacity: 0`. A stuck section means a `matchMedia` branch is missing its `reduced` case.
2. Scrolling is native, not smoothed.
3. The How it works section does not pin; cards stack or scroll normally.
4. The location ticker is static.
5. The constellation renders a single static frame and does not animate.
6. Stat numbers show their final values.

- [ ] **Step 3: Verify the three breakpoints**

Capture each width with headless Chrome (see Global Constraints for why the browser tool is not used), then read each PNG:

```bash
cd "D:/Work/Jewishchat/Jewishchat" && for s in "mobile 390 2600" "tablet 768 2600" "desktop 1440 2600"; do set -- $s; "/c/Program Files/Google/Chrome/Application/chrome.exe" --headless --disable-gpu --hide-scrollbars --virtual-time-budget=8000 --window-size=$2,$3 --screenshot="D:\Work\Jewishchat\Jewishchat\docs\screenshots\home-$1.png" http://localhost:3000; done
```

At each width confirm: no horizontal overflow, no text clipped or overlapping, all tap targets at least 40px, and the header does not overlap hero copy.

- [ ] **Step 4: Verify the search flow once more, at desktop width**

1. Type `Business forums in Florida with over 100 members` — the first suggestion must be **Frum Business Forum Florida**.
2. Type `roofing contractors in Lakewood with financing` — the first suggestion must be **Lakewood Contractors Network**.
3. Type `manchester support circle` — **Manchester Support Circle** must not appear (it is suspended).
4. Clear the field — the constellation returns to its idle grey.

- [ ] **Step 5: Check the console and the build output**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npm run build
```

Confirm: the build succeeds, `/` is listed as a static route, and the browser console is clean — no hydration warnings, no `ScrollTrigger` warnings about missing triggers, no WebGL context errors.

- [ ] **Step 6: Confirm the constellation stops when off-screen**

Scroll to the footer, then in the console run:

```js
document.querySelector("canvas") !== null
```

The canvas element still exists; confirm via the Performance panel that no WebGL frames are being submitted while the hero is out of view. If frames continue, the `IntersectionObserver` in `Constellation.tsx` is not firing and the `rootMargin` needs checking.

- [ ] **Step 7: Run the test suite one final time**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && npm test && npx tsc --noEmit && npm run build
```

Expected: 11 tests pass, `tsc` exits 0, build exits 0.

- [ ] **Step 8: Commit**

```bash
cd "D:/Work/Jewishchat/Jewishchat" && git add -A && git commit -m "chore: reduced-motion backstop and responsive verification pass"
```

---

## Appendix: Section order on the finished page

1. `Header` — fixed, gains a blurred background once the hero starts leaving
2. `Hero` — constellation, headline, search slot, query chips
3. `StatBand` — four counting metrics
4. `CategoryLattice` — 12 tiles in a hex-offset grid, then the location ticker
5. `TrendingGroups` — 8 metric-ranked cards behind size filters
6. `RecentGroups` — 4 newest listings
7. `HowItWorks` — pinned four-step submission track
8. `TrustSafety` — dark band, four pillars
9. `AddGroupBand` — full-bleed green call to action
10. `Faq` — six questions
11. `Footer` — categories, directory, account, legal
12. `CookieConsent` — fixed, appears once per browser

## Appendix: SRS coverage map

| Requirement | Where it lands |
|---|---|
| FR-AI-01 prominent search for all users | `SearchDock` / `SearchField`, docked into the header on scroll |
| FR-AI-02 natural-language queries | `QueryChips`, `parseQuery` intent extraction |
| FR-AI-03 type-ahead suggestions | `Suggestions` |
| FR-AI-04 filters, relevance ordering | `FilterChips` size bands; `searchGroups` sort |
| FR-AI-06 confidence score per result | Percentage + meter in `Suggestions` and `GroupCard` |
| FR-GL-01 prominent Add Group for guests and members | `Header` CTA and `AddGroupBand` |
| FR-GL-02 multi-step submission | `HowItWorks` four steps |
| FR-GL-05 SEO-friendly group URL | `data-href` on every group link; `buildItemListSchema` |
| FR-CM-02 category name, description, icon, slug | `CategoryTile`, `CategoryLattice`, `Footer` |
| FR-GV-04 login-restricted join links | Members-only badge on `GroupCard` |
| FR-GS-02 suspended groups hidden | `PUBLIC_GROUPS` filter, enforced again in `searchGroups` |
| FR-ME-01 engagement metrics | `TrendingGroups` ordering, `StatBand` |
| FR-RP-01/04 reporting and thresholds | `TrustSafety` pillars, footer report link |
| FR-UR-05/06 email and WhatsApp verification | `HowItWorks` step 3, `AddGroupBand` note, FAQ 2 |
| §3.14 cookie consent | `CookieConsent` |
| §4.1 clean navigation, labelled categories | `Header`, `CategoryLattice`, `Footer` |
| §5.5 SEO, schema markup | `lib/seo/schema.ts`, `metadata` in `app/layout.tsx` |
| §5.6 responsive on mobile browsers | Task 14 breakpoint pass |

**Deliberately out of scope** (no route exists, per the homepage-only constraint): registration and login flows, the group submission form itself, group and category pages, My Groups, the profile page, the admin panel, audit trail, geo-fencing, and bulk upload. Every link to those points at `#` and carries its intended URL in `data-href`.



