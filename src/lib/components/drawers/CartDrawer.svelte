<!-- lib/components/CartDrawer.svelte -->
<script>
    import { appState } from "$lib/state.svelte.js";
    import { products } from "$lib/data/products.js";
    import ProductCard from "../cards&grids/ProductCard.svelte";
    import { fly, fade } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { goto } from "$app/navigation";

    let subtotal = $derived(
        appState.cartItems.reduce(
            (acc, item) => acc + item.product.price * item.quantity,
            0,
        ),
    );

    // Cross-sell items: Reads from API list if loaded, otherwise falls back to local mocks
    let crossSellProducts = $derived(
        (appState.allProducts.length > 0 ? appState.allProducts : products)
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
        appState.isCheckoutOpen = true;
        goto("/cart");
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
        appState.toggleFavorite(id); // Use core state toggler [5]
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

    let baseDateStr = targetDate.toLocaleDateString("en-US", {
        weekday: "long",
    });
    let month = targetDate.toLocaleDateString("en-US", { month: "long" });
    let dayNum = targetDate.getDate();
    let formattedDate = `${baseDateStr} ${dayNum}${getOrdinalSuffix(dayNum)} ${month} ${targetDate.getFullYear()}`;
</script>

{#if appState.isCartOpen}
    <button
        onclick={close}
        transition:fade={{ duration: 150 }}
        class="fixed inset-0 z-[80] bg-slate-950/20 backdrop-blur-xs select-none focus:outline-none"
        aria-label="Close cart"
    ></button>

    <aside
        transition:fly={{ x: 440, duration: 300, easing: cubicOut }}
        class="fixed inset-y-0 right-0 z-[90] w-full sm:w-[440px] bg-white shadow-2xl border-l border-slate-200/50 flex flex-col justify-between font-sans select-none"
    >
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
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-6">
            <div
                class="flex items-center justify-between border-b border-slate-100 pb-3"
            >
                <div>
                    <h4 class="text-sm font-semibold text-slate-800">
                        Delivery Timeline
                    </h4>
                    <span
                        class="text-sm text-emerald-600 flex items-center gap-1 mt-0.5"
                    >
                        ⚡ Delivery by {formattedDate}
                    </span>
                </div>
            </div>

            {#if appState.cartItems.length === 0}
                <div
                    class="text-center py-20 space-y-4 max-w-md mx-auto"
                    style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;"
                >
                    <div
                        class="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400"
                    >
                        <svg
                            class="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                            />
                        </svg>
                    </div>
                    <div class="space-y-1">
                        <h2
                            class="text-[15px] text-gray-900 tracking-tight font-extrabold"
                        >
                            Your basket is empty
                        </h2>
                    </div>
                    <a
                        href="/"
                        onclick={close}
                        class="inline-block bg-[#0aad0a] hover:bg-[#099409] text-white text-[13px] font-bold px-6 py-2.5 rounded-full transition-all"
                    >
                        Continue shopping
                    </a>
                </div>
            {:else}
                <div class="space-y-4">
                    {#each appState.cartItems as item (item.product.id)}
                        <div
                            class="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                        >
                            <div class="flex items-center gap-3.5 min-w-0">
                                <div
                                    class="flex items-center justify-center shrink-0"
                                >
                                    <img
                                        src={item.product.images[0]}
                                        alt=""
                                        class="max-w-full max-h-full object-cover w-12 h-12 mix-blend-multiply rounded-xl bg-slate-50 border border-slate-100"
                                    />
                                </div>
                                <div class="min-w-0">
                                    <h5
                                        class="text-sm text-slate-900 leading-snug line-clamp-3 max-w-[160px] sm:max-w-[200px]"
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

                            <div class="flex items-center gap-3 shrink-0">
                                <div
                                    class="flex items-center border border-slate-200/80 rounded-full h-7 bg-slate-50/50 select-none"
                                >
                                    <button
                                        onclick={() => handleDecrement(item)}
                                        class="{item.quantity > 1
                                            ? 'w-8 text-[#0aad0a]'
                                            : 'w-8 text-red-500 px-1.5'} hover:bg-slate-100 h-6 rounded-l-full flex items-center justify-center font-semibold text-xl focus:outline-none"
                                    >
                                        {#if item.quantity === 1}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="100"
                                                height="100"
                                                viewBox="0 0 30 30"
                                                class="w-4 h-4 fill-current"
                                            >
                                                <path
                                                    d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"
                                                />
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

            {#if crossSellProducts.length > 0}
                <div class="space-y-4 pt-6 border-t border-slate-100">
                    <div
                        class="bg-slate-50 border-y border-slate-200/40 -mx-5 px-5 py-2 select-none"
                    >
                        <h4
                            class="text-sm font-black text-slate-900 tracking-tight"
                        >
                            Suggested items
                        </h4>
                    </div>

                    <div
                        class="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x -mx-5 px-5 sm:mx-0 sm:px-0 grid grid-cols-2"
                    >
                        {#each crossSellProducts as product (product.id)}
                            <ProductCard
                                {product}
                                isFavorited={appState.favorites.includes(
                                    product.id,
                                )}
                                onCardClick={handleProductRedirect}
                                onToggleFavorite={handleFavoriteToggle}
                                onAddToCart={handleAddToCart}
                            />
                        {/each}
                    </div>
                </div>
            {/if}
        </div>

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
