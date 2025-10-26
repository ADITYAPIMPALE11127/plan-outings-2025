import React, { useState } from 'react';
import './SuggestMovie.css';

interface SuggestMovieProps {
  onSendMessage: (message: string) => void;
  chatMessages: Array<{
    sender: string;
    content: string;
    timestamp?: string;
  }>;
}

interface MovieData {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

interface MovieResponse {
  success: boolean;
  chatId: string;
  suggestions: MovieData[];
  analysis: {
    genres: string[];
    themes: string[];
    mood: string;
    mentioned_movies: string[];
    summary: string;
  };
  message: string;
  chatPreview: string[];
}

const SuggestMovie: React.FC<SuggestMovieProps> = ({
  onSendMessage,
  chatMessages
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to format star ratings for movies
  const formatMovieRating = (rating: number): string => {
    if (!rating) return '⭐ Rating N/A';
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '');
    return `${stars} ${rating}`;
  };

  // Helper function to get genre names from IDs
  const getGenreName = (genreId: number): string => {
    const genreMap: { [key: number]: string } = {
      28: 'Action',
      12: 'Adventure',
      16: 'Animation',
      35: 'Comedy',
      80: 'Crime',
      99: 'Documentary',
      18: 'Drama',
      10751: 'Family',
      14: 'Fantasy',
      36: 'History',
      27: 'Horror',
      10402: 'Music',
      9648: 'Mystery',
      10749: 'Romance',
      878: 'Science Fiction',
      10770: 'TV Movie',
      53: 'Thriller',
      10752: 'War',
      37: 'Western'
    };
    return genreMap[genreId] || 'Unknown';
  };

  const handleSuggestMovies = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Generate a unique chatId based on current timestamp
      const chatId = `chat_${Date.now()}`;
      
      const response = await fetch(`https://moviesreccombot.onrender.com/api/suggestions/${chatId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MovieResponse = await response.json();
      
      if (data.success && data.suggestions) {
        const movieMessage = formatMovieSuggestions(data);
        onSendMessage(movieMessage);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error: any) {
      console.error('Error fetching movie suggestions:', error);
      
      // Send error message to chat
      const errorMessage = `❌ **Error getting movie suggestions**\n\nSorry, I couldn't fetch movie recommendations right now. Please try again later.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
      onSendMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format the movie suggestions into a readable chat message
  const formatMovieSuggestions = (data: MovieResponse) => {
    let message = `🎬 **AI-Powered Movie Suggestions**\n\n`;

    // Add analysis summary
    if (data.analysis?.summary) {
      message += `📊 **Analysis**: ${data.analysis.summary}\n\n`;
    }

    // Add movie suggestions
    if (data.suggestions && data.suggestions.length > 0) {
      message += `🎭 **Top Movie Recommendations**:\n`;
      data.suggestions.slice(0, 5).forEach((movie: MovieData, index: number) => {
        const rating = movie.vote_average;
        const ratingText = formatMovieRating(rating);
        const reviewText = movie.vote_count ? `(${movie.vote_count} reviews)` : '';
        const genres = movie.genre_ids.map(getGenreName).join(', ');
        const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown';
        
        message += `${index + 1}. **${movie.title}** (${releaseYear}) ${ratingText} ${reviewText}\n`;
        message += `   🎭 Genres: ${genres}\n`;
        message += `   📝 ${movie.overview}\n`;
        message += `   📅 Release Date: ${movie.release_date}\n`;
        message += `   🌍 Language: ${movie.original_language.toUpperCase()}\n`;
        if (movie.popularity) {
          message += `   📈 Popularity Score: ${Math.round(movie.popularity)}\n`;
        }
        message += `\n`;
      });
    } else {
      message += `No movie suggestions found.`;
    }

    // Add analysis details if available
    if (data.analysis) {
      message += `🔍 **Analysis Details**:\n`;
      if (data.analysis.genres && data.analysis.genres.length > 0) {
        message += `• Preferred Genres: ${data.analysis.genres.join(', ')}\n`;
      }
      if (data.analysis.themes && data.analysis.themes.length > 0) {
        message += `• Themes: ${data.analysis.themes.join(', ')}\n`;
      }
      if (data.analysis.mood) {
        message += `• Mood: ${data.analysis.mood}\n`;
      }
      message += `\n`;
    }

    // Add chat preview if available
    if (data.chatPreview && data.chatPreview.length > 0) {
      message += `💬 **Chat Preview**:\n`;
      data.chatPreview.forEach((preview: string) => {
        message += `• ${preview}\n`;
      });
      message += `\n`;
    }

    // Add metadata
    message += `📈 **Search Details**:\n`;
    message += `• Found ${data.suggestions?.length || 0} movies\n`;
    message += `• Chat ID: ${data.chatId}\n`;
    message += `• Powered by MoviesRecComBot\n`;

    return message;
  };

  return (
    <div className="suggest-movie-container">
      <button
        className={`suggest-movie-btn ${isLoading ? 'loading' : ''}`}
        onClick={handleSuggestMovies}
        disabled={isLoading}
        title="Get AI-powered movie suggestions based on your conversation"
      >
        {isLoading ? (
          <>
            <div className="spinner"></div>
            <span>Finding Movies...</span>
          </>
        ) : (
          <>
            <span className="icon">🎬</span>
            <span>Suggest Movie</span>
          </>
        )}
      </button>
    </div>
  );
};

export default SuggestMovie;
