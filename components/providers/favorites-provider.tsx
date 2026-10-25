"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { MatchSummary } from "@/lib/types";

type FavoritesState = {
  teams: number[];
  series: number[];
};

const STORAGE_KEY = "chauka:favorites:v1";
const EMPTY: FavoritesState = { teams: [], series: [] };

type FavoritesContextValue = FavoritesState & {
  hydrated: boolean;
  hasFavorites: boolean;
  isTeamFollowed: (id: number) => boolean;
  isSeriesFollowed: (id: number) => boolean;
  isMatchFollowed: (match: MatchSummary) => boolean;
  toggleTeam: (id: number) => void;
  toggleSeries: (id: number) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function parse(value: string | null): FavoritesState {
  if (!value) return EMPTY;
  try {
    const parsed = JSON.parse(value) as Partial<FavoritesState>;
    return {
      teams: Array.isArray(parsed.teams)
        ? parsed.teams.filter((id): id is number => Number.isInteger(id))
        : [],
      series: Array.isArray(parsed.series)
        ? parsed.series.filter((id): id is number => Number.isInteger(id))
        : [],
    };
  } catch {
    return EMPTY;
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FavoritesState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setState(parse(window.localStorage.getItem(STORAGE_KEY)));
    } catch {
      setState(EMPTY);
    }
    setHydrated(true);

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setState(parse(event.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((updater: (current: FavoritesState) => FavoritesState) => {
    setState((current) => {
      const next = updater(current);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage can be unavailable in private mode.
      }
      return next;
    });
  }, []);

  const toggleTeam = useCallback(
    (id: number) => {
      update((current) => ({
        ...current,
        teams: current.teams.includes(id)
          ? current.teams.filter((teamId) => teamId !== id)
          : [...current.teams, id],
      }));
    },
    [update]
  );

  const toggleSeries = useCallback(
    (id: number) => {
      update((current) => ({
        ...current,
        series: current.series.includes(id)
          ? current.series.filter((seriesId) => seriesId !== id)
          : [...current.series, id],
      }));
    },
    [update]
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ...state,
      hydrated,
      hasFavorites: state.teams.length + state.series.length > 0,
      isTeamFollowed: (id) => state.teams.includes(id),
      isSeriesFollowed: (id) => state.series.includes(id),
      isMatchFollowed: (match) =>
        state.series.includes(match.seriesId) ||
        state.teams.includes(match.teams[0].id) ||
        state.teams.includes(match.teams[1].id),
      toggleTeam,
      toggleSeries,
    }),
    [state, hydrated, toggleTeam, toggleSeries]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
