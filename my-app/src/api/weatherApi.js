// Weather API calls using Open-Meteo

/**
 * Fetch current and hourly weather data for a location
 */
export async function fetchWeatherData(lat, lon) {
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&hourly=cloud_cover,relative_humidity_2m,precipitation,wind_speed_10m` +
    `&daily=sunrise,sunset` +
    `&timezone=auto`;

  const response = await fetch(weatherUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch weather data.");
  }

  return await response.json();
}

/**
 * Fetch 7-day hourly weather forecast for a location
 */
export async function fetchWeeklyWeatherData(lat, lon) {
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}` +
    `&longitude=${lon}` +
    `&hourly=cloud_cover,relative_humidity_2m,precipitation,wind_speed_10m` +
    `&forecast_days=7` +
    `&timezone=auto`;

  const response = await fetch(weatherUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch weather data.");
  }

  return await response.json();
}
