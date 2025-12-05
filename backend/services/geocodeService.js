const https = require('https');

// Try OpenStreetMap Nominatim first (free, no API key)
const geocodeWithNominatim = (address) => {
  return new Promise((resolve, reject) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    const options = {
      headers: {
        'User-Agent': 'BloodLink/1.0 (College Project)'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results && results.length > 0) {
            resolve({
              lat: parseFloat(results[0].lat),
              lng: parseFloat(results[0].lon)
            });
          } else {
            reject(new Error('Address not found in OpenStreetMap'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
};

// Google Geocoding API (if API key is provided)
const geocodeWithGoogle = (address) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error('Google API key not configured'));
      return;
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === 'OK' && result.results.length > 0) {
            const location = result.results[0].geometry.location;
            resolve({
              lat: location.lat,
              lng: location.lng
            });
          } else {
            reject(new Error('Address not found: ' + result.status));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
};

// Main geocode function - tries Nominatim first, then Google if available
const geocodeAddress = async (address) => {
  if (!address || address.trim() === '') {
    return null;
  }

  // Try Nominatim first (free)
  try {
    const result = await geocodeWithNominatim(address);
    console.log('Geocoded with Nominatim:', address);
    return result;
  } catch (nominatimError) {
    console.log('Nominatim failed:', nominatimError.message);
  }

  // Try Google if API key is configured
  if (process.env.GOOGLE_MAPS_API_KEY) {
    try {
      const result = await geocodeWithGoogle(address);
      console.log('Geocoded with Google:', address);
      return result;
    } catch (googleError) {
      console.log('Google geocoding failed:', googleError.message);
    }
  }

  // Return null if all geocoding fails - app will still work without coordinates
  console.log('Geocoding failed for address, continuing without coordinates:', address);
  return null;
};

module.exports = {
  geocodeAddress
};
