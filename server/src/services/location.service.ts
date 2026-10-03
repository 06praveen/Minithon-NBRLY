/**
 * NBRLY Location & Geocoding Intelligence Service
 * Handles Haversine distance calculations, geocoding with OpenStreetMap Nominatim,
 * and robust local caching for neighborhood locations.
 */

export interface LocationCoordinates {
  locationName: string;
  latitude: number;
  longitude: number;
}

// Curated dictionary of well-known Mumbai & Maharashtra locations for zero-latency, reliable resolution
const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number; standardName: string }> = {
  // Bandra
  'bandra west': { lat: 19.0596, lng: 72.8295, standardName: 'Bandra West, Mumbai' },
  'bandra east': { lat: 19.0607, lng: 72.8465, standardName: 'Bandra East, Mumbai' },
  'bandra': { lat: 19.0596, lng: 72.8295, standardName: 'Bandra West, Mumbai' },
  'pali hill': { lat: 19.0645, lng: 72.8272, standardName: 'Pali Hill, Bandra West' },
  'carter road': { lat: 19.0682, lng: 72.8226, standardName: 'Carter Road, Bandra West' },
  'hill road': { lat: 19.0560, lng: 72.8330, standardName: 'Hill Road, Bandra West' },
  'bkc': { lat: 19.0657, lng: 72.8682, standardName: 'Bandra Kurla Complex, Mumbai' },

  // Khar
  'khar west': { lat: 19.0699, lng: 72.8335, standardName: 'Khar West, Mumbai' },
  'khar east': { lat: 19.0715, lng: 72.8440, standardName: 'Khar East, Mumbai' },
  'khar': { lat: 19.0699, lng: 72.8335, standardName: 'Khar West, Mumbai' },

  // Santacruz
  'santacruz west': { lat: 19.0843, lng: 72.8360, standardName: 'Santacruz West, Mumbai' },
  'santacruz east': { lat: 19.0805, lng: 72.8510, standardName: 'Santacruz East, Mumbai' },
  'santacruz': { lat: 19.0843, lng: 72.8360, standardName: 'Santacruz West, Mumbai' },

  // Juhu & Vile Parle
  'juhu': { lat: 19.1075, lng: 72.8263, standardName: 'Juhu, Mumbai' },
  'vile parle west': { lat: 19.0998, lng: 72.8436, standardName: 'Vile Parle West, Mumbai' },
  'vile parle east': { lat: 19.0980, lng: 72.8520, standardName: 'Vile Parle East, Mumbai' },
  'vile parle': { lat: 19.0998, lng: 72.8436, standardName: 'Vile Parle West, Mumbai' },

  // Andheri
  'andheri east': { lat: 19.1155, lng: 72.8697, standardName: 'Andheri East, Mumbai' },
  'andheri west': { lat: 19.1197, lng: 72.8464, standardName: 'Andheri West, Mumbai' },
  'andheri': { lat: 19.1197, lng: 72.8464, standardName: 'Andheri West, Mumbai' },
  'lokhandwala': { lat: 19.1412, lng: 72.8258, standardName: 'Lokhandwala, Andheri West' },
  'marol': { lat: 19.1176, lng: 72.8856, standardName: 'Marol, Andheri East' },
  'sakinaka': { lat: 19.1060, lng: 72.8860, standardName: 'Sakinaka, Andheri East' },

  // Powai & East Suburbs
  'powai': { lat: 19.1197, lng: 72.9051, standardName: 'Powai, Mumbai' },
  'iit bombay': { lat: 19.1334, lng: 72.9133, standardName: 'IIT Bombay, Powai' },
  'ghatkopar east': { lat: 19.0830, lng: 72.9150, standardName: 'Ghatkopar East, Mumbai' },
  'ghatkopar west': { lat: 19.0860, lng: 72.9080, standardName: 'Ghatkopar West, Mumbai' },
  'ghatkopar': { lat: 19.0860, lng: 72.9080, standardName: 'Ghatkopar, Mumbai' },
  'chembur': { lat: 19.0622, lng: 72.8973, standardName: 'Chembur, Mumbai' },
  'kurla': { lat: 19.0726, lng: 72.8845, standardName: 'Kurla, Mumbai' },
  'vikhroli': { lat: 19.1110, lng: 72.9278, standardName: 'Vikhroli, Mumbai' },
  'kanjurmarg': { lat: 19.1310, lng: 72.9340, standardName: 'Kanjurmarg, Mumbai' },
  'bhandup': { lat: 19.1520, lng: 72.9370, standardName: 'Bhandup, Mumbai' },
  'mulund west': { lat: 19.1726, lng: 72.9425, standardName: 'Mulund West, Mumbai' },
  'mulund east': { lat: 19.1710, lng: 72.9560, standardName: 'Mulund East, Mumbai' },
  'mulund': { lat: 19.1726, lng: 72.9425, standardName: 'Mulund West, Mumbai' },

  // North Suburbs
  'goregaon west': { lat: 19.1646, lng: 72.8400, standardName: 'Goregaon West, Mumbai' },
  'goregaon east': { lat: 19.1680, lng: 72.8580, standardName: 'Goregaon East, Mumbai' },
  'goregaon': { lat: 19.1646, lng: 72.8493, standardName: 'Goregaon, Mumbai' },
  'malad west': { lat: 19.1860, lng: 72.8485, standardName: 'Malad West, Mumbai' },
  'malad east': { lat: 19.1840, lng: 72.8640, standardName: 'Malad East, Mumbai' },
  'malad': { lat: 19.1860, lng: 72.8485, standardName: 'Malad West, Mumbai' },
  'kandivali west': { lat: 19.2060, lng: 72.8360, standardName: 'Kandivali West, Mumbai' },
  'kandivali east': { lat: 19.2040, lng: 72.8680, standardName: 'Kandivali East, Mumbai' },
  'kandivali': { lat: 19.2060, lng: 72.8360, standardName: 'Kandivali, Mumbai' },
  'borivali west': { lat: 19.2307, lng: 72.8450, standardName: 'Borivali West, Mumbai' },
  'borivali east': { lat: 19.2290, lng: 72.8650, standardName: 'Borivali East, Mumbai' },
  'borivali': { lat: 19.2307, lng: 72.8567, standardName: 'Borivali, Mumbai' },
  'dahisar': { lat: 19.2570, lng: 72.8630, standardName: 'Dahisar, Mumbai' },

  // South / Central Mumbai
  'dadar west': { lat: 19.0178, lng: 72.8420, standardName: 'Dadar West, Mumbai' },
  'dadar east': { lat: 19.0180, lng: 72.8510, standardName: 'Dadar East, Mumbai' },
  'dadar': { lat: 19.0178, lng: 72.8478, standardName: 'Dadar, Mumbai' },
  'matunga': { lat: 19.0270, lng: 72.8550, standardName: 'Matunga, Mumbai' },
  'sion': { lat: 19.0400, lng: 72.8630, standardName: 'Sion, Mumbai' },
  'lower parel': { lat: 19.0010, lng: 72.8300, standardName: 'Lower Parel, Mumbai' },
  'worli': { lat: 19.0166, lng: 72.8167, standardName: 'Worli, Mumbai' },
  'prabhadevi': { lat: 19.0160, lng: 72.8280, standardName: 'Prabhadevi, Mumbai' },
  'colaba': { lat: 18.9067, lng: 72.8147, standardName: 'Colaba, Mumbai' },
  'fort': { lat: 18.9320, lng: 72.8340, standardName: 'Fort, Mumbai' },
  'marine lines': { lat: 18.9430, lng: 72.8230, standardName: 'Marine Lines, Mumbai' },
  'nariman point': { lat: 18.9260, lng: 72.8220, standardName: 'Nariman Point, Mumbai' },

  // Thane & Navi Mumbai
  'thane west': { lat: 19.1970, lng: 72.9634, standardName: 'Thane West, Maharashtra' },
  'thane east': { lat: 19.1860, lng: 72.9750, standardName: 'Thane East, Maharashtra' },
  'thane': { lat: 19.2183, lng: 72.9781, standardName: 'Thane, Maharashtra' },
  'navi mumbai': { lat: 19.0330, lng: 73.0297, standardName: 'Navi Mumbai' },
  'vashi': { lat: 19.0770, lng: 72.9980, standardName: 'Vashi, Navi Mumbai' },
  'nerul': { lat: 19.0330, lng: 73.0180, standardName: 'Nerul, Navi Mumbai' },
  'belapur': { lat: 19.0180, lng: 73.0400, standardName: 'CBD Belapur, Navi Mumbai' },
  'kharghar': { lat: 19.0470, lng: 73.0690, standardName: 'Kharghar, Navi Mumbai' },
  'panvel': { lat: 18.9900, lng: 73.1170, standardName: 'Panvel, Navi Mumbai' },
  'kalyan': { lat: 19.2437, lng: 73.1355, standardName: 'Kalyan, Maharashtra' },
  'dombivli': { lat: 19.2184, lng: 73.0867, standardName: 'Dombivli, Maharashtra' },
  'mira road': { lat: 19.2812, lng: 72.8561, standardName: 'Mira Road, Maharashtra' },
  'bhayandar': { lat: 19.3000, lng: 72.8500, standardName: 'Bhayandar, Maharashtra' },

  // City broad fallback
  'mumbai': { lat: 19.0760, lng: 72.8777, standardName: 'Mumbai, Maharashtra' },
};

