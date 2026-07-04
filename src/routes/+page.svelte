<!-- routes/+page.svelte -->
<script>
  import { goto } from "$app/navigation";
  import { appState } from "$lib/state.svelte.js";
  import ProductGrid from "$lib/components/cards&grids/ProductGrid.svelte";
  import CategoryShowcase from "$lib/components/cards&grids/CategoryShowcase.svelte";
  import SubcategoryScroller from "$lib/components/cards&grids/SubcategoryScroller.svelte";
  import ProductCard from "$lib/components/cards&grids/ProductCard.svelte";

  // Dynamic derivation: maps flat IDs array to reactive bool index map [5]
  let favoritedMap = $derived(
    appState.favorites.reduce((acc, id) => {
      acc[id] = true;
      return acc;
    }, {})
  );

  let agroProducts = $derived(
    appState.allProducts.filter((p) => p.category === "Agro Products"),
  );
  let foodBeverages = $derived(
    appState.allProducts.filter((p) => p.category === "Food & Beverages"),
  );
  let artsCrafts = $derived(
    appState.allProducts.filter((p) => p.category === "Arts & Crafts"),
  );

  let filteredProducts = $derived(
    appState.allProducts.filter((p) => {
      const currentCategory = appState.selectedCategory;
      const currentSearch = appState.searchQuery;

      const matchesCategory =
        currentCategory === "All" || p.category === currentCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
        p.seller.toLowerCase().includes(currentSearch.toLowerCase());

      return matchesCategory && matchesSearch;
    }),
  );

  $effect(() => {
    appState.fetchProducts();
    appState.fetchBanners();
    appState.fetchWishlist(); // Sync wishlist on entry [5]
  });

  function handleProductRedirect(product) {
    appState.selectedProductForModal = product;
  }

  function handleFavoriteToggle(id) {
    appState.toggleFavorite(id); // Direct synchronization with backend APIs [5]
  }

  function handleAddToCart(product) {
    appState.addCartItem(product);
  }
</script>

