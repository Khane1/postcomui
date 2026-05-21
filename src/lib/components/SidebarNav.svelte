<!-- lib/components/SidebarNav.svelte -->
<script>
  let { 
    selectedCategory = "All", 
    fulfillmentMode = "pickup",
    onCategoryChange,
    onFulfillmentChange
  } = $props();

  // Reactive state rune tracking active hovered category list
  let hoveredCategory = $state(null);

  const categories = [
    { id: "All", label: "Explore All", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { id: "Agro Products", label: "Agro Products", icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "Food & Beverages", label: "Food & Beverages", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { id: "Arts & Crafts", label: "Arts & Crafts", icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" }
  ];

  // Map containing subcategories + rich focus content cards to increase surface area
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
</script>

<!-- Aside wrapper container handles mouseleave to collapse active flyouts -->
<aside 
  onmouseleave={() => hoveredCategory = null}
  class="hidden lg:flex w-64 bg-slate-50/50 border-r border-slate-200 flex-col justify-between p-5 flex-shrink-0 relative z-30"
>
  <div class="space-y-6">
    
    <!-- Fulfillment Toggle -->
    <div class="bg-slate-200/80 p-1 rounded-xl flex">
      <button 
        onclick={() => onFulfillmentChange?.('delivery')}
        class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center
          {fulfillmentMode === 'delivery' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}"
      >
        Delivery
      </button>
      <button 
        onclick={() => onFulfillmentChange?.('pickup')}
        class="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all text-center
          {fulfillmentMode === 'pickup' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}"
      >
        Post Pickup
      </button>
    </div>

    <!-- Navigation Anchor Links (Relative context anchor) -->
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
  </div>

  <div class="bg-slate-200/50 p-4 rounded-2xl border border-slate-200 flex-shrink-0">
    <p class="text-[10px] font-black tracking-wider text-slate-400 uppercase">Vendor Access</p>
    <p class="text-xs text-slate-600 font-bold mt-1">Sell on Postcom to reach national buyers.</p>
    <a href="#register" class="text-xs text-red-600 font-black hover:underline mt-2 inline-block">Enroll Shop →</a>
  </div>
</aside>