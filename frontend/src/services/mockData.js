// Client-side demonstration data store and offline simulation engine
// Provides instant zero-error fallback whenever FastAPI backend on port 8000 is not running

export const SERVICE_CATEGORIES = [
  { id: 1, name: "Hair Care & Styling", slug: "hair-care", icon: "Scissors", display_order: 1 },
  { id: 2, name: "Beard & Shaving", slug: "beard-shaving", icon: "Smile", display_order: 2 },
  { id: 3, name: "Hair Coloring & Highlights", slug: "hair-coloring", icon: "Palette", display_order: 3 },
  { id: 4, name: "Hair Treatments & Spa", slug: "hair-treatments", icon: "Sparkles", display_order: 4 },
  { id: 5, name: "Skin Care & Facials", slug: "skin-facials", icon: "Sun", display_order: 5 },
  { id: 6, name: "Bridal & Event Makeup", slug: "bridal-makeup", icon: "Heart", display_order: 6 },
  { id: 7, name: "Nails & Pedicure", slug: "nails-pedicure", icon: "CheckCircle", display_order: 7 },
];

export const POPULAR_SERVICES = [
  { name: "Haircut & Styling", category: "Hair Care & Styling", starting_price: 250 },
  { name: "Hair Spa & Deep Conditioning", category: "Hair Treatments & Spa", starting_price: 600 },
  { name: "Beard Trim & Grooming", category: "Beard & Shaving", starting_price: 150 },
  { name: "Global Hair Colour", category: "Hair Coloring & Highlights", starting_price: 1400 },
  { name: "Balayage Highlights", category: "Hair Coloring & Highlights", starting_price: 3500 },
  { name: "Keratin Treatment", category: "Hair Treatments & Spa", starting_price: 3200 },
];

