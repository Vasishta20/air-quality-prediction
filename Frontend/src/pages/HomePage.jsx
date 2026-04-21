import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';
import AqiGauge from '../components/AqiGauge.jsx';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };
  return [storedValue, setValue];
}

const getHealthAdvice = (quality) => {
  switch (quality) {
    case 'Good': return { icon: '😊', message: "It's a beautiful day! Perfect for all outdoor activities." };
    case 'Satisfactory': return { icon: '🙂', message: 'Air quality is acceptable. Sensitive individuals may feel minor effects.' };
    case 'Moderate': return { icon: '😷', message: 'Unhealthy for sensitive groups. Limit prolonged outdoor exertion.' };
    case 'Poor': return { icon: '🤢', message: 'Everyone may feel health effects. Reduce heavy outdoor activity.' };
    case 'Very Poor': return { icon: '😫', message: 'Health alert. Everyone should avoid outdoor activity.' };
    case 'Severe': return { icon: '☠️', message: 'Serious health risk. Avoid all outdoor activity and stay indoors.' };
    default: return { icon: '', message: '' };
  }
};

const getQualityColors = (quality) => {
  switch (quality) {
    case 'Good': return 'bg-aqi-good border-aqi-good-dark text-aqi-good-dark';
    case 'Satisfactory': return 'bg-aqi-satisfactory border-aqi-satisfactory-dark text-aqi-satisfactory-dark';
    case 'Moderate': return 'bg-aqi-moderate border-aqi-moderate-dark text-aqi-moderate-dark';
    case 'Poor': return 'bg-aqi-poor border-aqi-poor-dark text-aqi-poor-dark';
    case 'Very Poor': return 'bg-aqi-very-poor border-aqi-very-poor-dark text-aqi-very-poor-dark';
    case 'Severe': return 'bg-aqi-severe border-aqi-severe-dark text-aqi-severe-dark';
    default: return 'bg-gray-100 border-gray-400 text-gray-800';
  }
};

const getPollutantReason = (pollutants) => {
  if (pollutants.pm2_5 > 150) return "PM2.5 (fine dust)";
  if (pollutants.o3 > 180) return "O3 (Ozone)";
  if (pollutants.pm10 > 250) return "PM10 (coarse dust)";
  if (pollutants.no2 > 100) return "NO2 (Nitrogen Dioxide)";
  return null;
};

const tips = [
  "Did you know? Indoor plants like Spider Plants are great at filtering air.",
  "On 'Poor' AQI days, it's best to keep your windows closed.",
  "Fact: PM2.5 particles are so fine they can enter your bloodstream. Our model tracks this!",
  "Our model was trained on 8 key pollutants to give you this score.",
  "This prediction is made by a Random Forest model."
];

// ⭐ UPDATE 1 — Add API BASE URL
const API_BASE = "https://air-quality-prediction-nh36.onrender.com";

