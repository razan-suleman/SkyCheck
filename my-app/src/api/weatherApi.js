// Open-Meteo weather API

export async function fetchWeatherData(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloud_cover,relative_humidity_2m,precipitation,wind_speed_10m&daily=sunrise,sunset&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather data.");
  return res.json();
}

export async function fetchWeeklyWeatherData(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloud_cover,relative_humidity_2m,precipitation,wind_speed_10m&forecast_days=7&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch weather data.");
  return res.json();
}