export const INITIAL_SALONS = [
  {
    id: 1,
    owner_id: 2,
    name: "Enrich Salon & Luxury Studio",
    description: "Premium unisex salon offering bespoke haircuts, advanced hair spa therapies, and expert styling by senior certified artists.",
    address: "Shop 4, Hill Road, Near Bandra Station, Bandra West",
    city: "Mumbai",
    locality: "Bandra West",
    pincode: "400050",
    latitude: 19.0596,
    longitude: 72.8295,
    phone: "+91 22 2640 1122",
    email: "bandra@enrichsalon.com",
    cover_image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    gallery_images: "[]",
    rating: 4.7,
    review_count: 38,
    is_active: true,
    services: [
      { id: 101, salon_id: 1, category_id: 1, name: "Haircut & Styling", description: "Consultation, wash, precision cut, and styling", price: 450.0, duration_minutes: 40, is_active: true },
      { id: 102, salon_id: 1, category_id: 2, name: "Beard Trim & Grooming", description: "Beard shaping with hot towel finish", price: 250.0, duration_minutes: 25, is_active: true },
      { id: 103, salon_id: 1, category_id: 4, name: "Hair Spa & Deep Conditioning", description: "L'Oreal revitalizing scalp and hair treatment", price: 950.0, duration_minutes: 60, is_active: true },
      { id: 104, salon_id: 1, category_id: 3, name: "Global Hair Colour", description: "Ammonia-free global color application", price: 1800.0, duration_minutes: 90, is_active: true },
      { id: 105, salon_id: 1, category_id: 4, name: "Keratin Treatment", description: "Frizz-free smoothing treatment", price: 3200.0, duration_minutes: 120, is_active: true }
    ],
    schedules: [
      { day_of_week: 0, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 1, open_time: "09:30:00", close_time: "20:30:00", is_closed: true, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 2, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 3, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 4, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 5, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 6, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 }
    ],
    reviews: [
      { id: 1, booking_id: 1, customer_id: 1, salon_id: 1, rating: 5, comment: "Fantastic experience at Enrich Bandra! Arjun was very attentive to my preferences and gave a clean textured fade. Very hygienic and punctual.", customer_name: "Rahul Verma", created_at: "2026-10-30T14:20:00" },
      { id: 2, booking_id: 2, customer_id: 3, salon_id: 1, rating: 4, comment: "Great haircut and wash. Stylists use premium sanitized scissors and combs.", customer_name: "Ananya Iyer", created_at: "2026-10-28T11:15:00" }
    ]
  },
  {
    id: 2,
    owner_id: 3,
    name: "Looks Unisex Salon & Grooming Bar",
    description: "Modern urban salon specializing in quick premium haircuts, beard grooming, and rejuvenating skin cleanups.",
    address: "Plot 12, Oshiwara Link Road, Andheri West",
    city: "Mumbai",
    locality: "Andheri West",
    pincode: "400053",
    latitude: 19.1363,
    longitude: 72.8277,
    phone: "+91 22 2631 3344",
    email: "andheri@lookssalon.com",
    cover_image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80",
    gallery_images: "[]",
    rating: 4.4,
    review_count: 52,
    is_active: true,
    services: [
      { id: 201, salon_id: 2, category_id: 1, name: "Haircut & Styling", description: "Senior stylist cut with quick blow-dry", price: 300.0, duration_minutes: 30, is_active: true },
      { id: 202, salon_id: 2, category_id: 2, name: "Beard Trim & Grooming", description: "Clean razor edge lining and organic beard oil", price: 180.0, duration_minutes: 20, is_active: true },
      { id: 203, salon_id: 2, category_id: 4, name: "Hair Spa & Deep Conditioning", description: "Moisture surge therapy for dry hair", price: 750.0, duration_minutes: 45, is_active: true },
      { id: 204, salon_id: 2, category_id: 3, name: "Global Hair Colour", description: "Rich tone pigment infusion", price: 2100.0, duration_minutes: 90, is_active: true }
    ],
    schedules: [
      { day_of_week: 0, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 1, open_time: "09:30:00", close_time: "20:30:00", is_closed: true, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 2, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 3, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 4, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 5, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 6, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 }
    ],
    reviews: [
      { id: 3, booking_id: 3, customer_id: 2, salon_id: 2, rating: 4, comment: "Very reasonable ₹300 haircut. Quick service with almost zero waiting time. Recommended if you're in Andheri!", customer_name: "Pooja Shah", created_at: "2026-10-31T17:00:00" }
    ]
  },
  {
    id: 3,
    owner_id: 4,
    name: "Toni & Guy Essentials",
    description: "International trendsetting hair studio renowned for precision cutting, runway styling, and balayage highlights.",
    address: "100 Feet Road, HAL 2nd Stage, Indiranagar",
    city: "Bengaluru",
    locality: "Indiranagar",
    pincode: "560038",
    latitude: 12.9784,
    longitude: 77.6408,
    phone: "+91 80 4125 5566",
    email: "indiranagar@toniandguy.com",
    cover_image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    gallery_images: "[]",
    rating: 4.9,
    review_count: 84,
    is_active: true,
    services: [
      { id: 301, salon_id: 3, category_id: 1, name: "Haircut & Styling", description: "Master artistic director precision haircut", price: 850.0, duration_minutes: 45, is_active: true },
      { id: 302, salon_id: 3, category_id: 3, name: "Global Hair Colour", description: "Multi-dimensional couture color styling", price: 3500.0, duration_minutes: 120, is_active: true },
      { id: 303, salon_id: 3, category_id: 3, name: "Balayage Highlights", description: "Hand-painted sunkissed balayage strands", price: 4200.0, duration_minutes: 150, is_active: true },
      { id: 304, salon_id: 3, category_id: 4, name: "Hair Spa & Deep Conditioning", description: "Kerastase ritual for damaged fiber restoration", price: 1600.0, duration_minutes: 60, is_active: true }
    ],
    schedules: [
      { day_of_week: 0, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 4 },
      { day_of_week: 1, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 4 },
      { day_of_week: 2, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 4 },
      { day_of_week: 3, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 4 },
      { day_of_week: 4, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 4 },
      { day_of_week: 5, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 4 },
      { day_of_week: 6, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 4 }
    ],
    reviews: [
      { id: 4, booking_id: 4, customer_id: 1, salon_id: 3, rating: 5, comment: "Top-tier precision haircut. Worth every rupee for the consultation and director cut.", customer_name: "Rahul Verma", created_at: "2026-11-01T12:00:00" }
    ]
  },
  {
    id: 4,
    owner_id: 5,
    name: "Jawed Habib Hair Studio",
    description: "Affordable and reliable haircuts, grooming, and scalp treatments designed for students and working professionals.",
    address: "5th Block, Jyoti Nivas College Road, Koramangala",
    city: "Bengaluru",
    locality: "Koramangala",
    pincode: "560095",
    latitude: 12.9352,
    longitude: 77.6245,
    phone: "+91 80 4150 7788",
    email: "koramangala@jawedhabib.com",
    cover_image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    gallery_images: "[]",
    rating: 4.2,
    review_count: 65,
    is_active: true,
    services: [
      { id: 401, salon_id: 4, category_id: 1, name: "Haircut & Styling", description: "Signature Habib scissor cut and styling", price: 250.0, duration_minutes: 30, is_active: true },
      { id: 402, salon_id: 4, category_id: 2, name: "Beard Trim & Grooming", description: "Classic scissors and trimmer grooming", price: 150.0, duration_minutes: 20, is_active: true },
      { id: 403, salon_id: 4, category_id: 4, name: "Hair Spa & Deep Conditioning", description: "Matrix nourishing deep conditioning spa", price: 600.0, duration_minutes: 45, is_active: true },
      { id: 404, salon_id: 4, category_id: 3, name: "Global Hair Colour", description: "Natural black or dark brown global coloring", price: 1400.0, duration_minutes: 75, is_active: true }
    ],
    schedules: [
      { day_of_week: 0, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 1, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 2, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 3, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 4, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 5, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 6, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 }
    ],
    reviews: [
      { id: 5, booking_id: 5, customer_id: 2, salon_id: 4, rating: 4, comment: "Quick and pocket-friendly haircut. Perfect for regular maintenance.", customer_name: "Karan Johar", created_at: "2026-10-25T15:00:00" }
    ]
  },
  {
    id: 5,
    owner_id: 2,
    name: "The Royal Scissor Grooming Lounge",
    description: "Heritage grooming and modern hair spa located in the heart of central Delhi.",
    address: "Block M, Connaught Circus, Connaught Place",
    city: "Delhi",
    locality: "Connaught Place",
    pincode: "110001",
    latitude: 28.6315,
    longitude: 77.2167,
    phone: "+91 11 2341 8899",
    email: "cp@royalscissor.com",
    cover_image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
    gallery_images: "[]",
    rating: 4.8,
    review_count: 41,
    is_active: true,
    services: [
      { id: 501, salon_id: 5, category_id: 1, name: "Haircut & Styling", description: "Executive haircut with relaxing head massage", price: 500.0, duration_minutes: 45, is_active: true },
      { id: 502, salon_id: 5, category_id: 2, name: "Beard Trim & Grooming", description: "Hot foam straight-razor shaping", price: 300.0, duration_minutes: 30, is_active: true },
      { id: 503, salon_id: 5, category_id: 4, name: "Hair Spa & Deep Conditioning", description: "Herbal scalp rejuvenation therapy", price: 1100.0, duration_minutes: 60, is_active: true }
    ],
    schedules: [
      { day_of_week: 0, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 1, open_time: "09:30:00", close_time: "20:30:00", is_closed: true, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 2, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 3, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 4, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 5, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 6, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 }
    ],
    reviews: [
      { id: 6, booking_id: 6, customer_id: 3, salon_id: 5, rating: 5, comment: "Superb royal haircut service in CP. Very calm ambience and expert barbers.", customer_name: "Amitabh K.", created_at: "2026-10-27T18:30:00" }
    ]
  },
  {
    id: 6,
    owner_id: 3,
    name: "Bounce Studio & Aesthetic Care",
    description: "Contemporary aesthetic studio offering personalized hair designing, deep organic conditioning, and cleanups.",
    address: "Paud Road, Ideal Colony, Kothrud",
    city: "Pune",
    locality: "Kothrud",
    pincode: "411038",
    latitude: 18.5074,
    longitude: 73.8077,
    phone: "+91 20 2543 9900",
    email: "kothrud@bouncestudio.com",
    cover_image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
    gallery_images: "[]",
    rating: 4.6,
    review_count: 29,
    is_active: true,
    services: [
      { id: 601, salon_id: 6, category_id: 1, name: "Haircut & Styling", description: "Trend haircut, wash, and blast-dry", price: 350.0, duration_minutes: 35, is_active: true },
      { id: 602, salon_id: 6, category_id: 2, name: "Beard Trim & Grooming", description: "Beard taper and trimming", price: 200.0, duration_minutes: 20, is_active: true },
      { id: 603, salon_id: 6, category_id: 4, name: "Hair Spa & Deep Conditioning", description: "Nutri-oil hair spa treatment", price: 800.0, duration_minutes: 50, is_active: true }
    ],
    schedules: [
      { day_of_week: 0, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 1, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 2, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 3, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 4, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 5, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 },
      { day_of_week: 6, open_time: "09:30:00", close_time: "20:30:00", is_closed: false, slot_duration_minutes: 30, concurrent_capacity: 3 }
    ],
    reviews: [
      { id: 7, booking_id: 7, customer_id: 1, salon_id: 6, rating: 5, comment: "Best hair salon in Kothrud Pune! Very skilled staff and clean premises.", customer_name: "Rahul Verma", created_at: "2026-10-29T10:00:00" }
    ]
  }
];

