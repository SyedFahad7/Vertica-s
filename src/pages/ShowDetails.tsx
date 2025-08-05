import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Show, Season, Episode, Network, Creator } from '../types';
import { Star, Calendar, MapPin, Users, ArrowLeft, Play, Heart } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

const ShowDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const id = slug ? parseInt(slug.split('-')[0], 10) : undefined;
  const [show, setShow] = useState<Show | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    const fetchShowDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}&append_to_response=credits`);
        const data = await res.json();
        // Map networks
        const networks: Network[] = (data.networks || []).map((n: any) => ({
          id: n.id,
          name: n.name,
          logo_path: n.logo_path,
          origin_country: n.origin_country,
        }));
        // Map creators
        const created_by: Creator[] = (data.created_by || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          profile_path: c.profile_path,
        }));
        // Map seasons (episodes will be fetched separately)
        const seasons: Season[] = (data.seasons || []).map((s: any) => ({
          id: s.id,
          name: s.name,
          overview: s.overview,
          poster_path: s.poster_path,
          season_number: s.season_number,
          episode_count: s.episode_count,
          air_date: s.air_date,
          episodes: [],
        }));
        const showObj: Show = {
          id: data.id,
          name: data.name,
          overview: data.overview,
          first_air_date: data.first_air_date,
          poster_path: data.poster_path,
          backdrop_path: data.backdrop_path,
          vote_average: data.vote_average,
          vote_count: data.vote_count,
          popularity: data.popularity,
          genre_ids: (data.genres || []).map((g: any) => g.id),
          origin_country: data.origin_country || [],
          original_language: data.original_language,
          original_name: data.original_name,
          seasons,
          status: data.status,
          number_of_episodes: data.number_of_episodes,
          number_of_seasons: data.number_of_seasons,
          networks,
          created_by,
        };
        setShow(showObj);
        // Auto-select first season if available
        if (seasons.length > 0) {
          setSelectedSeason(seasons[0]);
        }
      } catch (err) {
        setError('Failed to fetch show details from TMDB.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchShowDetails();
  }, [id]);

  // Fetch episodes for selected season
  useEffect(() => {
    const fetchSeasonEpisodes = async () => {
      if (!show || !selectedSeason) return;
      setLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_TMDB_API_KEY;
        const res = await fetch(`https://api.themoviedb.org/3/tv/${show.id}/season/${selectedSeason.season_number}?api_key=${apiKey}`);
        const data = await res.json();
        const episodes: Episode[] = (data.episodes || []).map((ep: any) => ({
          id: ep.id,
          name: ep.name,
          overview: ep.overview,
          episode_number: ep.episode_number,
          season_number: ep.season_number,
          air_date: ep.air_date,
          runtime: ep.runtime || 0,
          still_path: ep.still_path,
          vote_average: ep.vote_average,
          vote_count: ep.vote_count,
        }));
        setSelectedSeason({ ...selectedSeason, episodes });
      } catch (err) {
        setError('Failed to fetch season episodes from TMDB.');
      } finally {
        setLoading(false);
      }
    };
    if (show && selectedSeason) fetchSeasonEpisodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, selectedSeason?.season_number]);

  useEffect(() => {
    if (!show) return;
    const list = JSON.parse(localStorage.getItem('watchlist') || '[]');
    setInWatchlist(list.some((s: any) => s.id === show.id));
  }, [show]);
  const handleWatchlist = () => {
    if (!show) return;
    let list = JSON.parse(localStorage.getItem('watchlist') || '[]');
    if (inWatchlist) {
      list = list.filter((s: any) => s.id !== show.id);
    } else {
      list.push({ id: show.id, name: show.name, poster_path: show.poster_path, first_air_date: show.first_air_date, overview: show.overview });
    }
    localStorage.setItem('watchlist', JSON.stringify(list));
    setInWatchlist(!inWatchlist);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading show details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">{error}</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Show Not Found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const backdropUrl = show.backdrop_path 
    ? `${TMDB_IMAGE_BASE}/w1280${show.backdrop_path}`
    : 'https://images.unsplash.com/photo-1489599136344-0d58d8d30a0a?w=1280&h=720&fit=crop';

  const posterUrl = show.poster_path 
    ? `${TMDB_IMAGE_BASE}/w500${show.poster_path}`
    : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop';

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <Link 
            to="/" 
            className="inline-flex items-center text-white hover:text-blue-300 mb-8 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img
                src={posterUrl}
                alt={show.name}
                className="w-64 h-96 object-cover rounded-xl shadow-2xl"
              />
            </div>
            
            {/* Details */}
            <div className="flex-1 text-white">
              <h1 className="text-4xl lg:text-6xl font-bold mb-4 leading-tight">
                {show.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-1 bg-yellow-500 text-black px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-semibold">{show.vote_average.toFixed(1)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(show.first_air_date).getFullYear()}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{show.origin_country.join(', ')}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{show.vote_count.toLocaleString()} votes</span>
                </div>
              </div>
              
              <p className="text-lg mb-8 text-gray-200 leading-relaxed max-w-3xl">
                {show.overview}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors duration-200">
                  <Play className="h-5 w-5" />
                  <span>Watch Trailer</span>
                </button>
                
                <button className={`border-2 ${inWatchlist ? 'border-red-600 bg-red-600 text-white' : 'border-white text-white hover:bg-white hover:text-gray-900'} px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors duration-200`}
                  onClick={handleWatchlist}>
                  <Heart className="h-5 w-5" />
                  <span>{inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>
              
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{show.number_of_seasons}</div>
                  <div className="text-gray-300">Seasons</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{show.number_of_episodes}</div>
                  <div className="text-gray-300">Episodes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{show.status}</div>
                  <div className="text-gray-300">Status</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{show.original_language.toUpperCase()}</div>
                  <div className="text-gray-300">Language</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seasons & Episodes */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Seasons & Episodes</h2>
          
          {/* Season Selector */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {show.seasons.map((season) => (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    selectedSeason?.id === season.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {season.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Episodes Grid */}
          {selectedSeason && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <img
                  src={selectedSeason.poster_path 
                    ? `${TMDB_IMAGE_BASE}/w300${selectedSeason.poster_path}`
                    : posterUrl
                  }
                  alt={selectedSeason.name}
                  className="w-48 h-72 object-cover rounded-lg mx-auto md:mx-0"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedSeason.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{selectedSeason.overview}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(selectedSeason.air_date).getFullYear()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{selectedSeason.episode_count} episodes</span>
                    </div>
                  </div>
                </div>
              </div>
              {selectedSeason.episodes.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-gray-900">Episodes</h4>
                  <div className="space-y-3">
                    {selectedSeason.episodes.map((episode) => (
                      <div key={episode.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                          {episode.episode_number}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">{episode.name}</h5>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{episode.overview}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(episode.air_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>{episode.runtime} min</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3" />
                              <span>{episode.vote_average.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ShowDetails;