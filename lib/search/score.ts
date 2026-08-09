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
