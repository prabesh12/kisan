export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @returns Distance in kilometers.
 */
export const calculateDistance = (p1: Coordinates, p2: Coordinates): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
  const dLng = (p2.lng - p1.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * (Math.PI / 180)) *
      Math.cos(p2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Formats distance for display.
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

/**
 * Browsers Geolocation API wrapper.
 */
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    }
  });
};
/**
 * Fetches the city/town name from coordinates using Nominatim Reverse Geocoding.
 */
export const fetchCityName = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'Kisan-Marketplace-App'
        }
      }
    );
    const data = await response.json();
    // Prioritize village, town, city, or county names
    const address = data.address;
    return address.village || address.town || address.city || address.county || address.suburb || 'Unknown Location';
  } catch (error) {
    console.error('Error fetching city name:', error);
    return 'Unknown Location';
  }
};
