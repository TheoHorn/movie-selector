import { Link } from "react-router-dom";

export function Nav() {
  return (
    <nav className="p-4 flex items-center justify-between bg-white/5 backdrop-blur-md rounded-xl mx-6 my-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-white/10 to-white/3 flex items-center justify-center text-black font-bold">
          MR
        </div>
        <div className="font-semibold">Movie Roulette</div>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/" className="px-3 py-1 rounded hover:bg-white/3">
          Roulette
        </Link>
        <Link to="/config" className="px-3 py-1 rounded hover:bg-white/3">
          Config
        </Link>
        <Link to="/profiles" className="px-3 py-1 rounded hover:bg-white/3">
          Profiles
        </Link>
        <Link to="/user/u1" className="px-3 py-1 rounded hover:bg-white/3">
          User 1
        </Link>
        <Link to="/user/u2" className="px-3 py-1 rounded hover:bg-white/3">
          User 2
        </Link>
      </div>
    </nav>
  );
}
