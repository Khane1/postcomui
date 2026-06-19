<!-- lib/components/ProductDetailModal.svelte -->
<script>
  import { appState } from '$lib/state.svelte.js';
  import { products } from '$lib/data/products.js';
  import ProductCard from './ProductCard.svelte';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let product = $derived(appState.selectedProductForModal);

  // Instacart-style live quantity sync
  let cartEntry = $derived(appState.cartItems.find(item => item.product.id === product?.id));
  let quantityInCart = $derived(cartEntry ? cartEntry.quantity : 0);
  let selectedThumbnailIndex = $state(0);

  // Element bindings for scroll control
  let modalShell = $state();
  let scrollContainer = $state();

  function scrollToTop() {
    // Reset internal container scrolls to top
    if (modalShell) modalShell.scrollTop = 0;
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }

  // Safely reset thumbnail pointer & scroll when switching selected products
  $effect(() => {
    if (product) {
      selectedThumbnailIndex = 0;
      scrollToTop(); // This ensures it scrolls to top automatically when a user clicks a suggestion
    }
  });

  // Accordion Expand States
  let detailsExpanded = $state(true);
  let returnsExpanded = $state(false);
  let isFavorited = $state(false);

  // Suggestions row ("Customers also considered")
  let suggestions = $derived(
    product 
      ? products.filter(p => p.id !== product.id && p.category === product.category)
      : []
  );

  function close() {
    appState.selectedProductForModal = null;
  }

  function handleIncrement() {
    if (!product) return;
    const existing = appState.cartItems.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      appState.cartItems.push({ product, quantity: 1, fulfillment: appState.fulfillmentMode });
    }
  }

  function handleDecrement() {
    if (!product || !cartEntry) return;
    if (cartEntry.quantity > 1) {
      cartEntry.quantity -= 1;
    } else {
      appState.cartItems = appState.cartItems.filter(item => item.product.id !== product.id);
    }
  }

  // Quick-format UGX currency
  let priceParts = $derived.by(() => {
    if (!product) return { major: '0', minor: '' };
    const str = product.price.toLocaleString();
    const commaIndex = str.indexOf(',');
    return commaIndex !== -1 ? { major: str.slice(0, commaIndex), minor: str.slice(commaIndex) } : { major: str, minor: '' };
  });
</script>

