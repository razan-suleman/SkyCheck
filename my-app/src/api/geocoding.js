// Geocoding and location services

/**
 * Get user's current location using browser geolocation
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Convert city name to coordinates using Open-Meteo geocoding API
 */
export async function geocodeCity(cityName) {
  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
  
  const response = await fetch(geocodeUrl);
  
  if (!response.ok) {
    throw new Error("Failed to find city location.");
  }
  
  const data = await response.json();
  
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${cityName}" not found.`);
  }
  
  return {
    latitude: data.results[0].latitude,
    longitude: data.results[0].longitude,
    name: data.results[0].name,
    country: data.results[0].country,
    population: data.results[0].population || 0,
  };
}

/**
 * Reverse geocode: convert coordinates to city name
 * Uses OpenStreetMap's Nominatim API for free reverse geocoding
 */
export async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return "Your Location";
    }
    
    const data = await response.json();
    
    // Try to extract city/town name from the address
    const address = data.address;
    const cityName = address.city || address.town || address.village || address.municipality || address.county;
    
    if (cityName) {
      return cityName;
    }
    
    return "Your Location";
  } catch (err) {
    console.error("Reverse geocoding failed:", err);
    return "Your Location";
  }
}
