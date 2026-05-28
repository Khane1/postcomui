<!-- src/routes/+layout.svelte -->
<script>
  import './layout.css';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { appState } from '$lib/state.svelte.js';
  import SidebarNav from '$lib/components/SidebarNav.svelte';
  
  let { children } = $props();

  const branches = [
    "Kampala GPO", 
    "Entebbe Post Office", 
    "Jinja Post Office",
    "Mbarara Post Office", 
    "Gulu Post Office", 
    "Mbale Post Office"
  ];

  
  function updateFulfillment(mode) {
    appState.fulfillmentMode = mode;
  }

  // Unified search execution form handler

  // Redirect search submissions to the new products sorting page
  function handleSearchSubmit(e) {
    e.preventDefault();
    goto('/products');
  }

  // Redirect categories clicked in sidebar to products sorting page
  function updateCategory(cat) {
    appState.selectedCategory = cat;
    goto('/products');
  }


  import ProductCard from '$lib/components/ProductCard.svelte';
  import FilterSidebar from '$lib/components/FilterSidebar.svelte';
  import { products } from '$lib/data/products.js';

  let selectedCategories = $state([]);
  let sortBy             = $state("popular");
  let minPrice           = $state(0);
  let maxPrice           = $state(150000);
  let onlyInStock        = $state(false);
  let isMobileFilterOpen = $state(false);
  let favoritedProducts  = $state({});

  let processedProducts = $derived.by(() => {
    let list = [...products];

    if (appState.searchQuery) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
        p.seller.toLowerCase().includes(appState.searchQuery.toLowerCase())
      );
    }

    if (selectedCategories.length > 0) {
      list = list.filter(p => selectedCategories.includes(p.category));
    } else if (appState.selectedCategory !== "All") {
      list = list.filter(p => p.category === appState.selectedCategory);
    }

    list = list.filter(p => p.price >= minPrice && p.price <= maxPrice);

    if (onlyInStock) {
      list = list.filter(p => p.stockStatus === "Many in stock");
    }

    if (sortBy === "price-asc")       list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating")     list.sort((a, b) => b.rating - a.rating);
    else                              list.sort((a, b) => b.reviews - a.reviews);

    return list;
  });

  let activeFilterCount = $derived(
    selectedCategories.length +
    (onlyInStock ? 1 : 0) +
    (maxPrice < 150000 ? 1 : 0)
  );

  function handleProductRedirect(product) { goto(`/${product.id}`); }

  function handleFavoriteToggle(id) {
    if (favoritedProducts[id]) {
      delete favoritedProducts[id];
      appState.favoritesCount -= 1;
      appState.addToast("Removed from Favorites", "info");
    } else {
      favoritedProducts[id] = true;
      appState.favoritesCount += 1;
      appState.addToast("Saved to Favorites");
    }
  }

  function handleAddToCart(product) {
    const existing = appState.cartItems.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      appState.cartItems.push({ product, quantity: 1, fulfillment: appState.fulfillmentMode });
    }
    appState.addToast(`Added ${product.name} to basket`);
  }

  function resetAllFilters() {
    selectedCategories = [];
    appState.selectedCategory = "All";
    appState.searchQuery = "";
    sortBy = "popular";
    minPrice = 0;
    maxPrice = 150000;
    onlyInStock = false;
    appState.addToast("All filters reset");
  }
</script>

<!-- BACKDROP LOCKDOWN CONTAINER -->
<div class="h-screen w-screen bg-slate-200 overflow-hidden flex flex-col font-sans text-slate-800 relative">
  
  <!-- JUMIA-STYLE TOP PORTAL STRIP (Desktop Only) -->
  <div class="hidden md:flex flex-shrink-0 bg-slate-100 border-b border-slate-200 px-6 py-2 items-center justify-between text-xs text-slate-500 font-semibold select-none ">
    <!-- Left: Seller recruitment -->
    <a href="#register" class="flex items-center gap-1.5 hover:text-red-600 transition-colors text-red-600 font-bold">
      <svg class="w-3.5 h-3.5 fill-current text-red-600" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
      <span>Sell on Postcom</span>
    </a>
    
    <!-- Right: Sub-brand Ecosystem Directories -->
    <div class="flex items-center gap-4 text-[10px] tracking-wide font-black uppercase text-slate-400">
      <a href="/" class="hover:text-slate-600 flex items-center gap-1 text-slate-700">POSTCOM <span class="text-[8px] text-red-600">★</span></a>
      <span class="text-slate-300">|</span>
      
      <a href="https://client.eposta.ug" class="hover:text-slate-600 flex items-center gap-1">EPosta<span class="text-[8px]">★</span></a>
    </div>
  </div>

  <!-- ANNOUNCEMENT BAR & BRANCH SELECTOR -->
  <div class="flex-shrink-0 bg-slate-900 text-slate-300 text-[10px] sm:text-[11px] font-semibold px-4 sm:px-6 py-2 sm:py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 border-b border-slate-800 text-center sm:text-left">
    <div class="flex items-center justify-center sm:justify-start gap-2 min-w-0">
      <span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse flex-shrink-0"></span>
      <span class="truncate max-w-[280px] xs:max-w-xs sm:max-w-none">
        Subsidized shipping across all 100+ national post offices
      </span>
    </div>
    <div class="flex-shrink-0">
      <button 
        onclick={() => appState.isLocationModalOpen = true} 
        class="hover:text-white transition-colors flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-red-500 rounded px-1.5 py-0.5"
      >
        <svg class="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.9a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
        </svg>
        <span class="truncate max-w-[180px] sm:max-w-none">
          Branch Location: <strong class="underline text-white font-bold">{appState.activeBranch}</strong>
        </span>
      </button>
    </div>
  </div>
