// 7-day stargazing forecast

import { getMoonPhaseImage } from '../constants/moonPhases';

export default function WeeklyForecast({ weekForecast }) {
  if (!weekForecast) return null;

  const bestScore = Math.max(...weekForecast.map(d => d.score));

  return (
    <div
      style={{
        marginTop: "1.5rem",
        padding: "1.25rem",
        background: "#707586",
        borderRadius: "16px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>7-Day Stargazing Forecast</h2>
      <p style={{ marginTop: "0.5rem", marginBottom: "1.25rem", color: "#e0e0e0" }}>
        Plan ahead! Evening conditions (8 PM - 11 PM) for the next week.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: "0.5rem",
        }}
      >
        {weekForecast.map((day, index) => {
          const isToday = index === 0;
          const isBest = day.score === bestScore;
          
          return (
            <div
              key={index}
              style={{
                padding: "0.85rem",
                background: isToday ? "#5c6173" : isBest ? "#4a7c59" : "#6b6e7c",
                borderRadius: "10px",
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
              <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "center" }}>
                <img 
                  src={getMoonPhaseImage(day.moonPhaseValue)} 
                  alt={day.moonPhase}
                  style={{ 
                    width: "60px", 
                    height: "60px",
                    objectFit: "contain",
                    filter: "drop-shadow(0 4px 10px rgba(255, 255, 255, 0.3))",
                  }}
                />
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
  );
}
