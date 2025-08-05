import { useState, useEffect, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';
import ShowCard from '../components/ShowCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { TrendingUp, Star, Clock, Film, Users as UsersIcon, ThumbsUp, Search } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import { Show } from '../types';

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

  // Refs for smooth scroll
  const trendingRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

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

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  // Animated carousel section
  const renderCarousel = (shows: Show[], title: string, icon: JSX.Element, bg: string, refObj?: React.RefObject<HTMLDivElement>) => (
    <motion.section
      className={`py-12 ${bg}`}
      ref={refObj}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center mb-6">
          {icon}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 ml-2">{title}</h2>
        </div>
        <Swiper
          modules={[Navigation, Pagination, A11y, Autoplay]}
          spaceBetween={48}
          slidesPerView="auto"
          navigation
          pagination={{ clickable: true }}
          loop={true}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          className="pb-8"
        >
          {shows.map((show, idx) => (
            <SwiperSlide key={show.id} className="h-auto flex !w-[340px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(80,80,200,0.12)' }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="flex h-full"
              >
                <ShowCard show={show} className="w-11/12 h-100px my-4" />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </motion.section>
  );

  // Stats animation
  const stats = [
    { value: 12000, label: 'TV Shows', color: 'text-blue-400' },
    { value: 650000, label: 'Episodes', color: 'text-purple-400' },
    { value: 1500000, label: 'Happy Users', color: 'text-green-400' },
  ];

  // Animated counter (type-safe, no .get())
  function AnimatedCounter({ value, className }: { value: number; className?: string }) {
    const [display, setDisplay] = useState(0);
    const spring = useSpring(value, { duration: 1.2 });
    useEffect(() => {
      return spring.on('change', (latest) => setDisplay(Math.floor(Number(latest))));
    }, [spring]);
    return (
      <span className={className}>{display.toLocaleString()}+</span>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-20"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <motion.h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" variants={fadeUp} transition={{ duration: 0.7, ease: 'easeOut' }}>
              Discover Your Next
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
                Favorite Show
              </span>
            </motion.h1>
            <motion.p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed" variants={fadeUp} transition={{ duration: 0.7, ease: 'easeOut' }}>
              Explore thousands of TV shows, get detailed episode information, 
              and never miss your next binge-worthy series.
            </motion.p>
            <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeUp} transition={{ duration: 0.7, ease: 'easeOut' }}>
              <button
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                onClick={() => trendingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Start Exploring
              </button>
              <button
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
                onClick={() => statsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Learn More
              </button>
            </motion.div>
          </motion.div>
        </div>
        {/* Animated Background Elements */}
        <motion.div className="absolute inset-0 overflow-hidden pointer-events-none" initial="hidden" animate="visible">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            animate={{ y: [0, 30, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"
            animate={{ y: [0, -30, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut', delay: 1 }}
          />
        </motion.div>
      </motion.section>
      {renderCarousel(trending, 'Trending Now', <TrendingUp className="h-8 w-8 text-red-500 mr-2" />, 'bg-white', trendingRef)}
      {renderCarousel(topRated, 'Top Rated', <Star className="h-8 w-8 text-yellow-500 mr-2" />, 'bg-gray-50')}
      {renderCarousel(airingToday, 'Airing Today', <Clock className="h-8 w-8 text-green-500 mr-2" />, 'bg-white')}
      {/* Statistics Section */}
      <motion.section
        className="py-16 bg-gray-900 text-white"
        ref={statsRef}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeUp}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 className="text-3xl font-bold mb-4" variants={fadeUp} transition={{ duration: 0.7, ease: 'easeOut' }}>Why Choose ShowFinder?</motion.h2>
            <motion.p className="text-gray-300 text-lg" variants={fadeUp} transition={{ duration: 0.7, ease: 'easeOut' }}>Your ultimate destination for TV show discovery</motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: idx * 0.2 }}
              >
                <span className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value.toLocaleString()}+</span>
                <div className="text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
            </div>
          </div>
      </motion.section>
      {/* Featured Genres Section */}
      <motion.section className="py-16 bg-white" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center"><Film className="h-7 w-7 text-blue-500 mr-2" /> Featured Genres</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
            {['Drama', 'Comedy', 'Action', 'Sci-Fi', 'Documentary', 'Animation'].map((genre) => (
              <div key={genre} className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-6 flex flex-col items-center shadow hover:scale-105 transition-transform duration-200">
                <span className="text-xl font-bold text-blue-700 mb-2">{genre}</span>
                <span className="text-gray-500 text-sm">{Math.floor(Math.random()*2000+100)} shows</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section className="py-16 bg-gray-50" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center"><ThumbsUp className="h-7 w-7 text-green-500 mr-2" /> How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="bg-blue-100 rounded-full p-4 mb-4"><Search className="h-6 w-6 text-blue-600" /></div>
              <h3 className="font-semibold text-lg mb-2">Search Instantly</h3>
              <p className="text-gray-500 text-center">Find any TV show with our lightning-fast search and live suggestions.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="bg-purple-100 rounded-full p-4 mb-4"><Star className="h-6 w-6 text-purple-600" /></div>
              <h3 className="font-semibold text-lg mb-2">Discover Details</h3>
              <p className="text-gray-500 text-center">Explore ratings, seasons, episodes, cast, and more for every show.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="bg-green-100 rounded-full p-4 mb-4"><UsersIcon className="h-6 w-6 text-green-600" /></div>
              <h3 className="font-semibold text-lg mb-2">Build Your Watchlist</h3>
              <p className="text-gray-500 text-center">Save your favorites and never miss a new episode or trending show.</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section className="py-16 bg-white" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 flex items-center"><UsersIcon className="h-7 w-7 text-yellow-500 mr-2" /> What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl shadow p-6">
              <p className="text-gray-700 mb-4">“ShowFinder helped me discover so many hidden gems. The search is super fast!”</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700">A</div>
                <div>
                  <div className="font-semibold">Ayesha K.</div>
                  <div className="text-xs text-gray-400">Binge Watcher</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl shadow p-6">
              <p className="text-gray-700 mb-4">“I love the detailed info and the beautiful UI. It’s my go-to for TV shows.”</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center font-bold text-purple-700">M</div>
                <div>
                  <div className="font-semibold">Mohsin R.</div>
                  <div className="text-xs text-gray-400">TV Buff</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl shadow p-6">
              <p className="text-gray-700 mb-4">“The recommendations and trending carousels are spot on. Highly recommended!”</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-700">S</div>
                <div>
                  <div className="font-semibold">Sana L.</div>
                  <div className="text-xs text-gray-400">Series Addict</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;