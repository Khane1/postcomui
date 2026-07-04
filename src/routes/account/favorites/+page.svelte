<!-- routes/account/favorites/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { appState } from "$lib/state.svelte.js";
  import { products } from "$lib/data/products.js";
  import ProductCard from "$lib/components/cards&grids/ProductCard.svelte";

  // Aggregates standard and backend products to ensure active card updates 
  let favoritedProductsList = $derived.by(() => {
    const pool = [...(appState.wishlistProducts || []), ...(appState.allProducts || []), ...products];
    const uniquePool = [];
    const seen = new Set();
    
    for (const p of pool) {
      if (p && !seen.has(p.id)) {
        seen.add(p.id);
        uniquePool.push(p);
      }
    }
    
    // Filters based directly on active favorites
    return uniquePool.filter(p => (appState.favorites || []).includes(p.id));
  });

  onMount(() => {
    appState.fetchWishlist();
  });

  function handleProductRedirect(product) {
    appState.selectedProductForModal = product;
  }

  function handleFavoriteToggle(id) {
    appState.toggleFavorite(id);
  }

  function handleAddToCart(product) {
    appState.addCartItem(product);
  }
</script>

<div class="max-w-2xl text-slate-900 py-6 select-none flex flex-col gap-6">
  <!-- Section Header -->
  <div class="border-b border-slate-100 pb-4">
    <h2 class="text-[22px] font-bold text-slate-900 tracking-tight">Favorites</h2>
    <p class="text-[13px] text-slate-500 font-light mt-1">Quickly find and reorder your favorite items.</p>
  </div>

  {#if favoritedProductsList.length === 0}
    <!-- Clean Empty State -->
    <div class="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto space-y-5">
      <div class="w-24 h-24 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      </div>
      
      <div class="space-y-1.5">
        <h4 class="text-base font-bold text-slate-900">No favorites saved yet</h4>
        <p class="text-[13px] text-slate-500 font-light leading-relaxed">
          Tap the heart icon on any product while browsing to save it here for quick access.
        </p>
      </div>

      <button 
        onclick={() => goto("/")} 
        class="inline-block bg-[#0aad0a] hover:bg-[#099409] text-white text-xs font-semibold px-6 py-3 rounded-full transition-all active:scale-95 focus:outline-none cursor-pointer shadow-xs"
      >
        Browse Products
      </button>
    </div>
  {:else}
    <!-- Product Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
      {#each favoritedProductsList as product (product.id)}
        <div class="w-full">
          <ProductCard 
            {product}
            isFavorited={true}
            onCardClick={handleProductRedirect}
            onToggleFavorite={handleFavoriteToggle}
            onAddToCart={handleAddToCart}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>