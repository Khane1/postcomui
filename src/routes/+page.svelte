<!-- routes/+page.svelte -->
<script>
  import { goto } from "$app/navigation";
  import { appState } from "$lib/state.svelte.js";
  import ProductGrid from "$lib/components/cards&grids/ProductGrid.svelte";
  import CategoryShowcase from "$lib/components/cards&grids/CategoryShowcase.svelte";
  import SubcategoryScroller from "$lib/components/cards&grids/SubcategoryScroller.svelte";
  import ProductCard from "$lib/components/cards&grids/ProductCard.svelte";
  import { untrack } from "svelte";

  $effect(() => {
    // Untrack to prevent search query keystrokes from triggering home-page API fetches
    untrack(() => {
      appState.fetchProducts();
    });
    appState.fetchBanners();
    appState.fetchWishlist();
  });

  // Dynamic derivation: maps flat IDs array to reactive bool index map
  let favoritedMap = $derived(
    appState.favorites.reduce((acc, id) => {
      acc[id] = true;
      return acc;
    }, {}),
  );

  // Dynamic mutually-exclusive categorization of landing page products (Zero duplicates)
  let categorizedProducts = $derived.by(() => {
    // Start with all main products (excluding child variants/variations)
    const list = appState.allProducts.filter((p) => !p.parent_id);

    const processed = [];
    const snacks = [];
    const apparel = [];
    const explore = [];

    for (const p of list) {
      const nameLower = p.name.toLowerCase();
      const descLower = (p.description || "").toLowerCase();
      const catLower = (p.category || "").toLowerCase();

      // 1. Snacks
      if (
        nameLower.includes("snack") ||
        nameLower.includes("dried") ||
        nameLower.includes("chips") ||
        nameLower.includes("mango") ||
        nameLower.includes("slices") ||
        nameLower.includes("bites") ||
        nameLower.includes("cashew") ||
        nameLower.includes("nut") ||
        nameLower.includes("cookie") ||
        nameLower.includes("crisp")
      ) {
        snacks.push(p);
      }
      // 2. Apparel
      else if (
        nameLower.includes("bag") ||
        nameLower.includes("tote") ||
        nameLower.includes("fabric") ||
        nameLower.includes("dress") ||
        nameLower.includes("clothing") ||
        nameLower.includes("wear") ||
        nameLower.includes("t-shirt") ||
        nameLower.includes("apparel") ||
        nameLower.includes("kanga") ||
        nameLower.includes("print") ||
        nameLower.includes("sandals") ||
        nameLower.includes("shoes") ||
        nameLower.includes("jewelry") ||
        nameLower.includes("basket") ||
        nameLower.includes("handwoven") ||
        nameLower.includes("woven") ||
        catLower.includes("craft")
      ) {
        apparel.push(p);
      }
      // 3. Processed products
      else if (
        nameLower.includes("coffee") ||
        nameLower.includes("honey") ||
        nameLower.includes("vanilla") ||
        nameLower.includes("flour") ||
        nameLower.includes("cocoa") ||
        nameLower.includes("shea") ||
        nameLower.includes("soap") ||
        nameLower.includes("mukene") ||
        nameLower.includes("fish") ||
        nameLower.includes("powder") ||
        nameLower.includes("tea") ||
        nameLower.includes("grain") ||
        nameLower.includes("butter") ||
        nameLower.includes("oil")
      ) {
        processed.push(p);
      }
      // 4. Explore (Uncategorized / Fresh / Rest)
      else {
        explore.push(p);
      }
    }

    return { processed, snacks, apparel, explore };
  });

  function handleProductRedirect(product) {
    appState.selectedProductForModal = product;
  }

  function handleFavoriteToggle(id) {
    appState.toggleFavorite(id); // Direct synchronization with backend APIs
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
      <span class="text-xs text-slate-400 font-light pb-1.5 select-none"
        >Sponsored</span
      >
      <div
        class="overflow-hidden rounded-2xl border border-slate-100 hover:shadow-xs transition-shadow duration-300"
      >
        <img
          src="/banner.gif"
          onerror={(e) => {
            e.currentTarget.src =
              "https://www.sliderrevolution.com/wp-content/uploads/2023/06/fashion-shop-header-slider-for-wordpress.gif";
          }}
          class="text-3xl text-white h-48 md:h-96 w-full object-cover flex md:justify-start justify-center"
          alt="Promo Banner"
        />
      </div>
    </div>

    <!-- Conditional retry screen rendered when the main products list fails to load [INDEX] -->
    {#if !appState.isLoading && appState.allProducts.length === 0}
      <div
        class="max-w-md mx-auto py-16 px-6 text-center bg-white border border-slate-200/60 rounded-3xl space-y-6 shadow-sm my-8 animate-in fade-in duration-300"
      >
        <div
          class="w-14 h-14 bg-rose-50 border border-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-xs"
        >
          <svg
            class="w-7 h-7"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div class="space-y-1.5">
          <h3 class="text-base font-extrabold text-slate-900 tracking-tight">
            Something went wrong
          </h3>
          <p
            class="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto font-light"
          >
            We encountered an issue retrieving the products catalog. Please
            check your network connection and try reloading the page.
          </p>
        </div>
        <button
          onclick={() => window.location.reload()}
          class="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-10 px-6 rounded-full transition-all focus:outline-none cursor-pointer"
        >
          Reload Page
        </button>
      </div>
    {:else}
      <!-- AISLE 1: PROCESSED PRODUCTS -->
      {#if categorizedProducts.processed.length > 0}
        <div class="space-y-4 pt-4">
          <div
            class="flex justify-between items-baseline w-full border-b border-slate-100 pb-3"
          >
            <div class="w-full">
              <div class="w-full flex justify-between">
                <h3 class="text-lg font-bold text-slate-900 tracking-tight">
                  Processed products
                </h3>
                <button
                  onclick={() => {
                    appState.selectedCategory = "Food & Beverages";
                    goto("/products");
                  }}
                  class="text-xs font-semibold text-[#0aad0a] hover:text-[#099409] hover:underline cursor-pointer focus:outline-none"
                >
                  See all ({categorizedProducts.processed.length}) →
                </button>
              </div>
              <p class="text-[13px] text-slate-500 font-light mt-0.5">
                Premium milled grains, roasted coffees, and organic wellness
                staples
              </p>
            </div>
          </div>

          <div
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 sm:gap-4 2xl:grid-cols-6 xl:grid-cols-5 gap-3"
          >
            {#each categorizedProducts.processed as product (product.id)}
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
      {/if}

      <CategoryShowcase />

      <!-- AISLE 2: SNACKS -->
      {#if categorizedProducts.snacks.length > 0}
        <div class="space-y-4 pt-2">
          <div
            class="w-full items-baseline border-b border-slate-100 pb-3"
          >
            <div class="w-full flex justify-between">
              <h3 class="text-lg font-bold text-slate-900 tracking-tight">
                Snacks
              </h3>

              <button
                onclick={() => {
                  appState.selectedCategory = "Food & Beverages";
                  goto("/products");
                }}
                class="text-xs font-semibold text-[#0aad0a] hover:text-[#099409] hover:underline cursor-pointer focus:outline-none"
              >
                See all ({categorizedProducts.snacks.length}) →
              </button>
            </div>
            <div>
              <p class="text-[13px] text-slate-500 font-light mt-0.5">
                Naturally sweet slices, dried fruit bites, and high-energy local
                crisps
              </p>
            </div>
          </div>

          <!-- Horizontal scroll layout -->
          <div
            class="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {#each categorizedProducts.snacks as product (product.id)}
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

      <!-- AISLE 3: apparel -->
      {#if categorizedProducts.apparel.length > 0}
        <div class="space-y-4 pt-2">
          <div
            class="flex justify-between items-baseline border-b border-slate-100 pb-3"
          >
            <div class="w-full">
            <div class="w-full flex justify-between">
              <h3 class="text-lg font-bold text-slate-900 tracking-tight">
                Apparel
              </h3>
              <button
              onclick={() => {
                appState.selectedCategory = "Arts & Crafts";
                goto("/products");
              }}
              class="text-xs font-semibold text-[#0aad0a] hover:text-[#099409] hover:underline cursor-pointer focus:outline-none"
            >
              See all ({categorizedProducts.apparel.length}) →
            </button>
            </div>
              <p class="text-[13px] text-slate-500 font-light mt-0.5">
                Traditional barkcloth bags, handwoven textiles, and heritage
                accessories
              </p>
            </div>
            
          </div>

          <!-- Horizontal Scroll Container -->
          <div
            class="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            <!-- 1. Sponsored Ad (First in Scroll) -->
            <div
              class="w-[240px] sm:w-[280px] shrink-0 snap-start flex flex-col gap-1.5"
            >
              <div class="text-xs text-slate-400 font-light pl-1 select-none">
                Sponsored
              </div>
              <div
                class="relative h-64 sm:h-[280px] w-full group overflow-hidden rounded-2xl border border-slate-100 hover:shadow-xs transition-shadow duration-300 bg-slate-50"
              >
                <img
                  class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTBnMDdscTA5ZzR5cnluZTR6NDhqcXxlNTV6aDFkanR0cmt5Z3BjOSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/XHX8QKQ5vXQnRZ32VI/giphy.gif"
                  alt="Artisan Craft Ad"
                />

                <div
                  class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent"
                >
                  <span class="text-white text-sm font-semibold"
                    >Heritage Collections</span
                  >
                </div>
              </div>
            </div>

            <!-- 2. Products Loop -->
            {#each categorizedProducts.apparel as product (product.id)}
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

      <!-- Explore Grid Section (Uncategorized / Remaining Products) -->
      {#if categorizedProducts.explore.length > 0}
        <div id="catalog-grid-anchor" class="pt-4 scroll-mt-6">
          <ProductGrid
            products={categorizedProducts.explore}
            {favoritedMap}
            title="Explore all sourced products"
            onProductSelect={handleProductRedirect}
            onToggleFavorite={handleFavoriteToggle}
            onAddToCart={handleAddToCart}
            grid={false}
          />
        </div>
      {/if}
    {/if}
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
