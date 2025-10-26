import React, { useState, useEffect } from 'react';
import './SuggestPlaces.css';

interface SuggestPlacesProps {
  onSendMessage: (message: string) => void;
  chatMessages: Array<{
    sender: string;
    content: string;
    timestamp?: string;
  }>;
  userLocation?: {
    latitude: number;
    longitude: number;
    city?: string;
  };
}

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
}

const SuggestPlaces: React.FC<SuggestPlacesProps> = ({
  onSendMessage,
  chatMessages,
  userLocation
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Function to get user's current location
  const getUserLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get city name using reverse geocoding
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            resolve({
              latitude,
              longitude,
              city: data.city || data.locality || 'Unknown City'
            });
          } catch (error) {
            // If reverse geocoding fails, still return coordinates
            resolve({
              latitude,
              longitude,
              city: 'Unknown City'
            });
          }
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  // Get location when component mounts
  useEffect(() => {
    const fetchLocation = async () => {
      // Use provided userLocation if available, otherwise get current location
      if (userLocation) {
        setCurrentLocation(userLocation);
        return;
      }

      setIsGettingLocation(true);
      setLocationError(null);

      try {
        const location = await getUserLocation();
        setCurrentLocation(location);
      } catch (error) {
        setLocationError(error instanceof Error ? error.message : 'Failed to get location');
        console.error('Location error:', error);
      } finally {
        setIsGettingLocation(false);
      }
    };

    fetchLocation();
  }, [userLocation]);

  // Helper function to format star ratings
  const formatStarRating = (rating: number): string => {
    if (!rating) return '⭐ Rating N/A';
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = '⭐'.repeat(fullStars) + (hasHalfStar ? '⭐' : '');
    return `${stars} ${rating}`;
  };

  const handleSuggestPlaces = async () => {
    if (isLoading) return;

    // Check if we have location data
    if (!currentLocation) {
      if (locationError) {
        onSendMessage(`**Location Error**\n\nI couldn't access your location: ${locationError}\n\nPlease enable location access in your browser settings to get personalized place suggestions.`);
        return;
      }
      
      if (isGettingLocation) {
        onSendMessage(`**Getting Your Location**\n\nPlease wait while I fetch your current location to provide personalized suggestions...`);
        return;
      }
    }

    setIsLoading(true);

    try {
      // Prepare messages for the API
      const messages = chatMessages.map(msg => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp || new Date().toISOString()
      }));

      // Use current location or fallback to NYC
      const location = currentLocation || {
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'New York'
      };

      // Call the place suggestion service
      const response = await fetch('http://localhost:3001/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          location,
          radius: 10000
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        const { places, analysis, activities } = data.data;
        
        // Create a formatted message with the suggestions
        let suggestionMessage = `🎯 **AI-Powered Place Suggestions**\n\n`;
        
        // Add analysis summary
        if (analysis?.summary) {
          suggestionMessage += `📊 **Analysis**: ${analysis.summary}\n\n`;
        }

        // Add top places
        if (places && places.length > 0) {
          suggestionMessage += `📍 **Top Recommendations**:\n`;
          places.slice(0, 5).forEach((place: any, index: number) => {
            // Format star rating with proper stars
            const rating = place.rating || place.original_rating;
            const reviewCount = place.user_ratings_total || place.original_user_ratings_total;
            const ratingText = formatStarRating(rating);
            const reviewText = reviewCount ? `(${reviewCount} reviews)` : '';
            
            suggestionMessage += `${index + 1}. **${place.name}** ${ratingText} ${reviewText}\n`;
            
            // Add price level if available
            if (place.price_level !== null && place.price_level !== undefined) {
              const priceLevel = '$'.repeat(place.price_level);
              suggestionMessage += `   💰 Price Level: ${priceLevel}\n`;
            }
            
            // Add personalized description
            if (place.personalizedDescription) {
              suggestionMessage += `   💡 ${place.personalizedDescription}\n`;
            }
            
            // Add address
            if (place.formatted_address) {
              suggestionMessage += `   📍 ${place.formatted_address}\n`;
            }
            
            // Add opening hours if available
            if (place.opening_hours && place.opening_hours.open_now !== undefined) {
              const status = place.opening_hours.open_now ? '🟢 Open Now' : '🔴 Closed';
              suggestionMessage += `   🕒 ${status}\n`;
            }
            
            suggestionMessage += `\n`;
          });
        }

        // Add activities if available
        if (activities && activities.length > 0) {
          suggestionMessage += `🎉 **Suggested Activities**:\n`;
          activities.slice(0, 3).forEach((activity: any, index: number) => {
            suggestionMessage += `${index + 1}. **${activity.activity}**\n`;
            if (activity.description) {
              suggestionMessage += `   📝 ${activity.description}\n`;
            }
            if (activity.duration) {
              suggestionMessage += `   ⏱️ Duration: ${activity.duration}\n`;
            }
            if (activity.cost) {
              suggestionMessage += `   💰 Cost: ${activity.cost}\n`;
            }
            if (activity.whyRecommended) {
              suggestionMessage += `   💡 Why Recommended: ${activity.whyRecommended}\n`;
            }
            suggestionMessage += `\n`;
          });
        }

        // Add tips if available
        if (data.data.recommendations?.tips && data.data.recommendations.tips.length > 0) {
          suggestionMessage += `💡 **Tips for your outing**:\n`;
          data.data.recommendations.tips.forEach((tip: string, index: number) => {
            suggestionMessage += `• ${tip}\n`;
          });
          suggestionMessage += `\n`;
        }

        // Add metadata
        suggestionMessage += `📈 **Search Details**:\n`;
        suggestionMessage += `• Found ${places?.length || 0} places\n`;
        suggestionMessage += `• Search radius: ${data.data.metadata?.searchRadius || 10000}m\n`;
        suggestionMessage += `• Location: ${location.city || 'Current location'}\n`;

        // Add location info to the message
        const locationText = currentLocation ? `📍 **Based on your location**: ${currentLocation.city}` : '📍 **Using default location**: New York';
        const finalMessage = `${locationText}\n\n${suggestionMessage}`;
        
        // Send the suggestion message to chat
        onSendMessage(finalMessage);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching place suggestions:', error);
      
      // Send error message to chat
      const errorMessage = `❌ **Error getting place suggestions**\n\nSorry, I couldn't fetch place recommendations right now. Please try again later.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
      onSendMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine button content based on state
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <div className="spinner"></div>
          <span>Finding Places...</span>
        </>
      );
    }
    
    if (isGettingLocation) {
      return (
        <>
          <div className="spinner"></div>
          <span>Getting Location...</span>
        </>
      );
    }
    
    if (locationError) {
      return (
        <>
          <span className="icon">📍</span>
          <span>Location Error</span>
        </>
      );
    }
    
    return (
      <>
        <span className="icon">🎯</span>
        <span>Suggest Places</span>
      </>
    );
  };

  const getButtonTitle = () => {
    if (currentLocation) {
      return `Get AI-powered place suggestions based on your location: ${currentLocation.city}`;
    }
    if (locationError) {
      return `Location error: ${locationError}. Click to try anyway with default location.`;
    }
    if (isGettingLocation) {
      return 'Getting your current location...';
    }
    return 'Get AI-powered place suggestions based on your conversation';
  };

  return (
    <div className="suggest-places-container">
      <button
        className={`suggest-places-btn ${isLoading || isGettingLocation ? 'loading' : ''}`}
        onClick={handleSuggestPlaces}
        disabled={isLoading || isGettingLocation}
        title={getButtonTitle()}
      >
        {getButtonContent()}
      </button>
    </div>
  );
};

export default SuggestPlaces;
