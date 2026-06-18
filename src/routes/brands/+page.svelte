<!-- routes/brands/+page.svelte -->
<script>
    import { goto } from "$app/navigation";
    import { appState } from "$lib/state.svelte.js";
    import { products } from "$lib/data/products.js";

    // Count active products dynamically from products.js to keep data in-sync
    function getProductCount(seller) {
        return products.filter((p) => p.seller === seller).length;
    }

    // 8 High-Fidelity Storefronts (Panoramic Banner + Overlapping Logo)
    const brands = [
        {
            name: "Sipi Falls Growers Co-op",
            category: "Agro Products",
            location: "Kapchorwa, Elgon Region",
            impact: "Directly funds volcanic water purification systems [2].",
            initials: "SF",
            logoColor: "bg-[#003d29] text-white", // Deep forest-green
            rating: "4.9",
            reviews: "142",
            speed: "Delivery by 9:30 AM",
            badge: "No markups",
            banner: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80",
        },
        {
            name: "Busoga Bee Keepers",
            category: "Food & Beverages",
            location: "Kamuli, Busoga Region",
            impact: "Maintains wild multi-floral forest canopies.",
            initials: "B",
            logoColor: "bg-amber-500 text-white",
            rating: "4.9",
            reviews: "95",
            speed: "Delivery within 1 hr",
            badge: "100% Organic",
            banner: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
        },
        {
            name: "Kibinge Coffee Growers Co-op",
            category: "Food & Beverages",
            location: "Bukomansimbi District",
            impact: "Funds fair-trade shade-composting equipment [2].",
            initials: "KB",
            logoColor: "bg-red-800 text-white",
            rating: "4.9",
            reviews: "83",
            speed: "Delivery by 11:15 AM",
            badge: "No markups",
            banner: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80",
        },
        {
            name: "Luweero Fruit Growers Union",
            category: "Food & Beverages",
            location: "Luweero District",
            impact: "Establishes community solar fruit dehydrators [2].",
            initials: "LF",
            logoColor: "bg-orange-500 text-white",
            rating: "4.7",
            reviews: "45",
            speed: "Delivery within 1 hr",
            badge: "Co-op Price",
            banner: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600&q=80",
        },
        {
            name: "Northern Shea Organics",
            category: "Health & Beauty",
            location: "Lira, Northern Nile",
            impact: "Guarantees direct wages to women-led pickers [1, 2].",
            initials: "NS",
            logoColor: "bg-teal-700 text-white",
            rating: "4.8",
            reviews: "122",
            speed: "Delivery by 11:30 AM",
            badge: "No markups",
            banner: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80",
        },
        {
            name: "Kampala Artisans Guild",
            category: "Arts & Crafts",
            location: "Masaka District",
            impact: "Sustains heritage barkcloth beating guilds [2].",
            initials: "AG",
            logoColor: "bg-slate-800 text-white",
            rating: "4.7",
            reviews: "34",
            speed: "Delivery within 24 hr",
            badge: "UNESCO Heritage",
            banner: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80",
        },
        {
            name: "Lake Victoria Fisheries Co-op",
            category: "Food & Beverages",
            location: "Kiyindi Landing Site",
            impact: "Funds raised-netting fish sanitization racks [2].",
            initials: "LV",
            logoColor: "bg-blue-800 text-white",
            rating: "4.6",
            reviews: "41",
            speed: "Delivery within 1 hr",
            badge: "No markups",
            banner: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&q=80",
        },
        {
            name: "Rwenzori Vanilla Association",
            category: "Agro Products",
            location: "Bundibugyo District",
            impact: "Sustains direct micro-grants for soil health [1, 2].",
            initials: "RV",
            logoColor: "bg-emerald-700 text-white",
            rating: "4.9",
            reviews: "73",
            speed: "Delivery by next-morning",
            badge: "Export Grade",
            banner: "https://images.unsplash.com/photo-1595122245594-a55086ee50a6?w=600&q=80",
        },
    ];

    function handleBrandSelect(brand) {
        appState.searchQuery = brand.name.split(" ")[0]; // Query first keyword
        appState.selectedCategory = brand.category;
        goto("/products"); // Redirects to the search listings grid
    }
</script>

<div class="space-y-10 select-none font-sans py-2">
    <!-- Header introduction -->
    <div class="space-y-10 pb-4 flex space-x-3">
        <span>
            <h2 class="text-xl font-black text-slate-900 tracking-tight">
                Featured Brand Stores
            </h2>
        </span>
        <span class="text-amber-400">★</span>
    </div>

    <!-- Storefront Cards Grid (Responsive 2-column layout) -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
        {#each brands as brand}
            <!-- {@const activeCount = getProductCount(brand.name)} -->
            <div>
                <button
                    onclick={() => handleBrandSelect(brand)}
                    class="bg-white sm:h-32 hover:border-slate-300 border border-slate-100 rounded-xl overflow-hidden flex flex-col transition-all hover:shadow-lg focus:outline-none group text-left cursor-pointer relative"
                >
                    <!-- Panoramic Background Banner -->
                    <div
                        class="w-full bg-slate-50 overflow-hidden relative shrink-0"
                    >
                        <img
                            src={brand.banner}
                            alt=""
                            loading="lazy"
                            class="w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                        <div
                            class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-transparent"
                        ></div>

                        <!-- Monogram Badge overlap (Positioned inside relative banner) -->
                        <div
                            class="absolute bottom-2 left-2 z-20 w-12 h-12 rounded-full {brand.logoColor} font-serif font-black text-base flex items-center justify-center shadow-md border-2 border-white select-none"
                        >
                            {brand.initials}
                        </div>
                    </div>

                    <!-- Metadata Content Container -->
                    <div
                        class="p-5 pt-8 space-y-2 flex-1 flex flex-col justify-between"
                    >
                        <div class="space-y-1">
                            <div
                                class="flex items-center justify-between gap-2"
                            >
                                <span
                                    class="text-[9px] text-black py-0.5 rounded uppercase tracking-wider select-none"
                                >
                                    {brand.category}
                                </span>
                                <span class="text-amber-400">★</span>

                                <!-- Rating Stars -->
                            </div>

                            <h4
                                class="text-base font-black  text-slate-900 tracking-tight leading-tight pt-1"
                            >
                                {brand.name}
                            </h4>

                            <p
                                class="text-[10px] text-slate-400 font-bold leading-none"
                            >
                                Premium brand
                            </p>
                        </div>

                        <!-- Impact log & fulfillment status -->
                    </div>
                </button>
            </div>
        {/each}
    </div>
</div>

<style>
    img {
        -webkit-user-drag: none;
    }
</style>
