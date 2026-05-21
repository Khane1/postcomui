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

  function updateCategory(cat) {
    appState.selectedCategory = cat;
    if (page.params.id) {
      goto('/');
    }
  }
  
  function updateFulfillment(mode) {
    appState.fulfillmentMode = mode;
  }
</script>

<!-- BACKDROP LOCKDOWN CONTAINER -->
<div class="h-screen w-screen bg-slate-200 overflow-hidden flex flex-col font-sans text-slate-800">
  
  <!-- FIXED TOP UTILITY BAR (Does not scroll) -->
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

  <!-- INNER COMPACT FRAME CONTAINER -->
  <div class="flex-1 flex items-center justify-center  overflow-hidden">
    <div class="w-full h-full max-w-[1450px] bg-white lg:rounded-3xl shadow-xl border border-slate-300/80 overflow-hidden flex flex-col">
      
      <!-- FIXED GLOBAL HEADER -->
      <header class="flex-shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div class="flex items-center justify-between w-full md:w-auto gap-4 flex-shrink-0">
          <a href="/" class="flex items-center gap-2 focus:outline-none text-left">
            <div class="font-black text-base sm:text-lg tracking-tight text-slate-950 flex items-center gap-1">
              <span>POSTCOM</span>
              <span class="bg-red-600 text-white text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest">UG</span>
            </div>
          </a>
          <div class="flex items-center gap-2.5 md:hidden">
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

        <div class="w-full md:flex-1 md:max-w-lg">
          <div class="relative">
            <input 
              type="search" 
              placeholder="Search premium local farm products, organic oils..."
              bind:value={appState.searchQuery}
              class="w-full pl-10 pr-4 py-2 bg-slate-100 focus:bg-slate-50 border border-slate-200 focus:border-slate-300 rounded-xl text-xs transition-all focus:outline-none"
            />
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
        </div>

        <div class="hidden md:flex items-center gap-4 flex-shrink-0">
          <button class="relative p-2 hover:bg-slate-100 rounded-xl transition-colors focus:outline-none" aria-label="Favorites">
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {#if appState.favoritesCount > 0}
              <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600"></span>
            {/if}
          </button>

          <button onclick={() => goto('/cart')} class="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm focus:outline-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <span class="hidden sm:inline">Cart:</span> <span>{appState.cartCount} items</span>
          </button>
        </div>
      </header>

      <!-- MAIN WORKSPACE ROW -->
      <div class="flex-1 flex overflow-hidden relative">
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