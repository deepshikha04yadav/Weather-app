import { useState, useEffect } from 'react';
import logo from '../assets/images/logo.svg';
import unitsIcon from '../assets/images/icon-units.svg';
import arrow from '../assets/images/icon-dropdown.svg';
import searchIcon from '../assets/images/icon-search.svg';
import drizzle from '../assets/images/icon-drizzle.webp';
import rain from '../assets/images/icon-rain.webp';
import sunny from '../assets/images/icon-sunny.webp';
import fog from '../assets/images/icon-fog.webp';
import overcast from '../assets/images/icon-overcast.webp';
import storm from '../assets/images/icon-storm.webp';
import partly_cloudy from '../assets/images/icon-partly-cloudy.webp';
import snow from '../assets/images/icon-snow.webp';
import loader from '../assets/images/icon-loading.svg';
import error from '../assets/images/icon-error.svg';
import retry from '../assets/images/icon-retry.svg';

import { buildOpenMeteoParams } from '../api';
import './styles.css';


async function geocodePlace(place) {
  const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
  const data = await resp.json();
  if (data && data.length) {
    return { lat: data[0].lat, lon: data[0].lon, display_name: data[0].display_name };
  }
  return null;
}

export default function WeatherApp() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState({ lat: 52.52, lon: 13.405, display_name: 'Berlin, Germany' });
  const [weather, setWeather] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);

  const [temperatureUnit, setTemperatureUnit] = useState('celsius');
  const [windUnit, setWindUnit] = useState('kmh');
  const [precipUnit, setPrecipUnit] = useState('mm');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isImperial = temperatureUnit === 'fahrenheit' && windUnit === 'mph' && precipUnit === 'inch';
  const [apiError, setApiError] = useState(false);
  const [recent, setRecent] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [debouncedQ, setDebouncedQ] = useState('');

// load 3 recent on mount
useEffect(() => {
  const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  setRecent(saved.slice(0, 3));
}, []);


