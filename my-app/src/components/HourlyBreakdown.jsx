export default function HourlyBreakdown({ hourlyTonight }) {
  if (!hourlyTonight || hourlyTonight.length === 0) return null;

  const bestScore = Math.max(...hourlyTonight.map(h => h.score));

  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "1rem",
        background: "#707586",
        borderRadius: "14px",
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: "1.2rem" }}>Hourly Tonight Breakdown</h2>
      <p style={{ marginTop: "0.35rem", marginBottom: "1rem", color: "#e0e0e0", fontSize: "0.85rem" }}>
        Hour-by-hour stargazing conditions from now until sunrise.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
          gap: "0.5rem",
        }}
      >
        {hourlyTonight.map((hour, index) => {
          const isBest = hour.score === bestScore;
          
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
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  BEST
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
                  Twilight
                </div>
              )}
              
              <div style={{ fontSize: "0.65rem", color: "#d0d0d0", lineHeight: "1.4" }}>
                <div>Cloud: {hour.cloud}%</div>
                <div>Humidity: {hour.humidity}%</div>
                <div>Moon: {hour.moonIllumination}%</div>
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
        <strong>Legend:</strong> Brighter cards = Dark sky period | Dimmed cards = Twilight hours | "BEST" badge = Highest score
      </div>
    </div>
  );
}
