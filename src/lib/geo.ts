export async function getGeoLocation(ip: string) {
  try {
    // If running locally or unable to determine IP, use default
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      return { city: 'Localhost', country: 'XX', lat: 0, lng: 0 };
    }

    const token = process.env.IPINFO_TOKEN;
    const url = token ? `https://ipinfo.io/${ip}/json?token=${token}` : `https://ipinfo.io/${ip}/json`;
    
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    
    let lat = null;
    let lng = null;
    
    if (data.loc) {
      const [latStr, lngStr] = data.loc.split(',');
      lat = parseFloat(latStr);
      lng = parseFloat(lngStr);
    }

    return {
      city: data.city || null,
      country: data.country || null,
      lat,
      lng
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return null;
  }
}
