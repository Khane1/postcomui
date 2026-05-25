<!-- lib/components/SidebarNav.svelte -->
<script>
  import { browser } from '$app/environment';

  let { 
    selectedCategory = "All", 
    fulfillmentMode = "pickup",
    onCategoryChange,
    onFulfillmentChange,
    onClaimCoupon // Prop added to forward coupon claim actions
  } = $props();

  // Reactive state rune tracking active hovered category list
  let hoveredCategory = $state(null);

  // Compact ad state
  let currentMiniSlide = $state(0);
  let momoActivated = $state(false);

  const categories = [
    { id: "All", label: "Explore All", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { id: "Agro Products", label: "Agro Products", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "Food & Beverages", label: "Food & Beverages", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { id: "Arts & Crafts", label: "Arts & Crafts", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" }
  ];

  const subcategoriesMap = {
    "All": {
      items: ["Harvest Campaigns", "Newly Listed Products", "Best Selling Items", "Subsidized Courier Deals"],
      promo: { title: "National Logistics", desc: "Get subsidized flat rate shipping slots countrywide." }
    },
    "Agro Products": {
      items: ["Organic Seeds & Seedlings", "Natural Soil Fertilizers", "Manual Farming Hand-Tools", "Micro Irrigation Kits"],
      promo: { title: "Posta Verified Agro", desc: "100% authenticated inputs directly sourced from verified cooperatives." }
    },
    "Food & Beverages": {
      items: ["Raw Honey & Natural Syrups", "Grains, Tubers & Flours", "Premium Coffee & Tea Blends", "Sun-Dried Fish & Pulses"],
      promo: { title: "Freshness Standards", desc: "Dispatched in humidity-controlled postal logistics crates." }
    },
    "Arts & Crafts": {
      items: ["Barkcloth Home Collections", "Handwoven Sisal Baskets", "Polished Mahogany Carvings", "Cultural Beaded Adornments"],
      promo: { title: "UNESCO Heritage", desc: "Certified authentic artisan crafts backing rural cooperatives." }
    }
  };

  // Mini-sized promotional ads tailored for the sidebar width (w-64)
  const miniSlides = [
    {
      bg: 'bg-emerald-800',
      eyebrow: 'Agro Specials',
      headline: 'Farm Fresh Deals',
      sub: 'Save up to 40% on fresh produce direct from Luweero & Kasese.',
      cta: 'Claim Coupon',
      badge: '-40%',
      coupon: 'HARVEST40'
    },
    {
      bg: 'bg-purple-800',
      eyebrow: 'Made in Uganda',
      headline: 'Artisan Crafts',
      sub: 'Authentic handmade goods supporting rural cooperatives.',
      cta: 'Claim Coupon',
      badge: '-25%',
      coupon: 'CRAFT25'
    },
    {
      bg: 'bg-amber-800',
      eyebrow: 'Food & Drinks',
      headline: 'Local Favorites',
      sub: 'Premium honey, coffees, and teas delivered straight to your door.',
      cta: 'Claim Coupon',
      badge: '-20%',
      coupon: 'FOOD20'
    }
  ];

  function handleMiniCTA(coupon) {
    onClaimCoupon?.(coupon);
  }

  function handleSidebarMoMo() {
    if (momoActivated) return;
    momoActivated = true;
    onClaimCoupon?.('MOMOSAVE');
    setTimeout(() => { momoActivated = false; }, 2500);
  }

  // Handle slide rotation logic
  $effect(() => {
    if (!browser) return;
    const interval = setInterval(() => {
      currentMiniSlide = (currentMiniSlide + 1) % miniSlides.length;
    }, 5000);
    return () => clearInterval(interval);
  });
</script>

<!-- Aside wrapper container handles mouseleave to collapse active flyouts -->
<aside 
  onmouseleave={() => hoveredCategory = null}
  class="hidden lg:flex w-64 bg-slate-50/50 border-r border-slate-200 flex-col justify-between p-5 flex-shrink-0 relative z-30 min-h-screen"
>
  <div class="space-y-5">
    
    <!-- Fulfillment Toggle -->
    

    <!-- Navigation Anchor Links -->
    <nav class="space-y-1.5 relative" aria-label="Sidebar main navigation">
      {#each categories as cat}
        {@const isSelected = selectedCategory === cat.id}
        {@const isHovered = hoveredCategory === cat.id}

        <button 
          onmouseenter={() => hoveredCategory = cat.id}
          onclick={() => { onCategoryChange?.(cat.id); hoveredCategory = null; }}
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all border group
            {isSelected 
              ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
              : isHovered 
                ? 'bg-red-50 border-red-100/50 text-red-600' 
                : 'text-slate-600 border-transparent hover:bg-slate-200/50 hover:text-slate-950'}"
        >
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d={cat.icon}/>
            </svg>
            <span>{cat.label}</span>
          </div>
          
          <svg class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5
            {isSelected ? 'text-white' : isHovered ? 'text-red-500' : 'text-slate-400'}" 
            fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      {/each}

      <!-- EXPANDED HIGH-FIDELITY MEGA MENU FLYOUT -->
      {#if hoveredCategory && subcategoriesMap[hoveredCategory]}
        <div class="absolute left-full pl-3 top-0 w-[540px] z-50">
          <div class="bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 border-l-slate-300 grid grid-cols-12 gap-5">
            
            <!-- Left Side: Subcategory List (Cols 1-7) -->
            <div class="col-span-7 space-y-3">
              <h4 class="text-[10px] font-black tracking-widest text-slate-400 uppercase select-none">
                {hoveredCategory} Categories
              </h4>
              <ul class="space-y-1">
                {#each subcategoriesMap[hoveredCategory].items as sub}
                  <li>
                    <button 
                      onclick={() => { onCategoryChange?.(hoveredCategory); hoveredCategory = null; }}
                      class="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-colors flex items-center justify-between group"
                    >
                      <span>{sub}</span>
                      <svg class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-red-600 transition-opacity" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </li>
                {/each}
              </ul>
            </div>

            <!-- Right Side: Focus Highlight Card (Cols 8-12) -->
            <div class="col-span-5 bg-slate-50/80 border border-slate-100 p-4 rounded-xl flex flex-col justify-between">
              <div class="space-y-1.5">
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Featured Focus</span>
                <h5 class="text-xs font-extrabold text-slate-900 leading-snug">
                  {subcategoriesMap[hoveredCategory].promo.title}
                </h5>
                <p class="text-[10px] text-slate-500 leading-relaxed font-medium">
                  {subcategoriesMap[hoveredCategory].promo.desc}
                </p>
              </div>
              <div class="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[9px] font-black text-red-600 uppercase tracking-wider">
                <span>Posta Inspected</span>
                <span>Subsidized</span>
              </div>
            </div>

          </div>
        </div>
      {/if}
    </nav>

    <!-- COMPACT SIDEBAR INTERACTIVE ADS -->
    <div class="space-y-3 pt-2">
      <!-- Dynamic Rotating Promo Ad -->
      <div 
        class="relative overflow-hidden rounded-xl text-white p-4 {miniSlides[currentMiniSlide].bg} transition-all duration-500 shadow-sm flex flex-col justify-between min-h-[145px] group cursor-pointer"
        onclick={() => handleMiniCTA(miniSlides[currentMiniSlide].coupon)}
      >
        <!-- Background blob decoration -->
        <div class="absolute -right-4 -top-4 w-14 h-14 rounded-full bg-white/10 pointer-events-none group-hover:scale-110 transition-transform"></div>
        
        <div>
          <div class="flex justify-between items-start gap-1">
            <span class="text-[8px] font-extrabold uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded">
              {miniSlides[currentMiniSlide].eyebrow}
            </span>
            <span class="text-[9px] font-black text-amber-300 bg-black/30 px-1.5 py-0.5 rounded">
              {miniSlides[currentMiniSlide].badge}
            </span>
          </div>
          
          <h5 class="text-xs font-black mt-2 leading-snug">
            {miniSlides[currentMiniSlide].headline}
          </h5>
          <p class="text-[9px] text-white/80 mt-1 leading-normal font-medium">
            {miniSlides[currentMiniSlide].sub}
          </p>
        </div>

        <button 
          onclick={(e) => { e.stopPropagation(); handleMiniCTA(miniSlides[currentMiniSlide].coupon); }}
          class="w-full mt-3 bg-white hover:bg-slate-50 text-slate-950 text-[10px] font-extrabold py-1 rounded-lg transition-all active:scale-98 shadow-xs"
        >
          {miniSlides[currentMiniSlide].cta}
        </button>
      </div>

      <!-- Compact MTN MoMo Promo -->
      <div class="bg-amber-400 p-4 rounded-xl flex flex-col justify-between relative overflow-hidden min-h-[115px] shadow-sm">
        <div class="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-black/5 pointer-events-none"></div>
        <div>
          <span class="text-[8px] font-extrabold text-amber-950 uppercase tracking-widest bg-amber-500/30 px-1.5 py-0.5 rounded">
            MTN MoMo
          </span>
          <h5 class="text-xs font-black text-amber-950 mt-1.5 leading-tight">
            Get UGX 1,500 Cash-Back
          </h5>
          <p class="text-[9px] text-amber-900 mt-1 leading-normal font-medium">
            On every order completed with MTN Mobile Money.
          </p>
        </div>
        <button 
          onclick={handleSidebarMoMo}
          class="w-full mt-3 text-[10px] font-extrabold py-1 rounded-lg transition-all active:scale-98 shadow-xs
            {momoActivated ? 'bg-emerald-700 text-white' : 'bg-slate-950 hover:bg-slate-900 text-amber-400'}"
        >
          {momoActivated ? '✓ Coupon Active!' : 'Activate — MOMOSAVE'}
        </button>
      </div>
    </div>

  </div>

  <!-- Vendor Access Section -->
  <div class="bg-slate-200/50 p-4 rounded-2xl border border-slate-200 flex-shrink-0 mt-5">
    <p class="text-[10px] font-black tracking-wider text-slate-400 uppercase">Vendor Access</p>
    <p class="text-xs text-slate-600 font-bold mt-1">Sell on Postcom to reach national buyers.</p>
    <a href="#register" class="text-xs text-red-600 font-black hover:underline mt-2 inline-block">Enroll Shop →</a>
  </div>

   <div class="bg-slate-200/50 p-4 rounded-2xl border border-slate-200 flex-shrink-0">
    <p class="text-[10px] font-black tracking-wider text-slate-400 uppercase">Vendor Access</p>
    <p class="text-xs text-slate-600 font-bold mt-1">Sell on Postcom to reach national buyers.</p>
    <a href="#register" class="text-xs text-red-600 font-black hover:underline mt-2 inline-block">Enroll Shop →</a>
  </div>
</aside>