export const AI_STYLES = {
  hairstyles: [
    { id: "textured_fade", name: "Textured Crop Fade", category: "Men", description: "Clean skin fade with textured top layer" },
    { id: "classic_pompadour", name: "Classic Pompadour", category: "Men", description: "High-volume swept back silhouette" },
    { id: "messy_quiff", name: "Modern Messy Quiff", category: "Men", description: "Contemporary casual upward sweep" },
    { id: "curtain_fringe", name: "Curtain Fringe with Waves", category: "Unisex", description: "Middle parted face-framing natural drape" },
    { id: "layered_bob", name: "Textured Layered Bob", category: "Women", description: "Collarbone grazing dynamic textured bob" },
    { id: "curtain_bangs_long", name: "Curtain Bangs with Long Layers", category: "Women", description: "Voluminous South Asian bridal/party layered blowout" },
    { id: "beach_waves", name: "Soft Balayage Beach Waves", category: "Women", description: "Loose effortless natural waves with dimensional tone" },
    { id: "pixie_cut", name: "Edgy Pixie Cut", category: "Women", description: "Chic short textured crop with tapered nape" },
  ],
  hair_colors: [
    { name: "Natural Black", hex: "#1a1a1a", desc: "Deep natural raven sheen" },
    { name: "Espresso Dark Brown", hex: "#382318", desc: "Rich dark coffee undertones" },
    { name: "Chestnut Brown", hex: "#5e3922", desc: "Warm autumnal brown with soft shine" },
    { name: "Honey Blonde", hex: "#c49a56", desc: "Warm golden sunkissed honey tones" },
    { name: "Caramel Highlights", hex: "#9c6b3b", desc: "Dimensional sunlit strands" },
    { name: "Burgundy Wine", hex: "#69172e", desc: "Deep wine red with purple nuance" },
    { name: "Copper Auburn", hex: "#9e4320", desc: "Vibrant fiery ginger-copper sheen" },
    { name: "Platinum Silver", hex: "#d3d5db", desc: "Cool modern metallic ash tone" },
  ],
  consent_notice: "By uploading your photo, you confirm that you are the person in the image or have authorized consent. Photos are processed temporarily for visualization purposes and are never shared or used to train third-party models."
};

