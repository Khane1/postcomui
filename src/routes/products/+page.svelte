<!-- routes/products/+page.svelte -->
<script>
    import { goto } from "$app/navigation";
    import { appState } from "$lib/state.svelte.js";
    import { products } from "$lib/data/products.js";
    import ProductGrid from "$lib/components/cards&grids/ProductGrid.svelte";

    // Coordinates the custom red-colored slider track background dynamically
    let pricePercentage = $derived(((maxPrice - 9500) / (150000 - 9500)) * 100);

    // Local filter state configurations
    let selectedCategories = $state([]);
    let sortBy = $state("popular");
    let minPrice = $state(0);
    let maxPrice = $state(150000);
    let onlyInStock = $state(false);
    let isMobileFilterOpen = $state(false);

    /// routes/products/+page.svelte
    let favoritedMap = $derived(
        (appState.favorites || []).reduce((acc, id) => {
            acc[id] = true;
            return acc;
        }, {}),
    );

    const categoriesList = [
        "Agro Products",
        "Food & Beverages",
        "Arts & Crafts",
        "Health & Beauty",
    ];

    // Computes and sorts processed products reactively
    let processedProducts = $derived.by(() => {
        let list = [...appState.allProducts];

        // 1. Text Search Filter
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

        // 2. Category Filter
        if (selectedCategories.length > 0) {
            list = list.filter((p) => selectedCategories.includes(p.category));
        } else if (appState.selectedCategory !== "All") {
            list = list.filter((p) => p.category === appState.selectedCategory);
        }

        // 3. Price Bounds Filter
        list = list.filter((p) => p.price >= minPrice && p.price <= maxPrice);

        // 4. Availability Filter
        if (onlyInStock) {
            list = list.filter((p) => p.stockStatus === "Many in stock");
        }

        // 5. Sorting Rules
        if (sortBy === "price-asc") {
            list.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
            list.sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
            list.sort((a, b) => b.rating - a.rating);
        } else {
            list.sort((a, b) => b.reviews - a.reviews);
        }

        return list;
    });

    $effect(() => {
        appState.fetchProducts();
        appState.fetchWishlist(); // Sync backend wishlist on load [5]
    });

    function handleProductRedirect(product) {
        appState.selectedProductForModal = product;
    }

    function handleFavoriteToggle(id) {
        appState.toggleFavorite(id); // Synchronize directly with backend [5]
    }

    function handleAddToCart(product) {
        appState.addCartItem(product);
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
    <!-- Catalog layout container -->
    <div class="flex flex-col h-full gap-4">
        <!-- Top Breadcrumb Navigation -->
        <nav
            class="flex flex-wrap items-center justify-between gap-y-2.5 text-xs font-semibold text-slate-400 border-b border-slate-100 pb-4 flex-shrink-0"
        >
            <div class="flex items-center gap-2 text-[11px] sm:text-xs">
                <a href="/" class="hover:text-slate-900 transition-colors"
                    >Catalog</a
                >
                <svg
                    class="w-3 h-3 text-slate-300"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
                <span class="text-slate-800 font-semibold"
                    >Search and filter catalog</span
                >
            </div>
            <button
                onclick={() => goto("/")}
                class="flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-colors focus:outline-none cursor-pointer"
            >
                <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
                <span class="font-semibold text-xs">Back to Home</span>
            </button>
        </nav>

        <!-- Main Content Grid -->
        <div
            class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden"
        >
            <div
                class="col-span-1 lg:col-span-9 flex flex-col overflow-hidden h-full"
            >
                <!-- Catalog Header Controls -->
                <div
                    class="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0 gap-2"
                >
                    <div class="flex items-center gap-3">
                        <button
                            onclick={() => (isMobileFilterOpen = true)}
                            class="lg:hidden flex items-center gap-1.5 bg-[#1a1a1a] hover:bg-slate-800 text-white text-xs font-semibold h-9 px-4 rounded-full transition-colors focus:outline-none cursor-pointer"
                        >
                            <svg
                                class="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                />
                            </svg>
                            <span>Filters</span>
                        </button>

                        <span
                            class="text-[12px] text-slate-400 font-light hidden sm:inline select-none"
                        >
                            Active listings: {processedProducts.length} items
                        </span>
                    </div>

                    <!-- Sort By Selection -->
                    <div class="flex items-center gap-2">
                        <label
                            for="sort-select"
                            class="text-xs text-slate-400 font-light hidden sm:block"
                            >Sort by:</label
                        >
                        <select
                            id="sort-select"
                            bind:value={sortBy}
                            class="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-slate-400 focus:outline-none cursor-pointer transition-colors"
                        >
                            <option value="popular">Popularity</option>
                            <option value="price-asc">Price: Low to High</option
                            >
                            <option value="price-desc"
                                >Price: High to Low</option
                            >
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>

                <!-- Product Cards Stream -->
                <div
                    class="flex-1 overflow-y-auto pt-4 pr-1 scrollbar-none h-full"
                >
                    {#if processedProducts.length === 0}
                        <!-- Elegant Empty State (Zero emojis) -->
                        <div
                            class="text-center py-20 space-y-5 max-w-sm mx-auto"
                        >
                            <div
                                class="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400"
                            >
                                <svg
                                    class="w-6 h-6 text-slate-300"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2.5"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z"
                                    />
                                </svg>
                            </div>
                            <div class="space-y-1.5">
                                <h4 class="text-base font-bold text-slate-900">
                                    No products match your search
                                </h4>
                                <p
                                    class="text-[13px] text-slate-500 font-light leading-relaxed"
                                >
                                    Try widening your price bounds, clearing
                                    search keywords, or resetting category
                                    selections.
                                </p>
                            </div>
                            <button
                                onclick={resetAllFilters}
                                class="bg-[#1a1a1a] hover:bg-slate-800 text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-colors focus:outline-none cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        </div>
                    {:else}
                        <div id="catalog-grid-anchor" class="pt-4 scroll-mt-6">
                            <ProductGrid
                                products={processedProducts}
                                {favoritedMap}
                                title="Explore All Sourced Products"
                                onProductSelect={handleProductRedirect}
                                onToggleFavorite={handleFavoriteToggle}
                                onAddToCart={handleAddToCart}
                                grid={true}
                            />
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Sidebar Sourcing Filters -->
            <aside
                class="hidden lg:flex lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-5 flex-col justify-between max-h-full space-y-6 select-none"
            >
                <div class="space-y-6">
                    <!-- Header -->
                    <div
                        class="flex justify-between items-center border-b border-slate-100 pb-3"
                    >
                        <h3 class="text-[15px] font-bold text-slate-900">
                            Sourcing filters
                        </h3>
                        <button
                            onclick={resetAllFilters}
                            class="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline focus:outline-none cursor-pointer"
                        >
                            Reset
                        </button>
                    </div>

                    <!-- Categories Section -->
                    <div class="space-y-3">
                        <span
                            class="text-[11px] font-semibold text-slate-400 tracking-wide uppercase block"
                            >Categories</span
                        >
                        <div class="space-y-2.5">
                            {#each categoriesList as cat}
                                {@const isActive =
                                    selectedCategories.includes(cat) ||
                                    appState.selectedCategory === cat}
                                <button
                                    onclick={() => toggleCategory(cat)}
                                    class="flex items-center gap-3 text-[13px] text-slate-700 hover:text-slate-950 transition-colors text-left focus:outline-none cursor-pointer group"
                                >
                                    <!-- Custom Crisp Checkbox -->
                                    <div
                                        class="w-4.5 h-4.5 border rounded-[4px] flex items-center justify-center transition-all shrink-0
                                        {isActive
                                            ? 'border-red-600 bg-red-600 text-white'
                                            : 'border-slate-300 bg-white group-hover:border-slate-400'}"
                                    >
                                        {#if isActive}
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
                                    <span class="font-light">{cat}</span>
                                </button>
                            {/each}
                        </div>
                    </div>

                    <!-- Price Limit Section -->
                    <div class="space-y-3 border-t border-slate-100 pt-4">
                        <div class="flex justify-between items-baseline">
                            <span
                                class="text-[11px] font-semibold text-slate-400 tracking-wide uppercase block"
                                >Price Limit</span
                            >
                            <span
                                class="text-[13px] font-semibold text-slate-900"
                                >{maxPrice.toLocaleString()} UGX</span
                            >
                        </div>
                        <div class="space-y-1.5">
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
                                class="flex justify-between text-[10px] text-slate-400 font-normal select-none"
                            >
                                <span>9,500 UGX</span>
                                <span>150,000 UGX</span>
                            </div>
                        </div>
                    </div>

                    <!-- Availability Section -->
                    <div class="space-y-3 border-t border-slate-100 pt-4">
                        <span
                            class="text-[11px] font-semibold text-slate-400 tracking-wide uppercase block"
                            >Availability</span
                        >
                        <button
                            onclick={() => (onlyInStock = !onlyInStock)}
                            class="flex items-center gap-3 text-[13px] text-slate-700 hover:text-slate-950 transition-colors focus:outline-none cursor-pointer group"
                        >
                            <!-- Custom Crisp Checkbox -->
                            <div
                                class="w-4.5 h-4.5 border rounded-[4px] flex items-center justify-center transition-all shrink-0
                                {onlyInStock
                                    ? 'border-red-600 bg-red-600 text-white'
                                    : 'border-slate-300 bg-white group-hover:border-slate-400'}"
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
                            <span class="font-light">Show In Stock Only</span>
                        </button>
                    </div>
                </div>

                <!-- Muted Informative Footer -->
                <div
                    class="pt-4 border-t border-slate-100 text-[11px] text-slate-400 font-light leading-relaxed"
                >
                    Posta collection routing updates automatically as filters
                    are applied.
                </div>
            </aside>
        </div>
    </div>
</div>

<!-- Mobile Filter Drawer Overlay -->
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

                <div class="space-y-2">
                    <button
                        onclick={() => (onlyInStock = !onlyInStock)}
                        class="flex items-center gap-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-all focus:outline-none"
                    >
                        <div
                            class="w-4 h-4 border-2 rounded flex items-center justify-center transition-all {onlyInStock
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
