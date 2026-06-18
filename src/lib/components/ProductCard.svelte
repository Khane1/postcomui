<script>
  import { appState } from '$lib/state.svelte.js';

  let { 
    product, 
    isFavorited = false, 
    onCardClick, 
    onToggleFavorite, 
    onAddToCart 
  } = $props();

  let isLoaded = $state(false);
  let isHovered = $state(false);

  // Instacart-style inline quantity tracking
  let cartEntry = $derived(appState.cartItems.find(item => item.product.id === product.id));
  let quantityInCart = $derived(cartEntry ? cartEntry.quantity : 0);

  // Reactive Parser: Extracts clean name and unit sizes (e.g., "500g", "2kg Pack")
  let parsed = $derived.by(() => {
    const name = product.name;
    const match = name.match(/\(([^)]*(?:500g|2kg Pack|1L|250g|100g|1KG|1kg|Medium Roast)[^)]*)\)$/i);
    if (match) {
      const sizeStr = match[1];
      const cleanedName = name.replace(match[0], '').trim();
      return {
        name: cleanedName,
        size: sizeStr
      };
    }
    return {
      name: name,
      size: '1 each' // Instacart default fallback
    };
  });

  // Instacart Typographic Price Parser: Big integer, superscript symbol and decimals
  let priceParts = $derived.by(() => {
    const str = product.price.toLocaleString(); // e.g., "24,500" or "9,500"
    const commaIndex = str.indexOf(',');
    if (commaIndex !== -1) {
      return {
        major: str.slice(0, commaIndex),
        minor: str.slice(commaIndex)
      };
    }
    return { major: str, minor: '' };
  });

  function handleIncrement(e) {
    e.stopPropagation();
    onAddToCart?.(product);
  }

  function handleDecrement(e) {
    e.stopPropagation();
    if (!cartEntry) return;
    if (cartEntry.quantity > 1) {
      cartEntry.quantity -= 1;
    } else {
      appState.cartItems = appState.cartItems.filter(item => item.product.id !== product.id);
    }
    appState.addToast(`Removed ${product.name} from basket`, 'info');
  }
</script>

<div 
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
  onclick={() => onCardClick?.(product)}
  class="bg-white flex flex-col  justify-between w-full relative aspect-[3/4] p-2  transition-all duration-200 select-none cursor-pointer"
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === 'Enter' && onCardClick?.(product)}
>
  
  <!-- Image Container -->
  <div class="relative w-full aspect-square bg-slate-50/40 flex items-center justify-center">
    
    <!-- Blur-up Loader -->
    <img 
      src={product.placeholder} 
      alt="" 
      aria-hidden="true" 
      class="absolute inset-4 object-cover blur-md transition-opacity duration-300
        {isLoaded ? 'opacity-0' : 'opacity-100'}"
    />
    
    <!-- Master Product Image -->
    <img 
      src={product.images[0]} 
      alt={product.name}
      loading="lazy"
      onload={() => isLoaded = true}
      class="w-full h-full object-cover mix-blend-multiply transition-all duration-300 rounded
        {isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        {isHovered ? '' : ''}"
    />

    <!-- Floating Action Stepper Button (Direct match to reference) -->
    <!-- Floating Action Stepper Button -->
    {#if quantityInCart > 0}
      <div 
        onclick={(e) => e.stopPropagation()}
        class="absolute top-2 right-2 z-20 flex items-center bg-white border border-slate-200/80 rounded-full h-8 shadow-md px-1 select-none"
      >
        <button 
          onclick={handleDecrement}
          class="w-6 h-6 rounded-full flex items-center justify-center text-[#0aad0a] hover:bg-slate-50 font-black text-sm focus:outline-none"
          aria-label="Remove item"
        >
          −
        </button>

        <!-- Change: Wrapped in a key block to trigger the CSS pop animation on change -->
        {#key quantityInCart}
          <span class="px-2 text-xs font-black text-slate-800 animate-pop inline-block">
            {quantityInCart}
          </span>
        {/key}

        <button 
          onclick={handleIncrement}
          class="w-6 h-6 rounded-full flex items-center justify-center text-[#0aad0a] hover:bg-slate-50 font-black text-sm focus:outline-none"
          aria-label="Add item"
        >
          +
        </button>
      </div>
    {:else}
      <button 
        onclick={handleIncrement}
        class="absolute top-2 right-2 z-20 bg-[#0aad0a] hover:bg-[#099409] text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transition-all active:scale-95 cursor-pointer focus:outline-none"
      >
        <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" stroke-width="3.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        <span>Add</span>
      </button>
    {/if}

    <!-- Simple Favorite Heart Icon -->
    <button 
      onclick={(e) => { e.stopPropagation(); onToggleFavorite?.(product.id); }}
      class="absolute bottom-2 left-2 z-10 w-6 h-6 rounded-full bg-white/90 hover:bg-white flex items-center justify-center border border-slate-200/20 text-slate-400 hover:text-red-500 transition-all active:scale-90 focus:outline-none"
      aria-label="Save item"
    >
      <svg class="w-3 h-3 transition-transform {isFavorited ? 'fill-red-500 stroke-red-500 scale-110' : 'stroke-slate-400'}" fill="none" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    </button>
  </div>

  <!-- Details & Pricing -->
 <div class="mt-2.5 flex-1 flex flex-col justify-between">
    <div class="space-y-1">
      
      <!-- Typographical Price Block (Matching Screenshot) -->
      <div class="flex items-start text-slate-900 leading-none py-0.5">
        <span class="text-[9px] font-bold mt-0.5 mr-0.5">UGX</span>
        <span class="text-lg font-extrabold tracking-tight">{priceParts.major}</span>
        {#if priceParts.minor}
          <span class="text-[9px] font-bold mt-0.5">{priceParts.minor}</span>
        {/if}
      </div>

      <!-- Clean Instacart Sans-Serif Title -->
      <h4 class="text-xs text-slate-700 font-medium line-clamp-2 leading-tight tracking-tight">
        {parsed.name}
      </h4>

      <!-- Stars Rating & Reviews (Matching Screenshot) -->
      {#if product.reviews}
        <div class="flex items-center gap-1 text-[10px] py-0.5">
          <span class="text-amber-400 tracking-tighter">★★★★★</span>
          <span class="text-slate-400 font-semibold">({product.reviews})</span>
        </div>
      {/if}
    </div>

    <!-- Stock Status / Size details (Matching Screenshot) -->
    <div class="pt-1 select-none">
      <div class="text-[11px] text-slate-400 font-medium leading-none">
        {parsed.size}
      </div>
      {#if product.stockStatus === "Many in stock"}
        <div class="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1.5">
          <span class="text-xs leading-none">☰</span>
          <span>Many in stock</span>
        </div>
      {/if}
    </div>
  </div>

</div>

<style>
  /* Spring-like pop animation on quantity update */
  @keyframes scale-pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
  .animate-pop {
    animation: scale-pop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
</style>