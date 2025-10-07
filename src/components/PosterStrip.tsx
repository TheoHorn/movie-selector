import { Movie } from "../state/useAppState";
import { hashToPercent } from "../utils/hash";

export default function PosterStrip({
  movies,
  showOwner,
}: {
  movies: Movie[];
  showOwner?: boolean;
}) {
  // For blindness: if hashToPercent(movie.id) < 90 => show placeholder poster
  const placeholder = "https://via.placeholder.com/300x450?text=?";

  return (
    <div className="overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md p-3">
      <div className="poster-track whitespace-nowrap will-change-transform animate-scroll-left">
        {movies.map((m) => {
          const blind = hashToPercent(m.id) < 90;
          const src = blind ? placeholder : m.poster;
          return (
            <div
              key={m.id}
              className="inline-block mr-4"
              style={{ width: 140 }}
            >
              <div className="rounded-lg overflow-hidden shadow-lg bg-white/3">
                <img
                  src={src}
                  alt={m.title}
                  className="w-full h-52 object-cover"
                />
              </div>
              <div className="mt-2 text-sm text-center">
                {showOwner ? `${m.title} (${m.ownerId})` : m.title}
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
.poster-track{ display:inline-block; padding-bottom:8px }
@keyframes scrollLeft { 0%{ transform: translateX(0) } 100%{ transform: translateX(-30%) }}
.animate-scroll-left{ animation: scrollLeft 18s linear infinite }
`}</style>
    </div>
  );
}
