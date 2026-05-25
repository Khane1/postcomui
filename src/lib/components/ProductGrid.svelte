<!-- ProductGrid.svelte -->
<script>
  import ProductCard from './ProductCard.svelte';

  let { 
    products = [], 
    favoritedMap = {}, 
    title = "Current Catalog Offerings",
    onProductSelect,
    onToggleFavorite,
    onAddToCart
  } = $props();
</script>

<div class="space-y-6">
  <section class="space-y-4">
    <div class="flex justify-between items-baseline border-b border-slate-200 pb-2">
      <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">
        {title}
      </h3>
      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        Showing {products.length} items
      </p>
    </div>

    {#if products.length === 0}
      <div class="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
        <p class="text-sm font-semibold text-slate-500">No matching items located in this sector.</p>
      </div>
    {:else}
      <!-- Dense, responsive grid customized for compact cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 max-w-7xl">
        {#each products as product (product.id)}
          <ProductCard 
            {product}
            isFavorited={!!favoritedMap[product.id]}
            onCardClick={onProductSelect}
            {onToggleFavorite}
            {onAddToCart}
          />
        {/each}
      </div>
    {/if}
  </section>
</div>