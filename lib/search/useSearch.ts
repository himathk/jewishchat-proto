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

  return {
    results,
    suggestions: results.slice(0, 6),
    isSearching: debounced.trim().length > 0,
  };
}
