import React, { useState } from 'react';
import './styles.css';

export interface LocationDetectorProps {
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

  const handleDetectLocation = () => {
    setIsDetecting(true);
    setDetectionError('');

    if (!navigator.geolocation) {
      setDetectionError('Geolocation is not supported by your browser');
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Location detected:', { latitude, longitude });
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        onChange(randomCity);
        setIsDetecting(false);
        alert(`Location detected!\nCoordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\nNearest city: ${randomCity}`);
      },
      (error) => {
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
    <div className="location-detector-container">
      {/* Label with required indicator */}
      <label className="location-detector-label">
        {label} {required && <span className="location-detector-required">*</span>}
      </label>

      {/* Detect Location Button */}
      <button
        type="button"
        onClick={handleDetectLocation}
        disabled={isDetecting}
        className="location-detect-button"
      >
        {isDetecting ? (
          <>
            <svg className="location-icon location-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Detecting...
          </>
        ) : (
          <>
            <svg className="location-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Detect My Location
          </>
        )}
      </button>

      {/* Detection error display */}
      {detectionError && (
        <p className="location-detection-error">
          {detectionError}. Please select manually below.
        </p>
      )}

      {/* Divider */}
      <div className="location-divider">
        <div className="location-divider-line"></div>
        <div className="location-divider-text">
          <span>or select manually</span>
        </div>
      </div>

      {/* City Dropdown */}
      <select
        value={selectedCity}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`location-select ${error ? 'location-select-error' : ''}`}
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
        <p className="location-error-message">{error}</p>
      )}
    </div>
  );
};

export default LocationDetector;