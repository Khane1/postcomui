<!-- src/routes/+page.svelte -->
<script>
  import { goto } from '$app/navigation';
  import { appState } from '$lib/state.svelte.js';
  import ProductGrid from '$lib/components/ProductGrid.svelte';
  import { products } from '$lib/data/products.js';

  let favoritedProducts = $state({});

  // Dynamic live countdown timer managed natively via Svelte 5 $effect
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
            // Loop back to simulate continuous flash sales
            hours = 12;
          }
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  });

  // Derived filtered product list
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

  function handleProductRedirect(product) {
    goto(`/${product.id}`);
  }

  function handleFavoriteToggle(id) {
    if (favoritedProducts[id]) {
      delete favoritedProducts[id];
      appState.favoritesCount -= 1;
      appState.addToast("Removed item from Favorites", "info");
    } else {
      favoritedProducts[id] = true;
      appState.favoritesCount += 1;
      appState.addToast("Saved item to Favorites");
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

  // Quick coupon activation action
  function claimCoupon(campaignName) {
    appState.addToast(`Subsidized Coupon Applied: ${campaignName}!`);
  }
</script>

<div class="space-y-8 pb-12">
  
  <!-- INTERACTIVE CATEGORY QUICK-BUBBLES (Instacart & Ozon Vibe) -->
  


  <!-- ASYMMETRICAL VIBRANT AD GRID -->
  <section class="grid grid-cols-1 xl:grid-cols-12 gap-5">
    <!-- LEFT CAMPAIGN: Kampala Harvest Week (Vibrant gradient focus) -->
    <div class="xl:col-span-8 bg-gradient-to-r from-rose-500 via-red-600 to-orange-500 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-sm group">
      <!-- Background abstract design -->
      <div class="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-xl pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
      
      <div class="space-y-2 relative z-10 max-w-lg">
        <span class="bg-white/20 text-white font-extrabold text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full">Kampala Food Festival</span>
        <h2 class="text-2xl sm:text-4xl font-black tracking-tight leading-none pt-1">Fresh Farm Produce Up to 40% Off</h2>
        <p class="text-[11px] sm:text-xs text-rose-100 font-semibold max-w-sm leading-relaxed">Subsidized regional post courier deliveries direct from Luweero, Kumi, and Kasese farms.</p>
      </div>

      <div class="pt-4 flex flex-wrap items-center gap-3 relative z-10">
        <button 
          onclick={() => claimCoupon("HARVEST40")}
          class="bg-white text-rose-600 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow hover:bg-slate-50 transition-all transform active:scale-95"
        >
          Clip Subsidized Coupon
        </button>
        <span class="text-[10px] font-black text-rose-100 tracking-wider uppercase">Code: HARVEST40</span>
      </div>
    </div>

    <!-- RIGHT CAMPAIGN: MTN MoMo Partnership Promo -->
    <div class="xl:col-span-4 bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 rounded-3xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden group">
      <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none"></div>
      
      <div class="space-y-1.5 relative z-10">
        <span class="bg-slate-900/10 text-slate-900 font-black text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full w-fit block">Mobile Money</span>
        <h3 class="text-lg font-black leading-tight pt-1">MTN MoMo Instant Cash-Back</h3>
        <p class="text-[11px] text-slate-800 font-bold leading-relaxed">Pay with your MTN MoMo wallet at checkout to claim instant 1,500 UGX delivery cash-back.</p>
      </div>

      <div class="pt-4 relative z-10 flex items-center justify-between">
        <button 
          onclick={() => claimCoupon("MOMOSAVE")}
          class="bg-slate-950 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          Activate Savings
        </button>
        <span class="text-[11px] font-black uppercase text-amber-950">MoMo Cash</span>
      </div>
    </div>
  </section>

  <!-- RE-ACTIVE DYNAMIC FLASH SALE COUNTDOWN TICKER -->
  <section class="bg-slate-950 text-white rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800 shadow-md">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-lg shadow-sm border border-red-500 animate-pulse">⚡</div>
      <div class="space-y-0.5">
        <h4 class="text-xs font-black uppercase tracking-wider">Flash Sale Countdown</h4>
        <p class="text-[10px] text-slate-400 font-bold">Limited subsidized farm batches remaining. Settle now before routes reset.</p>
      </div>
    </div>

    <!-- Live Timer Output -->
    <div class="flex items-center gap-1.5 font-mono text-xs font-black select-none">
      <div class="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-red-500 flex flex-col items-center">
        <span>{hours.toString().padStart(2, '0')}</span>
        <span class="text-[8px] text-slate-500 font-sans tracking-wide uppercase pt-0.5">Hrs</span>
      </div>
      <span class="text-slate-700 animate-pulse">:</span>
      <div class="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-red-500 flex flex-col items-center">
        <span>{minutes.toString().padStart(2, '0')}</span>
        <span class="text-[8px] text-slate-500 font-sans tracking-wide uppercase pt-0.5">Min</span>
      </div>
      <span class="text-slate-700 animate-pulse">:</span>
      <div class="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-red-500 flex flex-col items-center">
        <span>{seconds.toString().padStart(2, '0')}</span>
        <span class="text-[8px] text-slate-500 font-sans tracking-wide uppercase pt-0.5">Sec</span>
      </div>
    </div>
  </section>

  <!-- PRODUCT GRID SECTION (Vibrant Catalog) -->
  <ProductGrid 
    products={filteredProducts}
    favoritedMap={favoritedProducts}
    title={appState.selectedCategory === "All" ? "Vibrant Marketplace Catalog" : appState.selectedCategory}
    onProductSelect={handleProductRedirect}
    onToggleFavorite={handleFavoriteToggle}
    onAddToCart={handleAddToCart}
  />
  
</div>