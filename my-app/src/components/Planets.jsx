// Visible planets display

export default function Planets({ planets, result }) {
  if (!result) return null;

  if (!planets || planets.length === 0) {
    return (
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
    );
  }

  return (
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
  );
}
