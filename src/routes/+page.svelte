<script>
  import { goto } from "$app/navigation";
  import { appState } from "$lib/state.svelte.js";
  import ProductGrid from "$lib/components/ProductGrid.svelte";
  import AdBanners from "$lib/components/AdBanners.svelte";
  import CategoryShowcase from "$lib/components/CategoryShowcase.svelte";
  import SubcategoryScroller from "$lib/components/SubcategoryScroller.svelte";
  import FlashStockDealAd from "$lib/components/FlashStockDealAd.svelte";
  import PostaLockerAd from "$lib/components/PostaLockerAd.svelte";
  import ArtisanSpotlightAd from "$lib/components/ArtisanSpotlightAd.svelte";
  import ProductCard from "$lib/components/ProductCard.svelte";
  import { products } from "$lib/data/products.js";
    import SponsoredCompanies from "$lib/components/SponsoredCompanies.svelte";

  let favoritedProducts = $state({});

  // Filters mapping directly to Instacart-style "aisles"
  let agroProducts = $derived(
    products.filter((p) => p.category === "Agro Products"),
  );
  let foodBeverages = $derived(
    products.filter((p) => p.category === "Food & Beverages"),
  );
  let artsCrafts = $derived(
    products.filter((p) => p.category === "Arts & Crafts"),
  );

  // Svelte 5 dynamic query filter for the bottom "Explore All" section
  let filteredProducts = $derived(
    products.filter((p) => {
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

  function handleProductRedirect(product) {
    appState.selectedProductForModal = product;
  }

  function handleFavoriteToggle(id) {
    if (favoritedProducts[id]) {
      delete favoritedProducts[id];
      appState.favoritesCount -= 1;
      appState.addToast("Removed item from Favorites", "info");
    } else {
      favoritedProducts[id] = true;
      appState.favoritesCount += 1;
      appState.addToast("Saved item to Favorites");
    }
  }

  function handleAddToCart(product) {
    const existing = appState.cartItems.find(
      (item) => item.product.id === product.id,
    );
    if (existing) {
      existing.quantity += 1;
    } else {
      appState.cartItems.push({
        product,
        quantity: 1,
        fulfillment: appState.fulfillmentMode,
      });
    }
    appState.addToast(`Added ${product.name} to basket`);
  }

  function handleClaimCoupon(coupon) {
    appState.addToast(`Coupon "${coupon}" successfully applied at checkout!`);
  }
</script>

<div class="space-y-8 pb-16">
  <!-- INSTACART-STYLE STORE BANNER -->

  <!-- AISLE 1: FARM FRESH PRODUCE (Horizontal Carousel) -->
  <div class="space-y-3.5">
    <SubcategoryScroller />
     <div>
    <div class="text-slate-300 text-xs font-light pb-1">Sponsered</div>
      <img
        src="https://www.sliderrevolution.com/wp-content/uploads/2023/06/fashion-shop-header-slider-for-wordpress.gif"
        class="text-3xl rounded-xl text-white sm:pb-2 md:h-96 bg-accent-500 w-full rounded flex md:justify-start justify-center w-full rounded-xl items items-center "
        alt=""
      />
     
  </div>
    <div
      class="flex justify-between items-baseline border-b border-slate-200/60 pb-2"
    >
      <div>
        <h3 class="text- font-black text-slate-900 uppercase tracking-wider">
          Farm Fresh Produce
        </h3>
        <p class="text-[11px] text-slate-500 font-medium">
          Direct seasonal harvests from partner cooperatives
        </p>
      </div>
      <button
        onclick={() => {
          appState.selectedCategory = "Agro Products";
          goto("/products");
        }}
        class="text-xs font-bold text-emerald-600 hover:text-emerald-700"
      >
        See all ({agroProducts.length}) →
      </button>
    </div>
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 sm:gap-4 2xl:grid-cols-6 xl:grid-cols-5 gap-3"
    >
      {#each agroProducts as product (product.id)}
        <div class="w-full">
          <ProductCard
            {product}
            isFavorited={!!favoritedProducts[product.id]}
            onCardClick={handleProductRedirect}
            onToggleFavorite={handleFavoriteToggle}
            onAddToCart={handleAddToCart}
          />
        </div>
      {/each}
    </div>
  </div>
  <!-- <SponsoredCompanies /> -->

  <CategoryShowcase />

  <!-- AISLE 2: NATURAL BEVERAGES & STAPLES (Horizontal Carousel) -->
  <div class="space-y-3.5 pt-2">
    <div
      class="flex justify-between items-baseline border-b border-slate-200/60 pb-2"
    >
      <div>
        <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">
          Food & Staples
        </h3>
        <p class="text-[10px] text-slate-500 font-medium">
          Naturally preserved honey, flours, grains, and coffees
        </p>
      </div>
      <button
        onclick={() => {
          appState.selectedCategory = "Food & Beverages";
          goto("/products");
        }}
        class="text-xs font-bold text-emerald-600 hover:text-emerald-700"
      >
        See all ({foodBeverages.length}) →
      </button>
    </div>

    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 sm:gap-4 2xl:grid-cols-6 xl:grid-cols-6 gap-3 flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0"
    >
      {#each foodBeverages as product (product.id)}
        <div class="w-[170px] sm:w-[180px] 2xl:w-[250px] shrink-0 snap-start">
          <ProductCard
            {product}
            isFavorited={!!favoritedProducts[product.id]}
            onCardClick={handleProductRedirect}
            onToggleFavorite={handleFavoriteToggle}
            onAddToCart={handleAddToCart}
          />
        </div>
      {/each}
    </div>
  </div>

  <!-- AISLE 3: ARTISAN & CULTURAL CRAFTS (Horizontal Carousel) -->
  {#if artsCrafts.length > 0}
    <div class="space-y-3.5 pt-2">
      <div
        class="flex justify-between items-baseline border-b border-slate-200/60 pb-2"
      >
        <div>
          <h3
            class="text-sm font-black text-slate-900 uppercase tracking-wider"
          >
            Artisan & Cultural Heritages
          </h3>
          <p class="text-[10px] text-slate-500 font-medium">
            Handcrafted, UNESCO-recognized authentic craftsmanship
          </p>
        </div>
        <button
          onclick={() => {
            appState.selectedCategory = "Arts & Crafts";
            goto("/products");
          }}
          class="text-xs font-bold text-emerald-600 hover:text-emerald-700"
        >
          See all ({artsCrafts.length}) →
        </button>
      </div>
      <div
        class="md:flex justify-start space-x-5 grid-col-1 space-y-4 sm:grid-col-2 gap-4 sm:gap-2"
      >
        <div class="w-full md:w-1/4">
          <div class="text-slate-300 text-xs font-light pb-1">Sponsered</div>
          <img
            class="text-3xl rounded-xl text-white sm:pb-2 h-64 object-cover w-full rounded"
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTBnMDdscTA5ZzR5cnluZTR6NDhqcXhlNTV6aDFkanR0cmt5Z3BjOSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/XHX8QKQ5vXQnRZ32VI/giphy.gif"
            alt=""
          />
          <!-- <div class="bg-blue-600 text-3xl p-4 rounded-xl text-white pb-10 sm:pb-2 shadow-lg h-full">
        <div class="text-slate-300 text-xs font-light pb-1 ">Nike</div>
          Brand Ads.
        </div> -->
        </div>
        <div
          // class="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 sm:gap-4 2xl:grid-cols-4 xl:grid-cols-4 gap-3"
        >
          {#each artsCrafts as product (product.id)}
            <div class="w-[170px] sm:w-[180px] shrink-0 snap-start">
              <ProductCard
                {product}
                isFavorited={!!favoritedProducts[product.id]}
                onCardClick={handleProductRedirect}
                onToggleFavorite={handleFavoriteToggle}
                onAddToCart={handleAddToCart}
              />
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
 

  <!-- EXPLORE ALL DENSE CATALOG VIEW -->
  <div id="catalog-grid-anchor" class="pt-4 scroll-mt-6">
    <ProductGrid
      products={filteredProducts}
      favoritedMap={favoritedProducts}
      title="Explore All Sourced Products"
      onProductSelect={handleProductRedirect}
      onToggleFavorite={handleFavoriteToggle}
      onAddToCart={handleAddToCart}
      grid={false}
    />
  </div>
</div>

<style>
  /* Clean horizontal scroll helper without scrollbar clutter */
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
