import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ShowDetails from './pages/ShowDetails';
import Search from './pages/Search';
import { Show } from './types';

function App() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingShows = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const response = await fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`);
        const data = await response.json();
        // Map TMDB results to Show type (partial, as TMDB trending does not include all fields)
        const shows: Show[] = data.results.map((item: any) => ({
          id: item.id,
          name: item.name,
          overview: item.overview,
          first_air_date: item.first_air_date,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          vote_average: item.vote_average,
          vote_count: item.vote_count,
          popularity: item.popularity,
          genre_ids: item.genre_ids || [],
          origin_country: item.origin_country || [],
          original_language: item.original_language,
          original_name: item.original_name,
          // The following fields are not available in trending endpoint, so we use defaults
          seasons: [],
          status: '',
          number_of_episodes: 0,
          number_of_seasons: 0,
          networks: [],
          created_by: [],
        }));
        setShows(shows);
      } catch (err) {
        setError('Failed to fetch shows from TMDB.');
      } finally {
      setLoading(false);
      }
    };
    fetchTrendingShows();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        {error && (
          <div className="bg-red-100 text-red-700 p-4 text-center">{error}</div>
        )}
        <Routes>
          <Route 
            path="/" 
            element={<Home />} 
          />
          <Route 
            path="/show/:id" 
            element={<ShowDetails />} 
          />
          <Route 
            path="/search" 
            element={<Search />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;