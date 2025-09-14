import React, { useState, useEffect } from 'react';

import logo from '../assets/images/logo.svg';
import unitsIcon from '../assets/images/icon-units.svg';
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
  { value: "metric", label: "Celsius", params: "temperature_unit=celsius&windspeed_unit=kmh&precipitation_unit=mm" },
  { value: "imperial", label: "Fahrenheit", params: "temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch" },
];

export default function WeatherApp() {
  const [search, setSearch] = useState("Berlin, Germany");
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
    return formatDate(dateStr, { weekday: "short" });
  }

  return (
    <div className="app-container">
      <header className="header">
        <img src={logo} alt="Weather Now Logo" className="logo-img" />
        <div className="units-toggle">
          <button className="units-btn">
            <span className="units-icon">
              <img src={unitsIcon} alt="Units" className="units-icon-img" />
            </span>

            <span className="units-label">Units</span>
            <span className="units-arrow">&#9662;</span>
            <select
              className="units-dropdown"
              value={units}
              onChange={e => setUnits(e.target.value)}
            >
              {unitOptions.map(u => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </button>
        </div>
      </header>
      <h1 className="headline">How's the sky looking today?</h1>
      <form className="search-section" onSubmit={handleSearch}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for a place..."
          className="search-box"
        />
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>
      {loading && <div className="loading">Loading...</div>}
      {weather ? (
        <section className="weather-main">
          <div>
            <div className="current-weather">
              <div className="location-date">{location.display_name}</div>
              <div className="weather-date">
                {formatDate((weather.current && weather.current.time) || new Date(), { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
              </div>
              <div className="temp-icon">
                <span className="weather-main-icon">
                  {weather.current ? getWeatherIcon(weather.current.weather_code) : "☀️"}
                </span>
                <span className="highlight-temp">{weather.current?.temperature_2m}°</span>
              </div>
            </div>
            <div className="metrics">
              <div>Feels Like<br /><span>{weather.current?.apparent_temperature}°</span></div>
              <div>Humidity<br /><span>{weather.current?.relative_humidity_2m}%</span></div>
              <div>Wind<br /><span>{weather.current?.wind_speed_10m}{units === "imperial" ? " mph" : " km/h"}</span></div>
              <div>Precipitation<br /><span>{weather.current?.precipitation}{units === "imperial" ? " in" : " mm"}</span></div>
            </div>
            <div className="daily-forecast">
              {weather.daily.time.map((d, idx) => (
                <div key={d} className="forecast-day">
                  <span className="label">{getDayLabel(d)}</span>
                  <span className="icon">{getWeatherIcon(weather.daily.weather_code[idx])}</span>
                  <div className="minmax">{weather.daily.temperature_2m_max[idx]}° / {weather.daily.temperature_2m_min[idx]}°</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="hourly-selector">
              <select value={selectedDay} onChange={e => setSelectedDay(Number(e.target.value))} className="day-selector">
                {weather.daily.time.map((d, idx) => (
                  <option key={d} value={idx}>{getDayLabel(d)}</option>
                ))}
              </select>
            </div>
            <div className="hourly-forecast">
              {getHourlyForDay(weather.hourly, weather.daily.time[selectedDay]).map((h, idx) => (
                <div key={idx} className="hour-block">
                  <span className="hour-label">{formatHour(h.time)}</span>
                  <span className="hour-icon">{getWeatherIcon(h.weather_code)}</span>
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
  if ([].includes(code)) return "☀️";
  if ([1,2,3].includes(code)) return "🌤️";
  if ([45,48].includes(code)) return "🌫️";
  if ([51,53,55,56,57].includes(code)) return "🌦️";
  if ([61,63,65,66,67,80,81,82].includes(code)) return "🌧️";
  if ([71,73,75,77,85,86].includes(code)) return "❄️";
  if ([95,96,99].includes(code)) return "⛈️";
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
