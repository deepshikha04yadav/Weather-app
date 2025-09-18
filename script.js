// Example JS: For demo, uses placeholder data. Replace with API requests for full functionality.

const dailyData = [
  { icon: '🌧️', day: 'Tue', max: 20, min: 14 },
  { icon: '🌦️', day: 'Wed',  max: 21, min: 15 },
  { icon: '☀️', day: 'Thu', max: 24, min: 17 },
  { icon: '⛅', day: 'Fri', max: 25, min: 18 },
  { icon: '🌤️', day: 'Sat', max: 21, min: 15 },
  { icon: '🌧️', day: 'Sun', max: 21, min: 16 },
  { icon: '🌫️', day: 'Mon', max: 24, min: 15 },
];

const hourlyData = [
  { icon: '☀️', time: '3 PM', temp: 20 },
  { icon: '🌤️', time: '4 PM', temp: 20 },
  { icon: '☀️', time: '5 PM', temp: 20 },
  { icon: '🌤️', time: '6 PM', temp: 19 },
  { icon: '⛅', time: '7 PM', temp: 18 },
  { icon: '🌫️', time: '8 PM', temp: 17 },
  { icon: '🌧️', time: '9 PM', temp: 17 },
  { icon: '🌧️', time: '10 PM', temp: 17 }
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
    block.innerHTML = `<span class="hour-icon">${h.icon}</span>
      <span>${h.time}</span>
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

// const searchBox = document.getElementById("search-box");
// const weatherDetailsElem = document.getElementById("weather-details");
// const locationTxt = document.getElementById("location");
// const weatherCondIcon = document.getElementById("weather-condition-icon");
// const weatherCondName = document.getElementById("weather-condition-name");
// const temperatureTxt = document.getElementById("temperature");
// const humidityTxt = document.getElementById("humidity");
// const windSpeedTxt = document.getElementById("wind-speed");
// const locationInput = document.getElementById("location-input");
// const dailyForecastElems = document.getElementById("daily-forecast")
// const errTxt = document.getElementById("errTxt")
// async function getLocation(location){
//      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1&language=en&format=json`);
//      const data = await res.json();
//      const result = data.results[0];
//      return {
//           name: result.name || "",
//           lat: result.latitude,
//           lon: result.longitude
//      }
// }

// async function getWeather(location){
//      const {lat,lon,name} = await getLocation(location);
//      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min`);
//      const data = await res.json();
//      return {
//           name,
//           current: data.current,
//           daily: data.daily
//      }
// }
// searchBox.addEventListener("submit",async e=>{
//      e.preventDefault()
//      weatherDetailsElem.classList.remove("active")
//      dailyForecastElems.innerHTML = ""
//      if(locationInput.value.trim()===""){
//           errTxt.textContent = "Please Enter a Location To Get Weather Details"
//      } else {
//           errTxt.textContent = ""
//           try{
//                const weather = await getWeather(locationInput.value)
//                const {temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m} = weather.current
//                const {weather_code: daily_weather_code,temperature_2m_max,temperature_2m_min,time} = weather.daily
//                const weatherCondition = weather_codes[weather_code]
//                const imgSrc = `assets/${is_day ? weatherCondition.icons.day : weatherCondition.icons.night}`
//                locationTxt.textContent = weather.name
//                temperatureTxt.textContent = temperature_2m
//                humidityTxt.textContent = relative_humidity_2m
//                windSpeedTxt.textContent = wind_speed_10m
//                weatherCondName.textContent = weatherCondition.name
//                weatherCondIcon.src = imgSrc
//                for(let i=0;i<7;i++){
//                     const weatherCond = weather_codes[daily_weather_code[i]]
//                     const temperatureMax = temperature_2m_max[i]
//                     const temperatureMin = temperature_2m_min[i]
//                     const timestamp = time[i] 
//                     const elem = document.createElement("div")
//                     elem.className = "card"
//                     elem.innerHTML = `<img src="assets/${weatherCond.icons.day}" alt="weather-icon" width="100" height="100"/>
//                     <div class="temps">
//                          <p class="temp" title="Maximum Temperature">${temperatureMax}<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 5c1.55 0 3 .47 4.19 1.28l-1.16 2.89A4.47 4.47 0 0 0 16.5 8C14 8 12 10 12 12.5s2 4.5 4.5 4.5c1.03 0 1.97-.34 2.73-.92l1.14 2.85A7.47 7.47 0 0 1 16.5 20A7.5 7.5 0 0 1 9 12.5A7.5 7.5 0 0 1 16.5 5M6 3a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0 2a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1"/></svg></p>
//                          <p class="temp" title="Minimum Temperature">${temperatureMin}<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16.5 5c1.55 0 3 .47 4.19 1.28l-1.16 2.89A4.47 4.47 0 0 0 16.5 8C14 8 12 10 12 12.5s2 4.5 4.5 4.5c1.03 0 1.97-.34 2.73-.92l1.14 2.85A7.47 7.47 0 0 1 16.5 20A7.5 7.5 0 0 1 9 12.5A7.5 7.5 0 0 1 16.5 5M6 3a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0 2a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1"/></svg></p>
//                     </div>
//                     <p class="date">${timestamp}</p>`
//                     dailyForecastElems.appendChild(elem)
//                }
//                weatherDetailsElem.classList.add("active")
//           } catch {
//                errTxt.textContent = "Location Not Found"
//           }
//      }
// })