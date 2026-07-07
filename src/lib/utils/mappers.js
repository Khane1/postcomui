// src/lib/utils/mappers.js

const S3_BASE = import.meta.env.VITE_APP_NAME_IMAGE || 'https://govnet-labs-eposta-postcom.s3.waw.io.cloud.ovh.net';
const BASE_URL = import.meta.env.VITE_APP_BASE_URL || 'https://api.postcom.labs.eposta.ug';

export function resolveImageUrl(url) {
  if (!url) return '';
  let cleanUrl = String(url).trim();

  // Pass absolute URLs straight through
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') || cleanUrl.startsWith('data:')) {
    return cleanUrl;
  }

  // Primary S3 Bucket Path Pattern
  const base = S3_BASE.replace(/\/+$/, '');
  const filename = cleanUrl.replace(/^\/+/, '');
  
  return `${base}/${filename}`;
}

export function normalizeCategory(item) {
  if (!item) return "Agro Products";
  
  let rawCat = "";
  if (Array.isArray(item.categories) && item.categories.length > 0) {
    const first = item.categories[0];
    rawCat = typeof first === 'object' ? (first.name || first.slug || "") : String(first);
  } else if (item.category) {
    rawCat = typeof item.category === 'object' ? (item.category.name || item.category.slug || "") : String(item.category);
  } else {
    rawCat = `${item.name || ""} ${item.description || ""} ${item.short_description || ""}`;
  }

  const s = rawCat.toLowerCase();
  if (s.includes("baby") || s.includes("beauty") || s.includes("health") || s.includes("shea") || s.includes("soap") || s.includes("wellness") || s.includes("jelly") || s.includes("lotion") || s.includes("hair") || s.includes("skin")) {
    return "Health & Beauty";
  }
  if (s.includes("beverage") || s.includes("food") || s.includes("staple") || s.includes("drink") || s.includes("honey") || s.includes("coffee") || s.includes("tea") || s.includes("cocoa") || s.includes("millet") || s.includes("flour") || s.includes("cassava") || s.includes("fish") || s.includes("mukene")) {
    return "Food & Beverages";
  }
  if (s.includes("art") || s.includes("craft") || s.includes("retail") || s.includes("basket") || s.includes("bag") || s.includes("fabric") || s.includes("handmade") || s.includes("handwoven")) {
    return "Arts & Crafts";
  }
  
  return "Agro Products"; 
}

// Ensure mapBackendProductToUI in lib/utils/mappers.js maps the numeric weight:
// Complete mapBackendProductToUI mapping function inside lib/utils/mappers.js
export function mapBackendProductToUI(item) {
  if (!item) return null;
  if (!item.id && !item.name) return null;

  // 1. Extract the distinct image parameters from backend payload
  let rawImages = [];
  if (item.front_image || item.back_image || item.side_image) {
    rawImages = [item.front_image, item.back_image, item.side_image].filter(Boolean);
  } else if (Array.isArray(item.images) && item.images.length > 0) {
    rawImages = item.images.map(img => typeof img === 'object' ? (img.url || img.path || '') : String(img)).filter(Boolean);
  } else if (item.image) {
    rawImages = [typeof item.image === 'object' ? (item.image.url || item.image.path || '') : String(item.image)];
  }

  // Generate resolved primary S3 URLs
  let images = rawImages.map(resolveImageUrl).filter(Boolean);

  if (images.length === 0) {
    images = ["https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400"];
  }

  // 2. Parse price points
  const price = Number(item.price || item.basePrice || item.base_price || 0);
  const originalPrice = item.compare_at_price || item.old_price 
    ? Number(item.compare_at_price || item.old_price) 
    : undefined;

  // 3. Resolve category, seller, and stock status details
  const category = normalizeCategory(item);
  const seller = item.vendor_name || item.brand?.name || item.seller || "Local Co-op";
  const stock = typeof item.stock === 'number' ? item.stock : (item.inventory?.quantity ?? 10);
  const stockStatus = stock > 5 ? "Many in stock" : stock > 0 ? `Only ${stock} left` : "Out of stock";
  
  // Extract and default weight cleanly
  const weight = Number(item.weight || item.package_weight || 500); 

  return {
    id: item.id,
    name: item.name,
    category,
    price,
    originalPrice,
    rating: Number(item.rating || 4.5),
    reviews: Number(item.review_count || item.reviews || 0),
    seller,
    badge: item.badge || (item.is_featured ? "Featured" : null),
    stockStatus,
    origin: item.brand?.location || item.origin || "Uganda Region Sourced",
    altitude: item.weight ? `${item.weight}g` : (item.altitude || "1 each"),
    weight, // Preserved for exact weight-based shipping fee calculation
    description: item.description || item.short_description || "High-quality co-op verified produce.",
    images, // Safely resolved array
    placeholder: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23f1f5f9'/></svg>",
    rawCategories: item.categories || [],
    rawVariations: item.variations || []
  };
}
export function mapBackendBrandToUI(brand) {
  if (!brand) return null;
  return {
    name: brand.name,
    category: brand.category || "Agro Products",
    location: brand.location || "Regional Sourcing",
    impact: brand.impact || "Supports organic farming initiatives.",
    initials: brand.name ? brand.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "CO",
    logoColor: brand.logoColor || "bg-[#003d29] text-white",
    rating: brand.rating || "4.8",
    reviews: brand.reviews || "50",
    speed: brand.speed || "Delivery by next-morning",
    badge: brand.badge || "Co-op Brand",
    banner: brand.banner ? resolveImageUrl(brand.banner) : "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80"
  };
}