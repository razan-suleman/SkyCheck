import { useState } from "react";

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

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

  function buildReason({ cloud, humidity, precipitation, wind }) {
    const reasons = [];

    if (cloud >= 70) reasons.push("very cloudy");
    else if (cloud >= 40) reasons.push("some cloud cover");

    if (humidity >= 80) reasons.push("high humidity");
    if (precipitation > 0) reasons.push("rain chance");
    if (wind >= 25) reasons.push("strong wind");

    if (reasons.length === 0) return "Clear enough for a decent stargazing session.";
    return `Main issues: ${reasons.join(", ")}.`;
  }

  function calculateScore({ cloud, humidity, precipitation, wind }) {
    let score = 100;

    score -= cloud * 0.6;
    score -= humidity * 0.1;

    if (precipitation > 0) score -= 20;
    if (wind > 25) score -= 10;

    return Math.round(clamp(score, 0, 100));
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

  async function handleCheck() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const position = await getCurrentPosition();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}` +
        `&longitude=${lon}` +
        `&hourly=cloud_cover,relative_humidity_2m,precipitation,wind_speed_10m` +
        `&timezone=auto`;

      const response = await fetch(weatherUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch weather data.");
      }

      const data = await response.json();

      const currentHour = pickTonightHour(data.hourly);

      const score = calculateScore(currentHour);
      const summary = getSummary(score);
      const reason = buildReason(currentHour);

      setResult({
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
      });
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
        background: "#5c6173",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          background: "#6b6e7c",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 10px 30px rgba(154, 110, 110, 0.3)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Stargazing Tonight</h1>
        <p>Check if your sky is good for stargazing using your current GPS location.</p>

        <button
          onClick={handleCheck}
          disabled={loading}
          style={{
            padding: "0.9rem 1.2rem",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "bold",
          }}
        >
          {loading ? "Checking..." : "Use My Location"}
        </button>

        {error && (
          <p style={{ color: "#ff8f8f", marginTop: "1rem" }}>
            {error}
          </p>
        )}

        {result && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.25rem",
              background: "#707586",
              borderRadius: "16px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {result.summary} — {result.score}/100
            </h2>

            <p>{result.reason}</p>

            <p><strong>Coordinates:</strong> {result.lat}, {result.lon}</p>
            <p><strong>Forecast time used:</strong> {result.checkedTime}</p>
            <p><strong>Cloud cover:</strong> {result.cloud}%</p>
            <p><strong>Humidity:</strong> {result.humidity}%</p>
            <p><strong>Precipitation:</strong> {result.precipitation} mm</p>
            <p><strong>Wind speed:</strong> {result.wind} km/h</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;