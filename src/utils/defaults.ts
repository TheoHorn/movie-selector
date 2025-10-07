import { Movie, User } from "../state/useAppState";

// A richer default dataset for manual testing and UI checks.
// Includes genres, tmdbIds, and varied user coins/weights to exercise the coin pool logic.
export const defaultMoviesSeed = (): Movie[] => [
  {
    id: "m1",
    title: "Inception",
    poster: "https://image.tmdb.org/t/p/w500/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg",
    ownerId: "u1",
    genre: "Action,Science Fiction",
    tmdbId: 27205,
  },
  {
    id: "m2",
    title: "Parasite",
    poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    ownerId: "u2",
    genre: "Drama,Thriller",
    tmdbId: 496243,
  },
  {
    id: "m3",
    title: "Spirited Away",
    poster: "https://image.tmdb.org/t/p/w500/dL11DBPcRhWWnJcFXl9A07MrqTI.jpg",
    ownerId: "u1",
    genre: "Animation,Family,Fantasy",
    tmdbId: 129,
  },
  {
    id: "m4",
    title: "The Matrix",
    poster: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    ownerId: "u2",
    genre: "Action,Science Fiction",
    tmdbId: 603,
  },
  {
    id: "m5",
    title: "The Grand Budapest Hotel",
    poster: "https://image.tmdb.org/t/p/w500/nX5XotM9yprCKarRH4fzOq1VM1J.jpg",
    ownerId: "u1",
    genre: "Comedy,Drama",
    tmdbId: 120467,
  },
  {
    id: "m7",
    title: "The Shawshank Redemption",
    poster: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    ownerId: "u2",
    genre: "Drama,Crime",
    tmdbId: 278,
  },
];

export const defaultUsersSeed = (): User[] => [
  {
    id: "u1",
    name: "Alice",
    avatar: "A",
    coins: 5,
    // Alice likes Inception and Grand Budapest a bit more
    weights: { m1: 1.5, m5: 1.3 },
    perMovieCoins: { m3: 1 },
  },
  {
    id: "u2",
    name: "Bob",
    avatar: "B",
    coins: 2,
    // Bob strongly favors The Matrix and Shawshank
    weights: { m4: 2.0, m7: 1.8 },
    perMovieCoins: { m4: 2 },
  },
];
