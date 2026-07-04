<!-- src/routes/[id]/+page.svelte -->
<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { appState } from '$lib/state.svelte.js';
  import { products } from '$lib/data/products.js';
  import { publicApi } from '$lib/config/api.js';
  import { mapBackendProductToUI, resolveImageUrl } from '$lib/utils/mappers.js';

  let productId = $derived(page.params.id); 
  let product = $state(null);

  let selectedThumbnailIndex = $state(0);
  let selectedFulfillment = $state("pickup");
  let quantity = $state(1);
  let isAddedRecently = $state(false);

  // Variations Selection State
  let selectedVariations = $state({});
  let activeImageOverride = $state(null);

  // Compute Total Price reactively
  let totalPrice = $derived.by(() => {
    if (!product) return 0;
    const additions = Object.values(selectedVariations).reduce((acc, v) => acc + (v.priceVariation || 0), 0);
    return product.price + additions;
  });

  $effect(() => {
    async function fetchProductDetails() {
      try {
        const res = await publicApi.get(`/products/${productId}`);
        product = mapBackendProductToUI(res.data);
      } catch (err) {
        product = appState.allProducts.find(p => String(p.id) === String(productId)) || 
                  products.find(p => String(p.id) === String(productId));
      }
    }
    if (productId) {
      fetchProductDetails();
      selectedVariations = {};
      activeImageOverride = null;
    }
  });

  function handleSelectVariation(groupType, variation) {
    selectedVariations[groupType] = variation;
    if (variation.image) {
      const resolved = resolveImageUrl(variation.image);
      if (resolved) {
        activeImageOverride = resolved;
      }
    }
  }

  function handleImageError(e) {
    const rawUrl = activeImageOverride || product.images[selectedThumbnailIndex];
    const filename = rawUrl.split('/').pop();
    const legacyUrl = `${import.meta.env.VITE_APP_BASE_URL || 'https://api.postcom.labs.eposta.ug'}/images/${filename}`;

    if (e.currentTarget.src !== legacyUrl) {
      e.currentTarget.src = legacyUrl;
    } else {
      e.currentTarget.src = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400";
    }
  }
</script>

