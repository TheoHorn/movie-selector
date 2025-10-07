import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppState } from '../state/useAppState';
import { searchTmdbMovies } from '../utils/tmdb';
import HistoryList from '../components/HistoryList';

export default function UserPage() {
  const { uid } = useParams<{ uid: string }>();
  const { users, movies, addMovieViaTmdb, removeMovie, updateUser, setUserWeight, } = useAppState();
  const user = users.find(u => u.id === uid);
  if (!user) return <div>User not found</div>;

  const ownMovies = movies.filter(m => m.ownerId === user.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoading] = useState(false);

  const doSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const res = await searchTmdbMovies(searchQuery);
      setSearchResults(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-2xl">
        <h2 className="text-2xl font-semibold">{user.name}'s Profile</h2>
        <div className="mt-2 text-sm text-neutral-400">You can manage your movie list, coins, and preferences here.</div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-2xl">
        <h3 className="font-semibold">Global Coins: {user.coins}</h3>
        <button className="mt-2 px-3 py-1 rounded bg-blue-600" onClick={() => updateUser(user.id, { coins: user.coins + 1 })}>+1 Coin</button>
      </div>

      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-2xl">
        <h3 className="font-semibold">Add Movie (TMDb Search)</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search movies..."
            className="p-2 rounded bg-white/2 text-black flex-1"
          />
          <button onClick={doSearch} className="px-3 py-1 rounded bg-green-600">Search</button>
        </div>
        {loadingSearch && <div>Loading...</div>}
        {searchResults.length > 0 && (
          <div className="mt-4 grid md:grid-cols-3 gap-3">
            {searchResults.map(r => (
              <div key={r.id} className="p-2 rounded bg-white/3 flex flex-col items-center">
                <img
                  src={r.poster_path ? `https://image.tmdb.org/t/p/w200${r.poster_path}` : `https://via.placeholder.com/200x300?text=No+Image`}
                  alt={r.title}
                  className="w-32 h-48 object-cover rounded"
                />
                <div className="mt-2 text-center">{r.title}</div>
                <button
                  className="mt-2 px-2 py-1 rounded bg-blue-500 text-sm"
                  onClick={() => addMovieViaTmdb(user.id, r)}
                >
                  Add to my list
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-2xl">
        <h3 className="font-semibold">Your Movies & Preferences</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {ownMovies.map(m => (
            <div key={m.id} className="p-3 rounded bg-white/3 flex flex-col gap-2">
              <img src={m.poster} alt={m.title} className="w-full h-48 object-cover rounded" />
              <div className="font-medium">{m.title}</div>
              <div className="text-sm">Genre: {m.genre || 'N/A'}</div>
              <div className="flex items-center gap-2">
                <label className="text-sm">Preference weight:</label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.25}
                  value={user.weights[m.id] ?? 1}
                  onChange={e => setUserWeight(user.id, m.id, Number(e.target.value))}
                />
                <span className="text-sm">{(user.weights[m.id] ?? 1).toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">Extra coins on this movie:</label>
                <input
                  type="number"
                  min={0}
                  value={user.perMovieCoins[m.id] ?? 0}
                  onChange={e => {
                    const val = Math.max(0, Number(e.target.value));
                    const upd = { ...user.perMovieCoins, [m.id]: val };
                    updateUser(user.id, { perMovieCoins: upd });
                  }}
                  className="w-20 p-1 rounded text-black"
                />
              </div>
              <button
                className="mt-2 px-3 py-1 rounded bg-red-600 text-sm"
                onClick={() => removeMovie(user.id, m.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg p-4 rounded-2xl">
        <h3 className="font-semibold">Your Win History</h3>
        {/* Show history filtered to this user */}
        <HistoryList userId={user.id} />
      </div>
    </div>
  );
}
