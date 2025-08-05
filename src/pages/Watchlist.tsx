import { useEffect, useState } from 'react';
import ShowCard from '../components/ShowCard';

interface WatchlistShow {
  id: number;
  name: string;
  poster_path: string;
  first_air_date: string;
  overview: string;
}

const Watchlist = () => {
  const [shows, setShows] = useState<WatchlistShow[]>([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('watchlist') || '[]');
    setShows(list);
  }, []);

  const removeFromWatchlist = (id: number) => {
    const updated = shows.filter(s => s.id !== id);
    setShows(updated);
    localStorage.setItem('watchlist', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">My Watchlist</h1>
        {shows.length === 0 ? (
          <div className="text-center text-gray-500 py-24 text-xl">Your watchlist is empty.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pb-16">
            {shows.map(show => (
              <div key={show.id} className="relative group">
                <ShowCard show={show} />
                <button
                  onClick={() => removeFromWatchlist(show.id)}
                  className="absolute top-3 right-3 bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from Watchlist"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;