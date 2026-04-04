// Get ISS flyover times from Open Notify API
export async function fetchISSPasses(lat, lon) {
  try {
    const url = `http://api.open-notify.org/iss-pass.json?lat=${lat}&lon=${lon}&n=5`;
    const res = await fetch(url);
    
    if (!res.ok) return null;
    
    const data = await res.json();
    if (!data.response || data.response.length === 0) return [];
    
    // format each pass
    const passes = data.response.map(pass => {
      const passDate = new Date(pass.risetime * 1000);
      const mins = Math.round(pass.duration / 60);
      
      // longer duration = brighter pass (ISS is higher in the sky)
      let brightness = "Faint";
      if (mins >= 6) brightness = "Very Bright";
      else if (mins >= 4) brightness = "Bright";
      else if (mins >= 2) brightness = "Moderate";
      
      const now = new Date();
      const minsUntil = Math.round((passDate - now) / 1000 / 60);
      let timeStr = "";
      
      if (minsUntil < 60) timeStr = `in ${minsUntil} min`;
      else if (minsUntil < 1440) timeStr = `in ${Math.round(minsUntil / 60)} hours`;
      else timeStr = `in ${Math.round(minsUntil / 1440)} days`;
      
      return {
        date: passDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: passDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        duration: mins,
        brightness,
        timeUntil: timeStr,
        isTonight: passDate.toDateString() === now.toDateString(),
      };
    });
    
    return passes;
  } catch (err) {
    console.error("Error fetching ISS passes:", err);
    return null;
  }
}
