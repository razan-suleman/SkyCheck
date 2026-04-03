// Weather data processing and formatting utilities

import { getMoonPhase, getMoonIllumination } from './astronomy';
import { calculateScore, getSummary } from './scoring';

/**
 * Pick the current or next available hour from hourly weather data
 */
export function pickTonightHour(hourly) {
  const now = new Date();

  // Look for the next hour that is at or after current time
  let index = hourly.time.findIndex((t) => new Date(t) >= now);

  // fallback if not found
  if (index === -1) index = 0;

  return {
    time: hourly.time[index],
    cloud: hourly.cloud_cover[index],
    humidity: hourly.relative_humidity_2m[index],
    precipitation: hourly.precipitation[index],
    wind: hourly.wind_speed_10m[index],
  };
}

/**
 * Extract and format sunset, sunrise, and twilight times from weather data
 */
export function extractSunTimes(data) {
  if (!data.daily || !data.daily.sunrise || !data.daily.sunset) {
    return null;
  }
  
  const sunrise = new Date(data.daily.sunrise[0]);
  const sunset = new Date(data.daily.sunset[0]);
  
  // Calculate twilight times (civil twilight ~30 min, astronomical ~90 min after sunset)
  const civilTwilight = new Date(sunset.getTime() + 30 * 60 * 1000);
  const nauticalTwilight = new Date(sunset.getTime() + 60 * 60 * 1000);
  const astronomicalTwilight = new Date(sunset.getTime() + 90 * 60 * 1000);
  
  // Astronomical twilight before sunrise
  const morningTwilight = new Date(sunrise.getTime() - 90 * 60 * 1000);
  
  return {
    sunrise: sunrise.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    sunset: sunset.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    civilTwilight: civilTwilight.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    nauticalTwilight: nauticalTwilight.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    astronomicalTwilight: astronomicalTwilight.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    morningTwilight: morningTwilight.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    sunsetDate: sunset,
    sunriseDate: sunrise,
    astronomicalTwilightDate: astronomicalTwilight,
    morningTwilightDate: morningTwilight,
  };
}

/**
 * Process hourly weather data for tonight (from now until sunrise)
 */
export function processHourlyTonight(data, sunTimes) {
  if (!sunTimes) return null;
  
  const hourly = [];
  const now = new Date();
  
  // Start from sunset, end at sunrise next day
  for (let i = 0; i < data.hourly.time.length; i++) {
    const hourTime = new Date(data.hourly.time[i]);
    
    // Only include hours from now until next sunrise
    if (hourTime >= now && hourTime >= sunTimes.sunsetDate && hourTime <= sunTimes.sunriseDate) {
      const cloud = data.hourly.cloud_cover[i] || 0;
      const humidity = data.hourly.relative_humidity_2m[i] || 0;
      const precipitation = data.hourly.precipitation[i] || 0;
      const wind = data.hourly.wind_speed_10m[i] || 0;
      
      const moonPhase = getMoonPhase(hourTime);
      const moonIllumination = getMoonIllumination(moonPhase);
      
      const score = calculateScore({ cloud, humidity, precipitation, wind, moonIllumination });
      const summary = getSummary(score);
      
      // Determine if it's dark enough for stargazing
      const isDarkEnough = hourTime >= sunTimes.astronomicalTwilightDate && hourTime <= sunTimes.morningTwilightDate;
      
      hourly.push({
        time: hourTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        hour: hourTime.getHours(),
        score,
        summary,
        cloud,
        humidity,
        precipitation,
        wind,
        moonIllumination,
        isDarkEnough,
      });
    }
  }
  
  return hourly;
}

/**
 * Calculate average stargazing score for a specific day
 */
export function calculateNightScore(hourlyData, dayIndex) {
  // For each day, analyze evening hours (20:00-23:00) to get night conditions
  const hoursPerDay = 24;
  const eveningStartHour = 20; // 8 PM
  const eveningEndHour = 23; // 11 PM
  
  let totalScore = 0;
  let count = 0;

  for (let hour = eveningStartHour; hour <= eveningEndHour; hour++) {
    const index = dayIndex * hoursPerDay + hour;
    if (index < hourlyData.time.length) {
      const cloud = hourlyData.cloud_cover[index] || 0;
      const humidity = hourlyData.relative_humidity_2m[index] || 0;
      const precipitation = hourlyData.precipitation[index] || 0;
      const wind = hourlyData.wind_speed_10m[index] || 0;
      
      // Get moon illumination for that day
      const date = new Date(hourlyData.time[index]);
      const moonPhase = getMoonPhase(date);
      const moonIllumination = getMoonIllumination(moonPhase);
      
      const score = calculateScore({ cloud, humidity, precipitation, wind, moonIllumination });
      totalScore += score;
      count++;
    }
  }

  return count > 0 ? Math.round(totalScore / count) : 0;
}

/**
 * Process weekly weather data into daily forecasts
 */
export function processWeeklyForecast(data) {
  const forecast = [];
  
  for (let day = 0; day < 7; day++) {
    const dayStartIndex = day * 24;
    if (dayStartIndex >= data.hourly.time.length) break;
    
    const date = new Date(data.hourly.time[dayStartIndex]);
    const moonPhase = getMoonPhase(date);
    const moonIllumination = getMoonIllumination(moonPhase);
    
    const avgScore = calculateNightScore(data.hourly, day);
    const summary = getSummary(avgScore);
    
    // Get average conditions for the evening
    let avgCloud = 0, avgHumidity = 0, avgPrecip = 0, avgWind = 0;
    let count = 0;
    
    for (let hour = 20; hour <= 23; hour++) {
      const index = day * 24 + hour;
      if (index < data.hourly.time.length) {
        avgCloud += data.hourly.cloud_cover[index] || 0;
        avgHumidity += data.hourly.relative_humidity_2m[index] || 0;
        avgPrecip += data.hourly.precipitation[index] || 0;
        avgWind += data.hourly.wind_speed_10m[index] || 0;
        count++;
      }
    }
    
    if (count > 0) {
      avgCloud = Math.round(avgCloud / count);
      avgHumidity = Math.round(avgHumidity / count);
      avgPrecip = (avgPrecip / count).toFixed(1);
      avgWind = Math.round(avgWind / count);
    }
    
    // Get moon phase name separately
    const moonPhaseName = getMoonPhase(date);
    const phaseName = moonPhaseName < 0.0625 ? "New Moon" :
                      moonPhaseName < 0.1875 ? "Waxing Crescent" :
                      moonPhaseName < 0.3125 ? "First Quarter" :
                      moonPhaseName < 0.4375 ? "Waxing Gibbous" :
                      moonPhaseName < 0.5625 ? "Full Moon" :
                      moonPhaseName < 0.6875 ? "Waning Gibbous" :
                      moonPhaseName < 0.8125 ? "Last Quarter" :
                      moonPhaseName < 0.9375 ? "Waning Crescent" : "New Moon";
    
    forecast.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      score: avgScore,
      summary,
      moonPhase: phaseName,
      moonPhaseValue: moonPhase,
      moonIllumination,
      cloud: avgCloud,
      humidity: avgHumidity,
      precipitation: avgPrecip,
      wind: avgWind,
    });
  }
  
  return forecast;
}
