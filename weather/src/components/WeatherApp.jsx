import React, { useState, useEffect } from 'react';

import logo from '../assets/images/logo.svg';
import unitsIcon from '../assets/images/icon-units.svg';
import arrow from '../assets/images/icon-dropdown.svg';
import searchIcon from '../assets/images/icon-search.svg'
import drizzle from '../assets/images/icon-drizzle.webp';
import rain from '../assets/images/icon-rain.webp' 
import sunny from '../assets/images/icon-sunny.webp';
import fog from '../assets/images/icon-fog.webp';
import overcast from '../assets/images/icon-overcast.webp';
import storm from '../assets/images/icon-storm.webp';
import partly_cloudy from '../assets/images/icon-partly-cloudy.webp';
import snow from '../assets/images/icon-snow.webp';



import './styles.css';

// Helper to geocode user input (Nominatim API, free)
async function geocodePlace(place) {
  const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
  const data = await r.json();
  if (data && data.length) {
    return { lat: data.lat, lon: data.lon, display_name: data.display_name };
  }
  return null;
}

const unitOptions = [
  { value: "metric", label: "Metrics", params: "temperature_unit=celsius&windspeed_unit=kmh&precipitation_unit=mm" },
  { value: "imperial", label: "Imperial", params: "temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch" },
];

export default function WeatherApp() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState({ lat: 52.52, lon: 13.405, display_name: "Berlin, Germany" });
  const [weather, setWeather] = useState(null);
  const [units, setUnits] = useState("metric");
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      if (!location) return;
      setLoading(true);
      const unitParam = unitOptions.find(u => u.value === units)?.params;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,relative_humidity_2m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7&${unitParam}`;
      const r = await fetch(url);
      const data = await r.json();
      setWeather(data);
      setLoading(false);
    }
    fetchWeather();
  }, [location, units]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    const geo = await geocodePlace(search);
    setLoading(false);
    if (geo) {
      setLocation(geo);
    } else {
      alert("Location not found");
    }
  };

  function formatDate(dateStr, opts) {
    return new Date(dateStr).toLocaleDateString("en-US", opts);
  }
  function getDayLabel(dateStr) {
    return formatDate(dateStr, { weekday: "long" });
  }

  return (
    <div className="app-container">
      <header className="header">
        <img src={logo} alt="Weather Now Logo" className="logo-img" width="170px" />
        <div className="units-toggle">
          <span className="units-icon">
            <img src={unitsIcon} alt="Units" className="units-icon-img" />
          </span>
          <span className="units-label">Units</span>
          <span className="units-arrow">
            <img src={arrow} alt="Arrow" className="arrow-image" />
          </span>
          <select
            className="units-dropdown"
            value={units}
            onChange={e => setUnits(e.target.value)}
          >
            {unitOptions.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>

      </header>
      <h1 className="headline"><b>How's the sky looking today?</b></h1>
      <form className="search-section" onSubmit={handleSearch}>
        <div className="search-img">
          <img src={searchIcon} alt="Search" className='search-icon' />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for a place..."
            className="search-box"
          /> 
        </div>
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>
      {loading && <div className="loading">Loading...</div>}
      {weather ? (
        <section className="weather-main">
          <div>
            <div className="current-weather">
              <div className="weather-loc">
                <div className="location">{location.display_name}</div>
                <div className="weather-date">
                  {formatDate((weather.current && weather.current.time) || new Date(), { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
                </div>
              </div>
              <div className="temp-icon">
                <span className="weather-main-icon">
                  {weather.current ? getWeatherIcon(weather.current.weather_code) : "☀️"}
                </span>
                <span className="highlight-temp">{weather.current?.temperature_2m}°</span>
              </div>
            </div>
            <div className="metrics">
              <div className='feels-like'>Feels Like<br /> <br />
                <span className='curr-temp'>{weather.current?.apparent_temperature}°</span>
              </div>
              <div className='humidity'>Humidity<br /> <br />
                <span className='curr-humidity'>{weather.current?.relative_humidity_2m}%</span>
              </div>
              <div className='wind'>Wind<br /> <br />
                <span className='curr-wind'>{weather.current?.wind_speed_10m}{units === "imperial" ? " mph" : " km/h"}</span>
              </div>
              <div className='precipitation'>Precipitation<br /> <br />
                <span className='curr-preci'>{weather.current?.precipitation}{units === "imperial" ? " in" : " mm"}</span>
              </div>
            </div>
            <div className="daily-forecast-heading">
              <h3>Daily Forecast</h3>
            </div>
            <div className="daily-forecast">
              {weather.daily.time.map((d, idx) => (
                <div key={d} className="forecast-day">
                  <span className="label">{getDayLabel(d)}</span> <br /> <br />
                  <span className="icon">{getWeatherIcon(weather.daily.weather_code[idx])}</span> <br />
                  <div className="minmax">
                    <div className="max">
                      {weather.daily.temperature_2m_max[idx]}°
                    </div>
                    <div className="min">
                    {weather.daily.temperature_2m_min[idx]}°
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="hourly-forecast">
              <div className="top">
                <h3>Hourly forecast</h3>
                <div className="hourly-selector">
                  <select value={selectedDay} onChange={e => setSelectedDay(Number(e.target.value))} className="day-selector">
                    {weather.daily.time.map((d, idx) => (
                      <option key={d} value={idx}>{getDayLabel(d)}</option>
                    ))}
                  </select>
                </div>
              </div>
              {getHourlyForDay(weather.hourly, weather.daily.time[selectedDay]).map((h, idx) => (
                <div key={idx} className="hour-block">
                  <span className="hour-icon">{getWeatherIcon(h.weather_code)}</span>
                  <span className="hour-label">{formatHour(h.time)}</span>
                  <span className="hour-temp">{h.temperature_2m}°</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function getWeatherIcon(code) {
  if ([0].includes(code)) return <img src={sunny} alt="Sunny" className="sunny-image" />;
  if ([1,2,3].includes(code)) return <img src={partly_cloudy} alt="Partly-cloudy" className="partly-cloudy-image" />;
  if ([45].includes(code)) return <img src={fog} alt="Fog" className="fog-image" />;
  if ([48].includes(code)) return <img src={overcast} alt="Cloudy" className="cloudy-image" />;
  // 45, 48 fog
  if ([51,53,55,56,57].includes(code)) return <img src={drizzle} alt="Drizzle" className="cloud-with-rain-img" />;
  if ([61,63,65,66,67,80,81,82].includes(code)) return <img src={rain} alt="Rain" className='rain-icon' />;
  if ([71,73,75,77,85,86].includes(code)) return <img src={snow} alt="Snow" className="snow-image" />;
  if ([95,96,99].includes(code)) return <img src={storm} alt="Storm" className="storm-image" />;
  return "🌡️";
}

function getHourlyForDay(hourly, selectedDay) {
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
    .slice(0, 8);
}

function formatHour(t) {
  const h = new Date(t).getHours();
  return `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`;
}
