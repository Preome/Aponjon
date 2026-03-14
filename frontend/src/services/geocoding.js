// Free geocoding using OpenStreetMap's Nominatim
// No API key required, completely free

export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    return {
      address: data.display_name,
      city: data.address?.city || data.address?.town || data.address?.village || '',
      country: data.address?.country || ''
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};