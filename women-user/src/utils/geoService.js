/**
 * Device geolocation and OpenStreetMap-based reverse geocoding.
 * SOS coordinates come from the device, not profile-city or IP estimates.
 */

export const ALL_INDIA_CITIES = {
  // Gujarat
  amreli: { lat: 21.6032, lng: 71.2221, name: "Amreli", state: "Gujarat" },
  rajkot: { lat: 22.3039, lng: 70.8022, name: "Rajkot", state: "Gujarat" },
  vadodara: { lat: 22.3072, lng: 73.1812, name: "Vadodara", state: "Gujarat" },
  baroda: { lat: 22.3072, lng: 73.1812, name: "Vadodara", state: "Gujarat" },
  ahmedabad: {
    lat: 23.0225,
    lng: 72.5714,
    name: "Ahmedabad",
    state: "Gujarat",
  },
  surat: { lat: 21.1702, lng: 72.8311, name: "Surat", state: "Gujarat" },
  bhavnagar: {
    lat: 21.7645,
    lng: 72.1519,
    name: "Bhavnagar",
    state: "Gujarat",
  },
  junagadh: { lat: 21.5222, lng: 70.4579, name: "Junagadh", state: "Gujarat" },
  jamnagar: { lat: 22.4707, lng: 70.0577, name: "Jamnagar", state: "Gujarat" },
  gandhinagar: {
    lat: 23.2156,
    lng: 72.6369,
    name: "Gandhinagar",
    state: "Gujarat",
  },
  anand: { lat: 22.5645, lng: 72.9289, name: "Anand", state: "Gujarat" },
  nadiad: { lat: 22.6916, lng: 72.8634, name: "Nadiad", state: "Gujarat" },
  navsari: { lat: 20.95, lng: 72.93, name: "Navsari", state: "Gujarat" },
  valsad: { lat: 20.61, lng: 72.93, name: "Valsad", state: "Gujarat" },
  vapi: { lat: 20.3893, lng: 72.9106, name: "Vapi", state: "Gujarat" },
  bharuch: { lat: 21.7051, lng: 72.9959, name: "Bharuch", state: "Gujarat" },
  surendranagar: {
    lat: 22.7284,
    lng: 71.637,
    name: "Surendranagar",
    state: "Gujarat",
  },
  porbandar: {
    lat: 21.6417,
    lng: 69.6293,
    name: "Porbandar",
    state: "Gujarat",
  },
  patan: { lat: 23.85, lng: 72.1167, name: "Patan", state: "Gujarat" },
  mehsana: { lat: 23.6, lng: 72.4, name: "Mehsana", state: "Gujarat" },
  bhuj: { lat: 23.242, lng: 69.6669, name: "Bhuj", state: "Gujarat" },
  veraval: { lat: 20.9, lng: 70.3667, name: "Veraval", state: "Gujarat" },
  gondal: { lat: 21.9667, lng: 70.8, name: "Gondal", state: "Gujarat" },
  morbi: { lat: 22.8167, lng: 70.8333, name: "Morbi", state: "Gujarat" },
  palanpur: { lat: 24.1717, lng: 72.4333, name: "Palanpur", state: "Gujarat" },
  mahuva: { lat: 21.0901, lng: 71.769, name: "Mahuva", state: "Gujarat" },
  bagasara: { lat: 21.4833, lng: 71.0, name: "Bagasara", state: "Gujarat" },
  savarkundla: {
    lat: 21.3333,
    lng: 71.3,
    name: "Savarkundla",
    state: "Gujarat",
  },
  dhari: { lat: 21.3297, lng: 71.0239, name: "Dhari", state: "Gujarat" },
  rajula: { lat: 20.9997, lng: 71.4331, name: "Rajula", state: "Gujarat" },
  jafrabad: { lat: 20.8667, lng: 71.3667, name: "Jafrabad", state: "Gujarat" },
  lathi: { lat: 21.7208, lng: 71.3867, name: "Lathi", state: "Gujarat" },
  babra: { lat: 21.85, lng: 71.3, name: "Babra", state: "Gujarat" },
  botad: { lat: 22.17, lng: 71.67, state: "Gujarat" },
  dwarka: { lat: 22.2442, lng: 68.9685, name: "Dwarka", state: "Gujarat" },
  somnath: { lat: 20.888, lng: 70.4012, name: "Somnath", state: "Gujarat" },

  // Maharashtra
  mumbai: { lat: 19.076, lng: 72.8777, name: "Mumbai", state: "Maharashtra" },
  bombay: { lat: 19.076, lng: 72.8777, name: "Mumbai", state: "Maharashtra" },
  pune: { lat: 18.5204, lng: 73.8567, name: "Pune", state: "Maharashtra" },
  nagpur: { lat: 21.1458, lng: 79.0882, name: "Nagpur", state: "Maharashtra" },
  thane: { lat: 19.2183, lng: 72.9781, name: "Thane", state: "Maharashtra" },
  nashik: { lat: 19.9975, lng: 73.7898, name: "Nashik", state: "Maharashtra" },
  aurangabad: {
    lat: 19.8762,
    lng: 75.3433,
    name: "Chhatrapati Sambhajinagar",
    state: "Maharashtra",
  },
  "chhatrapati sambhajinagar": {
    lat: 19.8762,
    lng: 75.3433,
    name: "Chhatrapati Sambhajinagar",
    state: "Maharashtra",
  },
  solapur: {
    lat: 17.6599,
    lng: 75.9064,
    name: "Solapur",
    state: "Maharashtra",
  },
  kolhapur: {
    lat: 16.705,
    lng: 74.2433,
    name: "Kolhapur",
    state: "Maharashtra",
  },
  "navi mumbai": {
    lat: 19.033,
    lng: 73.0297,
    name: "Navi Mumbai",
    state: "Maharashtra",
  },
  amravati: {
    lat: 20.9374,
    lng: 77.7796,
    name: "Amravati",
    state: "Maharashtra",
  },
  nanded: { lat: 19.1383, lng: 77.321, name: "Nanded", state: "Maharashtra" },
  jalgaon: {
    lat: 21.0077,
    lng: 75.5626,
    name: "Jalgaon",
    state: "Maharashtra",
  },

  // Delhi NCR
  delhi: { lat: 28.6139, lng: 77.209, name: "Delhi", state: "Delhi" },
  "new delhi": { lat: 28.6139, lng: 77.209, name: "New Delhi", state: "Delhi" },
  noida: { lat: 28.5355, lng: 77.391, name: "Noida", state: "Uttar Pradesh" },
  "greater noida": {
    lat: 28.4744,
    lng: 77.504,
    name: "Greater Noida",
    state: "Uttar Pradesh",
  },
  gurgaon: { lat: 28.4595, lng: 77.0266, name: "Gurugram", state: "Haryana" },
  gurugram: { lat: 28.4595, lng: 77.0266, name: "Gurugram", state: "Haryana" },
  faridabad: {
    lat: 28.4089,
    lng: 77.3178,
    name: "Faridabad",
    state: "Haryana",
  },
  ghaziabad: {
    lat: 28.6692,
    lng: 77.4538,
    name: "Ghaziabad",
    state: "Uttar Pradesh",
  },

  // Karnataka
  bengaluru: {
    lat: 12.9716,
    lng: 77.5946,
    name: "Bengaluru",
    state: "Karnataka",
  },
  bangalore: {
    lat: 12.9716,
    lng: 77.5946,
    name: "Bengaluru",
    state: "Karnataka",
  },
  mysore: { lat: 12.2958, lng: 76.6394, name: "Mysuru", state: "Karnataka" },
  mysuru: { lat: 12.2958, lng: 76.6394, name: "Mysuru", state: "Karnataka" },
  hubli: { lat: 15.3647, lng: 75.124, name: "Hubli", state: "Karnataka" },
  mangalore: {
    lat: 12.9141,
    lng: 74.856,
    name: "Mangaluru",
    state: "Karnataka",
  },
  mangaluru: {
    lat: 12.9141,
    lng: 74.856,
    name: "Mangaluru",
    state: "Karnataka",
  },
  belgaum: { lat: 15.8497, lng: 74.4977, name: "Belagavi", state: "Karnataka" },

  // Tamil Nadu
  chennai: { lat: 13.0827, lng: 80.2707, name: "Chennai", state: "Tamil Nadu" },
  madras: { lat: 13.0827, lng: 80.2707, name: "Chennai", state: "Tamil Nadu" },
  coimbatore: {
    lat: 11.0168,
    lng: 76.9558,
    name: "Coimbatore",
    state: "Tamil Nadu",
  },
  madurai: { lat: 9.9252, lng: 78.1198, name: "Madurai", state: "Tamil Nadu" },
  trichy: {
    lat: 10.7905,
    lng: 78.7047,
    name: "Tiruchirappalli",
    state: "Tamil Nadu",
  },
  tiruchirappalli: {
    lat: 10.7905,
    lng: 78.7047,
    name: "Tiruchirappalli",
    state: "Tamil Nadu",
  },
  salem: { lat: 11.6643, lng: 78.146, name: "Salem", state: "Tamil Nadu" },
  tirunelveli: {
    lat: 8.7139,
    lng: 77.7567,
    name: "Tirunelveli",
    state: "Tamil Nadu",
  },

  // Telangana
  hyderabad: {
    lat: 17.385,
    lng: 78.4867,
    name: "Hyderabad",
    state: "Telangana",
  },
  warangal: {
    lat: 17.9689,
    lng: 79.5941,
    name: "Warangal",
    state: "Telangana",
  },
  nizamabad: {
    lat: 18.6725,
    lng: 78.0941,
    name: "Nizamabad",
    state: "Telangana",
  },

  // Andhra Pradesh
  visakhapatnam: {
    lat: 17.6868,
    lng: 83.2185,
    name: "Visakhapatnam",
    state: "Andhra Pradesh",
  },
  vijayawada: {
    lat: 16.5062,
    lng: 80.648,
    name: "Vijayawada",
    state: "Andhra Pradesh",
  },
  guntur: {
    lat: 16.3067,
    lng: 80.4365,
    name: "Guntur",
    state: "Andhra Pradesh",
  },
  tirupati: {
    lat: 13.6288,
    lng: 79.4192,
    name: "Tirupati",
    state: "Andhra Pradesh",
  },
  nellore: {
    lat: 14.4426,
    lng: 79.9865,
    name: "Nellore",
    state: "Andhra Pradesh",
  },

  // West Bengal
  kolkata: {
    lat: 22.5726,
    lng: 88.3639,
    name: "Kolkata",
    state: "West Bengal",
  },
  calcutta: {
    lat: 22.5726,
    lng: 88.3639,
    name: "Kolkata",
    state: "West Bengal",
  },
  howrah: { lat: 22.5958, lng: 88.2636, name: "Howrah", state: "West Bengal" },
  durgapur: {
    lat: 23.5204,
    lng: 87.3119,
    name: "Durgapur",
    state: "West Bengal",
  },
  asansol: {
    lat: 23.6739,
    lng: 86.9524,
    name: "Asansol",
    state: "West Bengal",
  },
  siliguri: {
    lat: 26.7271,
    lng: 88.3953,
    name: "Siliguri",
    state: "West Bengal",
  },
  darjeeling: {
    lat: 27.041,
    lng: 88.2663,
    name: "Darjeeling",
    state: "West Bengal",
  },

  // Rajasthan
  jaipur: { lat: 26.9124, lng: 75.7873, name: "Jaipur", state: "Rajasthan" },
  jodhpur: { lat: 26.2389, lng: 73.0243, name: "Jodhpur", state: "Rajasthan" },
  udaipur: { lat: 24.5854, lng: 73.7125, name: "Udaipur", state: "Rajasthan" },
  kota: { lat: 25.2138, lng: 75.8648, name: "Kota", state: "Rajasthan" },
  bikaner: { lat: 28.0229, lng: 73.3119, name: "Bikaner", state: "Rajasthan" },
  ajmer: { lat: 26.4499, lng: 74.6399, name: "Ajmer", state: "Rajasthan" },

  // Uttar Pradesh
  lucknow: {
    lat: 26.8467,
    lng: 80.9462,
    name: "Lucknow",
    state: "Uttar Pradesh",
  },
  kanpur: {
    lat: 26.4499,
    lng: 80.3319,
    name: "Kanpur",
    state: "Uttar Pradesh",
  },
  varanasi: {
    lat: 25.3176,
    lng: 82.9739,
    name: "Varanasi",
    state: "Uttar Pradesh",
  },
  banaras: {
    lat: 25.3176,
    lng: 82.9739,
    name: "Varanasi",
    state: "Uttar Pradesh",
  },
  agra: { lat: 27.1767, lng: 78.0081, name: "Agra", state: "Uttar Pradesh" },
  prayagraj: {
    lat: 25.4358,
    lng: 81.8463,
    name: "Prayagraj",
    state: "Uttar Pradesh",
  },
  allahabad: {
    lat: 25.4358,
    lng: 81.8463,
    name: "Prayagraj",
    state: "Uttar Pradesh",
  },
  meerut: {
    lat: 28.9845,
    lng: 77.7064,
    name: "Meerut",
    state: "Uttar Pradesh",
  },
  bareilly: {
    lat: 28.367,
    lng: 79.4304,
    name: "Bareilly",
    state: "Uttar Pradesh",
  },
  aligarh: {
    lat: 27.8974,
    lng: 78.088,
    name: "Aligarh",
    state: "Uttar Pradesh",
  },
  moradabad: {
    lat: 28.8386,
    lng: 78.7733,
    name: "Moradabad",
    state: "Uttar Pradesh",
  },
  gorakhpur: {
    lat: 26.7606,
    lng: 83.3732,
    name: "Gorakhpur",
    state: "Uttar Pradesh",
  },
  ayodhya: {
    lat: 26.7922,
    lng: 82.1998,
    name: "Ayodhya",
    state: "Uttar Pradesh",
  },
  mathura: {
    lat: 27.4924,
    lng: 77.6737,
    name: "Mathura",
    state: "Uttar Pradesh",
  },

  // Madhya Pradesh
  bhopal: {
    lat: 23.2599,
    lng: 77.4126,
    name: "Bhopal",
    state: "Madhya Pradesh",
  },
  indore: {
    lat: 22.7196,
    lng: 75.8577,
    name: "Indore",
    state: "Madhya Pradesh",
  },
  jabalpur: {
    lat: 23.1815,
    lng: 79.9864,
    name: "Jabalpur",
    state: "Madhya Pradesh",
  },
  gwalior: {
    lat: 26.2183,
    lng: 78.1828,
    name: "Gwalior",
    state: "Madhya Pradesh",
  },
  ujjain: {
    lat: 23.1765,
    lng: 75.7885,
    name: "Ujjain",
    state: "Madhya Pradesh",
  },

  // Bihar
  patna: { lat: 25.5941, lng: 85.1376, name: "Patna", state: "Bihar" },
  gaya: { lat: 24.7914, lng: 85.0002, name: "Gaya", state: "Bihar" },
  muzaffarpur: {
    lat: 26.1209,
    lng: 85.3647,
    name: "Muzaffarpur",
    state: "Bihar",
  },
  bhagalpur: { lat: 25.2425, lng: 86.9842, name: "Bhagalpur", state: "Bihar" },
  darbhanga: { lat: 26.1542, lng: 85.8918, name: "Darbhanga", state: "Bihar" },

  // Punjab & Haryana & Chandigarh
  chandigarh: {
    lat: 30.7333,
    lng: 76.7794,
    name: "Chandigarh",
    state: "Chandigarh",
  },
  ludhiana: { lat: 30.901, lng: 75.8573, name: "Ludhiana", state: "Punjab" },
  amritsar: { lat: 31.634, lng: 74.8723, name: "Amritsar", state: "Punjab" },
  jalandhar: { lat: 31.326, lng: 75.5762, name: "Jalandhar", state: "Punjab" },
  patiala: { lat: 30.3398, lng: 76.3869, name: "Patiala", state: "Punjab" },
  mohali: { lat: 30.7046, lng: 76.7179, name: "Mohali", state: "Punjab" },
  panipat: { lat: 29.3909, lng: 76.9635, name: "Panipat", state: "Haryana" },
  ambala: { lat: 30.3782, lng: 76.7767, name: "Ambala", state: "Haryana" },

  // Kerala
  thiruvananthapuram: {
    lat: 8.5241,
    lng: 76.9366,
    name: "Thiruvananthapuram",
    state: "Kerala",
  },
  trivandrum: {
    lat: 8.5241,
    lng: 76.9366,
    name: "Thiruvananthapuram",
    state: "Kerala",
  },
  kochi: { lat: 9.9312, lng: 76.2673, name: "Kochi", state: "Kerala" },
  cochin: { lat: 9.9312, lng: 76.2673, name: "Kochi", state: "Kerala" },
  kozhikode: { lat: 11.2588, lng: 75.7804, name: "Kozhikode", state: "Kerala" },
  calicut: { lat: 11.2588, lng: 75.7804, name: "Kozhikode", state: "Kerala" },
  thrissur: { lat: 10.5276, lng: 76.2144, name: "Thrissur", state: "Kerala" },

  // Odisha
  bhubaneswar: {
    lat: 20.2961,
    lng: 85.8245,
    name: "Bhubaneswar",
    state: "Odisha",
  },
  cuttack: { lat: 20.4625, lng: 85.8828, name: "Cuttack", state: "Odisha" },
  puri: { lat: 19.8135, lng: 85.8312, name: "Puri", state: "Odisha" },
  rourkela: { lat: 22.2604, lng: 84.8536, name: "Rourkela", state: "Odisha" },

  // Assam & Northeast
  guwahati: { lat: 26.1445, lng: 91.7362, name: "Guwahati", state: "Assam" },
  silchar: { lat: 24.8333, lng: 92.7789, name: "Silchar", state: "Assam" },
  shillong: {
    lat: 25.5788,
    lng: 91.8933,
    name: "Shillong",
    state: "Meghalaya",
  },
  imphal: { lat: 24.817, lng: 93.9368, name: "Imphal", state: "Manipur" },
  aizawl: { lat: 23.7271, lng: 92.7176, name: "Aizawl", state: "Mizoram" },
  agartala: { lat: 23.8315, lng: 91.2868, name: "Agartala", state: "Tripura" },
  kohima: { lat: 25.6751, lng: 94.1086, name: "Kohima", state: "Nagaland" },
  itanagar: {
    lat: 27.0844,
    lng: 93.6053,
    name: "Itanagar",
    state: "Arunachal Pradesh",
  },
  gangtok: { lat: 27.3389, lng: 88.6065, name: "Gangtok", state: "Sikkim" },

  // Jharkhand & Chhattisgarh
  ranchi: { lat: 23.3441, lng: 85.3096, name: "Ranchi", state: "Jharkhand" },
  jamshedpur: {
    lat: 22.8046,
    lng: 86.2029,
    name: "Jamshedpur",
    state: "Jharkhand",
  },
  dhanbad: { lat: 23.7957, lng: 86.4304, name: "Dhanbad", state: "Jharkhand" },
  raipur: { lat: 21.2514, lng: 81.6296, name: "Raipur", state: "Chhattisgarh" },
  bilaspur: {
    lat: 22.0797,
    lng: 82.1409,
    name: "Bilaspur",
    state: "Chhattisgarh",
  },

  // Uttarakhand & Himachal Pradesh
  dehradun: {
    lat: 30.3165,
    lng: 78.0322,
    name: "Dehradun",
    state: "Uttarakhand",
  },
  haridwar: {
    lat: 29.9457,
    lng: 78.1642,
    name: "Haridwar",
    state: "Uttarakhand",
  },
  rishikesh: {
    lat: 30.0869,
    lng: 78.2676,
    name: "Rishikesh",
    state: "Uttarakhand",
  },
  shimla: {
    lat: 31.1048,
    lng: 77.1734,
    name: "Shimla",
    state: "Himachal Pradesh",
  },
  dharamshala: {
    lat: 32.219,
    lng: 76.3234,
    name: "Dharamshala",
    state: "Himachal Pradesh",
  },
  manali: {
    lat: 32.2396,
    lng: 77.1887,
    name: "Manali",
    state: "Himachal Pradesh",
  },

  // Jammu & Kashmir & Ladakh
  srinagar: {
    lat: 34.0837,
    lng: 74.7973,
    name: "Srinagar",
    state: "Jammu and Kashmir",
  },
  jammu: {
    lat: 32.7266,
    lng: 74.857,
    name: "Jammu",
    state: "Jammu and Kashmir",
  },
  leh: { lat: 34.1526, lng: 77.5771, name: "Leh", state: "Ladakh" },

  // Goa & Others
  panaji: { lat: 15.4909, lng: 73.8278, name: "Panaji", state: "Goa" },
  goa: { lat: 15.2993, lng: 74.124, name: "Goa", state: "Goa" },
  margao: { lat: 15.2832, lng: 73.9862, name: "Margao", state: "Goa" },
  puducherry: {
    lat: 11.9416,
    lng: 79.8083,
    name: "Puducherry",
    state: "Puducherry",
  },
  pondicherry: {
    lat: 11.9416,
    lng: 79.8083,
    name: "Puducherry",
    state: "Puducherry",
  },
  "port blair": {
    lat: 11.6234,
    lng: 92.7265,
    name: "Port Blair",
    state: "Andaman and Nicobar",
  },
};

