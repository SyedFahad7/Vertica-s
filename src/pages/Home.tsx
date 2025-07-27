import { useState, useEffect } from 'react';
import ShowCard from '../components/ShowCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { TrendingUp, Star, Clock } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SwiperCore from 'swiper';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import { Show } from '../types';

SwiperCore.use([Navigation, Pagination, A11y]);

const fetchShows = async (endpoint: string) => {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const res = await fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}`);
  const data = await res.json();
  return (data.results || []).map((item: any) => ({
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
    seasons: [],
    status: '',
    number_of_episodes: 0,
    number_of_seasons: 0,
    networks: [],
    created_by: [],
  }));
};

const Home = () => {
  const [trending, setTrending] = useState<Show[]>([]);
  const [topRated, setTopRated] = useState<Show[]>([]);
  const [airingToday, setAiringToday] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchShows('trending/tv/week'),
      fetchShows('tv/top_rated'),
      fetchShows('tv/airing_today'),
    ])
      .then(([trending, topRated, airingToday]) => {
        setTrending(trending);
        setTopRated(topRated);
        setAiringToday(airingToday);
      })
      .catch(() => setError('Failed to fetch shows from TMDB.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading amazing shows...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600 font-bold">{error}</div>
      </div>
    );
  }

  const renderCarousel = (shows: Show[], title: string, icon: JSX.Element, bg: string) => (
    <section className={`py-12 ${bg}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          {icon}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 ml-2">{title}</h2>
        </div>
        <Swiper
          spaceBetween={16}
          slidesPerView={2}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 6 },
          }}
          className="pb-8"
        >
          {shows.map((show) => (
            <SwiperSlide key={show.id} className="h-auto">
              <ShowCard show={show} className="transition-transform duration-300 hover:scale-105" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Your Next
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
                Favorite Show
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Explore thousands of TV shows, get detailed episode information, 
              and never miss your next binge-worthy series.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg">
                Start Exploring
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </section>
      {renderCarousel(trending, 'Trending Now', <TrendingUp className="h-8 w-8 text-red-500 mr-2" />, 'bg-white')}
      {renderCarousel(topRated, 'Top Rated', <Star className="h-8 w-8 text-yellow-500 mr-2" />, 'bg-gray-50')}
      {renderCarousel(airingToday, 'Airing Today', <Clock className="h-8 w-8 text-green-500 mr-2" />, 'bg-white')}
      {/* Statistics Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose ShowFinder?</h2>
            <p className="text-gray-300 text-lg">Your ultimate destination for TV show discovery</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">10,000+</div>
              <div className="text-gray-300">TV Shows</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">500,000+</div>
              <div className="text-gray-300">Episodes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">1M+</div>
              <div className="text-gray-300">Happy Users</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;