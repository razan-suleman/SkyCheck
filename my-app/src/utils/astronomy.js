// Moon and planet calculations

export function getJulianDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

// Calculate moon phase: 0 = new, 0.5 = full
export function getMoonPhase(date) {
  let yr = date.getFullYear();
  let mo = date.getMonth() + 1;
  const day = date.getDate();
  
  if (mo < 3) {
    yr--;
    mo += 12;
  }
  
  ++mo;
  let c = 365.25 * yr;
  let e = 30.6 * mo;
  let jd = c + e + day - 694039.09;
  jd /= 29.53058867; // moon cycle length
  let b = parseInt(jd);
  jd -= b;
  
  return jd;
}

export function getMoonPhaseName(phase) {
  if (phase < 0.0625) return "New Moon";
  if (phase < 0.1875) return "Waxing Crescent";
  if (phase < 0.3125) return "First Quarter";
  if (phase < 0.4375) return "Waxing Gibbous";
  if (phase < 0.5625) return "Full Moon";
  if (phase < 0.6875) return "Waning Gibbous";
  if (phase < 0.8125) return "Last Quarter";
  if (phase < 0.9375) return "Waning Crescent";
  return "New Moon";
}

export function getMoonIllumination(phase) {
  // convert phase to percentage lit
  return Math.round(100 * (1 - Math.abs(phase * 2 - 1)));
}

export function getMoonImpact(illumination) {
  if (illumination > 75) return "High - Moon will wash out stars";
  if (illumination > 50) return "Moderate - Moon will affect viewing";
  if (illumination > 25) return "Low - Some moonlight";
  return "Minimal - Good conditions";
}

// Figure out which planets are visible tonight
export function calculatePlanetPositions(date, latitude, longitude, sunTimes) {
  const planets = [];
  const jd = getJulianDate(date);
  const hr = date.getHours();
  
  const isNight = sunTimes && (date >= sunTimes.sunsetDate && date <= sunTimes.sunriseDate);
  
  // Venus - evening/morning star
  const venusPos = ((jd * 0.617) % 360);
  if (venusPos < 47 || venusPos > 313) {
    const visible = (hr >= 18 && hr <= 21) || (hr >= 4 && hr <= 7);
    if (visible) {
      planets.push({
        name: "Venus",
        icon: "♀",
        visibility: venusPos < 47 ? "Evening (West)" : "Morning (East)",
        brightness: "Very Bright",
        color: "#FFD700",
        description: venusPos < 47 ? "Look west after sunset" : "Look east before sunrise"
      });
    }
  }
  
  // Mars - reddish one
  const marsPos = ((jd * 0.531) % 360);
  if (isNight && (marsPos > 150 && marsPos < 210)) {
    planets.push({
      name: "Mars",
      icon: "♂",
      visibility: "Night (South)",
      brightness: "Bright",
      color: "#FF6347",
      description: "Look south, appears reddish"
    });
  }
  
  // Jupiter - usually the brightest
  const jupiterPos = ((jd * 0.083) % 360);
  if (isNight && (jupiterPos > 120 && jupiterPos < 240)) {
    planets.push({
      name: "Jupiter",
      icon: "♃",
      visibility: "Night (South)",
      brightness: "Very Bright",
      color: "#DAA520",
      description: "Look south, brightest star-like object"
    });
  }
  
  // Saturn - the one with rings (but you need telescope to see them)
  const saturnPos = ((jd * 0.034) % 360);
  if (isNight && (saturnPos > 110 && saturnPos < 250)) {
    planets.push({
      name: "Saturn",
      icon: "♄",
      visibility: "Night (South)",
      brightness: "Bright",
      color: "#F4E4C1",
      description: "Look south, yellowish with steady light"
    });
  }
  
  return planets;
}

// Estimate light pollution using Bortle scale (1-9)
// Based on population - not super accurate but gives you an idea
export function estimateLightPollution(population, isRural = false) {
  let scale, desc, quality, color;
  
  if (isRural || population < 1000) {
    scale = 3;
    desc = "Rural Sky";
    quality = "Excellent - Milky Way visible";
    color = "#2d5016";
  } else if (population < 10000) {
    scale = 4;
    desc = "Rural/Suburban";
    quality = "Good - Milky Way visible with effort";
    color = "#4a7c59";
  } else if (population < 50000) {
    scale = 5;
    desc = "Suburban Sky";
    quality = "Fair - Milky Way hard to see";
    color = "#8b8f20";
  } else if (population < 250000) {
    scale = 6;
    desc = "Bright Suburban";
    quality = "Moderate - Only bright stars";
    color = "#b8860b";
  } else if (population < 1000000) {
    scale = 7;
    desc = "Suburban/Urban";
    quality = "Poor - Lots of light pollution";
    color = "#cd853f";
  } else {
    scale = 8;
    desc = "City Sky";
    quality = "Bad - Only planets and moon";
    color = "#8b4513";
  }
  
  return {
    bortleScale: scale,
    description: desc,
    quality,
    color,
  };
}