{#if product}
  <div class="space-y-6">
    <nav class="flex flex-wrap items-center justify-between gap-y-2.5 text-xs font-semibold text-slate-500 border-b border-slate-100 pb-4">
      <div class="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs min-w-0">
        <a href="/" class="hover:text-slate-900 transition-colors flex-shrink-0">Catalog</a>
        <svg class="w-3 h-3 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
        <span class="text-slate-400 font-medium truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none flex-shrink-0">
          {product.category}
        </span>
        <svg class="w-3 h-3 text-slate-300 flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
        <span class="text-slate-900 font-black truncate max-w-[140px] md:max-w-sm hidden sm:block">
          {product.name}
        </span>
      </div>
      
      <a 
        href="/" 
        class="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors flex-shrink-0 text-[11px] sm:text-xs focus:outline-none rounded p-0.5"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        <span>Back to Listings</span>
      </a>
    </nav>

    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <div class="xl:col-span-5 space-y-4">
        <div class="relative w-full aspect-square bg-slate-50 border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
          <img 
            src={activeImageOverride || product.images[selectedThumbnailIndex]} 
            alt={product.name}
            onerror={handleImageError}
            class="w-full h-full object-cover"
          />
          {#if product.badge}
            <div class="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
              <span class="bg-slate-900 text-white text-[9px] font-black px-2.5 py-1 rounded shadow-sm uppercase tracking-wider">
                {product.badge}
              </span>
            </div>
          {/if}
        </div>

        <div class="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {#each product.images as img, index}
            <button 
              onclick={() => { selectedThumbnailIndex = index; activeImageOverride = null; }}
              class="w-16 h-16 rounded-xl overflow-hidden border-2 bg-slate-50 flex-shrink-0 transition-all
                {selectedThumbnailIndex === index && !activeImageOverride ? 'border-slate-900 shadow' : 'border-slate-200 hover:border-slate-300'}"
            >
              <img src={img} alt="" class="w-full h-full object-cover"/>
            </button>
          {/each}
        </div>
      </div>

      <div class="xl:col-span-7 space-y-6">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-red-600 uppercase tracking-widest">{product.category}</span>
            <span class="text-slate-300">•</span>
            <span class="text-xs text-slate-500 font-semibold">By {product.seller}</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{product.name}</h1>
          <p class="text-xs text-slate-600 leading-relaxed pt-2">{product.description}</p>

          <!-- Display categories list -->
          {#if product.categories && product.categories.length > 0}
            <div class="flex flex-wrap gap-1.5 pt-1">
              {#each product.categories as cat}
                <span class="text-[9px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                  {cat.name || cat}
                </span>
              {/each}
            </div>
          {/if}
        </div>

        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-center justify-between">
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price Point</p>
            <span class="text-2xl font-black text-slate-900">{totalPrice.toLocaleString()} UGX</span>
          </div>
          <span class="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded">{product.stockStatus}</span>
        </div>

        <!-- Render active variations if present -->
        {#if product.variations && product.variations.length > 0}
          <div class="space-y-4 pt-3 border-t border-slate-100 select-none">
            {#each product.variations as group}
              <div class="space-y-1.5">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{group.variationType}</span>
                <div class="flex flex-wrap gap-2">
                  {#each group.variations as variation}
                    {@const isSelected = selectedVariations[group.variationType]?.id === variation.id}
                    <button
                      onclick={() => handleSelectVariation(group.variationType, variation)}
                      class="px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all focus:outline-none text-left
                        {isSelected 
                          ? 'border-slate-800 bg-slate-50 text-slate-950 font-bold' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}"
                    >
                      <span>{variation.label}</span>
                      {#if variation.priceVariation}
                        <span class="text-[10px] text-emerald-600 font-black ml-1">
                          (+{variation.priceVariation.toLocaleString()} UGX)
                        </span>
                      {/if}
                    </button>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <div class="space-y-3">
          <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">Select Courier Route</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onclick={() => selectedFulfillment = "pickup"}
              class="text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3
                {selectedFulfillment === 'pickup' ? 'border-slate-900 bg-slate-900/5' : 'border-slate-200 bg-white'}"
            >
              <span class="text-xs font-extrabold text-slate-900 uppercase">Post Office Pickup</span>
              <p class="text-[11px] text-slate-500">Pick up tomorrow morning safely at <strong class="text-slate-800">{appState.activeBranch}</strong> with <strong>Free Delivery</strong>.</p>
            </button>

            <button 
              onclick={() => selectedFulfillment = "delivery"}
              class="text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3
                {selectedFulfillment === 'delivery' ? 'border-slate-900 bg-slate-900/5' : 'border-slate-200 bg-white'}"
            >
              <span class="text-xs font-extrabold text-slate-900 uppercase">Home Delivery</span>
              <p class="text-[11px] text-slate-500">Direct transit processing route dispatched straight to your door.</p>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4 pt-4">
          <div class="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden h-11 bg-white flex-shrink-0">
            <button onclick={() => quantity = Math.max(1, quantity - 1)} class="px-3 hover:bg-slate-50 font-bold text-sm">-</button>
            <span class="w-10 text-center text-xs font-black">{quantity}</span>
            <button onclick={() => quantity++} class="px-3 hover:bg-slate-50 font-bold text-sm">+</button>
          </div>

          <button 
            onclick={() => {
              const existing = appState.cartItems.find(item => String(item.product.id) === String(product.id));
              if (existing) {
                existing.quantity += quantity;
                existing.fulfillment = selectedFulfillment;
              } else {
                appState.cartItems.push({
                  product,
                  quantity,
                  fulfillment: selectedFulfillment
                });
              }
              appState.addToast(`Added ${quantity}x items to basket`);
              
              isAddedRecently = true;
              setTimeout(() => {
                isAddedRecently = false;
                goto('/');
              }, 1200);
            }}
            class="flex-1 text-white text-xs font-black h-11 rounded-xl transition-all flex items-center justify-center gap-2 focus:outline-none
              {isAddedRecently ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}"
          >
            {#if isAddedRecently}
              <svg class="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Added Successfully</span>
            {:else}
              <span>Add to Cart Allocation</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="p-12 text-center">
    <p class="text-sm font-bold text-slate-500">Target listing footprint could not be identified.</p>
    <a href="/" class="text-xs text-red-600 font-bold underline mt-2 block">Return to Dashboard</a>
  </div>
{/if}