<header class="flex-shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 select-none">
        
        <!-- Logo and Hamburger Row -->
        <div class="flex items-center justify-between w-full md:w-auto gap-4 flex-shrink-0">
          <div class="flex items-center gap-3">
            <!-- Hamburger menu (Now fully wired to state toggles) -->
            <button 
              onclick={() => appState.isSidebarOpen = !appState.isSidebarOpen}
              class="text-slate-800 hover:text-slate-900 focus:outline-none p-1.5 hover:bg-slate-100 rounded-lg transition-colors" 
              aria-label="Catalog menu"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            <!-- Brand Logo -->
            <a href="/" class="flex items-center gap-2 focus:outline-none text-left">
              <div class="font-black text-base sm:text-lg tracking-tight text-slate-950 flex items-center gap-1">
                <img src="https://postcom.ug/assets/postcom-logo-white-B0oZfjq1.jpg" class="size-12" alt="">
                <span>POSTCOM</span>
                <span class="bg-red-600 text-white text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest">UG</span>
              </div>
            </a>
          </div>

          <!-- Mobile Only Utilities -->
          <div class="flex items-center gap-2.5 md:hidden ">
            <button class="relative p-1.5 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none" aria-label="Favorites">
              <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              {#if appState.favoritesCount > 0}
                <span class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-600"></span>
              {/if}
            </button>
            <button onclick={() => goto('/cart')} class="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <span>{appState.cartCount}</span>
            </button>
          </div>
        </div>

        <form onsubmit={handleSearchSubmit} class="w-full md:flex-1 md:max-w-lg">
          <div class="flex  overflow-hidden transition-colors  bg-white">
            <div class="relative flex-1">
              <input 
                type="search" 
                placeholder="Search products, brands and categories..."
                bind:value={appState.searchQuery}
                class="w-full pl-10 pr-4 py-2  text-xs text-slate-800  placeholder-slate-400 font-medium"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <!-- Solid Search CTA -->
            <button type="submit" class="bg-red-600 hover:bg-red-700 text-white font-black text-xs px-6 py-2 transition-colors uppercase tracking-wider flex-shrink-0 cursor-pointer">
              Search
            </button>
          </div>
        </form>

        <!-- Desktop Only Dropdowns and Actions -->
        <div class="hidden md:flex items-center gap-6 flex-shrink-0">
          
          <!-- Jumia Style Account Dropdown (Fully Active Dropdown Menu) -->
          <div class="relative group cursor-pointer">
            <button class="flex items-center gap-1 text-slate-700 hover:text-red-600 text-xs font-black py-2 focus:outline-none transition-colors">
              <svg class="w-5 h-5 text-slate-800 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span>Account</span>
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            
            <!-- Hover dropdown menu block -->
            <div class="absolute right-0 top-full pt-1 w-48 bg-white border border-slate-200 shadow-xl rounded-xl hidden group-hover:block z-50 animate-in fade-in duration-100">
              <ul class="py-1 text-xs font-bold text-slate-600">
                <li><button onclick={() => goto('/cart')} class="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-slate-900 transition-colors">👤 My Profile</button></li>
                <li><button onclick={() => goto('/cart')} class="w-full text-left px-4 py-2.5 hover:bg-slate-50 hover:text-slate-900 transition-colors">📦 My Orders</button></li>
                <li><button onclick={() => goto('/')} class="w-full text-left px-4 py-2.5 border-t border-slate-100 hover:bg-slate-50 hover:text-slate-900 transition-colors">❤️ Saved Items</button></li>
              </ul>
            </div>
          </div>

          <!-- Jumia Style Help Dropdown (Fully Active Dropdown Menu) -->
          <div class="relative group cursor-pointer">
            <button class="flex items-center gap-1 text-slate-700 hover:text-red-600 text-xs font-black py-2 focus:outline-none transition-colors">
              <svg class="w-5 h-5 text-slate-800 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Help</span>
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <!-- Hover dropdown menu block -->
            <div class="absolute right-0 top-full pt-1 w-48 bg-white border border-slate-200 shadow-xl rounded-xl hidden group-hover:block z-50 animate-in fade-in duration-100">
              <ul class="py-1 text-xs font-bold text-slate-600">
                <li><a href="#help" class="block px-4 py-2.5 hover:bg-slate-50 hover:text-slate-900 transition-colors">❓ Help Center</a></li>
                <li><a href="#delivery" class="block px-4 py-2.5 hover:bg-slate-50 hover:text-slate-900 transition-colors">📦 Logistics Rates</a></li>
                <li><button onclick={() => appState.isLocationModalOpen = true} class="w-full text-left px-4 py-2.5 border-t border-slate-100 hover:bg-slate-50 hover:text-slate-900 transition-colors">📍 Posta Map</button></li>
              </ul>
            </div>
          </div>

          <!-- Cart Action -->
          <button onclick={() => goto('/cart')} class="flex items-center gap-2 text-slate-700 hover:text-red-600 text-xs font-black py-2 focus:outline-none transition-colors">
            <div class="relative">
              <svg class="w-5 h-5 text-slate-800 hover:text-red-600 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              {#if appState.cartCount > 0}
                <span class="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {appState.cartCount}
                </span>
              {/if}
            </div>
            <span>Cart</span>
          </button>
        </div>
      </header>
  <!-- INNER COMPACT APP CONTAINER -->
  <div class="flex-1 flex items-center justify-center p-0 overflow-hidden ">
    <div class="w-full h-full max-w-[1450px] bg-white  shadow-xl border border-slate-300/80 overflow-hidden flex flex-col  md:px-10">
      
      <!-- MAIN JUMIA-STYLE UNIFIED HEADER -->
      

      <!-- MAIN WORKSPACE ROW -->
      <div class="flex-1 flex overflow-hidden relative">
         <!-- <aside class="sidebar">
      <FilterSidebar
        bind:selectedCategories
        bind:maxPrice
        bind:onlyInStock
        {activeFilterCount}
        onReset={resetAllFilters}
      />
    </aside>
        -->
       <SidebarNav 
          selectedCategory={appState.selectedCategory} 
          fulfillmentMode={appState.fulfillmentMode} 
          onCategoryChange={updateCategory}
          onFulfillmentChange={updateFulfillment}
        />

        <main class="flex-1 overflow-y-auto h-full p-6">
          {@render children?.()}
        </main>
      </div>
    </div>
  </div>

  <!-- Mobile Drawer Backdrop Overlay -->
  {#if appState.isSidebarOpen}
    <button 
      onclick={() => appState.isSidebarOpen = false}
      class="fixed inset-0 bg-slate-950/40 z-30 lg:hidden transition-opacity duration-300"
      aria-label="Close menu drawer"
    ></button>
  {/if}
</div>

<!-- FLOATING TOAST NOTIFICATION STACK -->
<div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-full max-w-xs sm:max-w-sm pointer-events-none px-4 sm:px-0" aria-live="polite">
  {#each appState.toasts as toast (toast.id)}
    <div class="pointer-events-auto bg-slate-900 text-white border border-slate-800 rounded-xl px-4 py-3 shadow-lg flex items-center justify-between gap-3 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200">
      <div class="flex items-center gap-2 min-w-0">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse"></span>
        <span class="truncate">{toast.message}</span>
      </div>
      <button 
        onclick={() => appState.toasts = appState.toasts.filter(t => t.id !== toast.id)}
        class="text-slate-400 hover:text-white transition-colors focus:outline-none"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/each}
</div>

<!-- POPUP MODAL: BRANCH PICKUP SELECTOR -->
{#if appState.isLocationModalOpen}
  <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-300 relative">
      <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
        📍 Pick a Posta Collection Branch
      </h3>
      <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">
        Specifying your local branch routes your checkout items correctly and calculates local postal network delivery subsidies.
      </p>

      <div class="mt-4 space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {#each branches as branch}
          <button 
            onclick={() => { appState.activeBranch = branch; appState.isLocationModalOpen = false; }}
            class="w-full text-left p-2.5 rounded-lg border text-xs font-semibold flex justify-between items-center transition-all
              {appState.activeBranch === branch 
                ? 'border-red-600 bg-red-50 text-red-700' 
                : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'}"
          >
            <span>{branch}</span>
            {#if appState.activeBranch === branch}
              <span class="text-red-600 text-[10px] font-bold">Selected</span>
            {/if}
          </button>
        {/each}
      </div>

      <button 
        onclick={() => appState.isLocationModalOpen = false}
        class="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition-colors"
      >
        Save Branch Choice
      </button>
    </div>
  </div>
{/if}

<style>
   @media (max-width: 1023px) {
    .body-grid { grid-template-columns: 1fr; }
    .sidebar { display: none; }
  }

  /* ── Sidebar Shell ────────────────────────── */
  .sidebar {
    background: var(--white);
    border-right: 1px solid var(--line);
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .sidebar::-webkit-scrollbar { display: none; }
</style>