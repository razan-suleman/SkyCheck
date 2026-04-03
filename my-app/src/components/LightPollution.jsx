// Light pollution level display (Bortle Scale)

export default function LightPollution({ lightPollution }) {
  if (!lightPollution) return null;

  const getTip = (scale) => {
    if (scale <= 4) {
      return "🌌 Great location for deep-sky objects and Milky Way photography";
    } else if (scale <= 6) {
      return "⭐ Suitable for bright deep-sky objects, planets, and moon observation";
    } else {
      return "🌙 Best for observing planets, moon, and brightest stars";
    }
  };

  return (
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
      }}>Light Pollution Level</h2>
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
            padding: "1.5rem",
            background: `linear-gradient(135deg, ${lightPollution.color} 0%, ${lightPollution.color}dd 100%)`,
            borderRadius: "16px",
            flex: "0 0 auto",
            minWidth: "110px",
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
            {getTip(lightPollution.bortleScale)}
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
  );
}
