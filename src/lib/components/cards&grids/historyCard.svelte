<!-- lib/components/cards&grids/CartProductCard.svelte -->
<script>
  let { item, iscart = false, adjustQuantity, children } = $props();

  // Resolve standard product properties or custom mock order parameters dynamically
  let name = $derived(item.product?.name || item.name || item.items || "Sourced Item");
  let price = $derived(item.product?.price || item.price || 0);
  let image = $derived(
    item.product?.images?.[0] || 
    item.images?.[0] || 
    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&q=80"
  );
  let quantity = $derived(item.quantity || 1);
</script>

<div class="border border-slate-200 bg-white rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4 select-none">
  <div class="flex items-start gap-4 min-w-0 flex-1">
    
    <!-- Thumbnail Frame -->
    <div class="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
      <img src={image} alt="" class="w-full h-full object-cover mix-blend-multiply" />
    </div>

    <!-- Product details section -->
    <div class="min-w-0 flex-1 space-y-1">
      <h4 class="text-xs sm:text-sm font-black text-slate-900 leading-snug line-clamp-2">{name}</h4>
      
      {#if iscart}
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          UGX {price.toLocaleString()} each
        </p>
      {:else if item.id}
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[9px] font-black tracking-widest text-slate-400 uppercase font-mono">{item.id}</span>
          <span class="text-slate-300 text-[10px]">•</span>
          <span class="text-xs text-slate-400 font-semibold">{item.date}</span>
        </div>
      {/if}

      <!-- Custom slot rendering active children / status steps -->
      {#if children}
        <div class="pt-1.5">
          {@render children()}
        </div>
      {/if}
    </div>
  </div>

  <!-- Right alignment controls for pricing -->
  <div class="flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-3 shrink-0">
    {#if iscart}
      <div class="flex items-center border border-slate-200 rounded-full h-8 bg-slate-50">
        <button onclick={() => adjustQuantity?.(-1)} class="w-8 text-lg font-bold text-slate-600 hover:bg-slate-100 h-full rounded-l-full flex items-center justify-center focus:outline-none cursor-pointer">
          −
        </button>
        <span class="px-2 text-xs font-black text-slate-800">{quantity}</span>
        <button onclick={() => adjustQuantity?.(1)} class="w-8 text-lg font-bold text-[#0aad0a] hover:bg-slate-100 h-full rounded-r-full flex items-center justify-center focus:outline-none cursor-pointer">
          +
        </button>
      </div>
      <p class="text-xs font-black text-slate-900">UGX {(price * quantity).toLocaleString()}</p>
    {:else if item.total}
      <div class="text-left sm:text-right">
        <p class="text-sm font-black text-slate-900">{item.total}</p>
      </div>
    {/if}
  </div>
</div>