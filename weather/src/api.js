export function buildOpenMeteoParams(latitude, longitude, temperatureUnit, windUnit, precipUnit) {
  const tempUnitParam = temperatureUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  const windUnitParam = windUnit === 'mph' ? 'mph' : 'kmh';
  const precipUnitParam = precipUnit === 'inch' ? 'inch' : 'mm';
  const params = new URLSearchParams({
    latitude,
    longitude,
    timezone: 'auto',
    forecast_days: '7',
    temperature_unit: tempUnitParam,
    windspeed_unit: windUnitParam,
    precipitation_unit: precipUnitParam,
    current_weather: 'true', // Use ONLY this for "current_weather"
    hourly: 'temperature_2m,weather_code,precipitation,wind_speed_10m,relative_humidity_2m,apparent_temperature',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}
