import { useState } from "react";

// API imports
import { fetchWeatherData, fetchWeeklyWeatherData } from "./api/weatherApi";
import { getCurrentPosition, geocodeCity, reverseGeocode } from "./api/geocoding";
import { fetchISSPasses } from "./api/issApi";

// Utility imports
import { 
  getMoonPhase, 
  getMoonPhaseName, 
  getMoonIllumination, 
  getMoonImpact,
  calculatePlanetPositions,
  estimateLightPollution 
} from "./utils/astronomy";
import { calculateScore, getSummary, buildReason } from "./utils/scoring";
import { 
  pickTonightHour, 
  extractSunTimes, 
  processHourlyTonight, 
  processWeeklyForecast 
} from "./utils/weatherHelpers";

// Component imports
import ResultCard from "./components/ResultCard";
import SunTimes from "./components/SunTimes";
import LightPollution from "./components/LightPollution";
import Planets from "./components/Planets";
import ISSPasses from "./components/ISSPasses";
import HourlyBreakdown from "./components/HourlyBreakdown";
import WeeklyForecast from "./components/WeeklyForecast";

function App() {
  // State management
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

  // Handle city search submission
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
        moonPhaseValue: moonPhase,
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

  // Handle current location check
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

      // Get the actual city name from coordinates
      const locationName = await reverseGeocode(lat, lon);

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
        location: locationName,
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
        moonPhaseValue: moonPhase,
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
        padding: "0.5rem",
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
          width: "100%",
          margin: "0 auto",
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "1rem",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          position: "relative",
          zIndex: 1,
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <h1 style={{ 
            marginTop: 0, 
            marginBottom: "0.25rem",
            fontSize: "2rem",
            fontWeight: "700",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
            paddingBottom: "0.6rem",
          }}>
            Can I stargaze?
          </h1>
          <p style={{ 
            fontSize: "1.1rem", 
            opacity: 0.9,
            margin: 0,
            color: "#c7d2fe",
          }}>
          </p>
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCitySearch()}
            placeholder="Enter city name (e.g., Tokyo)..."
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "12px",
              border: "2px solid rgba(255, 255, 255, 0.15)",
              fontSize: "0.95rem",
              width: "100%",
              boxSizing: "border-box",
              marginBottom: "0.75rem",
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
          
          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button
              onClick={handleCitySearch}
              disabled={loading}
              style={{
                padding: "0.85rem 1rem",
                borderRadius: "12px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
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
              {loading ? "Checking..." : "Search City"}
            </button>

            <button
              onClick={handleCheck}
              disabled={loading}
              style={{
                padding: "0.85rem 1rem",
                borderRadius: "12px",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
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
              {loading ? "Locating..." : "My Location"}
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

        <ResultCard result={result} />
        <SunTimes sunTimes={sunTimes} />
        <LightPollution lightPollution={lightPollution} />
        <Planets planets={planets} result={result} />
        <ISSPasses issPasses={issPasses} />
        <HourlyBreakdown hourlyTonight={hourlyTonight} />
        <WeeklyForecast weekForecast={weekForecast} />
      </div>
    </div>
  );
}

export default App;
