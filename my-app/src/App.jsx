import { useState } from "react";

function App() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [weekForecast, setWeekForecast] = useState(null);
  const [sunTimes, setSunTimes] = useState(null);
  const [hourlyTonight, setHourlyTonight] = useState(null);
  const [lightPollution, setLightPollution] = useState(null);
  const [planets, setPlanets] = useState(null);
  const [issPasses, setIssPasses] = useState(null);

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (err) => reject(err),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  async function geocodeCity(cityName) {
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    
    const response = await fetch(geocodeUrl);
    
    if (!response.ok) {
      throw new Error("Failed to find city location.");
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error(`City "${cityName}" not found.`);
    }
    
    return {
      latitude: data.results[0].latitude,
      longitude: data.results[0].longitude,
      name: data.results[0].name,
      country: data.results[0].country,
      population: data.results[0].population || 0,
    };
  }

  function estimateLightPollution(population, isRural = false) {
    // Estimate Bortle Scale based on population
    // 1-3: Rural dark skies, 4-5: Rural/suburban transition, 6-7: Suburban, 8-9: Urban
    
    let bortleScale;
    let description;
    let quality;
    let color;
    
    if (isRural || population < 1000) {
      bortleScale = 3;
      description = "Rural Sky";
      quality = "Excellent - Milky Way visible";
      color = "#2d5016";
    } else if (population < 10000) {
      bortleScale = 4;
      description = "Rural/Suburban Transition";
      quality = "Good - Milky Way visible with effort";
      color = "#4a7c59";
    } else if (population < 50000) {
      bortleScale = 5;
      description = "Suburban Sky";
      quality = "Fair - Milky Way difficult to see";
      color = "#8b8f20";
    } else if (population < 250000) {
      bortleScale = 6;
      description = "Bright Suburban Sky";
      quality = "Moderate - Only bright stars visible";
      color = "#b8860b";
    } else if (population < 1000000) {
      bortleScale = 7;
      description = "Suburban/Urban Transition";
      quality = "Poor - Significant light pollution";
      color = "#cd853f";
    } else {
      bortleScale = 8;
      description = "City Sky";
      quality = "Bad - Only planets and moon visible";
      color = "#8b4513";
    }
    
    return {
      bortleScale,
      description,
      quality,
      color,
    };
  }

  function calculatePlanetPositions(date, latitude, longitude, sunTimes) {
    // Simplified planet visibility calculation
    // This uses approximate positions - for production, use a proper astronomy library
    
    const planets = [];
    const jd = getJulianDate(date);
    const hour = date.getHours();
    
    // Check if it's nighttime (between sunset and sunrise)
    const isNight = sunTimes && (
      date >= sunTimes.sunsetDate && date <= sunTimes.sunriseDate
    );
    
    // Venus - visible in evening or morning
    const venusElongation = ((jd * 0.617) % 360);
    if (venusElongation < 47 || venusElongation > 313) {
      const venusVisible = (hour >= 18 && hour <= 21) || (hour >= 4 && hour <= 7);
      if (venusVisible) {
        planets.push({
          name: "Venus",
          icon: "♀",
          visibility: venusElongation < 47 ? "Evening (West)" : "Morning (East)",
          brightness: "Very Bright",
          color: "#FFD700",
          description: venusElongation < 47 ? "Look west after sunset" : "Look east before sunrise"
        });
      }
    }
    
    // Mars - visible when opposition or near
    const marsPosition = ((jd * 0.531) % 360);
    if (isNight && (marsPosition > 150 && marsPosition < 210)) {
      planets.push({
        name: "Mars",
        icon: "♂",
        visibility: "Night (South)",
        brightness: "Bright",
        color: "#FF6347",
        description: "Look south, appears reddish"
      });
    }
    
    // Jupiter - visible most of the year
    const jupiterPosition = ((jd * 0.083) % 360);
    if (isNight && (jupiterPosition > 120 && jupiterPosition < 240)) {
      planets.push({
        name: "Jupiter",
        icon: "♃",
        visibility: "Night (South)",
        brightness: "Very Bright",
        color: "#DAA520",
        description: "Look south, brightest star-like object"
      });
    }
    
    // Saturn - visible when in favorable position
    const saturnPosition = ((jd * 0.034) % 360);
    if (isNight && (saturnPosition > 110 && saturnPosition < 250)) {
      planets.push({
        name: "Saturn",
        icon: "♄",
        visibility: "Night (South)",
        brightness: "Bright",
        color: "#F4E4C1",
        description: "Look south, yellowish with steady light"
      });
    }
    
    return planets;
  }

  function getJulianDate(date) {
    return date.getTime() / 86400000 + 2440587.5;
  }

  async function fetchISSPasses(lat, lon) {
    try {
      const issUrl = `http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}&n=5`;
      const response = await fetch(issUrl);
      
      if (!response.ok) {
        console.error("Failed to fetch ISS passes");
        return null;
      }
      
      const data = await response.json();
      
      if (!data.response || data.response.length === 0) {
        return [];
      }
      
      // Process and format the ISS passes
      const passes = data.response.map(pass => {
        const passDate = new Date(pass.risetime * 1000);
        const duration = Math.round(pass.duration / 60); // Convert to minutes
        
        // Estimate brightness based on duration (longer = brighter/higher)
        let brightness = "Faint";
        let brightnessEmoji = "✨";
        if (duration >= 6) {
          brightness = "Very Bright";
          brightnessEmoji = "⭐";
        } else if (duration >= 4) {
          brightness = "Bright";
          brightnessEmoji = "🌟";
        } else if (duration >= 2) {
          brightness = "Moderate";
          brightnessEmoji = "💫";
        }
        
        const now = new Date();
        const timeUntil = Math.round((passDate - now) / 1000 / 60); // minutes
        let timeUntilStr = "";
        
        if (timeUntil < 60) {
          timeUntilStr = `in ${timeUntil} min`;
        } else if (timeUntil < 1440) {
          timeUntilStr = `in ${Math.round(timeUntil / 60)} hours`;
        } else {
          timeUntilStr = `in ${Math.round(timeUntil / 1440)} days`;
        }
        
        return {
          date: passDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          time: passDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          duration: duration,
          brightness,
          brightnessEmoji,
          timeUntil: timeUntilStr,
          isTonight: passDate.toDateString() === now.toDateString(),
        };
      });
      
      return passes;
    } catch (err) {
      console.error("Error fetching ISS passes:", err);
      return null;
    }
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getSummary(score) {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Okay";
    if (score >= 30) return "Poor";
    return "Bad";
  }

  function buildReason({ cloud, humidity, precipitation, wind, moonIllumination }) {
    const reasons = [];

    if (cloud >= 70) reasons.push("very cloudy");
    else if (cloud >= 40) reasons.push("some cloud cover");

    if (humidity >= 80) reasons.push("high humidity");
    if (precipitation > 0) reasons.push("rain chance");
    if (wind >= 25) reasons.push("strong wind");
    
    if (moonIllumination > 75) reasons.push("bright moon");
    else if (moonIllumination > 50) reasons.push("moderate moonlight");

    if (reasons.length === 0) return "Clear enough for a decent stargazing session.";
    return `Main issues: ${reasons.join(", ")}.`;
  }

  function calculateScore({ cloud, humidity, precipitation, wind, moonIllumination }) {
    let score = 100;

    score -= cloud * 0.6;
    score -= humidity * 0.1;

    if (precipitation > 0) score -= 20;
    if (wind > 25) score -= 10;
    
    // Reduce score based on moon brightness (bright moon reduces visibility)
    if (moonIllumination > 75) score -= 25;
    else if (moonIllumination > 50) score -= 15;
    else if (moonIllumination > 25) score -= 8;

    return Math.round(clamp(score, 0, 100));
  }

  function getMoonPhase(date) {
    // Calculate moon phase (0 = new moon, 0.5 = full moon, 1 = new moon again)
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    const day = date.getDate();
    
    let c, e, jd, b;
    
    if (month < 3) {
      year--;
      month += 12;
    }
    
    ++month;
    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09; // Julian date relative to Jan 1, 1900
    jd /= 29.53058867; // Divide by the Moon cycle
    b = parseInt(jd);
    jd -= b; // Decimal part is moon phase
    
    return jd;
  }

  function getMoonPhaseName(phase) {
    if (phase < 0.0625) return "🌑 New Moon";
    if (phase < 0.1875) return "🌒 Waxing Crescent";
    if (phase < 0.3125) return "🌓 First Quarter";
    if (phase < 0.4375) return "🌔 Waxing Gibbous";
    if (phase < 0.5625) return "🌕 Full Moon";
    if (phase < 0.6875) return "🌖 Waning Gibbous";
    if (phase < 0.8125) return "🌗 Last Quarter";
    if (phase < 0.9375) return "🌘 Waning Crescent";
    return "🌑 New Moon";
  }

  function getMoonIllumination(phase) {
    // Convert phase to illumination percentage
    // Full moon (0.5) = 100%, New moon (0 or 1) = 0%
    return Math.round(100 * (1 - Math.abs(phase * 2 - 1)));
  }

  function getMoonImpact(illumination) {
    if (illumination > 75) return "High - Moon will significantly reduce visibility";
    if (illumination > 50) return "Moderate - Moon will affect viewing";
    if (illumination > 25) return "Low - Some moon light present";
    return "Minimal - Good conditions";
  }

  function pickTonightHour(hourly) {
    const now = new Date();

    // Look for the next hour that is at or after current time.
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

  async function fetchWeatherData(lat, lon) {
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

  async function fetchWeeklyWeatherData(lat, lon) {
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

  function calculateNightScore(hourlyData, dayIndex) {
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

  function extractSunTimes(data) {
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
  
  function processHourlyTonight(data, sunTimes) {
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

  function processWeeklyForecast(data) {
    const forecast = [];
    
    for (let day = 0; day < 7; day++) {
      const dayStartIndex = day * 24;
      if (dayStartIndex >= data.hourly.time.length) break;
      
      const date = new Date(data.hourly.time[dayStartIndex]);
      const moonPhase = getMoonPhase(date);
      const moonPhaseName = getMoonPhaseName(moonPhase);
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
      
      forecast.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        score: avgScore,
        summary,
        moonPhase: moonPhaseName,
        moonIllumination,
        cloud: avgCloud,
        humidity: avgHumidity,
        precipitation: avgPrecip,
        wind: avgWind,
      });
    }
    
    return forecast;
  }

  async function handleCitySearch() {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setWeekForecast(null);
    setSunTimes(null);
    setHourlyTonight(null);
    setLightPollution(null);
    setPlanets(null);
    setIssPasses(null);

    try {
      const location = await geocodeCity(city);
      const data = await fetchWeatherData(location.latitude, location.longitude);
      const weekData = await fetchWeeklyWeatherData(location.latitude, location.longitude);

      // Extract sun times
      const sunTimesData = extractSunTimes(data);
      setSunTimes(sunTimesData);
      
      // Process hourly breakdown
      const hourlyData = processHourlyTonight(data, sunTimesData);
      setHourlyTonight(hourlyData);
      
      // Calculate light pollution
      const lightPollutionData = estimateLightPollution(location.population);
      setLightPollution(lightPollutionData);
      
      // Calculate moon and planet data
      const now = new Date();
      const visiblePlanets = calculatePlanetPositions(now, location.latitude, location.longitude, sunTimesData);
      setPlanets(visiblePlanets);
      
      // Fetch ISS pass times
      const issPassData = await fetchISSPasses(location.latitude, location.longitude);
      setIssPasses(issPassData);

      const currentHour = pickTonightHour(data.hourly);
      
      // Calculate moon data
      const moonPhase = getMoonPhase(now);
      const moonPhaseName = getMoonPhaseName(moonPhase);
      const moonIllumination = getMoonIllumination(moonPhase);
      const moonImpact = getMoonImpact(moonIllumination);

      const score = calculateScore({ ...currentHour, moonIllumination });
      const summary = getSummary(score);
      const reason = buildReason({ ...currentHour, moonIllumination });

      setResult({
        location: `${location.name}, ${location.country}`,
        lat: location.latitude.toFixed(4),
        lon: location.longitude.toFixed(4),
        checkedTime: currentHour.time,
        score,
        summary,
        reason,
        cloud: currentHour.cloud,
        humidity: currentHour.humidity,
        precipitation: currentHour.precipitation,
        wind: currentHour.wind,
        moonPhase: moonPhaseName,
        moonIllumination,
        moonImpact,
      });
      
      // Process and set weekly forecast
      const forecast = processWeeklyForecast(weekData);
      setWeekForecast(forecast);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheck() {
    setLoading(true);
    setError("");
    setResult(null);
    setWeekForecast(null);
    setSunTimes(null);
    setHourlyTonight(null);
    setLightPollution(null);
    setPlanets(null);
    setIssPasses(null);

    try {
      const position = await getCurrentPosition();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const data = await fetchWeatherData(lat, lon);
      const weekData = await fetchWeeklyWeatherData(lat, lon);

      // Extract sun times
      const sunTimesData = extractSunTimes(data);
      setSunTimes(sunTimesData);
      
      // Process hourly breakdown
      const hourlyData = processHourlyTonight(data, sunTimesData);
      setHourlyTonight(hourlyData);
      
      // Estimate light pollution (assume rural/suburban for geolocation)
      const lightPollutionData = estimateLightPollution(50000); // Default estimate
      setLightPollution(lightPollutionData);
      
      // Calculate visible planets
      const now = new Date();
      const visiblePlanets = calculatePlanetPositions(now, lat, lon, sunTimesData);
      setPlanets(visiblePlanets);
      
      // Fetch ISS pass times
      const issPassData = await fetchISSPasses(lat, lon);
      setIssPasses(issPassData);

      const currentHour = pickTonightHour(data.hourly);
      
      // Calculate moon data
      const moonPhase = getMoonPhase(now);
      const moonPhaseName = getMoonPhaseName(moonPhase);
      const moonIllumination = getMoonIllumination(moonPhase);
      const moonImpact = getMoonImpact(moonIllumination);

      const score = calculateScore({ ...currentHour, moonIllumination });
      const summary = getSummary(score);
      const reason = buildReason({ ...currentHour, moonIllumination });

      setResult({
        location: "Your Location",
        lat: lat.toFixed(4),
        lon: lon.toFixed(4),
        checkedTime: currentHour.time,
        score,
        summary,
        reason,
        cloud: currentHour.cloud,
        humidity: currentHour.humidity,
        precipitation: currentHour.precipitation,
        wind: currentHour.wind,
        moonPhase: moonPhaseName,
        moonIllumination,
        moonImpact,
      });
      
      // Process and set weekly forecast
      const forecast = processWeeklyForecast(weekData);
      setWeekForecast(forecast);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1d2e 0%, #2d3561 50%, #1a1d2e 100%)",
        color: "white",
        fontFamily: "'Segoe UI', Roboto, system-ui, sans-serif",
        padding: "2rem 1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background stars */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 
          `radial-gradient(2px 2px at 20% 30%, white, transparent),
           radial-gradient(2px 2px at 60% 70%, white, transparent),
           radial-gradient(1px 1px at 50% 50%, white, transparent),
           radial-gradient(1px 1px at 80% 10%, white, transparent),
           radial-gradient(2px 2px at 90% 60%, white, transparent),
           radial-gradient(1px 1px at 33% 80%, white, transparent)`,
        backgroundSize: "200% 200%",
        opacity: 0.4,
        pointerEvents: "none",
      }} />
      
      <div
        className="fade-in"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          borderRadius: "32px",
          padding: "3rem 2.5rem",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ 
            marginTop: 0, 
            marginBottom: "0.5rem",
            fontSize: "3rem",
            fontWeight: "700",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}>
            ✨ SkyCheck
          </h1>
          <p style={{ 
            fontSize: "1.1rem", 
            opacity: 0.9,
            margin: 0,
            color: "#c7d2fe",
          }}>
            Discover the best nights for stargazing
          </p>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCitySearch()}
            placeholder="Enter city name (e.g., Tokyo)..."
            style={{
              padding: "1.1rem 1.5rem",
              borderRadius: "16px",
              border: "2px solid rgba(255, 255, 255, 0.15)",
              fontSize: "1.05rem",
              width: "100%",
              boxSizing: "border-box",
              marginBottom: "1rem",
              background: "rgba(255, 255, 255, 0.08)",
              color: "white",
              outline: "none",
              transition: "all 0.3s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(102, 126, 234, 0.6)";
              e.target.style.background = "rgba(255, 255, 255, 0.12)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
              e.target.style.background = "rgba(255, 255, 255, 0.08)";
              e.target.style.transform = "translateY(0)";
            }}
          />
          
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={handleCitySearch}
              disabled={loading}
              style={{
                padding: "1.1rem 1.5rem",
                borderRadius: "16px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "1.05rem",
                fontWeight: "600",
                flex: 1,
                background: loading 
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
              }}
            >
              {loading ? "🔍 Checking..." : "🔍 Search City"}
            </button>

            <button
              onClick={handleCheck}
              disabled={loading}
              style={{
                padding: "1.1rem 1.5rem",
                borderRadius: "16px",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "1.05rem",
                fontWeight: "600",
                flex: 1,
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.background = "rgba(255, 255, 255, 0.15)";
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
            >
              {loading ? "📍 Locating..." : "📍 My Location"}
            </button>
          </div>
        </div>

        {error && (
          <div className="fade-in" style={{ 
            color: "#fca5a5", 
            marginTop: "1rem",
            padding: "1rem 1.25rem",
            background: "rgba(239, 68, 68, 0.15)",
            borderRadius: "12px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            fontSize: "0.95rem",
          }}>
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div
            className="slide-in"
            style={{
              marginTop: "2rem",
              padding: "2rem",
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)",
              backdropFilter: "blur(10px)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "1.5rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}>
              <div style={{
                fontSize: "4rem",
                fontWeight: "bold",
                background: result.score >= 70 ? "linear-gradient(135deg, #10b981 0%, #34d399 100%)" :
                           result.score >= 50 ? "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)" :
                           result.score >= 30 ? "linear-gradient(135deg, #f97316 0%, #fb923c 100%)" :
                           "linear-gradient(135deg, #ef4444 0%, #f87171 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1,
              }}>
                {result.score}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ 
                  marginTop: 0,
                  marginBottom: "0.5rem",
                  fontSize: "1.8rem",
                  fontWeight: "700",
                }}>
                  {result.summary} Night
                </h2>
                <p style={{ 
                  margin: 0,
                  fontSize: "1.05rem",
                  opacity: 0.9,
                  lineHeight: 1.6,
                }}>{result.reason}</p>
              </div>
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                padding: "1.5rem",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <h3 style={{ 
                marginTop: 0, 
                marginBottom: "1rem",
                fontSize: "1.3rem",
                fontWeight: "600",
              }}>
                🌙 Moon Conditions
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.25rem" }}>Phase</div>
                  <div style={{ fontWeight: "600", fontSize: "1.05rem" }}>{result.moonPhase}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.25rem" }}>Illumination</div>
                  <div style={{ fontWeight: "600", fontSize: "1.05rem" }}>{result.moonIllumination}%</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.25rem" }}>Impact</div>
                  <div style={{ fontWeight: "600", fontSize: "1.05rem" }}>{result.moonImpact}</div>
                </div>
              </div>
            </div>

            <div style={{ 
              marginTop: "1.5rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              fontSize: "0.95rem",
            }}>
              <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
                <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>📍 Location</div>
                <div style={{ fontWeight: "500" }}>{result.location}</div>
              </div>
              <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
                <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>🌐 Coordinates</div>
                <div style={{ fontWeight: "500" }}>{result.lat}, {result.lon}</div>
              </div>
              <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
                <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>☁️ Cloud Cover</div>
                <div style={{ fontWeight: "500" }}>{result.cloud}%</div>
              </div>
              <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
                <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>💧 Humidity</div>
                <div style={{ fontWeight: "500" }}>{result.humidity}%</div>
              </div>
              <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
                <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>🌧️ Precipitation</div>
                <div style={{ fontWeight: "500" }}>{result.precipitation} mm</div>
              </div>
              <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
                <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>💨 Wind Speed</div>
                <div style={{ fontWeight: "500" }}>{result.wind} km/h</div>
              </div>
            </div>
          </div>
        )}

        {sunTimes && (
          <div
            className="slide-in"
            style={{
              marginTop: "2rem",
              padding: "2rem",
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h2 style={{ 
              marginTop: 0,
              marginBottom: "1.5rem",
              fontSize: "1.6rem",
              fontWeight: "600",
            }}>🌅 Sunset & Stargazing Window</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  padding: "1.25rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌇</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.25rem" }}>Sunset</div>
                <div style={{ fontSize: "1.3rem", fontWeight: "600" }}>{sunTimes.sunset}</div>
              </div>
              
              <div
                style={{
                  padding: "1.25rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌆</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.25rem" }}>Civil Twilight</div>
                <div style={{ fontSize: "1.3rem", fontWeight: "600" }}>{sunTimes.civilTwilight}</div>
              </div>
              
              <div
                style={{
                  padding: "1.25rem",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.2) 100%)",
                  borderRadius: "16px",
                  border: "2px solid rgba(52, 211, 153, 0.5)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "rgba(52, 211, 153, 0.8)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(52, 211, 153, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(52, 211, 153, 0.5)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⭐</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.25rem", color: "#d0fae5" }}>Dark Sky Begins</div>
                <div style={{ fontSize: "1.3rem", fontWeight: "600", color: "#6ee7b7" }}>{sunTimes.astronomicalTwilight}</div>
              </div>
              
              <div
                style={{
                  padding: "1.25rem",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.2) 100%)",
                  borderRadius: "16px",
                  border: "2px solid rgba(52, 211, 153, 0.5)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "rgba(52, 211, 153, 0.8)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(52, 211, 153, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(52, 211, 153, 0.5)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌌</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.25rem", color: "#d0fae5" }}>Dark Sky Ends</div>
                <div style={{ fontSize: "1.3rem", fontWeight: "600", color: "#6ee7b7" }}>{sunTimes.morningTwilight}</div>
              </div>
              
              <div
                style={{
                  padding: "1.25rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌄</div>
                <div style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.25rem" }}>Sunrise</div>
                <div style={{ fontSize: "1.3rem", fontWeight: "600" }}>{sunTimes.sunrise}</div>
              </div>
            </div>
            
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "rgba(52, 211, 153, 0.1)",
                borderRadius: "12px",
                fontSize: "0.95rem",
                border: "1px solid rgba(52, 211, 153, 0.2)",
              }}
            >
              <strong>💡 Best Stargazing:</strong> During the <span style={{ color: "#6ee7b7", fontWeight: "600" }}>Dark Sky</span> window when astronomical twilight has passed and stars are most visible.
            </div>
          </div>
        )}

        {lightPollution && (
          <div
            className="slide-in"
            style={{
              marginTop: "2rem",
              padding: "2rem",
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h2 style={{ 
              marginTop: 0,
              marginBottom: "1.5rem",
              fontSize: "1.6rem",
              fontWeight: "600",
            }}>🌃 Light Pollution Level</h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2rem",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  padding: "2rem",
                  background: `linear-gradient(135deg, ${lightPollution.color} 0%, ${lightPollution.color}dd 100%)`,
                  borderRadius: "20px",
                  flex: "0 0 auto",
                  minWidth: "140px",
                  textAlign: "center",
                  boxShadow: `0 8px 25px ${lightPollution.color}66`,
                  border: `2px solid ${lightPollution.color}`,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = `0 12px 35px ${lightPollution.color}99`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = `0 8px 25px ${lightPollution.color}66`;
                }}
              >
                <div style={{ fontSize: "3.5rem", fontWeight: "700", marginBottom: "0.5rem", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
                  {lightPollution.bortleScale}
                </div>
                <div style={{ fontSize: "0.9rem", opacity: 0.95, fontWeight: "500" }}>
                  Bortle Scale
                </div>
              </div>
              
              <div style={{ flex: 1, minWidth: "250px" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: "600", marginBottom: "0.75rem" }}>
                  {lightPollution.description}
                </div>
                <div style={{ fontSize: "1.05rem", opacity: 0.9, marginBottom: "1rem", lineHeight: 1.5 }}>
                  {lightPollution.quality}
                </div>
                <div
                  style={{
                    fontSize: "0.95rem",
                    opacity: 0.8,
                    lineHeight: "1.6",
                    padding: "1rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    borderLeft: `3px solid ${lightPollution.color}`,
                  }}
                >
                  {lightPollution.bortleScale <= 4 
                    ? "🌌 Great location for deep-sky objects and Milky Way photography"
                    : lightPollution.bortleScale <= 6
                    ? "⭐ Suitable for bright deep-sky objects, planets, and moon observation"
                    : "🌙 Best for observing planets, moon, and brightest stars"}
                </div>
              </div>
            </div>
            
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: "12px",
                fontSize: "0.9rem",
                opacity: 0.8,
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <strong>📊 Bortle Scale Guide:</strong> 1-3 = Excellent (rural) | 4-5 = Good (suburban) | 6-7 = Moderate (bright suburban) | 8-9 = Poor (urban)
            </div>
          </div>
        )}

        {planets && planets.length > 0 && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem",
              background: "#707586",
              borderRadius: "16px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>🪐 Visible Planets Tonight</h2>
            <p style={{ marginTop: "0.5rem", marginBottom: "1.25rem", color: "#e0e0e0" }}>
              Planets you can see with the naked eye tonight.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              {planets.map((planet, index) => (
                <div
                  key={index}
                  style={{
                    padding: "1.25rem",
                    background: "#6b6e7c",
                    borderRadius: "12px",
                    border: `2px solid ${planet.color}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "2.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {planet.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      marginBottom: "0.5rem",
                      color: planet.color,
                    }}
                  >
                    {planet.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#e0e0e0",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <strong>When:</strong> {planet.visibility}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#e0e0e0",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <strong>Brightness:</strong> {planet.brightness}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#d0d0d0",
                      lineHeight: "1.4",
                    }}
                  >
                    {planet.description}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "1.25rem",
                padding: "0.75rem",
                background: "#6b6e7c",
                borderRadius: "8px",
                fontSize: "0.85rem",
                color: "#e0e0e0",
              }}
            >
              <strong>Tip:</strong> Planets don't twinkle like stars! They shine with steady light. Use a stargazing app for precise positions.
            </div>
          </div>
        )}

        {planets && planets.length === 0 && result && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem",
              background: "#707586",
              borderRadius: "16px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>🪐 Visible Planets Tonight</h2>
            <p style={{ marginTop: "0.5rem", color: "#e0e0e0" }}>
              No major planets are visible tonight at this location. Check back another night or try a different time!
            </p>
          </div>
        )}

        {issPasses && issPasses.length > 0 && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem",
              background: "#707586",
              borderRadius: "16px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>🚀 ISS Pass Times</h2>
            <p style={{ marginTop: "0.5rem", marginBottom: "1.25rem", color: "#e0e0e0" }}>
              When the International Space Station will fly over your location. Look for a bright moving "star"!
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "1rem",
              }}
            >
              {issPasses.map((pass, index) => (
                <div
                  key={index}
                  style={{
                    padding: "1.25rem",
                    background: pass.isTonight ? "#4a7c59" : "#6b6e7c",
                    borderRadius: "12px",
                    border: pass.isTonight ? "2px solid #66d98f" : "2px solid transparent",
                    position: "relative",
                  }}
                >
                  {pass.isTonight && (
                    <div
                      style={{
                        position: "absolute",
                        top: "0.5rem",
                        right: "0.5rem",
                        background: "#66d98f",
                        color: "#1a1a1a",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "8px",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                      }}
                    >
                      TONIGHT
                    </div>
                  )}
                  
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                    {pass.brightnessEmoji}
                  </div>
                  
                  <div style={{ fontSize: "0.85rem", color: "#d0d0d0", marginBottom: "0.5rem" }}>
                    {pass.date}
                  </div>
                  
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      marginBottom: "0.5rem",
                      color: "#ffffff",
                    }}
                  >
                    {pass.time}
                  </div>
                  
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#e0e0e0",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <strong>Duration:</strong> {pass.duration} min
                  </div>
                  
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#e0e0e0",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <strong>Brightness:</strong> {pass.brightness}
                  </div>
                  
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: pass.isTonight ? "#66d98f" : "#ffcc66",
                      fontWeight: "bold",
                      marginTop: "0.5rem",
                    }}
                  >
                    {pass.timeUntil}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "1.25rem",
                padding: "0.75rem",
                background: "#6b6e7c",
                borderRadius: "8px",
                fontSize: "0.85rem",
                color: "#e0e0e0",
              }}
            >
              <strong>Spotting Tips:</strong> The ISS looks like a bright star moving steadily across the sky. 
              Best viewing is during twilight when the sky is dark but the ISS is still lit by the sun. 
              Longer passes (5+ min) are brighter and easier to spot!
            </div>
          </div>
        )}

        {hourlyTonight && hourlyTonight.length > 0 && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem",
              background: "#707586",
              borderRadius: "16px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>🌟 Hourly Tonight Breakdown</h2>
            <p style={{ marginTop: "0.5rem", marginBottom: "1.25rem", color: "#e0e0e0" }}>
              Hour-by-hour stargazing conditions from now until sunrise.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {hourlyTonight.map((hour, index) => {
                const isBest = hour.score === Math.max(...hourlyTonight.map(h => h.score));
                
                return (
                  <div
                    key={index}
                    style={{
                      padding: "1rem",
                      background: hour.isDarkEnough ? "#5c6173" : "#6b6e7c",
                      borderRadius: "12px",
                      border: isBest && hour.isDarkEnough 
                        ? "2px solid #66d98f" 
                        : hour.isDarkEnough 
                        ? "2px solid #8b8fa0" 
                        : "2px solid transparent",
                      opacity: hour.isDarkEnough ? 1 : 0.7,
                      position: "relative",
                    }}
                  >
                    {isBest && hour.isDarkEnough && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          background: "#66d98f",
                          color: "#1a1a1a",
                          borderRadius: "50%",
                          width: "22px",
                          height: "22px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                        }}
                      >
                        ⭐
                      </div>
                    )}
                    
                    <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                      {hour.time}
                    </div>
                    
                    <div
                      style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        marginBottom: "0.25rem",
                        color: 
                          hour.score >= 70 ? "#66d98f" :
                          hour.score >= 50 ? "#ffcc66" :
                          hour.score >= 30 ? "#ff9966" :
                          "#ff6b6b"
                      }}
                    >
                      {hour.score}
                    </div>
                    
                    <div style={{ fontSize: "0.7rem", marginBottom: "0.75rem", color: "#e0e0e0" }}>
                      {hour.summary}
                    </div>
                    
                    {!hour.isDarkEnough && (
                      <div
                        style={{
                          fontSize: "0.65rem",
                          color: "#ffcc66",
                          marginBottom: "0.5rem",
                        }}
                      >
                        🌆 Twilight
                      </div>
                    )}
                    
                    <div style={{ fontSize: "0.65rem", color: "#d0d0d0", lineHeight: "1.4" }}>
                      <div>☁️ {hour.cloud}%</div>
                      <div>💧 {hour.humidity}%</div>
                      <div>🌙 {hour.moonIllumination}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: "1.25rem",
                padding: "0.75rem",
                background: "#6b6e7c",
                borderRadius: "8px",
                fontSize: "0.85rem",
                color: "#e0e0e0",
              }}
            >
              <strong>Legend:</strong> ⭐ = Best hour | Brighter cards = Dark sky period | Dimmed cards = Twilight hours
            </div>
          </div>
        )}

        {weekForecast && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem",
              background: "#707586",
              borderRadius: "16px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>📅 7-Day Stargazing Forecast</h2>
            <p style={{ marginTop: "0.5rem", marginBottom: "1.25rem", color: "#e0e0e0" }}>
              Plan ahead! Evening conditions (8 PM - 11 PM) for the next week.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {weekForecast.map((day, index) => {
                const isToday = index === 0;
                const isBest = day.score === Math.max(...weekForecast.map(d => d.score));
                
                return (
                  <div
                    key={index}
                    style={{
                      padding: "1rem",
                      background: isToday ? "#5c6173" : isBest ? "#4a7c59" : "#6b6e7c",
                      borderRadius: "12px",
                      border: isBest ? "2px solid #66d98f" : isToday ? "2px solid #4a9eff" : "2px solid transparent",
                      position: "relative",
                    }}
                  >
                    {isBest && !isToday && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          background: "#66d98f",
                          color: "#1a1a1a",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        ⭐
                      </div>
                    )}
                    <div style={{ fontSize: "0.85rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                      {day.date}
                      {isToday && <span style={{ color: "#4a9eff" }}> (Today)</span>}
                    </div>
                    <div
                      style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        marginBottom: "0.25rem",
                        color: 
                          day.score >= 70 ? "#66d98f" :
                          day.score >= 50 ? "#ffcc66" :
                          day.score >= 30 ? "#ff9966" :
                          "#ff6b6b"
                      }}
                    >
                      {day.score}
                    </div>
                    <div style={{ fontSize: "0.75rem", marginBottom: "0.75rem", color: "#e0e0e0" }}>
                      {day.summary}
                    </div>
                    <div style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                      {day.moonPhase.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#d0d0d0", lineHeight: "1.4" }}>
                      <div>☁️ {day.cloud}%</div>
                      <div>💧 {day.humidity}%</div>
                      <div>🌙 {day.moonIllumination}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: "1.25rem",
                padding: "0.75rem",
                background: "#6b6e7c",
                borderRadius: "8px",
                fontSize: "0.85rem",
                color: "#e0e0e0",
              }}
            >
              <strong>Legend:</strong> ⭐ = Best night | Blue border = Today | 
              Score: <span style={{ color: "#66d98f" }}>70+</span> Excellent, 
              <span style={{ color: "#ffcc66" }}> 50-69</span> Good, 
              <span style={{ color: "#ff9966" }}> 30-49</span> Poor, 
              <span style={{ color: "#ff6b6b" }}> &lt;30</span> Bad
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;