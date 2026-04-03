// Scoring and rating calculations for stargazing conditions

/**
 * Helper function to clamp values within a range
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Convert numerical score to descriptive rating
 */
export function getSummary(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Okay";
  if (score >= 30) return "Poor";
  return "Bad";
}

/**
 * Build a human-readable explanation of current conditions
 */
export function buildReason({ cloud, humidity, precipitation, wind, moonIllumination }) {
  const reasons = [];

  // Check cloud cover
  if (cloud >= 70) reasons.push("very cloudy");
  else if (cloud >= 40) reasons.push("some cloud cover");

  // Check other weather factors
  if (humidity >= 80) reasons.push("high humidity");
  if (precipitation > 0) reasons.push("rain chance");
  if (wind >= 25) reasons.push("strong wind");
  
  if (moonIllumination > 75) reasons.push("bright moon");
  else if (moonIllumination > 50) reasons.push("moderate moonlight");

  if (reasons.length === 0) return "Clear enough for a decent stargazing session.";
  return `Main issues: ${reasons.join(", ")}.`;
}

/**
 * Calculate overall stargazing score based on weather and moon conditions
 */
export function calculateScore({ cloud, humidity, precipitation, wind, moonIllumination }) {
  let score = 100;

  score -= cloud * 0.6;
  score -= humidity * 0.1;

  if (precipitation > 0) score -= 20;
  if (wind > 25) score -= 10;
  
  // Reduce score based on moon brightness (bright moon reduces visibility)
  if (moonIllumination > 75) score -= 25;
  else if (moonIllumination > 50) score -= 15;
  else if (moonIllumination > 25) score -= 8;

  return Math.round(clamp(score, 0, 100));
}
