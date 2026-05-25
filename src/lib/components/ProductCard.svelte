<!-- lib/components/ProductCard.svelte -->
<script>
  let { 
    product, 
    isFavorited = false, 
    onCardClick, 
    onToggleFavorite, 
    onAddToCart 
  } = $props();

  let isLoaded = $state(false);
  
  // Local reactive tracker for localized added checkmark
  let isAddedRecently = $state(false);

  let discountPercentage = $derived(
    product.originalPrice > product.price 
      ? Math.round((1 - product.price / product.originalPrice) * 100) 
      : 0
  );

  function handleAdd(e) {
    e.stopPropagation();
    onAddToCart?.(product);
    
    // Switch state to green success checkmark
    isAddedRecently = true;
    setTimeout(() => {
      isAddedRecently = false;
    }, 2000);
  }
</script>

<button 
  onclick={() => onCardClick?.(product)}
  class="bg-white rounded-xl border border-slate-200/60 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group text-left w-full focus:outline-none"
>
  <div class="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden border-b border-slate-100">
    <img 
      src={product.placeholder} 
      alt="" 
      aria-hidden="true" 
      class="absolute inset-0 w-full h-full object-cover blur-md transition-opacity duration-300
        {isLoaded ? 'opacity-0' : 'opacity-100'}"
    />
    <img 
      src={product.images[0]} 
      alt={product.name}
      loading="lazy"
      onload={() => isLoaded = true}
      class="w-full h-full object-cover transition-all duration-300 group-hover:scale-102
        {isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}"
    />

    <!-- Repositioned Badge over image to save vertical height -->
    {#if product.badge}
      <span class="absolute top-2 left-2 z-10 bg-slate-900/85 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
        {product.badge}
      </span>
    {/if}

    <div 
      onclick={(e) => { e.stopPropagation(); onToggleFavorite?.(product.id); }}
      class="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs shadow-xs hover:bg-white flex items-center justify-center border border-slate-200/30 text-slate-400 hover:text-red-600 transition-colors focus:outline-none"
      aria-label="Favorite product"
    >
      <svg class="w-3.5 h-3.5 {isFavorited ? 'fill-red-600 stroke-red-600' : 'stroke-slate-500'}" fill="none" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    </div>
  </div>

  <div class="p-3 flex-1 flex flex-col justify-between gap-2.5 w-full">
    <div class="space-y-1">
      <!-- Title: compact line-clamp-1 to save space -->
      <h4 class="text-xs font-semibold text-slate-800 line-clamp-1 leading-tight">
        {product.name}
      </h4>

      <!-- Price Block (Smaller fonts and gaps) -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="text-sm font-bold text-slate-900">
          {product.price.toLocaleString()} UGX
        </span>
        {#if discountPercentage > 0}
          <span class="text-[10px] text-slate-400 line-through font-medium">
            {product.originalPrice.toLocaleString()}
          </span>
          <span class="text-[9px] text-red-600 bg-red-50 font-bold px-1 py-0.2 rounded">
            -{discountPercentage}%
          </span>
        {/if}
      </div>
    </div>

    <div class="space-y-2 pt-0.5">
      <!-- Rating & Stock Status -->
      <div class="flex items-center justify-between text-[10px]">
        <div class="flex items-center gap-0.5 font-semibold text-slate-600">
          <svg class="w-3 h-3 text-amber-500 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span>{product.rating}</span>
          <span class="text-slate-400 font-normal">({product.reviews})</span>
        </div>
        
        <span class="text-[9px] font-bold text-emerald-600 bg-emerald-50/80 px-1.5 py-0.5 rounded">
          {product.stockStatus}
        </span>
      </div>

      <!-- Compact Button -->
      <div 
        onclick={handleAdd}
        class="w-full border text-[11px] font-semibold py-1.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 focus:outline-none cursor-pointer
          {isAddedRecently 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'border-slate-200 hover:border-slate-800 hover:bg-slate-800 hover:text-white text-slate-700'}"
      >
        {#if isAddedRecently}
          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Added</span>
        {:else}
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Add</span>
        {/if}
      </div>
    </div>
  </div>
</button>