// ISS (International Space Station) pass predictions

/**
 * Fetch upcoming ISS passes overhead for a location
 * Uses Open Notify API to get visible passes
 */
export async function fetchISSPasses(lat, lon) {
  try {
    const issUrl = `http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}&n=5`;
    const response = await fetch(issUrl);
    
    if (!response.ok) {
      console.error("Failed to fetch ISS passes");
      return null;
    }
    
    const data = await response.json();
    
    if (!data.response || data.response.length === 0) {
      return [];
    }
    
    // Process and format the ISS passes
    const passes = data.response.map(pass => {
      const passDate = new Date(pass.risetime * 1000);
      const duration = Math.round(pass.duration / 60); // Convert to minutes
      
      // Estimate brightness based on duration (longer = brighter/higher)
      let brightness = "Faint";
      let brightnessEmoji = "✨";
      if (duration >= 6) {
        brightness = "Very Bright";
        brightnessEmoji = "⭐";
      } else if (duration >= 4) {
        brightness = "Bright";
        brightnessEmoji = "🌟";
      } else if (duration >= 2) {
        brightness = "Moderate";
        brightnessEmoji = "💫";
      }
      
      const now = new Date();
      const timeUntil = Math.round((passDate - now) / 1000 / 60); // minutes
      let timeUntilStr = "";
      
      if (timeUntil < 60) {
        timeUntilStr = `in ${timeUntil} min`;
      } else if (timeUntil < 1440) {
        timeUntilStr = `in ${Math.round(timeUntil / 60)} hours`;
      } else {
        timeUntilStr = `in ${Math.round(timeUntil / 1440)} days`;
      }
      
      return {
        date: passDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: passDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        duration: duration,
        brightness,
        brightnessEmoji,
        timeUntil: timeUntilStr,
        isTonight: passDate.toDateString() === now.toDateString(),
      };
    });
    
    return passes;
  } catch (err) {
    console.error("Error fetching ISS passes:", err);
    return null;
  }
}
