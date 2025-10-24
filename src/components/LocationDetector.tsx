import React, { useState } from 'react';

/**
 * LocationDetector Component
 *
 * A hybrid location component with:
 * 1. "Detect My Location" button using browser geolocation API
 * 2. City dropdown fallback for manual selection
 *
 * @param label - Label for the location selector
 * @param cities - Array of city names for dropdown
 * @param selectedCity - Currently selected city
 * @param onChange - Handler function when city changes
 * @param error - Error message to display (if any)
 * @param required - Whether location is required
 */

interface LocationDetectorProps {
  label: string;
  cities: string[];
  selectedCity: string;
  onChange: (city: string) => void;
  error?: string;
  required?: boolean;
}

const LocationDetector: React.FC<LocationDetectorProps> = ({
  label,
  cities,
  selectedCity,
  onChange,
  error,
  required = false,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState('');

  /**
   * Detect user's location using browser Geolocation API
   * Uses reverse geocoding to get city name (mock implementation)
   */
  const handleDetectLocation = () => {
    setIsDetecting(true);
    setDetectionError('');

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setDetectionError('Geolocation is not supported by your browser');
      setIsDetecting(false);
      return;
    }

    // Get user's coordinates
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Location detected:', { latitude, longitude });

        // Mock reverse geocoding - in real app, use Google Maps API or similar
        // For demo, randomly select a city from the list
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        onChange(randomCity);

        setIsDetecting(false);
        alert(`Location detected!\nCoordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\nNearest city: ${randomCity}`);
      },
      (error) => {
        // Handle geolocation errors
        let errorMessage = 'Unable to detect location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out';
        }
        setDetectionError(errorMessage);
        setIsDetecting(false);
      }
    );
  };

  return (
    <div className="mb-4 sm:mb-5">
      {/* Label with required indicator */}
      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Detect Location Button */}
      <button
        type="button"
        onClick={handleDetectLocation}
        disabled={isDetecting}
        className={`
          w-full mb-3 sm:mb-4 px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium
          flex items-center justify-center gap-2
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          touch-manipulation min-h-[44px]
          ${
            isDetecting
              ? 'bg-gray-400 text-white cursor-wait'
              : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
          }
        `}
      >
        {isDetecting ? (
          <>
            <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Detecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Detect My Location
          </>
        )}
      </button>

      {/* Detection error display */}
      {detectionError && (
        <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-orange-600 bg-orange-50 p-2.5 sm:p-3 rounded-lg">
          {detectionError}. Please select manually below.
        </p>
      )}

      {/* Divider */}
      <div className="relative mb-3 sm:mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-xs sm:text-sm">
          <span className="px-2 sm:px-3 bg-white text-gray-500">or select manually</span>
        </div>
      </div>

      {/* City Dropdown */}
      <select
        value={selectedCity}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 transition-all min-h-[44px] ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      >
        <option value="">Select a city</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      {/* Error message display */}
      {error && (
        <p className="mt-1.5 text-xs sm:text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default LocationDetector;