const FavoriteCityCard = ({ city, onSelect }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorite = async () => {
      try {
        // ⭐ UPDATE 2 — Use full backend URL
        const response = await fetch(`${API_BASE}/api/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city }),
        });
        const result = await response.json();
        if (response.ok) {
          setData(result);
        }
      } catch (e) {}
      setLoading(false);
    };
    fetchFavorite();
  }, [city]);

  if (loading) {
    return <div className="p-4 bg-gray-200 rounded-lg animate-pulse h-[88px]"></div>;
  }
  if (!data) return null;

  return (
    <div
      className={`p-4 rounded-lg shadow cursor-pointer transition-transform hover:scale-105 ${getQualityColors(data.aqi_quality)}`}
      onClick={() => onSelect(data)}
    >
      <div className="flex justify-between items-center">
        <span className="font-bold">{data.city}</span>
        <span className="text-2xl font-bold">{data.predicted_aqi}</span>
      </div>
      <p className="text-sm">{data.aqi_quality}</p>
    </div>
  );
};

export default function HomePage() {
  const [city, setCity] = useState('');
  const [mainResult, setMainResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [favorites, setFavorites] = useLocalStorage('aqiFavorites', ['Delhi', 'Mumbai']);
  const [tip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

  // ⭐ UPDATE 3 — Main API URL replaced
  const API_URL = `${API_BASE}/api/predict`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city) return;
    await fetchAndDisplay(city);
  };

  const fetchAndDisplay = async (cityName) => {
    setIsLoading(true);
    setMainResult(null);
    setError('');
    setShowDetails(false);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: cityName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'City not found.');

      const advice = getHealthAdvice(data.aqi_quality);
      const reason = getPollutantReason(data.live_pollutants);

      setMainResult({ ...data, advice, reason });
      setCity('');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteClick = (data) => {
    setMainResult(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (cityName) => {
    if (favorites.includes(cityName)) {
      setFavorites(favorites.filter(f => f !== cityName));
    } else {
      setFavorites([...favorites, cityName]);
    }
  };

  const isFavorite = (cityName) => favorites.includes(cityName);

  return (
    <div className="relative space-y-6">

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800">What's the air like outside?</h1>
        <p className="text-gray-500 mt-1">Get a live AQI prediction for any city.</p>

        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
          <input
            type="text"
            className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., London, New York..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`p-3 px-4 bg-blue-600 text-white rounded-md font-semibold ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            disabled={isLoading}
          >
            {isLoading ? '...' : 'Check'}
          </button>
        </form>
      </div>

      {isLoading && <div className="text-center p-6 text-gray-500"><p>Gathering live pollutant data...</p></div>}

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
          <strong>Error:</strong> {error}
        </div>
      )}

      {mainResult && (
        <div className={`p-6 border-l-4 rounded-lg shadow-lg ${getQualityColors(mainResult.aqi_quality)} animate-fadeIn`}>

          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold">{mainResult.city}</h2>
            <button onClick={() => toggleFavorite(mainResult.city)} title="Add to favorites">
              {isFavorite(mainResult.city)
                ? <HeartSolidIcon className="h-6 w-6 text-red-500" />
                : <HeartOutlineIcon className="h-6 w-6" />
              }
            </button>
          </div>

          <AqiGauge aqi={mainResult.predicted_aqi} quality={mainResult.aqi_quality} />

          <div className="mt-4 text-center flex items-center justify-center gap-3 bg-white/50 p-3 rounded-md">
            <span className="text-3xl">{mainResult.advice.icon}</span>
            <p className="font-medium text-base">{mainResult.advice.message}</p>
          </div>

          {mainResult.reason && (mainResult.aqi_quality === 'Poor' || mainResult.aqi_quality === 'Very Poor' || mainResult.aqi_quality === 'Severe') && (
            <p className="text-center text-sm mt-3">
              Main pollutant today appears to be <strong>{mainResult.reason}</strong>.
            </p>
          )}

          <div className="mt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm font-semibold text-blue-600 hover:underline flex items-center"
            >
              {showDetails ? 'Hide' : 'Show'} Pollutant Details
              <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>

            {showDetails && (
<div className="mt-3 grid grid-cols-2 gap-2 text-sm bg-white/50 p-3 rounded animate-fadeIn">
  <p><strong>PM2.5:</strong> {mainResult.live_pollutants.pm2_5} µg/m³</p>
  <p><strong>PM10:</strong> {mainResult.live_pollutants.pm10} µg/m³</p>
  <p><strong>CO:</strong> {mainResult.live_pollutants.co} µg/m³</p>
  <p><strong>O3:</strong> {mainResult.live_pollutants.o3} µg/m³</p>
  <p><strong>NO:</strong> {mainResult.live_pollutants.no} µg/m³</p>
  <p><strong>NO2:</strong> {mainResult.live_pollutants.no2} µg/m³</p>
  <p><strong>SO2:</strong> {mainResult.live_pollutants.so2} µg/m³</p>
  <p><strong>NH3:</strong> {mainResult.live_pollutants.nh3} µg/m³</p>
</div>
            )}
          </div>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-700 mb-3">Favorite Cities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favorites.map(favCity => (
              <FavoriteCityCard
                key={favCity}
                city={favCity}
                onSelect={handleFavoriteClick}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

//vasi//