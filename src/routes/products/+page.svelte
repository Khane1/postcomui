<!-- src/routes/products/+page.svelte -->
<script>
    import { goto } from "$app/navigation";
    import { appState } from "$lib/state.svelte.js";
    import ProductCard from "$lib/components/ProductCard.svelte";
    import { products } from "$lib/data/products.js";
    import ProductGrid from "$lib/components/ProductGrid.svelte";
    let pricePercentage = $derived(((maxPrice - 9500) / (150000 - 9500)) * 100);
    // Svelte 5 Local Filter States
    let selectedCategories = $state([]); // Supports advanced multi-category selection
    let sortBy = $state("popular"); // "popular" | "price-asc" | "price-desc" | "rating"
    let minPrice = $state(0);
    let maxPrice = $state(150000); // Standard max budget cap
    let onlyInStock = $state(false);
    let isMobileFilterOpen = $state(false); // Mobile filter toggle state

    let favoritedProducts = $state({});

    // Core Categories List
    const categoriesList = [
        "Agro Products",
        "Food & Beverages",
        "Arts & Crafts",
        "Health & Beauty",
    ];

    // Svelte 5 $derived.by Block for Multi-faceted Query Evaluation
    let processedProducts = $derived.by(() => {
        let list = [...products];

        // 1. Text Query Filter
        if (appState.searchQuery) {
            list = list.filter(
                (p) =>
                    p.name
                        .toLowerCase()
                        .includes(appState.searchQuery.toLowerCase()) ||
                    p.seller
                        .toLowerCase()
                        .includes(appState.searchQuery.toLowerCase()),
            );
        }

        // 2. Category Filter (Advanced Multi-select)
        if (selectedCategories.length > 0) {
            list = list.filter((p) => selectedCategories.includes(p.category));
        } else if (appState.selectedCategory !== "All") {
            list = list.filter((p) => p.category === appState.selectedCategory);
        }

        // 3. Price Filter Bounds
        list = list.filter((p) => p.price >= minPrice && p.price <= maxPrice);

        // 4. In Stock Filter
        if (onlyInStock) {
            list = list.filter((p) => p.stockStatus === "Many in stock");
        }

        // 5. Sorting Computations
        if (sortBy === "price-asc") {
            list.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
            list.sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
            list.sort((a, b) => b.rating - a.rating);
        } else {
            list.sort((a, b) => b.reviews - a.reviews); // "popular"
        }

        return list;
    });

    function handleProductRedirect(product) {
        appState.selectedProductForModal = product;
    }

    function handleFavoriteToggle(id) {
        if (favoritedProducts[id]) {
            delete favoritedProducts[id];
            appState.favoritesCount -= 1;
            appState.addToast("Removed from Favorites", "info");
        } else {
            favoritedProducts[id] = true;
            appState.favoritesCount += 1;
            appState.addToast("Saved to Favorites");
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

    function toggleCategory(cat) {
        if (selectedCategories.includes(cat)) {
            selectedCategories = selectedCategories.filter((c) => c !== cat);
        } else {
            selectedCategories.push(cat);
        }
    }

    function resetAllFilters() {
        selectedCategories = [];
        appState.selectedCategory = "All";
        appState.searchQuery = "";
        sortBy = "popular";
        minPrice = 0;
        maxPrice = 150000;
        onlyInStock = false;
        appState.addToast("All filters reset");
    }
</script>

<div class="space-y-6 select-none h-full flex flex-col overflow-hidden">
    <!-- Breadcrumbs Back Nav -->
    <nav
        class="flex flex-wrap items-center justify-between gap-y-2.5 text-xs font-semibold text-slate-500 border-b border-slate-100 pb-4 flex-shrink-0"
    >
        <div class="flex items-center gap-2 text-[11px] sm:text-xs">
            <a href="/" class="hover:text-slate-900 transition-colors"
                >Catalog</a
            >
            <svg
                class="w-3 h-3 text-slate-300"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
                ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 5l7 7-7 7"
                /></svg
            >
            <span class="text-slate-900 font-bold"
                >Search and Filter Catalog</span
            >
        </div>
        <button
            onclick={() => goto("/")}
            class="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors focus:outline-none"
        >
            <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
                ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 19l-7-7 7-7"
                /></svg
            >
            <span>Back to Home</span>
        </button>
    </nav>

    <!-- DUAL GRID LAYOUT (Filters Panel left + Products grid right) -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        <!-- LEFT COLUMN: Advanced Filters Panel (Floating Card Style) -->
        <!-- RIGHT COLUMN: Interactive listings viewport -->
        <div
            class="col-span-1 lg:col-span-9 flex flex-col overflow-hidden h-full"
        >
            <!-- Sorting & Mobile Filter Header Controls -->
            <div
                class="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0 gap-2"
            >
                <div class="flex items-center gap-2">
                    <!-- Mobile filter button -->
                    <button
                        onclick={() => (isMobileFilterOpen = true)}
                        class="lg:hidden flex items-center gap-1 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl focus:outline-none"
                    >
                        <svg
                            class="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                            /></svg
                        >
                        <span>Filters</span>
                    </button>

                    <span
                        class="text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:inline"
                        >Active listings: {processedProducts.length} items</span
                    >
                </div>

                <!-- Sorting dropdown block -->
                <div class="flex items-center gap-2">
                    <label
                        for="sort-select"
                        class="text-xs font-bold text-slate-500 hidden sm:block"
                        >Sort By:</label
                    >
                    <select
                        id="sort-select"
                        bind:value={sortBy}
                        class="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-400"
                    >
                        <option value="popular">Popularity</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                    </select>
                </div>
            </div>

            <!-- Scrollable Product grid Area -->
            <div class="flex-1 overflow-y-auto pt-4 pr-1 scrollbar-none h-full">
                {#if processedProducts.length === 0}
                    <div class="text-center py-20 space-y-4 max-w-sm mx-auto">
                        <div
                            class="w-14 h-14 bg-slate-50 border border-slate-200 border-dashed rounded-full flex items-center justify-center mx-auto text-slate-400"
                        >
                            🔍
                        </div>
                        <div class="space-y-1">
                            <h4 class="text-xs font-bold text-slate-800">
                                No products match your query
                            </h4>
                            <p
                                class="text-[11px] text-slate-500 leading-relaxed font-semibold"
                            >
                                Try widening your price bounds, clearing search
                                keywords, or resetting category selections.
                            </p>
                        </div>
                        <button
                            onclick={resetAllFilters}
                            class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl focus:outline-none"
                        >
                            Reset Filters
                        </button>
                    </div>
                {:else}
                    <div
                        class="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0"
                    >
                        <!-- {#each processedProducts as product (product.id)}
                            <div
                                class="w-[200px] sm:w-[180px] shrink-0 snap-start"
                            >
                                <ProductCard
                                    {product}
                                    isFavorited={!!favoritedProducts[
                                        product.id
                                    ]}
                                    onCardClick={handleProductRedirect}
                                    onToggleFavorite={handleFavoriteToggle}
                                    onAddToCart={handleAddToCart}
                                />
                            </div>
                        {/each} -->
                        <div id="catalog-grid-anchor" class="pt-4 scroll-mt-6">
                            <ProductGrid
                                products={processedProducts}
                                favoritedMap={favoritedProducts}
                                title="Explore All Sourced Products"
                                onProductSelect={handleProductRedirect}
                                onToggleFavorite={handleFavoriteToggle}
                                onAddToCart={handleAddToCart}
                                grid={true}
                            />
                        </div>
                    </div>
                {/if}
            </div>
        </div>
        <aside
            class="hidden lg:flex lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-5 flex-col justify-between max-h-full space-y-6 select-none shadow-md"
        >
            <div class="space-y-6">
                <div
                    class="flex justify-between items-center border-b border-slate-200 pb-2"
                >
                    <h3
                        class="text-xs font-black text-slate-900 uppercase tracking-widest"
                    >
                        Sourcing Filters
                    </h3>
                    <button
                        onclick={resetAllFilters}
                        class="text-[10px] font-bold text-red-600 hover:underline focus:outline-none"
                    >
                        Reset
                    </button>
                </div>

                <!-- Filter 1: Advanced Category Selection -->
                <div class="space-y-2.5">
                    <span
                        class="text-[10px] font-black text-slate-400 uppercase tracking-wider block"
                    >
                        Categories
                    </span>
                    <div class="space-y-2">
                        {#each categoriesList as cat}
                            <button
                                onclick={() => toggleCategory(cat)}
                                class="flex items-center gap-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all text-left focus:outline-none"
                            >
                                <div
                                    class="w-4 h-4 border-2 rounded flex items-center justify-center transition-all
                {selectedCategories.includes(cat) ||
                                    appState.selectedCategory === cat
                                        ? 'border-red-600 bg-red-600 text-white'
                                        : 'border-slate-300 bg-white'}"
                                >
                                    {#if selectedCategories.includes(cat) || appState.selectedCategory === cat}
                                        <svg
                                            class="w-2.5 h-2.5"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="3.5"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    {/if}
                                </div>
                                <span>{cat}</span>
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Filter 2: Subsidized Pricing Drag Slider (Vibrant Completed Track) -->
                <div class="space-y-3 border-t border-slate-200/60 pt-4">
                    <div class="flex justify-between items-baseline">
                        <span
                            class="text-[10px] font-black text-slate-400 uppercase tracking-wider block"
                        >
                            Price Limit
                        </span>
                        <span class="text-xs font-black text-slate-900">
                            {maxPrice.toLocaleString()} UGX
                        </span>
                    </div>
                    <div class="space-y-1">
                        <input
                            type="range"
                            min="9500"
                            max="150000"
                            step="500"
                            bind:value={maxPrice}
                            style="background: linear-gradient(to right, #dc2626 0%, #dc2626 {pricePercentage}%, #f1f5f9 {pricePercentage}%, #f1f5f9 100%);"
                            class="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
                        />
                        <div
                            class="flex justify-between text-[9px] text-slate-400 font-bold select-none"
                        >
                            <span>9,500 UGX</span>
                            <span>150,000 UGX</span>
                        </div>
                    </div>
                </div>

                <!-- Filter 3: Stock Checkbox -->
                <div class="space-y-2 border-t border-slate-200/60 pt-4">
                    <span
                        class="text-[10px] font-black text-slate-400 uppercase tracking-wider block"
                    >
                        Availability
                    </span>
                    <button
                        onclick={() => (onlyInStock = !onlyInStock)}
                        class="flex items-center gap-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all focus:outline-none"
                    >
                        <div
                            class="w-4 h-4 border-2 rounded flex items-center justify-center transition-all
            {onlyInStock
                                ? 'border-red-600 bg-red-600 text-white'
                                : 'border-slate-300 bg-white'}"
                        >
                            {#if onlyInStock}
                                <svg
                                    class="w-2.5 h-2.5"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="3.5"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            {/if}
                        </div>
                        <span>Show In Stock Only</span>
                    </button>
                </div>
            </div>

            <div
                class="pt-4 border-t border-slate-200 text-[10px] text-slate-400 font-medium leading-relaxed"
            >
                Posta collection routing updates automatically as filters are
                set.
            </div>
        </aside>
    </div>
</div>

<!-- POPUP MODAL: MOBILE FILTERS DRAWER -->
{#if isMobileFilterOpen}
    <div
        class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 select-none"
    >
        <div
            class="bg-white rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-300 relative max-h-[80vh] overflow-y-auto"
        >
            <h3
                class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-4 border-b border-slate-100 pb-2"
            >
                Sourcing Filters
            </h3>

            <div class="space-y-6">
                <!-- Categories -->
                <div class="space-y-2">
                    <span
                        class="text-[10px] font-black text-slate-400 uppercase tracking-wider block"
                        >Categories</span
                    >
                    <div class="space-y-2">
                        {#each categoriesList as cat}
                            <button
                                onclick={() => toggleCategory(cat)}
                                class="flex items-center gap-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all text-left focus:outline-none"
                            >
                                <div
                                    class="w-4 h-4 border-2 rounded flex items-center justify-center transition-all
                  {selectedCategories.includes(cat) ||
                                    appState.selectedCategory === cat
                                        ? 'border-red-600 bg-red-600 text-white'
                                        : 'border-slate-300 bg-white'}"
                                >
                                    {#if selectedCategories.includes(cat) || appState.selectedCategory === cat}
                                        <svg
                                            class="w-2.5 h-2.5"
                                            fill="none"
                                            stroke="currentColor"
                                            stroke-width="3.5"
                                            viewBox="0 0 24 24"
                                            ><path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M5 13l4 4L19 7"
                                            /></svg
                                        >
                                    {/if}
                                </div>
                                <span>{cat}</span>
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Prices Slider (Mobile Sync) -->
                <div class="space-y-3">
                    <div class="flex justify-between items-baseline">
                        <span
                            class="text-[10px] font-black text-slate-400 uppercase tracking-wider block"
                            >Price Limit</span
                        >
                        <span class="text-xs font-black text-slate-900"
                            >{maxPrice.toLocaleString()} UGX</span
                        >
                    </div>
                    <div class="space-y-1">
                        <input
                            type="range"
                            min="9500"
                            max="150000"
                            step="500"
                            bind:value={maxPrice}
                            class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
                        />
                        <div
                            class="flex justify-between text-[9px] text-slate-400 font-bold select-none"
                        >
                            <span>9,500 UGX</span>
                            <span>150,000 UGX</span>
                        </div>
                    </div>
                </div>

                <!-- Stock -->
                <div class="space-y-2">
                    <button
                        onclick={() => (onlyInStock = !onlyInStock)}
                        class="flex items-center gap-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all focus:outline-none"
                    >
                        <div
                            class="w-4 h-4 border-2 rounded flex items-center justify-center transition-all
              {onlyInStock
                                ? 'border-red-600 bg-red-600 text-white'
                                : 'border-slate-300 bg-white'}"
                        >
                            {#if onlyInStock}
                                <svg
                                    class="w-2.5 h-2.5"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="3.5"
                                    viewBox="0 0 24 24"
                                    ><path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M5 13l4 4L19 7"
                                    /></svg
                                >
                            {/if}
                        </div>
                        <span>Show In Stock Only</span>
                    </button>
                </div>
            </div>

            <div class="pt-6 flex gap-2">
                <button
                    onclick={resetAllFilters}
                    class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                    Reset All
                </button>
                <button
                    onclick={() => (isMobileFilterOpen = false)}
                    class="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                    Apply Filters
                </button>
            </div>

            <!-- Close icon button -->
            <button
                onclick={() => (isMobileFilterOpen = false)}
                class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label="Close filters"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    </div>
{/if}

<style>
    .scrollbar-none::-webkit-scrollbar {
        display: none;
    }
    .scrollbar-none {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
</style>
