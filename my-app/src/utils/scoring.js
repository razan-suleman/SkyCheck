export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getSummary(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Okay";
  if (score >= 30) return "Poor";
  return "Bad";
}

export function buildReason({ cloud, humidity, precipitation, wind, moonIllumination }) {
  const issues = [];
  
  if (cloud >= 70) issues.push("very cloudy");
  else if (cloud >= 40) issues.push("some clouds");
  
  if (humidity >= 80) issues.push("high humidity");
  if (precipitation > 0) issues.push("rain");
  if (wind >= 25) issues.push("windy");
  if (moonIllumination > 75) issues.push("bright moon");
  else if (moonIllumination > 50) issues.push("some moonlight");
  
  return issues.length === 0 
    ? "Conditions look pretty good!" 
    : `Issues: ${issues.join(", ")}.`;
}

export function calculateScore({ cloud, humidity, precipitation, wind, moonIllumination }) {
  let score = 100;
  
  // cloud cover is the biggest factor
  score -= cloud * 0.6;
  score -= humidity * 0.1;
  
  // any rain is bad news
  if (precipitation > 0) score -= 20;
  if (wind > 25) score -= 10;
  
  // moon penalizes score
  if (moonIllumination > 75) score -= 25;
  else if (moonIllumination > 50) score -= 15;
  else if (moonIllumination > 25) score -= 8;
  
  return Math.round(clamp(score, 0, 100));
}
