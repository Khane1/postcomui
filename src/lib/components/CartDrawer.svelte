<!-- lib/components/CartDrawer.svelte -->
<script>
    import { appState } from "$lib/state.svelte.js";
    import { products } from "$lib/data/products.js";
    import ProductCard from "./ProductCard.svelte";
    import { fly, fade } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    let subtotal = $derived(
        appState.cartItems.reduce(
            (acc, item) => acc + item.product.price * item.quantity,
            0,
        ),
    );

    // Cross-sell items: Filter out what is already in the cart
    let crossSellProducts = $derived(
        products
            .filter(
                (p) =>
                    !appState.cartItems.some(
                        (item) => item.product.id === p.id,
                    ),
            )
            .slice(0, 4),
    );

    function close() {
        appState.isCartOpen = false;
    }

    function handleCheckoutTrigger() {
        appState.isCartOpen = false;
        appState.isCheckoutOpen = true; // Seamless modal overlay transition
    }

    function handleIncrement(item) {
        item.quantity += 1;
    }

    function handleDecrement(item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            appState.cartItems = appState.cartItems.filter(
                (i) => i.product.id !== item.product.id,
            );
        }
    }
    function handleProductRedirect(product) {
        appState.selectedProductForModal = product;
    }
    function handleFavoriteToggle(id) {
        if (crossSellProducts[id]) {
            delete crossSellProducts[id];
            appState.favoritesCount -= 1;
            appState.addToast("Removed item from Favorites", "info");
        } else {
            crossSellProducts[id] = true;
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
    let today = new Date();
    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    // Helper function to append st, nd, rd, or th
    function getOrdinalSuffix(day) {
        if (day > 3 && day < 21) return "th";
        switch (day % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    }

    // Get weekday and month names: "Saturday June"
    let baseDateStr = targetDate.toLocaleDateString("en-US", {
        weekday: "long",
    });
    let month = targetDate.toLocaleDateString("en-US", {
        month: "long",
    });

    // Get day number: 20
    let dayNum = targetDate.getDate();

    // Combine into final string: "Saturday June 20th"
    let formattedDate = `${baseDateStr} ${dayNum}${getOrdinalSuffix(dayNum)} ${month} ${targetDate.getFullYear()}`;
</script>

{#if appState.isCartOpen}
    <!-- Backdrop Overlay -->
    <button
        onclick={close}
        transition:fade={{ duration: 150 }}
        class="fixed inset-0 z-[80] bg-slate-950/20 backdrop-blur-xs select-none focus:outline-none"
        aria-label="Close cart"
    ></button>

    <!-- Slide-Out Drawer (Right-to-Left transition) -->
    <aside
        transition:fly={{ x: 440, duration: 300, easing: cubicOut }}
        class="fixed inset-y-0 right-0 z-[90] w-full sm:w-[440px] bg-white shadow-2xl border-l border-slate-200/50 flex flex-col justify-between font-sans select-none"
    >
        <!-- Header Block -->
        <div
            class="p-4 border-b border-slate-100 flex items-center justify-between shrink-0"
        >
            <button
                onclick={close}
                class="text-slate-400 hover:text-slate-600 focus:outline-none p-1"
            >
                <svg
                    class="w-5 h-5"
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
            <div class="text-center">
                <h3 class="text-sm font-black text-slate-900 tracking-tight">
                    Personal Postcom Cart
                </h3>
                <p
                    class="text-[10px] text-slate-400 font-bold uppercase mt-0.5"
                >
                    Shopping in {appState.activeBranch}
                </p>
            </div>
            <div class="w-7"></div>
            <!-- Spacer balance -->
        </div>

        <!-- Scrollable Items Area -->
        <div class="flex-1 overflow-y-auto p-5 space-y-6">
            <!-- Store Segment Header -->
            <div
                class="flex items-center justify-between border-b border-slate-100 pb-3"
            >
                <div>
                    <h4 class="text-sm font-semibold text-slate-800">
                        Delivery Timeline
                    </h4>
                    <span
                        class="text-sm text-emerald-600 font- flex items-center gap-1 mt-0.5"
                    >
                        ⚡ Delivery by {formattedDate}
                    </span>
                </div>
            </div>

            {#if appState.cartItems.length === 0}
                <div class="text-center py-20 space-y-4 max-w-md mx-auto">
                    <div
                        class="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-3xl"
                    >
                        🧺
                    </div>
                    <div class="space-y-1">
                        <h2 class="text-base text-slate-800 tracking-tight">
                            Your basket is empty!
                        </h2>
                        <p
                            class="text-xs text-slate-500 leading-relaxed font-semibold"
                        ></p>
                    </div>
                    <button onclick={close}>
                        <a
                            href="/"
                            class="inline-block bg-[#0aad0a] hover:bg-[#099409] text-white text-xs font-black px-6 py-2.5 rounded-full transition-all"
                        >
                            Continue Shopping
                        </a>
                    </button>
                </div>
            {:else}
                <!-- Cart Items List -->
                <div class="space-y-4">
                    {#each appState.cartItems as item (item.product.id)}
                        <div
                            class="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                        >
                            <div class="flex items-center gap-3.5 min-w-0">
                                <div
                                    class=" flex items-center justify-center shrink-0"
                                >
                                    <img
                                        src={item.product.images[0]}
                                        alt=""
                                        class="max-w-full max-h-full object-cover w-12 h-12 mix-blend-multiply rounded-xl bg-slate-50 border border-slate-100"
                                    />
                                </div>
                                <div class="min-w-0">
                                    <h5
                                        class=" text-sm text-slate-900 leading-snug line-clamp-3 max-w-[160px] sm:max-w-[200px]"
                                    >
                                        {item.product.name}
                                    </h5>
                                    <p
                                        class="text-[10px] text-slate-400 font-semibold mt-0.5"
                                    >
                                        UGX {(
                                            item.product.price * item.quantity
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <!-- Price & Custom Stepper Group -->
                            <div class="flex items-center gap-3 shrink-0">
                                <div
                                    class="flex items-center border border-slate-200/80 rounded-full h-7 bg-slate-50/50 select-none"
                                >
                                    <button
                                        onclick={() => handleDecrement(item)}
                                        class="{item.quantity > 1
                                            ? ' w-8 text-[#0aad0a]  '
                                            : 'w-8 text-red-500 px-1.5'} hover:bg-slate-100 h-6 rounded-l-full flex items-center justify-center font-semibold text-xl focus:outline-none"
                                    >
                                        {#if item.quantity == 1}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                x="0px"
                                                y="0px"
                                                width="100"
                                                height="100"
                                                viewBox="0 0 30 30"
                                            >
                                                <path
                                                    d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"
                                                ></path>
                                            </svg>
                                        {:else}
                                            −
                                        {/if}
                                    </button>
                                    <span class="px-2 text-xl text-slate-800"
                                        >{item.quantity}</span
                                    >
                                    <button
                                        onclick={() => handleIncrement(item)}
                                        class="w-8 h-6 rounded-r-full flex items-center justify-center text-[#0aad0a] hover:bg-slate-100 font-semibold text-xl focus:outline-none"
                                        >+</button
                                    >
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}

            <!-- Suggested items Row (Matching Screenshot) -->
            {#if crossSellProducts.length > 0}
                <div class="space-y-4 pt-6 border-t border-slate-100">
                    <!-- Section Banner Header -->
                    <div
                        class="bg-slate-50 border-y border-slate-200/40 -mx-5 px-5 py-2 select-none"
                    >
                        <h4
                            class="text-sm font-black text-slate-900 tracking-tight"
                        >
                            Suggested items
                        </h4>
                    </div>

                    <!-- Horizontal Swipe Carousel -->
                    <div
                        class="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x -mx-5 px-5 sm:mx-0 sm:px-0 grid grid-cols-2"
                    >
                        {#each crossSellProducts as product, idx}
                            <ProductCard
                                {product}
                                isFavorited={!!crossSellProducts[product.id]}
                                onCardClick={handleProductRedirect}
                                onToggleFavorite={handleFavoriteToggle}
                                onAddToCart={handleAddToCart}
                            />
                        {/each}
                    </div>
                </div>
            {/if}
        </div>

        <!-- Sticky Checkout Footer Bar (Instacart style) -->
        <div
            class="p-5 border-t border-slate-100 bg-slate-50/50 shrink-0 space-y-4"
        >
            <div
                class="flex justify-between items-baseline text-xs font-bold text-slate-500"
            >
                <span>Item subtotal</span>
                <span class="text-slate-900 font-extrabold"
                    >{subtotal.toLocaleString()} UGX</span
                >
            </div>

            <button
                onclick={handleCheckoutTrigger}
                disabled={appState.cartItems.length === 0}
                class="w-full bg-[#0aad0a] hover:bg-[#099409] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-sm h-12 rounded-full flex items-center justify-between px-6 shadow-md transition-all active:scale-[0.98] focus:outline-none"
            >
                <span>Go to checkout</span>
                <span>{subtotal.toLocaleString()} UGX</span>
            </button>
        </div>
    </aside>
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
