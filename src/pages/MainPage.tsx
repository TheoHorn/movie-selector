import React, { useMemo, useState } from "react";
import { useAppState } from "./../state/useAppState";
import PosterStrip from "./../components/PosterStrip";
import RouletteWheel from "./../components/RouletteWheel";

export default function MainPage() {
  const { movies, users, spinAndResolve } = useAppState();
  const [last, setLast] = useState(null as any);

  // Build wheel movies set: use real posters for 10% (deterministic), placeholder for others handled in PosterStrip
  const wheelMovies = useMemo(() => movies.map((m) => ({ ...m })), [movies]);

  const handleSpin = async () => {
    // call core spin logic (which uses coin pool)
    const record = await spinAndResolve();
    setLast(record);
    // We don't force a targetIndex in the wheel here; visual spin will be random but the resolved record is authoritative
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white/5 backdrop-blur-lg p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Roulette</h2>
          <div className="mb-6">
            <RouletteWheel
              movies={wheelMovies}
              onComplete={(m) => {
                /* purely visual */
              }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSpin}
              className="px-4 py-2 rounded bg-rose-500"
            >
              🎰 Spin (compute)
            </button>
            <button onClick={handleSpin} className="px-4 py-2 rounded border">
              ♻️ Re-run
            </button>
            <div className="ml-auto text-sm text-neutral-300">
              Last:{" "}
              {last
                ? `${last.movieTitle} @ ${new Date(
                    last.timestamp
                  ).toLocaleTimeString()}`
                : "—"}
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg p-4 rounded-2xl">
          <h3 className="font-semibold">Players</h3>
          <div className="mt-3 space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-2 rounded bg-white/2 flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  {u.avatar}
                </div>
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-sm text-neutral-300">
                    Coins: {u.coins}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h4 className="font-semibold">Poster Strip</h4>
            <PosterStrip movies={movies} />
          </div>
        </div>
      </div>
    </div>
  );
}
