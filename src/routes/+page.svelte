<!-- src/routes/+page.svelte -->
<script>
  import { goto } from '$app/navigation';
  import { appState } from '$lib/state.svelte.js';
  import ProductGrid from '$lib/components/ProductGrid.svelte';
  import AdBanners from '$lib/components/AdBanners.svelte'; // Persistent top banners
  import { products } from '$lib/data/products.js';

  let favoritedProducts = $state({});

  // Dynamic live countdown timer for express collection deals
  let hours = $state(3);
  let minutes = $state(44);
  let seconds = $state(18);

  $effect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        seconds--;
      } else {
        seconds = 59;
        if (minutes > 0) {
          minutes--;
        } else {
          minutes = 59;
          if (hours > 0) {
            hours--;
          } else {
            hours = 12; // continuous simulated flash route
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  });

  // Dynamic filtered product list
  let filteredProducts = $derived(
    products.filter(p => {
      const currentCategory = appState.selectedCategory;
      const currentSearch = appState.searchQuery;

      const matchesCategory = currentCategory === "All" || p.category === currentCategory;
      const matchesSearch = p.name.toLowerCase().includes(currentSearch.toLowerCase()) || 
                            p.seller.toLowerCase().includes(currentSearch.toLowerCase());
                            
      return matchesCategory && matchesSearch;
    })
  );

  // Derived list of items with active discounts for "Discounts of the Week"
  let discountedProducts = $derived(
    products.filter(p => p.originalPrice > p.price)
  );

  // Ozon Image 2 (Top) - Playful Campaign Cards
  const campaigns = [
    { id: "movie", title: "Weekend Moviegoers", desc: "Soda & Popcorn Combos", bg: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" },
    { id: "cool", title: "Time to Cool Down", desc: "Fresh Honey Juices", bg: "bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600 text-white" },
    { id: "butcher", title: "Butcher Shop", desc: "Nile Catch & Local Meats", bg: "bg-gradient-to-br from-red-500 to-rose-600 text-white" },
    { id: "help", title: "I Buy - I Help", desc: "Supporting Local MSMEs", bg: "bg-gradient-to-br from-sky-400 to-teal-500 text-white" }
  ];

  // Ozon Image 2 (Bottom) - 3D-Style Collection Tags
  const quickTags = [
    { id: "discounts", label: "Discounts & Promos", iconBg: "bg-rose-100 text-rose-600", path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04" },
    { id: "past", label: "Past Purchases", iconBg: "bg-blue-100 text-blue-600", path: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { id: "eat", label: "Eat Quickly", iconBg: "bg-amber-100 text-amber-600", path: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707" },
    { id: "posta-fresh", label: "Posta Fresh Box", iconBg: "bg-emerald-100 text-emerald-600", path: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { id: "faq", label: "Help & FAQ", iconBg: "bg-purple-100 text-purple-600", path: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3" }
  ];

  // Ozon Image 3 - Very Tasty Products (Visual Categories)
  const tastyCategories = [
    { id: "Agro Products", label: "Agro Products", desc: "Fresh crop, seeds", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=200" },
    { id: "Food & Beverages", label: "Bakeries & Honey", desc: "Bread, coffee, honey", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=200" },
    { id: "Arts & Crafts", label: "Local Handcrafts", desc: " UNESCO crafts, baskets", image: "https://images.unsplash.com/photo-1504198266287-1659872e6590?auto=format&fit=crop&q=80&w=200" },
    { id: "Health & Beauty", label: "Shea Butter & Oils", desc: "Organic cosmetics", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=200" }
  ];

  function handleProductRedirect(product) {
    goto(`/${product.id}`);
  }

  function handleFavoriteToggle(id) {
    if (favoritedProducts[id]) {
      delete favoritedProducts[id];
      appState.favoritesCount -= 1;
      appState.addToast('Removed item from Favorites', 'info');
    } else {
      favoritedProducts[id] = true;
      appState.favoritesCount += 1;
      appState.addToast('Saved item to Favorites');
    }
  }

  function handleAddToCart(product) {
    const existing = appState.cartItems.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      appState.cartItems.push({
        product,
        quantity: 1,
        fulfillment: appState.fulfillmentMode
      });
    }
    appState.addToast(`Added ${product.name} to basket`);
  }

  function filterCategory(catId) {
    appState.selectedCategory = catId;
    const el = document.getElementById("catalog-grid-anchor");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function claimCoupon(campaignName) {
    appState.addToast(`Coupon Applied: ${campaignName}!`);
  }
</script>

<div class="space-y-8 pb-12 select-none">

  <!-- 1. PERSISTENT TOP AD BANNERS (Untouched at the top of the canvas) -->
  <AdBanners onClaimCoupon={claimCoupon} />

  <!-- 2. PLAYFUL CAMPAIGN CAROUSEL ROW (Ozon Image 2 Top) -->
  

  <!-- 4. DISCOUNTS OF THE WEEK CAROUSEL (Ozon Image 1) -->
  <section class="space-y-4 pt-14">
    <div class="flex justify-between items-center border-b border-slate-200 pb-2">
      <h3 class="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-red-600"></span>
        Discounts of the Week
      </h3>
      <span class="text-xs font-bold text-red-600 hover:underline cursor-pointer">Watch everything →</span>
    </div>

    <div class="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x">
      {#each discountedProducts as product (product.id)}
        <div onclick={() => handleProductRedirect(product)} class="snap-start flex-shrink-0 w-60 bg-white rounded-2xl p-4 flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-shadow">
          <!-- Favorites Toggle Overlay -->
          <button 
            onclick={(e) => toggleFavorite(product.id, e)}
            class="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors shadow-sm"
          >
            <svg class="w-3.5 h-3.5 {favoritedProducts[product.id] ? 'fill-red-600 stroke-red-600' : 'stroke-slate-500'}" fill="none" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>

          <!-- Aspect 4/3 Visual Stage -->
          <div class="w-full aspect-[4/3] bg-slate-50 border-b border-slate-100 rounded-xl overflow-hidden relative">
            <img src={product.images[0]} alt={product.name} class="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"/>
          </div>

          <!-- Product Details and Express CTA Block -->
          <div class="pt-3 space-y-2 flex-1 flex flex-col justify-between">
            <div class="space-y-1">
              <div class="flex items-baseline gap-1.5 flex-wrap">
                <span class="text-sm font-black text-red-600">{product.price.toLocaleString()} UGX</span>
                <span class="text-[10px] text-slate-400 line-through">{product.originalPrice.toLocaleString()}</span>
                <span class="text-[9px] font-black text-red-600 bg-red-50 px-1 py-0.5 rounded">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </span>
              </div>
              <h4 onclick={() => handleProductRedirect(product)} class="text-xs font-bold text-slate-800 line-clamp-2 leading-relaxed cursor-pointer hover:text-red-600 transition-colors">
                {product.name}
              </h4>
              <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wide">by {product.seller}</p>
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-1 text-[10px] text-slate-500">
                <span class="text-yellow-400">★</span>
                <span class="font-extrabold text-slate-700">{product.rating}</span>
                <span>({product.reviews})</span>
              </div>

             
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- 6. GENERAL CATALOG PRODUCT GRID -->
  <div id="catalog-grid-anchor" class="pt-">
    <ProductGrid 
      products={filteredProducts}
      favoritedMap={favoritedProducts}
      title={appState.selectedCategory === "All" ? "Explore Marketplace Catalog" : appState.selectedCategory}
      onProductSelect={handleProductRedirect}
      onToggleFavorite={handleFavoriteToggle}
      onAddToCart={handleAddToCart}
    />
  </div>
  
</div>

<style>
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>