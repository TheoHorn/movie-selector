import React, { useRef, useState } from "react";
import { Movie } from "../state/useAppState";

export default function RouletteWheel({
  movies,
  onComplete,
}: {
  movies: Movie[];
  onComplete: (m: Movie) => void;
}) {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const [spinning, setSpinning] = useState(false);

  const spin = async (targetIndex?: number) => {
    if (!wheelRef.current || spinning || movies.length === 0) return;
    setSpinning(true);
    // if no targetIndex given, pick random
    const finalIndex =
      typeof targetIndex === "number"
        ? targetIndex
        : Math.floor(Math.random() * movies.length);
    const spins = 4 + Math.floor(Math.random() * 3);
    const anglePer = 360 / movies.length;
    const finalAngle = spins * 360 + finalIndex * anglePer + anglePer / 2;
    wheelRef.current.style.transition =
      "transform 3s cubic-bezier(.22,.9,.2,1)";
    wheelRef.current.style.transform = `rotate(${finalAngle}deg)`;
    setTimeout(() => {
      setSpinning(false);
      onComplete(movies[finalIndex]);
      // reset transform quickly to 0 for subsequent spins
      wheelRef.current!.style.transition = "none";
      wheelRef.current!.style.transform = "rotate(0deg)";
    }, 3200);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-96 h-96 rounded-full bg-white/3 backdrop-blur-lg border border-white/6 flex items-center justify-center">
        <div
          ref={wheelRef}
          className="absolute w-full h-full rounded-full flex items-center justify-center"
        >
          {movies.map((m, i) => {
            const angle = (i / movies.length) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * 140;
            const y = Math.sin(angle) * 140;
            return (
              <div
                key={m.id}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: "translate(-50%,-50%)",
                }}
              >
                <img
                  src={m.poster}
                  alt={m.title}
                  className="w-24 h-36 rounded-md object-cover shadow"
                />
              </div>
            );
          })}
        </div>
        <div className="absolute -top-4 w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-red-400" />
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => spin()}
          className="px-4 py-2 rounded bg-rose-500"
        >
          Spin
        </button>
        <button onClick={() => spin()} className="px-4 py-2 rounded border">
          Re-run
        </button>
      </div>
    </div>
  );
}
