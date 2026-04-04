export default function ISSPasses({ issPasses }) {
  if (!issPasses || issPasses.length === 0) return null;

  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "1rem",
        background: "#707586",
        borderRadius: "14px",
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: "1.2rem" }}>ISS Pass Times</h2>
      <p style={{ marginTop: "0.35rem", marginBottom: "1rem", color: "#e0e0e0", fontSize: "0.85rem" }}>
        When the International Space Station will fly over your location. Look for a bright moving "star"!
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "0.65rem",
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
  );
}
