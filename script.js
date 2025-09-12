// Example JS: For demo, uses placeholder data. Replace with API requests for full functionality.

const dailyData = [
  { day: 'Tue', icon: '🌧️', max: 20, min: 14 },
  { day: 'Wed', icon: '🌦️', max: 21, min: 15 },
  { day: 'Thu', icon: '☀️', max: 24, min: 17 },
  { day: 'Fri', icon: '⛅', max: 25, min: 18 },
  { day: 'Sat', icon: '🌤️', max: 21, min: 15 },
  { day: 'Sun', icon: '🌧️', max: 21, min: 16 },
  { day: 'Mon', icon: '🌫️', max: 24, min: 15 },
];

const hourlyData = [
  { time: '3 PM', icon: '☀️', temp: 20 },
  { time: '4 PM', icon: '🌤️', temp: 20 },
  { time: '5 PM', icon: '☀️', temp: 20 },
  { time: '6 PM', icon: '🌤️', temp: 19 },
  { time: '7 PM', icon: '⛅', temp: 18 },
  { time: '8 PM', icon: '🌫️', temp: 17 },
  { time: '9 PM', icon: '🌧️', temp: 17 },
  { time: '10 PM', icon: '🌧️', temp: 17 }
];

const dailyForecastElem = document.getElementById('daily-forecast');
const daySelector = document.getElementById('day-selector');
const hourlyForecastElem = document.getElementById('hourly-forecast');

// Render daily forecast
dailyData.forEach((d, idx) => {
  const dayDiv = document.createElement('div');
  dayDiv.className = 'forecast-day';
  dayDiv.innerHTML = `<span class="label">${d.day}</span>
    <span class="icon">${d.icon}</span>
    <div class="minmax">${d.max}° / ${d.min}°</div>`;
  dailyForecastElem.appendChild(dayDiv);

  const selectorOpt = document.createElement('option');
  selectorOpt.value = idx;
  selectorOpt.textContent = d.day;
  daySelector.appendChild(selectorOpt);
});

// Render hourly forecast
function renderHourly(idx = 0) {
  hourlyForecastElem.innerHTML = '';
  hourlyData.forEach(h => {
    const block = document.createElement('div');
    block.className = 'hour-block';
    block.innerHTML = `<span>${h.time}</span>
      <span class="hour-icon">${h.icon}</span>
      <span class="hour-temp">${h.temp}°</span>`;
    hourlyForecastElem.appendChild(block);
  });
}
renderHourly();

// Listen for selector changes
daySelector.addEventListener('change', (e) => {
  renderHourly(parseInt(e.target.value));
});

// Search interaction
document.getElementById('search-btn').addEventListener('click', () => {
  // For demo, just prompt search!
  alert('Search feature not implemented. Hook this to your API logic!');
});


async function getLatLon(place) {
  // Example Nominatim query for "Berlin, Germany"
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`);
  const data = await response.json();
  if (data && data.length) {
    return { lat: data[0].lat, lon: data[0].lon };
  } else {
    alert("Place not found");
    return null;
  }
}

async function fetchWeather(lat, lon, units="metric") {
  // Units mapping
  const unitParams = units === "imperial" ?
    "temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch" :
    "temperature_unit=celsius&windspeed_unit=kmh&precipitation_unit=mm";

  // Compose Open-Meteo query string
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation&hourly=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&${unitParams}&forecast_days=7&timezone=auto`;

  const response = await fetch(url);
  const weatherData = await response.json();
  return weatherData;
}

// Usage in search handler
document.getElementById('search-btn').addEventListener('click', async () => {
  const place = document.getElementById('search-box').value;
  const units = document.getElementById('units-toggle').value;
  const location = await getLatLon(place);
  if (!location) return;

  const weather = await fetchWeather(location.lat, location.lon, units);
  // TODO: Parse `weather` and update DOM, e.g. update temperature, daily, and hourly forecast
});

const unitsToggle = document.querySelector('.units-toggle');
const unitsBtn = document.querySelector('.units-btn');
const unitsDropdown = document.querySelector('.units-dropdown');
const unitItems = document.querySelectorAll('.unit-item');

unitsBtn.onclick = () => {
  unitsToggle.classList.toggle('open');
};

unitItems.forEach(btn => {
  btn.onclick = () => {
    // Handle unit selection with btn.dataset.value;
    unitsToggle.classList.remove('open');
    // Your API logic goes here…
  };
});

document.addEventListener('click', e => {
  if (!unitsToggle.contains(e.target)) {
    unitsToggle.classList.remove('open');
  }
});
