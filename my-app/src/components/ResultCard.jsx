import { getMoonPhaseImage } from '../constants/moonPhases';

export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div
      className="slide-in"
      style={{
        marginTop: "1.25rem",
        padding: "1.25rem",
        background: "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "1rem",
        marginBottom: "1rem",
        flexWrap: "wrap",
      }}>
        <div style={{
          fontSize: "3rem",
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
            marginBottom: "0.35rem",
            fontSize: "1.4rem",
            fontWeight: "700",
          }}>
            {result.summary} Night
          </h2>
          <p style={{ 
            margin: 0,
            fontSize: "0.9rem",
            opacity: 0.9,
            lineHeight: 1.5,
          }}>{result.reason}</p>
        </div>
      </div>

      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <h3 style={{ 
          marginTop: 0, 
          marginBottom: "0.75rem",
          fontSize: "1.1rem",
          fontWeight: "600",
        }}>
          Moon Conditions
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          <div style={{ 
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <img 
              src={getMoonPhaseImage(result.moonPhaseValue)} 
              alt={result.moonPhase}
              style={{ 
                width: "100px", 
                height: "100px",
                objectFit: "contain",
                filter: "drop-shadow(0 8px 20px rgba(255, 255, 255, 0.4))",
              }}
            />
          </div>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
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
      </div>

      <div style={{ 
        marginTop: "1.5rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        fontSize: "0.95rem",
      }}>
        <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
          <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>Location</div>
          <div style={{ fontWeight: "500" }}>{result.location}</div>
        </div>
        <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
          <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>Coordinates</div>
          <div style={{ fontWeight: "500" }}>{result.lat}, {result.lon}</div>
        </div>
        <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
          <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>Cloud Cover</div>
          <div style={{ fontWeight: "500" }}>{result.cloud}%</div>
        </div>
        <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
          <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>Humidity</div>
          <div style={{ fontWeight: "500" }}>{result.humidity}%</div>
        </div>
        <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
          <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>Precipitation</div>
          <div style={{ fontWeight: "500" }}>{result.precipitation} mm</div>
        </div>
        <div style={{ padding: "0.75rem", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px" }}>
          <div style={{ opacity: 0.7, marginBottom: "0.25rem" }}>Wind Speed</div>
          <div style={{ fontWeight: "500" }}>{result.wind} km/h</div>
        </div>
      </div>
    </div>
  );
}