useEffect(() => {
  const t = setTimeout(() => setDebouncedQ(search.trim()), 300);
  return () => clearTimeout(t);
}, [search]);
useEffect(() => {
  async function fetchSuggestions(q) {
    if (!q) { setSuggestions([]); return; }
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`;
    const resp = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await resp.json();
    setSuggestions(data.map(d => ({
      name: d.display_name,
      lat: d.lat,
      lon: d.lon
    })));
  }
  fetchSuggestions(debouncedQ);
}, [debouncedQ]);
function rememberSearch(name) {
  const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  const next = [name, ...saved.filter(x => x !== name)].slice(0, 3);
  localStorage.setItem('recentSearches', JSON.stringify(next));
  setRecent(next);
}



async function fetchWeather() {
  setLoading(true);
  setApiError(false);
  try {
    const url = buildOpenMeteoParams(location.lat, location.lon, temperatureUnit, windUnit, precipUnit);
    const response = await fetch(url);
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    setWeather(data);
  } catch (error) {
    setApiError(true);
    setWeather(null);
  }
  setLoading(false);
}

// Retry handler 
function onRetry() {
  setApiError(false);
  fetchWeather();
}


  // Fetch weather whenever location/units change
  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      const url = buildOpenMeteoParams(location.lat, location.lon, temperatureUnit, windUnit, precipUnit);
      try {
        const response = await fetch(url);
        const data = await response.json();
        setWeather(data);
        setLoading(false);
      } catch (err) {
        setWeather(null);
        setLoading(false);
      }
    }
    fetchWeather();
  }, [location, temperatureUnit, windUnit, precipUnit]);

  // Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNoResult(false);
    const geo = await geocodePlace(search);
    setLoading(false);
    if (geo) {
      setLocation(geo);
      setNoResult(false);
    } else {
      setNoResult(true);
      setWeather(null);
    }
    rememberSearch(geo.display_name);
  };

  function formatDate(dateStr, opts) {
    return new Date(dateStr).toLocaleDateString('en-US', opts);
  }
  function getDayLabel(dateStr) {
    return formatDate(dateStr, { weekday: 'long' });
  }

  function getWeatherIcon(code) {
    if ([0].includes(code)) return <img src={sunny} alt="Sunny" className="sunny-image" />;
    if ([1, 2, 3].includes(code)) return <img src={partly_cloudy} alt="Partly cloudy" className="partly-cloudy-image" />;
    if ([45].includes(code)) return <img src={fog} alt="Fog" className="fog-image" />;
    if ([48].includes(code)) return <img src={overcast} alt="Cloudy" className="cloudy-image" />;
    if ([51, 53, 55, 56, 57].includes(code)) return <img src={drizzle} alt="Drizzle" className="drizzle-icon" />;
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <img src={rain} alt="Rain" className="rain-icon" />;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return <img src={snow} alt="Snow" className="snow-image" />;
    if ([95, 96, 99].includes(code)) return <img src={storm} alt="Storm" className="storm-image" />;
    return "🌡️";
  }

  // Get hourly forecast data for a selected day
  function getHourlyForDay(hourly, selectedDay) {
    if (!hourly || !hourly.time) return [];
    const day = new Date(selectedDay);
    return hourly.time
      .map((t, idx) => {
        const dt = new Date(t);
        if (dt.getUTCDate() === day.getUTCDate()) {
          return {
            time: t,
            temperature_2m: hourly.temperature_2m[idx],
            weather_code: hourly.weather_code[idx],
          };
        }
        return null;
      })
      .filter(Boolean)
      .slice(0, 24);
  }

  function formatHour(t) {
    const h = new Date(t).getHours();
    return `${h % 12 || 12} ${h < 12 ? 'AM' : 'PM'}`;
  }

  return (
    <div className="app-container">
      <header className="header">
        <img src={logo} alt="Weather Now Logo" className="logo-img" width="170px" />
        <div
          className="units-toggle"
          tabIndex="0"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setDropdownOpen(false);
            }
          }}
        >
          <button className="units-btn" onClick={() => setDropdownOpen((open) => !open)}>
            <span className="units-icon">
              <img src={unitsIcon} alt="Units" className="units-icon-img" />
            </span>
            <span className="units-label">Units</span>
            <span className="units-arrow">
              <img src={arrow} alt="Arrow" className="arrow-image" />
            </span>
          </button>
          {dropdownOpen && (
            <div className="units-dropdown-menu">
              <button
                type="button"
                className="dropdown-item switch-imperial"
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (isImperial) {
                    // Switch to Metric units
                    setTemperatureUnit('celsius');
                    setWindUnit('kmh');
                    setPrecipUnit('mm');
                  } else {
                    // Switch to Imperial units
                    setTemperatureUnit('fahrenheit');
                    setWindUnit('mph');
                    setPrecipUnit('inch');
                  }
                }}
              >
                {isImperial ? 'Switch to Metrics' : 'Switch to Imperial'}
              </button>

              <div className="dropdown-section">
                <div className="dropdown-title">Temperature</div>
                <button
                  className={temperatureUnit === 'celsius' ? 'dropdown-item selected' : 'dropdown-item'}
                  onClick={() => setTemperatureUnit('celsius')}
                >
                  Celsius (°C)
                </button>
                <button
                  className={temperatureUnit === 'fahrenheit' ? 'dropdown-item selected' : 'dropdown-item'}
                  onClick={() => setTemperatureUnit('fahrenheit')}
                >
                  Fahrenheit (°F)
                </button>
              </div>
              <div className="dropdown-section">
                <div className="dropdown-title">Wind Speed</div>
                <button
                  className={windUnit === 'kmh' ? 'dropdown-item selected' : 'dropdown-item'}
                  onClick={() => setWindUnit('kmh')}
                >
                  km/h
                </button>
                <button
                  className={windUnit === 'mph' ? 'dropdown-item selected' : 'dropdown-item'}
                  onClick={() => setWindUnit('mph')}
                >
                  mph
                </button>
              </div>
              <div className="dropdown-section">
                <div className="dropdown-title">Precipitation</div>
                <button
                  className={precipUnit === 'mm' ? 'dropdown-item selected' : 'dropdown-item'}
                  onClick={() => setPrecipUnit('mm')}
                >
                  Millimeters (mm)
                </button>
                <button
                  className={precipUnit === 'inch' ? 'dropdown-item selected' : 'dropdown-item'}
                  onClick={() => setPrecipUnit('inch')}
                >
                  Inches (in)
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
      {apiError ? (
        <div className="error-card">
          <div className="error-icon">
            <img src={error} alt="Error" className="error-icon" />
          </div>
          <div className="error-title">Something went wrong</div>
          <div className="error-desc">
            We couldn't connect to the server (API error). Please try again in a few moments.
          </div>
          <button className="retry-btn" type="button" onClick={onRetry}>
            <img src={retry} alt="Retry" className="retry-icon" />
            Retry
          </button>
        </div>
      ) : (
        <>
        {/* Headline & search */}
        <h1 className="headline"><b>How's the sky looking today?</b></h1>
        <form className="search-section" onSubmit={handleSearch}>
          <div className="search-img">
            <img src={searchIcon} alt="Search" className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setShowDrop(true)}
              onBlur={() => setTimeout(() => setShowDrop(false), 120)}
              placeholder="Search for a place..."
              className="search-box"
            />
              {showDrop && (
                <div className="recent-dropdown">
                  {(!debouncedQ && recent.length > 0) ? (
                    recent.map((name, i) => (
                      <button
                        key={`r-${i}`}
                        type="button"
                        className="recent-item"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          setSearch(name);
                          setShowDrop(false);
                        }}
                      >
                        {name}
                      </button>
                    ))
                  ) : (
                    suggestions.slice(0,5).map((s, i) => (
                      <button
                        key={`s-${i}`}
                        type="button"
                        className="recent-item"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          setSearch(s.name);
                          setShowDrop(false);
                          setLocation({ lat: s.lat, lon: s.lon, display_name: s.name });
                          rememberSearch(s.name);
                        }}
                      >
                        {s.name}
                      </button>
                    ))
                  )}
                </div>
              )}

          </div>
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>

        {/* Results or loading */}
        {noResult ? (
          <div className="no-result">No search result found!</div>
        ) : (
          <>
            {loading && (
              <div className="loading-card">
                <img src={loader} alt="Loading..." className="loading-spinner" />
                <div className="loading-text">Loading...</div>
              </div>
            )}

            {weather && (
              <section className="weather-main">
                <div>
                  {/* Current Weather */}
                  <div className="current-weather">
                    <div className="weather-loc">
                      <div className="location">{location.display_name}</div>
                      <div className="weather-date">
                        {formatDate(
                          (weather.current && weather.current.time) || new Date(),
                          { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </div>
                    </div>
                    <div className="temp-icon">
                      <span className="weather-main-icon">
                        {getWeatherIcon(weather.current_weather?.weathercode)}
                      </span>
                      <span className="highlight-temp">
                        {weather.current_weather?.temperature}°
                      </span>
                    </div>
                  </div>
                  {/* Metrics */}
                  <div className="metrics">
                    <div className="feels-like">
                      Feels Like<br /><br />
                      <span className="curr-temp">{weather.hourly?.apparent_temperature?.[0]}°</span>
                    </div>
                    <div className="humidity">
                      Humidity<br /><br />
                      <span className="curr-humidity">{weather.hourly?.relative_humidity_2m?.[0]}%</span>
                    </div>
                    <div className="wind">
                      Wind<br /><br />
                      <span className="curr-wind">
                        {weather.current_weather?.windspeed}
                        {windUnit === 'mph' ? ' mph' : ' km/h'}
                      </span>
                    </div>
                    <div className="precipitation">
                      Precipitation<br /><br />
                      <span className="curr-preci">
                        {weather.hourly?.precipitation?.[0]}
                        {precipUnit === 'inch' ? ' in' : ' mm'}
                      </span>
                    </div>
                  </div>
                  {/* Daily Forecast */}
                  <div className="daily-forecast-heading">
                    <h3>Daily Forecast</h3>
                  </div>
                  <div className="daily-forecast">
                    {weather.daily?.time && weather.daily.time.map((d, idx) => (
                      <div key={d} className="forecast-day">
                        <span className="label">{getDayLabel(d)}</span>
                        <br /><br />
                        <span className="icon">{getWeatherIcon(weather.daily.weather_code[idx])}</span>
                        <br />
                        <div className="minmax">
                          <div className="max">{weather.daily.temperature_2m_max[idx]}°</div>
                          <div className="min">{weather.daily.temperature_2m_min[idx]}°</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Hourly Forecast */}
                <div>
                  <div className="hourly-forecast">
                    <div className="top">
                      <h3>Hourly forecast</h3>
                      <div className="hourly-selector">
                        <select
                          value={selectedDay}
                          onChange={(e) => setSelectedDay(Number(e.target.value))}
                          className="day-selector"
                        >
                          {weather.daily?.time && weather.daily.time.map((d, idx) => (
                            <option key={d} value={idx}>
                              {getDayLabel(d)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="hour-scroll">
                      {getHourlyForDay(weather.hourly, weather.daily?.time?.[selectedDay]).map((h, idx) => (
                        <div key={idx} className="hour-block">
                          <span className="hour-icon">{getWeatherIcon(h.weather_code)}</span>
                          <span className="hour-label">{formatHour(h.time)}</span>
                          <span className="hour-temp">{h.temperature_2m}°</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
        </>
      )}
    </div>
  );
}
