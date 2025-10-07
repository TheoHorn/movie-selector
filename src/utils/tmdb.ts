import axios from "axios";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

export interface TmdbMovieResult {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  genre_ids: number[];
}

export async function searchTmdbMovies(
  query: string
): Promise<TmdbMovieResult[]> {
  const resp = await axios.get(`${BASE_URL}/search/movie`, {
    params: {
      api_key: TMDB_API_KEY,
      query,
      include_adult: false,
      page: 1,
    },
  });
  return resp.data.results as TmdbMovieResult[];
}

export function tmdbPosterFullPath(
  poster_path: string | null,
  size = "w500"
): string {
  if (!poster_path) return "";
  return `https://image.tmdb.org/t/p/${size}${poster_path}`;
}
