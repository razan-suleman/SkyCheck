export default function SunTimes({ sunTimes }) {
  if (!sunTimes) return null;

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
      }}>Sunset & Stargazing Window</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "0.65rem",
        }}
      >
        <TimeCard label="Sunset" time={sunTimes.sunset} />
        <TimeCard label="Civil Twilight" time={sunTimes.civilTwilight} />
        <TimeCard 
          label="Dark Sky Begins" 
          time={sunTimes.astronomicalTwilight} 
          highlighted
        />
        <TimeCard 
          label="Dark Sky Ends" 
          time={sunTimes.morningTwilight} 
          highlighted
        />
        <TimeCard label="Sunrise" time={sunTimes.sunrise} />
      </div>
      
      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          background: "rgba(52, 211, 153, 0.1)",
          borderRadius: "10px",
          fontSize: "0.85rem",
          border: "1px solid rgba(52, 211, 153, 0.2)",
        }}
      >
        <strong>Best Stargazing:</strong> During the <span style={{ color: "#6ee7b7", fontWeight: "600" }}>Dark Sky</span> window when astronomical twilight has passed and stars are most visible.
      </div>
    </div>
  );
}

function TimeCard({ label, time, highlighted = false }) {
  return (
    <div
      style={{
        padding: "1.25rem",
        background: highlighted 
          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.2) 100%)"
          : "rgba(255, 255, 255, 0.05)",
        borderRadius: "16px",
        border: highlighted 
          ? "2px solid rgba(52, 211, 153, 0.5)"
          : "1px solid rgba(255, 255, 255, 0.1)",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.background = highlighted 
          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(52, 211, 153, 0.25) 100%)"
          : "rgba(255, 255, 255, 0.08)";
        e.currentTarget.style.boxShadow = highlighted 
          ? "0 8px 25px rgba(52, 211, 153, 0.3)"
          : "0 8px 20px rgba(0, 0, 0, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = highlighted 
          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(52, 211, 153, 0.2) 100%)"
          : "rgba(255, 255, 255, 0.05)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ 
        fontSize: "0.75rem", 
        opacity: highlighted ? 0.9 : 0.7, 
        marginBottom: "0.2rem",
        color: highlighted ? "#d0fae5" : "inherit"
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: "1.1rem", 
        fontWeight: "600",
        color: highlighted ? "#6ee7b7" : "inherit"
      }}>
        {time}
      </div>
    </div>
  );
}
