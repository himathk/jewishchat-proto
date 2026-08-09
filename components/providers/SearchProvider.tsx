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