// Helper: Haversine distance in KM
export function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// LocalStorage helpers for persistence
function getStored(key, defaultVal) {
  try {
    const raw = localStorage.getItem(`glamguide_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(`glamguide_${key}`, JSON.stringify(val));
  } catch {}
}

// Initialize mock salons in storage if not present
export function getSalonsStore() {
  const stored = getStored('salons', null);
  if (!stored) {
    setStored('salons', INITIAL_SALONS);
    return INITIAL_SALONS;
  }
  return stored;
}

export function saveSalonsStore(salons) {
  setStored('salons', salons);
}

// Mock Search & Filter Handler
export function mockSearchSalons(params = {}) {
  const salons = getSalonsStore();
  const favourites = getStored('favourites', []);
  const targetService = params.service_name?.trim().toLowerCase() || '';

  const results = [];

  for (const salon of salons) {
    if (!salon.is_active) continue;

    // City filter
    if (params.city && !salon.city.toLowerCase().includes(params.city.toLowerCase())) {
      continue;
    }

    // Locality filter
    if (params.locality && !salon.locality.toLowerCase().includes(params.locality.toLowerCase())) {
      continue;
    }

    // Keyword Query filter
    if (params.query) {
      const q = params.query.toLowerCase();
      const matchName = salon.name.toLowerCase().includes(q);
      const matchLoc = salon.locality.toLowerCase().includes(q);
      const matchDesc = salon.description?.toLowerCase().includes(q);
      const matchCity = salon.city.toLowerCase().includes(q);
      const matchSvc = salon.services?.some(s => s.name.toLowerCase().includes(q));
      if (!matchName && !matchLoc && !matchDesc && !matchCity && !matchSvc) {
        continue;
      }
    }

    // Match exact service
    let matchedSvc = null;
    if (targetService) {
      matchedSvc = salon.services?.find(s => s.name.toLowerCase().includes(targetService));
      if (!matchedSvc) continue; // Must offer target service
    } else {
      matchedSvc = salon.services?.[0] || null;
    }

    // Price range filters on matched service
    if (matchedSvc) {
      if (params.min_price && matchedSvc.price < parseFloat(params.min_price)) continue;
      if (params.max_price && matchedSvc.price > parseFloat(params.max_price)) continue;
    }

    // Rating filter
    if (params.min_rating && salon.rating < parseFloat(params.min_rating)) {
      continue;
    }

    // Distance calculation
    let dist = null;
    if (params.user_lat && params.user_lon) {
      dist = calculateHaversineKm(
        parseFloat(params.user_lat), parseFloat(params.user_lon),
        salon.latitude, salon.longitude
      );
      if (params.max_distance_km && dist > parseFloat(params.max_distance_km)) {
        continue;
      }
    }

    results.push({
      id: salon.id,
      owner_id: salon.owner_id,
      name: salon.name,
      description: salon.description,
      address: salon.address,
      city: salon.city,
      locality: salon.locality,
      pincode: salon.pincode,
      latitude: salon.latitude,
      longitude: salon.longitude,
      phone: salon.phone,
      email: salon.email,
      cover_image: salon.cover_image,
      gallery_images: salon.gallery_images,
      rating: salon.rating,
      review_count: salon.review_count,
      is_active: salon.is_active,
      distance_km: dist,
      matched_service_price: matchedSvc ? matchedSvc.price : null,
      matched_service_duration: matchedSvc ? matchedSvc.duration_minutes : null,
      matched_service_name: matchedSvc ? matchedSvc.name : null,
      is_favourite: favourites.includes(salon.id)
    });
  }

  // Sorting
  const sortBy = params.sort_by || 'relevance';
  if (sortBy === 'price_asc') {
    results.sort((a, b) => (a.matched_service_price || 9999) - (b.matched_service_price || 9999));
  } else if (sortBy === 'price_desc') {
    results.sort((a, b) => (b.matched_service_price || 0) - (a.matched_service_price || 0));
  } else if (sortBy === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'distance') {
    results.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
  }

  return results;
}

// Mock Salon by ID
export function mockGetSalonById(id) {
  const salons = getSalonsStore();
  const salon = salons.find(s => s.id === parseInt(id));
  if (!salon) throw new Error("Salon not found");
  const favourites = getStored('favourites', []);
  return {
    ...salon,
    is_favourite: favourites.includes(salon.id)
  };
}

// Mock Favorites Toggle
export function mockToggleFavourite(id) {
  const favs = getStored('favourites', []);
  const numId = parseInt(id);
  const exists = favs.includes(numId);
  const updated = exists ? favs.filter(i => i !== numId) : [...favs, numId];
  setStored('favourites', updated);
  return { status: "success", is_favourite: !exists };
}

export function mockGetMyFavourites() {
  const favs = getStored('favourites', []);
  const salons = getSalonsStore();
  return salons.filter(s => favs.includes(s.id)).map(s => ({
    ...s,
    matched_service_price: s.services?.[0]?.price || null,
    matched_service_duration: s.services?.[0]?.duration_minutes || null,
    matched_service_name: s.services?.[0]?.name || null,
    is_favourite: true
  }));
}

// Mock Comparison Engine
export function mockGetComparison(req = {}) {
  const salons = getSalonsStore();
  const targetService = req.service_name?.trim() || "Haircut & Styling";
  const targetLower = targetService.toLowerCase();
  const userBudget = req.max_budget ? parseFloat(req.max_budget) : null;

  const items = [];

  for (const s of salons) {
    if (!s.is_active) continue;
    if (req.salon_ids && req.salon_ids.length > 0 && !req.salon_ids.includes(s.id)) {
      continue;
    }
    if (req.city && !s.city.toLowerCase().includes(req.city.toLowerCase())) {
      continue;
    }

    const matchedSvc = s.services?.find(svc => svc.name.toLowerCase().includes(targetLower)) || s.services?.[0];
    if (!matchedSvc) continue;

    const price = matchedSvc.price;
    const isBudgetFit = userBudget ? price <= userBudget : true;

    // Budget score (0-100)
    let budgetScore = 100;
    if (userBudget) {
      if (price <= userBudget) {
        const savingsRatio = (userBudget - price) / userBudget;
        budgetScore = Math.min(100, Math.round(75 + savingsRatio * 25));
      } else {
        const overRatio = (price - userBudget) / userBudget;
        budgetScore = Math.max(10, Math.round(70 - overRatio * 60));
      }
    }

    // Rating score (0-100)
    const ratingScore = Math.round((s.rating / 5.0) * 100);

    // Distance score
    let dist = null;
    let distanceScore = 80;
    if (req.user_latitude && req.user_longitude) {
      dist = calculateHaversineKm(req.user_latitude, req.user_longitude, s.latitude, s.longitude);
      distanceScore = dist <= 3 ? 95 : dist <= 7 ? 80 : dist <= 15 ? 60 : 40;
    }

    // Availability
    const availabilityScore = 90;
    const compositeScore = Math.round(
      budgetScore * 0.35 +
      distanceScore * 0.25 +
      ratingScore * 0.25 +
      availabilityScore * 0.15
    );

    const reasons = [];
    if (isBudgetFit) reasons.push(`Fits budget: ₹${price} vs ₹${userBudget || price} limit`);
    else reasons.push(`Exceeds budget by ₹${price - userBudget}`);
    reasons.push(`${s.rating}★ verified rating across ${s.review_count} client visits`);
    reasons.push("Live slot confirmed for requested date");

    items.push({
      salon_id: s.id,
      salon_name: s.name,
      cover_image: s.cover_image,
      locality: s.locality,
      city: s.city,
      rating: s.rating,
      review_count: s.review_count,
      distance_km: dist,
      exact_service_id: matchedSvc.id,
      exact_service_name: matchedSvc.name,
      exact_service_price: matchedSvc.price,
      exact_service_duration: matchedSvc.duration_minutes,
      opening_hours_text: "Mon-Sun: 09:30 - 20:30",
      is_available_for_date: true,
      has_preferred_slot: true,
      booking_policy: "Free cancellation up to 2 hours prior to scheduled appointment.",
      score_breakdown: {
        budget_fit: isBudgetFit,
        budget_score: budgetScore,
        distance_score: distanceScore,
        rating_score: ratingScore,
        availability_score: availabilityScore,
        total_composite_score: compositeScore,
        reasons
      }
    });
  }

  // Sort by composite score
  items.sort((a, b) => b.score_breakdown.total_composite_score - a.score_breakdown.total_composite_score);

  return {
    queried_service: targetService,
    customer_budget: userBudget,
    total_candidates_found: items.length,
    ranking_explanation: "Ranked by exact service price fit (35%), verified client rating (25%), geographic proximity (25%), and confirmed slot availability (15%).",
    items
  };
}

// Mock Booking Slots
export function mockGetSlots(_salonId, _serviceId, _dateStr) {
  const times = [
    "10:00", "10:30", "11:00", "11:30", "12:00",
    "13:00", "14:00", "14:30", "15:00", "16:00",
    "16:30", "17:00", "17:30", "18:00", "18:30"
  ];
  return times.map(t => ({
    time_str: t,
    is_available: t !== "13:00", // simulate 1PM lunch booked
    remaining_capacity: t === "13:00" ? 0 : 2
  }));
}

// Mock Bookings Store
export function mockCreateBooking(payload) {
  const salons = getSalonsStore();
  const salon = salons.find(s => s.id === parseInt(payload.salon_id));
  const service = salon?.services?.find(svc => svc.id === parseInt(payload.service_id));

  const bookings = getStored('bookings', [
    {
      id: 101,
      booking_reference: "SLN-2026-X9Y2A",
      customer_id: 1,
      salon_id: 1,
      service_id: 101,
      booking_date: "2026-10-30",
      start_time: "11:00:00",
      end_time: "11:40:00",
      total_price: 450.0,
      status: "COMPLETED",
      customer_notes: "Looking for clean textured taper fade.",
      created_at: "2026-10-30T10:00:00",
      salon_name: "Enrich Salon & Luxury Studio",
      service_name: "Haircut & Styling",
      customer_name: "Rahul Verma",
      customer_phone: "+91 9769012345",
      can_review: false,
      has_reviewed: true
    }
  ]);

  const ref = `SLN-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const newBooking = {
    id: Date.now(),
    booking_reference: ref,
    customer_id: 1,
    salon_id: salon ? salon.id : 1,
    service_id: service ? service.id : 101,
    booking_date: payload.booking_date,
    start_time: `${payload.start_time}:00`,
    end_time: `${payload.start_time}:30`,
    total_price: service ? service.price : 450.0,
    status: "CONFIRMED",
    customer_notes: payload.customer_notes || "",
    created_at: new Date().toISOString(),
    salon_name: salon ? salon.name : "Enrich Salon & Luxury Studio",
    service_name: service ? service.name : "Haircut & Styling",
    customer_name: "Rahul Verma",
    customer_phone: "+91 9769012345",
    can_review: false,
    has_reviewed: false
  };

  bookings.unshift(newBooking);
  setStored('bookings', bookings);
  return newBooking;
}

export function mockGetMyBookings() {
  return getStored('bookings', [
    {
      id: 101,
      booking_reference: "SLN-2026-X9Y2A",
      customer_id: 1,
      salon_id: 1,
      service_id: 101,
      booking_date: "2026-10-30",
      start_time: "11:00:00",
      end_time: "11:40:00",
      total_price: 450.0,
      status: "COMPLETED",
      customer_notes: "Looking for clean textured taper fade.",
      created_at: "2026-10-30T10:00:00",
      salon_name: "Enrich Salon & Luxury Studio",
      service_name: "Haircut & Styling",
      customer_name: "Rahul Verma",
      customer_phone: "+91 9769012345",
      can_review: true,
      has_reviewed: false
    }
  ]);
}

export function mockCancelBooking(id, reason) {
  const bookings = getStored('bookings', []);
  const booking = bookings.find(b => b.id === parseInt(id));
  if (booking) {
    booking.status = "CANCELLED";
    booking.cancellation_reason = reason;
    setStored('bookings', bookings);
  }
  return { status: "CANCELLED", message: "Booking cancelled successfully" };
}

export function mockSubmitReview(payload) {
  const bookings = getStored('bookings', []);
  const booking = bookings.find(b => b.id === parseInt(payload.booking_id));
  if (booking) {
    booking.has_reviewed = true;
    booking.can_review = false;
    setStored('bookings', bookings);
  }
  return {
    id: Date.now(),
    booking_id: payload.booking_id,
    rating: payload.rating,
    comment: payload.comment,
    customer_name: "Rahul Verma",
    created_at: new Date().toISOString()
  };
}

// Mock Owner Endpoints
export function mockOwnerGetMySalon() {
  const salons = getSalonsStore();
  const salon = salons[0];
  return {
    has_salon: true,
    salon: {
      ...salon,
      schedules: salon.schedules
    }
  };
}

export function mockOwnerGetServices() {
  const salons = getSalonsStore();
  return salons[0]?.services || [];
}

export function mockOwnerAddService(payload) {
  const salons = getSalonsStore();
  const newSvc = {
    id: Date.now(),
    salon_id: salons[0].id,
    category_id: payload.category_id || 1,
    name: payload.name,
    description: payload.description,
    price: parseFloat(payload.price),
    duration_minutes: parseInt(payload.duration_minutes),
    is_active: true
  };
  salons[0].services.push(newSvc);
  saveSalonsStore(salons);
  return newSvc;
}

export function mockOwnerUpdateService(id, payload) {
  const salons = getSalonsStore();
  const svc = salons[0].services.find(s => s.id === parseInt(id));
  if (svc) {
    Object.assign(svc, payload);
    saveSalonsStore(salons);
  }
  return svc;
}

export function mockOwnerDeleteService(id) {
  const salons = getSalonsStore();
  salons[0].services = salons[0].services.filter(s => s.id !== parseInt(id));
  saveSalonsStore(salons);
  return { status: "deleted" };
}

export function mockOwnerGetBookings(status) {
  const all = getStored('bookings', [
    {
      id: 101,
      booking_reference: "SLN-2026-X9Y2A",
      customer_id: 1,
      salon_id: 1,
      service_id: 101,
      booking_date: "2026-10-30",
      start_time: "11:00:00",
      end_time: "11:40:00",
      total_price: 450.0,
      status: "completed",
      customer_notes: "Looking for clean textured taper fade.",
      created_at: "2026-10-30T10:00:00",
      salon_name: "Enrich Salon & Luxury Studio",
      service_name: "Haircut & Styling",
      customer_name: "Rahul Verma",
      customer_phone: "+91 9769012345"
    }
  ]);
  if (status) {
    return all.filter(b => b.status === status);
  }
  return all;
}

export function mockOwnerUpdateBookingStatus(id, payload) {
  const all = getStored('bookings', []);
  const b = all.find(item => item.id === parseInt(id));
  if (b) {
    b.status = payload.status;
    setStored('bookings', all);
  }
  return b;
}

export function mockOwnerGetStats() {
  return {
    total_appointments: 48,
    confirmed_upcoming: 6,
    completed_this_month: 42,
    total_revenue_inr: 28450.0,
    average_customer_rating: 4.7,
    active_services_count: 5
  };
}

// Mock AI Transformation
export function mockAITransform(formData) {
  const hairstyle = formData.get('hairstyle') || "Textured Crop Fade";
  const hairColor = formData.get('hair_color') || "Burgundy Wine";
  const file = formData.get('file');

  let previewUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80";
  if (file && typeof file === 'object' && typeof URL !== 'undefined' && URL.createObjectURL) {
    previewUrl = URL.createObjectURL(file);
  }

  return {
    status: "success",
    is_mock: true,
    hairstyle,
    hair_color: hairColor,
    preview_url: previewUrl,
    message: `Generated AI virtual preview for ${hairstyle} in ${hairColor}. Visualized with ethical consent guardrails.`
  };
}

// Mock Auth
export function mockAuthLogin(credentials) {
  const email = credentials.email.toLowerCase();
  let role = "CUSTOMER";
  let name = "Rahul Verma";

  if (email.includes("owner") || email.includes("enrich") || email.includes("arjun")) {
    role = "SALON_OWNER";
    name = "Arjun Mehta";
  } else if (email.includes("admin")) {
    role = "ADMIN";
    name = "Platform Administrator";
  }

  const user = {
    id: 1,
    email: credentials.email,
    full_name: name,
    phone: "+91 9769012345",
    role,
    is_active: true,
    created_at: new Date().toISOString()
  };

  const token = `demo_jwt_token_${role}_${Date.now()}`;
  return {
    access_token: token,
    token_type: "bearer",
    user
  };
}

export function mockAuthRegister(userData) {
  const user = {
    id: Date.now(),
    email: userData.email,
    full_name: userData.full_name,
    phone: userData.phone || "+91 9800000000",
    role: (userData.role || "CUSTOMER").toUpperCase(),
    is_active: true,
    created_at: new Date().toISOString()
  };
  const token = `demo_jwt_token_${user.role}_${Date.now()}`;
  return {
    access_token: token,
    token_type: "bearer",
    user
  };
}
