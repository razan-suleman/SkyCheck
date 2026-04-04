export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

export async function geocodeCity(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  
  if (!res.ok) throw new Error("Failed to find city location.");
  
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${cityName}" not found.`);
  }
  
  const result = data.results[0];
  return {
    latitude: result.latitude,
    longitude: result.longitude,
    name: result.name,
    country: result.country,
    population: result.population || 0,
  };
}

// Convert coordinates back to city name using OSM Nominatim
export async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`;
    const res = await fetch(url);
    if (!res.ok) return "Your Location";
    
    const data = await res.json();
    const addr = data.address;
    
    // try to find a city name in the response
    const city = addr.city || addr.town || addr.village || addr.municipality || addr.county;
    return city || "Your Location";
  } catch (err) {
    return "Your Location";
  }
}
