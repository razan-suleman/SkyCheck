// Astronomy calculations for moon, planets, and celestial events

/**
 * Convert date to Julian Day Number for astronomical calculations
 */
export function getJulianDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Calculate moon phase (0 = new moon, 0.5 = full moon, 1 = new moon again)
 */
export function getMoonPhase(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();
  
  let c, e, jd, b;
  
  if (month < 3) {
    year--;
    month += 12;
  }
  
  ++month;
  c = 365.25 * year;
  e = 30.6 * month;
  jd = c + e + day - 694039.09; // Julian date relative to Jan 1, 1900
  jd /= 29.53058867; // Divide by the Moon cycle
  b = parseInt(jd);
  jd -= b; // Decimal part is moon phase
  
  return jd;
}

/**
 * Get the name of the moon phase
 */
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

/**
 * Convert moon phase to illumination percentage
 * Full moon (0.5) = 100%, New moon (0 or 1) = 0%
 */
export function getMoonIllumination(phase) {
  return Math.round(100 * (1 - Math.abs(phase * 2 - 1)));
}

/**
 * Get the impact description of moon brightness on stargazing
 */
export function getMoonImpact(illumination) {
  if (illumination > 75) return "High - Moon will significantly reduce visibility";
  if (illumination > 50) return "Moderate - Moon will affect viewing";
  if (illumination > 25) return "Low - Some moon light present";
  return "Minimal - Good conditions";
}

/**
 * Calculate which planets are visible tonight
 * Uses simplified orbital mechanics - good enough for hobby stargazing!
 */
export function calculatePlanetPositions(date, latitude, longitude, sunTimes) {
  const planets = [];
  const jd = getJulianDate(date);
  const hour = date.getHours();
  
  // Check if it's nighttime (between sunset and sunrise)
  const isNight = sunTimes && (
    date >= sunTimes.sunsetDate && date <= sunTimes.sunriseDate
  );
  
  // Venus - visible in evening or morning
  const venusElongation = ((jd * 0.617) % 360);
  if (venusElongation < 47 || venusElongation > 313) {
    const venusVisible = (hour >= 18 && hour <= 21) || (hour >= 4 && hour <= 7);
    if (venusVisible) {
      planets.push({
        name: "Venus",
        icon: "♀",
        visibility: venusElongation < 47 ? "Evening (West)" : "Morning (East)",
        brightness: "Very Bright",
        color: "#FFD700",
        description: venusElongation < 47 ? "Look west after sunset" : "Look east before sunrise"
      });
    }
  }
  
  // Mars - visible when opposition or near
  const marsPosition = ((jd * 0.531) % 360);
  if (isNight && (marsPosition > 150 && marsPosition < 210)) {
    planets.push({
      name: "Mars",
      icon: "♂",
      visibility: "Night (South)",
      brightness: "Bright",
      color: "#FF6347",
      description: "Look south, appears reddish"
    });
  }
  
  // Jupiter - visible most of the year
  const jupiterPosition = ((jd * 0.083) % 360);
  if (isNight && (jupiterPosition > 120 && jupiterPosition < 240)) {
    planets.push({
      name: "Jupiter",
      icon: "♃",
      visibility: "Night (South)",
      brightness: "Very Bright",
      color: "#DAA520",
      description: "Look south, brightest star-like object"
    });
  }
  
  // Saturn - visible when in favorable position
  const saturnPosition = ((jd * 0.034) % 360);
  if (isNight && (saturnPosition > 110 && saturnPosition < 250)) {
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

/**
 * Estimate light pollution based on population density
 * Uses Bortle Scale (1-9, where 1 is darkest and 9 is brightest sky)
 */
export function estimateLightPollution(population, isRural = false) {
  let bortleScale;
  let description;
  let quality;
  let color;
  
  if (isRural || population < 1000) {
    bortleScale = 3;
    description = "Rural Sky";
    quality = "Excellent - Milky Way visible";
    color = "#2d5016";
  } else if (population < 10000) {
    bortleScale = 4;
    description = "Rural/Suburban Transition";
    quality = "Good - Milky Way visible with effort";
    color = "#4a7c59";
  } else if (population < 50000) {
    bortleScale = 5;
    description = "Suburban Sky";
    quality = "Fair - Milky Way difficult to see";
    color = "#8b8f20";
  } else if (population < 250000) {
    bortleScale = 6;
    description = "Bright Suburban Sky";
    quality = "Moderate - Only bright stars visible";
    color = "#b8860b";
  } else if (population < 1000000) {
    bortleScale = 7;
    description = "Suburban/Urban Transition";
    quality = "Poor - Significant light pollution";
    color = "#cd853f";
  } else {
    bortleScale = 8;
    description = "City Sky";
    quality = "Bad - Only planets and moon visible";
    color = "#8b4513";
  }
  
  return {
    bortleScale,
    description,
    quality,
    color,
  };
}