// Runtime cache for dynamic geocoding queries
const runtimeGeocodingCache = new Map<string, LocationCoordinates>();

export class LocationService {
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    return this.calculateDistanceKm(lat1, lon1, lat2, lon2);
  }

  /**
   * Calculate distance in kilometers between two geographic coordinates using the Haversine formula.
   * Returns rounded distance in km (1 decimal place, e.g. 2.4).
   */
  static calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    if (
      lat1 === undefined || lat1 === null ||
      lon1 === undefined || lon1 === null ||
      lat2 === undefined || lat2 === null ||
      lon2 === undefined || lon2 === null
    ) {
      return 0;
    }

    const R = 6371; // Earth's mean radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10;
  }

  /**
   * Geocode a neighborhood or area name into latitude, longitude, and formatted name.
   * First checks known curated locations (sorted longest key first), then dynamic cache, then OpenStreetMap Nominatim.
   */
  static async geocode(query: string): Promise<LocationCoordinates | null> {
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return null;
    }

    const clean = query.trim();
    const normalized = clean.toLowerCase();

    // 1. Check known locations dictionary, sorting keys by length descending
    // This ensures specific multi-word locations (e.g. 'andheri east') match before generic ones ('andheri')
    const sortedEntries = Object.entries(KNOWN_LOCATIONS).sort(
      (a, b) => b[0].length - a[0].length
    );

    for (const [key, value] of sortedEntries) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return {
          locationName: clean.includes(',') ? clean : value.standardName,
          latitude: value.lat,
          longitude: value.lng,
        };
      }
    }

    // 2. Check runtime cache
    if (runtimeGeocodingCache.has(normalized)) {
      return runtimeGeocodingCache.get(normalized)!;
    }

    // 3. Fallback to OpenStreetMap Nominatim
    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        clean
      )}&limit=1`;

      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'NBRLY-Neighborhood-App/1.0 (hackathon@nbrly.org)',
          'Accept-Language': 'en',
        },
        signal: AbortSignal.timeout(3500),
      });

      if (!response.ok) {
        return null;
      }

      const results = (await response.json()) as any[];
      if (results && results.length > 0) {
        const first = results[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);

        if (!isNaN(lat) && !isNaN(lng)) {
          const displayName = first.display_name?.split(',').slice(0, 3).join(',').trim() || clean;
          const result: LocationCoordinates = {
            locationName: displayName,
            latitude: lat,
            longitude: lng,
          };
          runtimeGeocodingCache.set(normalized, result);
          return result;
        }
      }
    } catch {
      // Nominatim unreachable or timed out
    }

    return null;
  }
}