{#if product}
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 z-120 bg-slate-950/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
    role="button"
    tabindex="0"
    onclick={close}
    onkeydown={(e) => e.key === 'Escape' && close()}
  >
    <!-- Modal Shell (Mobile slides from bottom up, Desktop is a centered card) -->
    <div 
      bind:this={modalShell}
      class="bg-white w-full rounded-t-3xl sm:rounded-3xl max-w-4xl sm:max-h-[90vh] h-[85vh] sm:h-auto overflow-y-auto flex flex-col justify-between shadow-2xl border border-slate-200/50"
      onclick={(e) => e.stopPropagation()}
      role="none"
      transition:fly={{ y: 440, duration: 300, easing: cubicOut }}
    >
      <!-- Mobile Pull Tab -->
      <div class="sm:hidden w-12 h-1 bg-slate-300 rounded-full mx-auto my-3 shrink-0"></div>

      <!-- Scrollable Container -->
      <div 
        bind:this={scrollContainer}
        class="p-5 sm:p-8 space-y-8 overflow-y-auto flex-1"
      >
        
        <!-- Header Controls -->
        <div class="flex items-center justify-between">
          <button onclick={close} class="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-black focus:outline-none">
            <span>← Back</span>
          </button>
          <button onclick={close} class="text-slate-400 hover:text-slate-600 focus:outline-none hidden sm:block">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Upper: Split Product Grid Detail -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          
         <!-- LEFT SIDE PANEL: Gallery, Title, Brand, & Accordions (60% Width) -->
          <div class="md:col-span-7 space-y-6">
            
            <!-- Gallery Layout -->
            <div class="flex gap-4 items-start w-full relative">
              
              <!-- Vertical Thumbnail Strip (Instacart Style) -->
              <div class="flex flex-col gap-2 shrink-0 select-none">
                {#each product.images as img, index}
                  <button 
                    onclick={() => selectedThumbnailIndex = index}
                    class="w-12 h-12 rounded-xl bg-white border-2 flex items-center justify-center p-1.5 focus:outline-none transition-all
                      {selectedThumbnailIndex === index 
                        ? 'border-slate-800 shadow-xs' 
                        : 'border-slate-200/80 hover:border-slate-400'}"
                    aria-label="View product image {index + 1}"
                  >
                    <img src={img} alt="" class="max-w-full max-h-full object-contain mix-blend-multiply" />
                  </button>
                {/each}

                <!-- Scroll down locator chevron -->
                {#if product.images.length > 3}
                  <button 
                    onclick={() => selectedThumbnailIndex = (selectedThumbnailIndex + 1) % product.images.length}
                    class="w-12 h-12 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 text-xs font-bold shadow-xs cursor-pointer focus:outline-none mt-1"
                  >
                    ▼
                  </button>
                {/if}
              </div>

              <!-- Main Centered Image Display -->
              <div class="flex-1 aspect-square bg-slate-50/45 border border-slate-200/40 rounded-3xl relative overflow-hidden">
                <img 
                  src={product.images[selectedThumbnailIndex]} 
                  alt={product.name} 
                  class="w-full h-full object-cover mix-blend-multiply transition-all duration-200" 
                />
                
                {#if product.badge}
                  <span class="absolute top-4 left-4 bg-slate-900/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider z-10">
                    {product.badge}
                  </span>
                {/if}
              </div>
            </div>

            <!-- Product Header Details -->
            <div class="space-y-1.5 pt-2">
              {#if product.reviews}
                <div class="flex items-center gap-1.5 text-xs font-semibold">
                  <span class="text-amber-400">★★★★★</span>
                  <span class="text-slate-800">{product.rating}</span>
                  <span class="text-slate-400">({product.reviews})</span>
                </div>
              {/if}
              
              <h2 class="text-lg sm:text-2xl font-black text-slate-900 leading-tight tracking-tight">{product.name}</h2>
              <p class="text-xs text-slate-400 font-bold">{product.size}</p>
              
              <button 
                onclick={() => { appState.selectedCategory = product.category; close(); }}
                class="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer focus:outline-none block pt-1"
              >
                Shop all {product.seller}
              </button>
            </div>

            <!-- Accordions Panel Stack -->
            <div class="border-t border-slate-200/60 pt-1 space-y-1">
              
              <!-- Accordion 1: Details -->
              <div class="border-b border-slate-200/40">
                <button 
                  onclick={() => detailsExpanded = !detailsExpanded}
                  class="w-full flex items-center justify-between py-3.5 focus:outline-none text-left"
                >
                  <span class="text-xs font-black text-slate-900 uppercase tracking-widest">Details</span>
                  <svg class="w-4 h-4 text-slate-400 transition-transform {detailsExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {#if detailsExpanded}
                  <div class="pb-4 text-sm text-slate-600 leading-relaxed animate-in fade-in duration-100">
                    {product.description}
                  </div>
                {/if}
              </div>

              <!-- Accordion 2: Specs / Sourcing -->
              <div class="border-b border-slate-200/40">
                <button 
                  onclick={() => returnsExpanded = !returnsExpanded}
                  class="w-full flex items-center justify-between py-3.5 focus:outline-none text-left"
                >
                  <span class="text-xs font-black text-slate-900 uppercase tracking-widest">Sourcing & Altitude</span>
                  <svg class="w-4 h-4 text-slate-400 transition-transform {returnsExpanded ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {#if returnsExpanded}
                  <div class="pb-4 space-y-2 text-sm text-slate-600 animate-in fade-in duration-100">
                    <div class="flex justify-between"><span class="text-slate-400">Origin</span><span class="text-slate-800 font-bold">{product.origin || 'Local Co-op'}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Altitude</span><span class="text-slate-800 font-bold">{product.altitude || 'Sustainable Sourced'}</span></div>
                    <div class="flex justify-between"><span class="text-slate-400">Logistics Route</span><span class="text-slate-800 font-bold">ePosta Subsidized</span></div>
                  </div>
                {/if}
              </div>

            </div>
          </div>

          <!-- RIGHT SIDE PANEL: Floating Checkout Purchase Box (40% Width) -->
          <div class="md:col-span-5 h-fit select-none">
            <div class="border border-slate-200 rounded-2xl p-5 shadow-xs bg-white space-y-4 relative">
              
              <div class="flex items-start text-slate-900 leading-none">
                <span class="text-xs font-bold mt-1 mr-0.5">UGX</span>
                <span class="text-2xl font-black tracking-tight">{priceParts.major}</span>
                {#if priceParts.minor}
                  <span class="text-xs font-bold mt-1">{priceParts.minor}</span>
                {/if}
              </div>

              <div class="flex">
                <span class="bg-orange-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-xl flex items-center gap-1 select-none">
                  🏷️ Save 1,500 UGX with MoMo
                </span>
              </div>

              <div class="relative">
                <label for="quantity-selector" class="sr-only">Quantity</label>
                <select 
                  id="quantity-selector"
                  value={quantityInCart || 1}
                  onchange={(e) => {
                    const qty = Number(e.target.value);
                    if (cartEntry) {
                      cartEntry.quantity = qty;
                    } else {
                      appState.cartItems.push({ product, quantity: qty, fulfillment: appState.fulfillmentMode });
                    }
                  }}
                  class="w-full flex items-center justify-between border border-slate-300 hover:border-slate-400 rounded-xl px-4 py-2.5 bg-slate-50/50 text-sm font-bold text-slate-800 transition-all focus:outline-none appearance-none cursor-pointer"
                >
                  {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as qty}
                    <option value={qty}>{qty}</option>
                  {/each}
                </select>
                <div class="absolute right-4 top-3.5 pointer-events-none text-slate-500 font-bold text-xs">
                  ▼
                </div>
              </div>

              <button 
                onclick={handleIncrement}
                class="w-full bg-[#0aad0a] hover:bg-[#099409] text-white font-extrabold text-sm h-12 rounded-full transition-all focus:outline-none cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Add to cart</span>
              </button>

              <button 
                onclick={() => isFavorited = !isFavorited}
                class="w-full border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-bold text-xs h-10 rounded-full transition-all focus:outline-none flex items-center justify-center gap-2 bg-white"
              >
                <svg class="w-4 h-4 {isFavorited ? 'fill-red-500 stroke-red-500' : 'stroke-slate-500'}" fill="none" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.175 1.907 1.125 1.907 2.237v12.014c0 1.24-1.328 1.983-2.378 1.258l-4.622-3.193-4.622 3.193c-1.05.725-2.378-.018-2.378-1.258V5.559c0-1.112.807-2.062 1.907-2.237a48.295 48.295 0 0 1 10.116 0Z" />
                </svg>
                <span>{isFavorited ? 'Saved to Favorites' : 'Save'}</span>
              </button>

            </div>
          </div>
        </div>

        <!-- 1. "Customers Also Considered" Row -->
        {#if suggestions.length > 0}
          <div class="space-y-3 pt-4 border-t border-slate-100">
            <h4 class="text-sm font-black text-slate-900 tracking-tight">Customers also considered</h4>
            <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
              {#each suggestions as sug}
                <div class="w-36 shrink-0 snap-start">
                  <ProductCard 
                    product={sug} 
                    onCardClick={() => { 
                      appState.selectedProductForModal = sug; 
                      scrollToTop(); 
                    }} 
                  />
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- 2. Interactive Sponsor / Promo Card -->
        <div class="bg-gradient-to-r from-emerald-50 to-teal-50/20 border border-emerald-100/50 p-4 rounded-2xl flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">Co-op Direct</span>
            <h4 class="text-xs font-black text-slate-900">Sourced Directly from {product.seller}</h4>
            <p class="text-[10px] text-slate-500 font-medium">100% of proceeds fund organic soils and cooperative equipment.</p>
          </div>
          <span class="text-xl select-none">🚜</span>
        </div>

        <!-- 3. Sourcing Details -->
        <div class="border-t border-slate-100 pt-1">
          <button 
            onclick={() => detailsExpanded = !detailsExpanded}
            class="w-full flex items-center justify-between py-3.5 focus:outline-none text-left"
          >
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Sourcing Details</span>
            <span class="text-slate-400 font-bold transition-transform {detailsExpanded ? 'rotate-180' : ''}">▼</span>
          </button>
          
          {#if detailsExpanded}
            <div class="pb-4 space-y-3 text-xs animate-in fade-in duration-100">
              {#if product.origin}
                <div class="flex justify-between border-b border-slate-100 pb-1.5"><span class="text-slate-400">Origin</span><span class="text-slate-800 font-bold">{product.origin}</span></div>
              {/if}
              {#if product.altitude}
                <div class="flex justify-between border-b border-slate-100 pb-1.5"><span class="text-slate-400">Altitude</span><span class="text-slate-800 font-bold">{product.altitude}</span></div>
              {/if}
              <p class="text-[11px] text-slate-500 leading-relaxed italic mt-2">"{product.description}"</p>
            </div>
          {/if}
        </div>

        <!-- 4. Reviews Block -->
        <div class="border-t border-slate-100 pt-4 space-y-3">
          <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest select-none">Reviews ({product.reviews})</h4>
          <div class="space-y-3">
            <div class="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200/20 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-extrabold text-slate-800">Brenda N. (Ntinda)</span>
                <span class="text-amber-400">★★★★★</span>
              </div>
              <p class="text-slate-500 font-medium">Exceptional quality! Exactly what I was looking for, processed and shipped super fast.</p>
            </div>
            <div class="space-y-1 bg-slate-50/50 p-3 rounded-xl border border-slate-200/20 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-extrabold text-slate-800">Joseph O. (Jinja)</span>
                <span class="text-amber-400">★★★★★</span>
              </div>
              <p class="text-slate-500 font-medium">Direct delivery coordinates worked flawlessly. Truly sustainable initiative.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
{/if}

<style>
  .scrollbar-none::-webkit-scrollbar { display: none; }
  .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
</style>