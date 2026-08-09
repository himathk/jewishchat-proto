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
