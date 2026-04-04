import { getMoonPhase, getMoonIllumination } from './astronomy';
import { calculateScore, getSummary } from './scoring';

// grab the current hour (or next one) from the weather data
export function pickTonightHour(hourly) {
  const now = new Date();
  let idx = hourly.time.findIndex((t) => new Date(t) >= now);
  if (idx === -1) idx = 0;
  
  return {
    time: hourly.time[idx],
    cloud: hourly.cloud_cover[idx],
    humidity: hourly.relative_humidity_2m[idx],
    precipitation: hourly.precipitation[idx],
    wind: hourly.wind_speed_10m[idx],
  };
}

// Get sunset/sunrise and calculate twilight times
export function extractSunTimes(data) {
  if (!data.daily || !data.daily.sunrise || !data.daily.sunset) return null;
  
  const sunrise = new Date(data.daily.sunrise[0]);
  const sunset = new Date(data.daily.sunset[0]);
  
  // twilight times (civil ~30min, astronomical ~90min after sunset)
  const civilTwilight = new Date(sunset.getTime() + 30 * 60 * 1000);
  const nauticalTwilight = new Date(sunset.getTime() + 60 * 60 * 1000);
  const astroTwilight = new Date(sunset.getTime() + 90 * 60 * 1000);
  const morningTwilight = new Date(sunrise.getTime() - 90 * 60 * 1000);
  
  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  return {
    sunrise: formatTime(sunrise),
    sunset: formatTime(sunset),
    civilTwilight: formatTime(civilTwilight),
    nauticalTwilight: formatTime(nauticalTwilight),
    astronomicalTwilight: formatTime(astroTwilight),
    morningTwilight: formatTime(morningTwilight),
    sunsetDate: sunset,
    sunriseDate: sunrise,
    astronomicalTwilightDate: astroTwilight,
    morningTwilightDate: morningTwilight,
  };
}

// Build hour-by-hour breakdown for tonight
export function processHourlyTonight(data, sunTimes) {
  if (!sunTimes) return null;
  
  const hours = [];
  const now = new Date();
  
  for (let i = 0; i < data.hourly.time.length; i++) {
    const t = new Date(data.hourly.time[i]);
    
    // only include hours from now until sunrise
    if (t >= now && t >= sunTimes.sunsetDate && t <= sunTimes.sunriseDate) {
      const cloud = data.hourly.cloud_cover[i] || 0;
      const humidity = data.hourly.relative_humidity_2m[i] || 0;
      const precip = data.hourly.precipitation[i] || 0;
      const wind = data.hourly.wind_speed_10m[i] || 0;
      
      const moonPhase = getMoonPhase(t);
      const moonIllum = getMoonIllumination(moonPhase);
      
      const score = calculateScore({ cloud, humidity, precipitation: precip, wind, moonIllumination: moonIllum });
      const summary = getSummary(score);
      
      // check if it's actually dark (past astronomical twilight)
      const dark = t >= sunTimes.astronomicalTwilightDate && t <= sunTimes.morningTwilightDate;
      
      hours.push({
        time: t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        hour: t.getHours(),
        score,
        summary,
        cloud,
        humidity,
        precipitation: precip,
        wind,
        moonIllumination: moonIllum,
        isDarkEnough: dark,
      });
    }
  }
  
  return hours;
}

// Calculate score for one night (average of evening hours 8-11pm)
export function calculateNightScore(hourlyData, dayIdx) {
  let total = 0;
  let count = 0;
  
  // check evening hours 20-23 (8pm-11pm)
  for (let hr = 20; hr <= 23; hr++) {
    const idx = dayIdx * 24 + hr;
    if (idx < hourlyData.time.length) {
      const cloud = hourlyData.cloud_cover[idx] || 0;
      const humidity = hourlyData.relative_humidity_2m[idx] || 0;
      const precip = hourlyData.precipitation[idx] || 0;
      const wind = hourlyData.wind_speed_10m[idx] || 0;
      
      const date = new Date(hourlyData.time[idx]);
      const moonPhase = getMoonPhase(date);
      const moonIllum = getMoonIllumination(moonPhase);
      
      const score = calculateScore({ cloud, humidity, precipitation: precip, wind, moonIllumination: moonIllum });
      total += score;
      count++;
    }
  }
  
  return count > 0 ? Math.round(total / count) : 0;
}

// Build 7-day forecast
export function processWeeklyForecast(data) {
  const days = [];
  
  for (let day = 0; day < 7; day++) {
    const idx = day * 24;
    if (idx >= data.hourly.time.length) break;
    
    const date = new Date(data.hourly.time[idx]);
    const moonPhase = getMoonPhase(date);
    const moonIllum = getMoonIllumination(moonPhase);
    
    const score = calculateNightScore(data.hourly, day);
    const summary = getSummary(score);
    
    // avg evening conditions
    let cloud = 0, humidity = 0, precip = 0, wind = 0, cnt = 0;
    
    for (let hr = 20; hr <= 23; hr++) {
      const i = day * 24 + hr;
      if (i < data.hourly.time.length) {
        cloud += data.hourly.cloud_cover[i] || 0;
        humidity += data.hourly.relative_humidity_2m[i] || 0;
        precip += data.hourly.precipitation[i] || 0;
        wind += data.hourly.wind_speed_10m[i] || 0;
        cnt++;
      }
    }
    
    if (cnt > 0) {
      cloud = Math.round(cloud / cnt);
      humidity = Math.round(humidity / cnt);
      precip = (precip / cnt).toFixed(1);
      wind = Math.round(wind / cnt);
    }
    
    // moon phase name
    let phaseName = "New Moon";
    if (moonPhase < 0.0625) phaseName = "New Moon";
    else if (moonPhase < 0.1875) phaseName = "Waxing Crescent";
    else if (moonPhase < 0.3125) phaseName = "First Quarter";
    else if (moonPhase < 0.4375) phaseName = "Waxing Gibbous";
    else if (moonPhase < 0.5625) phaseName = "Full Moon";
    else if (moonPhase < 0.6875) phaseName = "Waning Gibbous";
    else if (moonPhase < 0.8125) phaseName = "Last Quarter";
    else if (moonPhase < 0.9375) phaseName = "Waning Crescent";
    
    days.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      score,
      summary,
      moonPhase: phaseName,
      moonPhaseValue: moonPhase,
      moonIllumination: moonIllum,
      cloud,
      humidity,
      precipitation: precip,
      wind,
    });
  }
  
  return days;
}
