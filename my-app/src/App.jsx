import { useState, useEffect, useRef } from "react";

// API imports
import { fetchWeatherData, fetchWeeklyWeatherData } from "./api/weatherApi";
import { getCurrentPosition, geocodeCity, reverseGeocode, getCitySuggestions } from "./api/geocoding";
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
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Fetch city suggestions with debouncing
  useEffect(() => {
    const delayTimer = setTimeout(async () => {
      if (city.trim().length >= 2) {
        try {
          const results = await getCitySuggestions(city);
          setSuggestions(results);
          setShowSuggestions(true); // Always show, even if empty
          setSelectedIndex(-1);
        } catch (err) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayTimer);
  }, [city]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle city search submission
  async function handleCitySearch(selectedCity = null) {
    const searchQuery = selectedCity || city.trim();
    
    if (!searchQuery) {
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
    setShowSuggestions(false);

    try {
      // First check if we have suggestions - they should work
      const location = await geocodeCity(searchQuery);
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

  // Handle selecting a suggestion
  function handleSelectSuggestion(suggestion) {
    setCity(suggestion.displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    // Automatically search after selection
    handleCitySearch(suggestion.name);
  }

  // Handle keyboard navigation in autocomplete
  function handleKeyDown(e) {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        handleCitySearch();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else {
          handleCitySearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
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

        <div style={{ marginBottom: "1.25rem", position: "relative" }}>
          <input
            ref={inputRef}
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={handleKeyDown}
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
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
              e.target.style.background = "rgba(255, 255, 255, 0.08)";
              e.target.style.transform = "translateY(0)";
            }}
          />
          
          {/* Autocomplete dropdown */}
          {showSuggestions && city.trim().length >= 2 && (
            <div
              ref={suggestionsRef}
              style={{
                position: "absolute",
                top: "calc(100% - 0.75rem)",
                left: 0,
                right: 0,
                background: "rgba(30, 30, 50, 0.98)",
                backdropFilter: "blur(20px)",
                borderRadius: "12px",
                border: "1px solid rgba(102, 126, 234, 0.3)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                maxHeight: "300px",
                overflowY: "auto",
                zIndex: 1000,
                marginBottom: "0.75rem",
              }}
            >
              {suggestions.length === 0 ? (
                <div style={{
                  padding: "1rem",
                  textAlign: "center",
                  opacity: 0.7,
                  fontSize: "0.9rem"
                }}>
                  No cities found. Try a different spelling or use a larger city nearby.
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.latitude}-${suggestion.longitude}`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                      padding: "0.75rem 1rem",
                      cursor: "pointer",
                      background: selectedIndex === index 
                        ? "rgba(102, 126, 234, 0.3)" 
                        : "transparent",
                      borderBottom: index < suggestions.length - 1 
                        ? "1px solid rgba(255, 255, 255, 0.1)" 
                        : "none",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <div style={{ 
                      fontSize: "0.95rem", 
                      fontWeight: "500",
                      marginBottom: "0.1rem",
                    }}>
                      {suggestion.displayName}
                    </div>
                    {suggestion.population > 0 && (
                      <div style={{ 
                        fontSize: "0.75rem", 
                        opacity: 0.6,
                      }}>
                        Population: {suggestion.population.toLocaleString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          
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
