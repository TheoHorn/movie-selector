import React, { createContext, useContext, useEffect, useState } from "react";
import { uid } from "../utils/uid";
import { defaultMoviesSeed, defaultUsersSeed } from "../utils/defaults";
import { TmdbMovieResult, tmdbPosterFullPath } from "../utils/tmdb";

export type Movie = {
  id: string;
  title: string;
  poster: string;
  ownerId: string;
  genre?: string;
  tmdbId?: number;
};

export type User = {
  id: string;
  name: string;
  avatar?: string;
  coins: number; // global coins
  weights: Record<string, number>; // preference weights
  perMovieCoins: Record<string, number>; // extra coins specific to movie
};

export type SpinRecord = {
  id: string;
  movieId: string;
  movieTitle: string;
  timestamp: number;
  selectedOwnerId: string;
};

const STORAGE = {
  MOVIES: "mr_movies_v2",
  USERS: "mr_users_v2",
  HISTORY: "mr_history_v2",
};

type AppState = {
  movies: Movie[];
  users: User[];
  history: SpinRecord[];
  addMovie: (m: Omit<Movie, "id">) => void;
  addMovieViaTmdb: (ownerId: string, tmdbMovie: TmdbMovieResult) => void;
  removeMovie: (ownerid: string, movieid: string) => void;
  updateUser: (id: string, patch: Partial<User>) => void;
  setUserWeight: (userId: string, movieId: string, weight: number) => void;
  pushHistory: (r: SpinRecord) => void;
  spinAndResolve: () => Promise<SpinRecord>;
};

const ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  // helper to safely parse JSON from localStorage and clear bad values
  const safeParse = <T,>(key: string): T | null => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`localStorage key ${key} contained invalid JSON and was removed`, err);
      localStorage.removeItem(key);
      return null;
    }
  };

  const [movies, setMovies] = useState<Movie[]>(() => {
    const parsed = safeParse<Movie[]>(STORAGE.MOVIES);
    if (parsed) return parsed;
    // temporary placeholder until we fetch defaults.json on mount
    return defaultMoviesSeed();
  });
  const [users, setUsers] = useState<User[]>(() => {
    const parsed = safeParse<User[]>(STORAGE.USERS);
    if (parsed) return parsed;
    // temporary placeholder until we fetch defaults.json on mount
    return defaultUsersSeed();
  });
  const [history, setHistory] = useState<SpinRecord[]>(() => {
    const parsed = safeParse<SpinRecord[]>(STORAGE.HISTORY);
    if (parsed) return parsed;
    return [];
  });

  // On mount, if localStorage is empty for movies/users, try to load from /defaults.json
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const hasMovies = !!localStorage.getItem(STORAGE.MOVIES);
        const hasUsers = !!localStorage.getItem(STORAGE.USERS);
        if (hasMovies && hasUsers) return;

        const res = await fetch('/defaults.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('failed to fetch defaults.json');
        const json = await res.json();
        const m = json.movies ?? defaultMoviesSeed();
        const u = json.users ?? defaultUsersSeed();

        // Only write to localStorage if not already present to avoid overwriting user data
        if (!hasMovies) {
          localStorage.setItem(STORAGE.MOVIES, JSON.stringify(m));
          setMovies(m);
        }
        if (!hasUsers) {
          localStorage.setItem(STORAGE.USERS, JSON.stringify(u));
          setUsers(u);
        }
      } catch (err) {
        // ignore fetch errors and keep in-memory seeds
        console.warn('Could not load /defaults.json, using embedded seeds', err);
        // ensure localStorage is seeded if empty so subsequent loads are consistent
        if (!localStorage.getItem(STORAGE.MOVIES))
          localStorage.setItem(STORAGE.MOVIES, JSON.stringify(defaultMoviesSeed()));
        if (!localStorage.getItem(STORAGE.USERS))
          localStorage.setItem(STORAGE.USERS, JSON.stringify(defaultUsersSeed()));
      }
    };
    loadDefaults();
  }, []);

  useEffect(
    () => localStorage.setItem(STORAGE.MOVIES, JSON.stringify(movies)),
    [movies]
  );
  useEffect(
    () => localStorage.setItem(STORAGE.USERS, JSON.stringify(users)),
    [users]
  );
  useEffect(
    () => localStorage.setItem(STORAGE.HISTORY, JSON.stringify(history)),
    [history]
  );

  const addMovie = (m: Omit<Movie, "id">) =>
    setMovies((prev) => [{ ...m, id: uid("m") }, ...prev]);

  const removeMovie = (ownerId: string, movieId: string) =>
    setMovies((prev) =>
      prev.filter((m) => !(m.id === movieId && m.ownerId === ownerId))
    );
  const updateUser = (id: string, patch: Partial<User>) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  const setUserWeight = (userId: string, movieId: string, weight: number) =>
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, weights: { ...(u as any).weights, [movieId]: weight } }
          : u
      )
    );
  const pushHistory = (r: SpinRecord) =>
    setHistory((prev) => [r, ...prev].slice(0, 50));

  // Selection algorithm described in the prompt:
  // - 90% base pool: 45% for user1 distributed equally among their movies, 45% for user2 likewise.
  // - 10% coin pool distributed among movies proportionally to coin-derived scores.
  const computeProbabilities = () => {
    if (!movies.length) return [] as { movie: Movie; p: number }[];

  // base pool per user
    const basePerUser = 0.45;

    // group movies by owner
    const byOwner = new Map<string, Movie[]>();
    for (const m of movies) {
      const arr = byOwner.get(m.ownerId) ?? [];
      arr.push(m);
      byOwner.set(m.ownerId, arr);
    }

    // per-movie base
    const perMovieBase = new Map<string, number>();
    for (const movieList of byOwner.values()) {
      const share = movieList.length ? basePerUser / movieList.length : 0;
      for (const m of movieList) perMovieBase.set(m.id, share);
    }

    // coin pool
    const coinPool = 0.1;

    // compute coin score per movie: sum over users of (user.coins * max(0, weight-1))
    let coinScores = new Map<string, number>();
    let totalCoinScore = 0;
    for (const m of movies) {
      let score = 0;
      for (const u of users) {
        const w = u.weights[m.id] ?? 1;
        const pmc = u.perMovieCoins[m.id] ?? 0;
        // e.g. global coin influence via (w - 1) * u.coins, plus perMovieCoins
        if (w > 1) score += u.coins * (w - 1);
        if (pmc > 0) score += pmc;
      }
      coinScores.set(m.id, score);
      totalCoinScore += score;
    }

    const results = movies.map((m) => {
      const base = perMovieBase.get(m.id) ?? 0;
      const coinShare =
        totalCoinScore > 0
          ? coinPool * (coinScores.get(m.id)! / totalCoinScore)
          : 0;
      return { movie: m, p: base + coinShare };
    });
    return results;
  };

  const addMovieViaTmdb = async (
    ownerId: string,
    tmdbMovie: TmdbMovieResult
  ) => {
    const newMovie: Movie = {
      id: uid("m"),
      ownerId,
      title: tmdbMovie.title,
      poster: tmdbPosterFullPath(tmdbMovie.poster_path),
      genre: tmdbMovie.genre_ids?.join(",") || undefined,
      tmdbId: tmdbMovie.id,
    };
    setMovies((prev) => [newMovie, ...prev]);
  };

  const spinAndResolve = async (): Promise<SpinRecord> => {
    const probs = computeProbabilities();
    // pick
    const r = Math.random();
    let acc = 0;
    let picked: Movie | null = null;
    for (const item of probs) {
      acc += item.p;
      if (r <= acc) {
        picked = item.movie;
        break;
      }
    }
    if (!picked) picked = probs[probs.length - 1].movie;

    // after selection: opponent gains coins (simple rule: +1 coin to opponent)
    const owner = picked.ownerId;
    const opponent = users.find((u) => u.id !== owner);
    if (opponent) updateUser(opponent.id, { coins: opponent.coins + 1 });

    const record: SpinRecord = {
      id: uid("spin"),
      movieId: picked.id,
      movieTitle: picked.title,
      timestamp: Date.now(),
      selectedOwnerId: owner,
    };
    pushHistory(record);
    return record;
  };

  const value: AppState = {
    movies,
    users,
    history,
    addMovie,
    addMovieViaTmdb,
    removeMovie,
    updateUser,
    setUserWeight,
    pushHistory,
    spinAndResolve,
  };

  return <ctx.Provider value={value}>{children}</ctx.Provider>;
}

export function useAppState() {
  const c = useContext(ctx);
  if (!c) throw new Error("useAppState must be inside provider");
  return c;
}

export function AppProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppStateProvider>{children}</AppStateProvider>;
}