<div class="flex flex-col gap-10 pb-16 select-none font-sans">
  
  <div class="space-y-6">
    <SubcategoryScroller />
    
    <!-- Sponsored Banner -->
    <div class="flex flex-col">
      <span class="text-xs text-slate-400 font-light pb-1.5 select-none">Sponsored</span>
      <div class="overflow-hidden rounded-2xl border border-slate-100 hover:shadow-xs transition-shadow duration-300">
        <img
          src={appState.banners[0]?.image ||
            "https://www.sliderrevolution.com/wp-content/uploads/2023/06/fashion-shop-header-slider-for-wordpress.gif"}
          onerror={(e) => {
            e.currentTarget.src =
              "https://www.sliderrevolution.com/wp-content/uploads/2023/06/fashion-shop-header-slider-for-wordpress.gif";
          }}
          class="text-3xl text-white h-48 md:h-96 w-full object-cover flex md:justify-start justify-center"
          alt="Promo Banner"
        />
      </div>
    </div>

    <!-- AISLE 1: FARM FRESH PRODUCE -->
    <div class="space-y-4 pt-4">
      <div class="flex justify-between items-baseline border-b border-slate-100 pb-3">
        <div>
          <h3 class="text-lg font-bold text-slate-900 tracking-tight">
            Farm fresh produce
          </h3>
          <p class="text-[13px] text-slate-500 font-light mt-0.5">
            Direct seasonal harvests from partner cooperatives
          </p>
        </div>
        <button
          onclick={() => {
            appState.selectedCategory = "Agro Products";
            goto("/products");
          }}
          class="text-xs font-semibold text-[#0aad0a] hover:text-[#099409] hover:underline cursor-pointer focus:outline-none"
        >
          See all ({agroProducts.length}) →
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 sm:gap-4 2xl:grid-cols-6 xl:grid-cols-5 gap-3">
        {#each agroProducts as product (product.id)}
          <div class="w-full">
            <ProductCard
              {product}
              isFavorited={!!favoritedMap[product.id]}
              onCardClick={handleProductRedirect}
              onToggleFavorite={handleFavoriteToggle}
              onAddToCart={handleAddToCart}
            />
          </div>
        {/each}
      </div>
    </div>
  </div>

  <CategoryShowcase />

  <!-- AISLE 2: STAPLES & SPECIALTY -->
  {#if foodBeverages.length > 0}
    <div class="space-y-4 pt-2">
      <div class="flex justify-between items-baseline border-b border-slate-100 pb-3">
        <div>
          <h3 class="text-lg font-bold text-slate-900 tracking-tight">
            Food & staples
          </h3>
          <p class="text-[13px] text-slate-500 font-light mt-0.5">
            Naturally preserved honey, flours, grains, and specialty coffees
          </p>
        </div>
        <button
          onclick={() => {
            appState.selectedCategory = "Food & Beverages";
            goto("/products");
          }}
          class="text-xs font-semibold text-[#0aad0a] hover:text-[#099409] hover:underline cursor-pointer focus:outline-none"
        >
          See all ({foodBeverages.length}) →
        </button>
      </div>

      <!-- Horizontal scroll layout -->
      <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
        {#each foodBeverages as product (product.id)}
          <div class="w-[170px] sm:w-[180px] shrink-0 snap-start">
            <ProductCard
              {product}
              isFavorited={!!favoritedMap[product.id]}
              onCardClick={handleProductRedirect}
              onToggleFavorite={handleFavoriteToggle}
              onAddToCart={handleAddToCart}
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- AISLE 3: ARTISAN & CULTURAL CRAFTS -->
  {#if artsCrafts.length > 0}
    <div class="space-y-4 pt-2">
      <div class="flex justify-between items-baseline border-b border-slate-100 pb-3">
        <div>
          <h3 class="text-lg font-bold text-slate-900 tracking-tight">
            Artisan & cultural crafts
          </h3>
          <p class="text-[13px] text-slate-500 font-light mt-0.5">
            Handcrafted, UNESCO-recognized authentic craftsmanship
          </p>
        </div>
        <button
          onclick={() => {
            appState.selectedCategory = "Arts & Crafts";
            goto("/products");
          }}
          class="text-xs font-semibold text-[#0aad0a] hover:text-[#099409] hover:underline cursor-pointer focus:outline-none"
        >
          See all ({artsCrafts.length}) →
        </button>
      </div>

      <!-- Horizontal Scroll Container -->
      <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
        
        <!-- 1. Sponsored Ad (First in Scroll) -->
        <div class="w-[240px] sm:w-[280px] shrink-0 snap-start flex flex-col gap-1.5">
          <div class="text-xs text-slate-400 font-light pl-1 select-none">
            Sponsored
          </div>
          <div class="relative h-64 sm:h-[280px] w-full group overflow-hidden rounded-2xl border border-slate-100 hover:shadow-xs transition-shadow duration-300 bg-slate-50">
            <img
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTBnMDdscTA5ZzR5cnluZTR6NDhqcXxlNTV6aDFkanR0cmt5Z3BjOSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/XHX8QKQ5vXQnRZ32VI/giphy.gif"
              alt="Artisan Craft Ad"
            />
            
            <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
              <span class="text-white text-sm font-semibold">Heritage Collections</span>
            </div>
          </div>
        </div>

        <!-- 2. Products Loop -->
        {#each artsCrafts as product (product.id)}
          <div class="w-[170px] sm:w-[180px] shrink-0 snap-start">
            <ProductCard
              {product}
              isFavorited={!!favoritedMap[product.id]}
              onCardClick={handleProductRedirect}
              onToggleFavorite={handleFavoriteToggle}
              onAddToCart={handleAddToCart}
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Explore Grid Section -->
  <div id="catalog-grid-anchor" class="pt-4 scroll-mt-6">
    <ProductGrid
      products={filteredProducts}
      {favoritedMap}
      title="Explore All Sourced Products"
      onProductSelect={handleProductRedirect}
      onToggleFavorite={handleFavoriteToggle}
      onAddToCart={handleAddToCart}
      grid={false}
    />
  </div>
</div>

<style>
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>