// Aliased backwards compatibility for Gujarat
export const GUJARAT_CITIES = ALL_INDIA_CITIES;

export const ALL_INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

// In-memory cache for dynamic forward-geocoded Indian towns/villages
const geoCache = new Map();

/* Dynamically resolves any Indian city, town, or village name to latitude and longitude.*/
export async function forwardGeocodeIndianCity(cityName) {
  if (!cityName) return null;
  const normalized = cityName.trim().toLowerCase();

  // 1. Instant dictionary lookup
  if (ALL_INDIA_CITIES[normalized]) {
    return ALL_INDIA_CITIES[normalized];
  }

  // 2. Cache lookup
  if (geoCache.has(normalized)) {
    return geoCache.get(normalized);
  }

  // 3. Dynamic Nominatim lookup across India
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(cityName + ", India")}&limit=1`;
    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "SafeHer-Emergency-System/1.0 (contact@safeher.org)",
      },
      signal: AbortSignal.timeout ? AbortSignal.timeout(3500) : undefined,
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const result = {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          name: item.name || cityName,
          state: "India",
          display_name: item.display_name,
        };
        geoCache.set(normalized, result);
        return result;
      }
    }
  } catch (err) {
    console.warn("Forward geocode failed:", err.message);
  }

  return null;
}

/**
 * Dynamic Real-Time IP Geolocation (Zero API Key needed)
 * Resolves current live city, state, postal code, and lat/lng anywhere across India.
 */
export async function fetchLiveIPLocation() {
  try {
    const res = await fetch("https://ipwho.is/", {
      signal: AbortSignal.timeout ? AbortSignal.timeout(3500) : undefined,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (
      data?.success &&
      Number.isFinite(Number(data.latitude)) &&
      Number.isFinite(Number(data.longitude))
    ) {
      return {
        lat: Number(data.latitude),
        lng: Number(data.longitude),
        city: data.city || "",
        state: data.region || "",
        source: "IP_APPROXIMATE",
      };
    }
  } catch (error) {
    console.error("IP location error:", error);
  }
  return null;
}

/**
 * Converts Latitude and Longitude to a real human-readable Indian street/locality address.
 */
export async function reverseGeocode(lat, lng) {
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
    return "Address unavailable";
  }

  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=json` +
      `&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;

    const res = await fetch(url, {
      headers: { "Accept-Language": "en" },
      signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined,
    });

    if (res.ok) {
      const data = await res.json();

      if (data?.address) {
        const a = data.address;
        const parts = [
          a.road || a.suburb || a.neighbourhood,
          a.city || a.town || a.village || a.county,
          a.state_district,
          a.state,
          a.postcode,
        ].filter(Boolean);
        if (parts.length) return parts.join(", ");
        if (data.display_name) return data.display_name;
      }
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
  }
  return `GPS Coordinates (${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)})`;
}

/**
 * Resolves safe city fallback based on user profile anywhere in India.
 */
export function getUserCityFallback(user) {
  const city = (user?.city || "").trim().toLowerCase();
  const location = ALL_INDIA_CITIES[city];

  if (location) {
    return {
      lat: location.lat,
      lng: location.lng,
      address: `${location.name}, ${location.state}`,
      source: "PROFILE_CITY",
      isExactGPS: false,
    };
  }

  return null;
}

/**
 * Collects several fresh device location fixes and keeps the most accurate one.
 * Network/IP and profile locations are intentionally not used for emergency SOS.
 */
export async function getAccurateLocation() {
  if (
    typeof window === "undefined" ||
    !window.isSecureContext ||
    !navigator.geolocation
  ) {
    throw new Error(
      "Location access requires HTTPS and browser location support.",
    );
  }

  const position = await new Promise((resolve, reject) => {
    let bestPosition = null;
    let watchId = null;
    let settled = false;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timerId);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      callback(value);
    };

    const timerId = window.setTimeout(() => {
      if (bestPosition) {
        finish(resolve, bestPosition);
      } else {
        finish(
          reject,
          new Error("Could not get a location fix. Please retry outdoors."),
        );
      }
    }, 15000);

    watchId = navigator.geolocation.watchPosition(
      (candidate) => {
        const { latitude, longitude, accuracy } = candidate.coords;
        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          !Number.isFinite(accuracy) ||
          accuracy < 0 ||
          Math.abs(latitude) > 90 ||
          Math.abs(longitude) > 180
        ) {
          return;
        }

        if (
          !bestPosition ||
          accuracy < bestPosition.coords.accuracy
        ) {
          bestPosition = candidate;
        }

        if (accuracy <= 100) finish(resolve, candidate);
      },
      (error) => {
        if (bestPosition) finish(resolve, bestPosition);
        else finish(reject, error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );
  });

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !Number.isFinite(accuracy) ||
    accuracy < 0
  ) {
    throw new Error("Your device returned invalid location coordinates.");
  }

  const address = await reverseGeocode(lat, lng);

  return {
    lat,
    lng,
    address,
    accuracy,
    source: "DEVICE_GPS",
    isExactGPS: accuracy <= 100,
    isApproximate: accuracy > 100,
  };
}
