import { Link } from 'react-router-dom';
import { Star, Calendar, MapPin } from 'lucide-react';
import { Show } from '../types';
import { BackgroundGradient } from './BackgroundGradient';

interface ShowCardProps {
  show: Show;
  className?: string;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const ShowCard = ({ show, className = '' }: ShowCardProps) => {
  const imageUrl = show.poster_path 
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop';

  return (
    <BackgroundGradient className="rounded-3xl max-w-xs p-4 sm:p-6 bg-white dark:bg-zinc-900 flex flex-col h-full" containerClassName={className}>
      <Link to={`/show/${show.id}-${slugify(show.name)}`} className="group flex flex-col h-full">
        <div className="relative overflow-hidden rounded-2xl shadow-lg">
          <img
            src={imageUrl}
            alt={show.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-medium">
              {typeof show.vote_average === 'number' && !isNaN(show.vote_average)
                ? show.vote_average.toFixed(1)
                : 'N/A'}
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-between mt-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
              {show.name}
            </h3>
            <p className="text-gray-600 dark:text-neutral-300 text-sm mb-3 line-clamp-2">
              {show.overview}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400 mt-auto">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{show.first_air_date ? new Date(show.first_air_date).getFullYear() : '-'}</span>
            </div>
            {Array.isArray(show.origin_country) && show.origin_country.length > 0 && (
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{show.origin_country[0]}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </BackgroundGradient>
  );
};

export default ShowCard;