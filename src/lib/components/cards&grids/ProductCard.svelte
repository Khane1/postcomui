<!-- lib/components/cards&grids/ProductCard.svelte -->
<script>
    import { appState } from "$lib/state.svelte.js";

    const ACCENT = "#0aad0a";

    let {
        product,
        isFavorited = false,
        onCardClick,
        onToggleFavorite,
        onAddToCart,
    } = $props();
    let isLoaded = $state(false);
    let isHovered = $state(false);
    let showDial = $state(false);

    $effect(() => {
        if (!isHovered) {
            showDial = false;
        }
    });
    let cartEntry = $derived(
        appState.cartItems.find((item) => item.product.id === product.id),
    );
    let quantityInCart = $derived(cartEntry ? cartEntry.quantity : 0);
    let parsed = $derived.by(() => {
        const name = product.name;
        const match = name.match(
            /\(([^)]*(?:500g|2kg Pack|1L|250g|100g|1KG|1kg|Medium Roast)[^)]*)\)$/i,
        );
        if (match) {
            const sizeStr = match[1];
            const cleanedName = name.replace(match[0], "").trim();
            return { name: cleanedName, size: sizeStr };
        }
        return { name: name, size: product.altitude || "1 each" };
    });
    let priceParts = $derived.by(() => {
        const str = product.price.toLocaleString();
        const commaIndex = str.indexOf(",");
        if (commaIndex !== -1) {
            return {
                major: str.slice(0, commaIndex),
                minor: str.slice(commaIndex),
            };
        }
        return { major: str, minor: "" };
    });
    function handleIncrement(e) {
        e.stopPropagation();
        onAddToCart?.(product);
    }
    function handleDecrement(e) {
        e.stopPropagation();
        if (!cartEntry) return;
        if (cartEntry.quantity > 1) {
            cartEntry.quantity -= 1;
        } else {
            appState.cartItems = appState.cartItems.filter(
                (item) => item.product.id !== product.id,
            );
        }
        appState.addToast(`Removed ${product.name} from basket`, "info");
    }
    function handleImageError(e) {
        const rawUrl = product.images[0];
        const filename = rawUrl.split("/").pop();
        const legacyUrl = `${import.meta.env.VITE_APP_BASE_URL || "https://api.postcom.labs.eposta.ug"}/images/${filename}`;
        if (e.currentTarget.src !== legacyUrl) {
            console.warn(
                `[Image Redirect] S3 asset loading failed. Retrying legacy backend location: ${legacyUrl}`,
            );
            e.currentTarget.src = legacyUrl;
        } else {
            e.currentTarget.src =
                "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400";
        }
    }
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin="true"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<div
    onmouseenter={() => (isHovered = true)}
    onmouseleave={() => (isHovered = false)}
    onclick={() => onCardClick?.(product)}
    class="bg-white flex flex-col justify-between w-full relative aspect-[3/4] p-2 transition-all duration-200 select-none cursor-pointer"
    style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;"
    role="button"
    tabindex="0"
    onkeydown={(e) => e.key === "Enter" && onCardClick?.(product)}
>
    <div
        class="relative w-full aspect-square bg-gray-50 flex items-center justify-center"
    >
        <img
            src={product.placeholder}
            alt=""
            aria-hidden="true"
            class="absolute inset-4 object-cover blur-md transition-opacity duration-300 {isLoaded
                ? 'opacity-0'
                : 'opacity-100'}"
        />
        <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            onload={() => (isLoaded = true)}
            onerror={handleImageError}
            class="w-full h-full object-cover mix-blend-multiply transition-all duration-300 rounded-lg {isLoaded
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-95'}"
        />

        {#if product.stockStatus === "Out of stock" || product.stockStatus === "Sold Out"}
            <!-- Out of Stock Indicator -->
            <span
                onclick={(e) => e.stopPropagation()}
                class="absolute top-2 right-2 z-20 bg-gray-100 text-gray-500 text-[10.5px] font-bold px-3 py-1.5 rounded-full shadow-sm cursor-not-allowed select-none border border-gray-200"
            >
                Out of Stock
            </span>
        {:else if quantityInCart > 0}
            <!-- Sliding Quantity Selector Pill Container -->
            <div
                onclick={(e) => {
                    e.stopPropagation();
                    showDial = true;
                }}
                class="absolute top-2 right-2 z-20 h-10 flex items-center justify-between rounded-full shadow-md select-none transition-all duration-300 ease-out overflow-hidden border
      {isHovered || showDial
                    ? 'w-28 bg-white border-gray-200 px-1.5'
                    : 'w-10 bg-[#0aad0a] border-transparent px-0 cursor-pointer hover:bg-[#099409]'}"
            >
                <button
                    onclick={handleDecrement}
                    class="rounded-full flex items-center justify-center text-[#0aad0a] hover:bg-gray-50 font-extrabold text-sm focus:outline-none transition-all duration-300 ease-out
        {isHovered || showDial
                        ? 'w-6 h-6 opacity-100 scale-100'
                        : 'w-0 h-0 opacity-0 scale-50 pointer-events-none'}"
                    aria-label="Remove item"
                >
                    −
                </button>
                <div class="flex-1 flex items-center justify-center">
                    {#key quantityInCart}
                        <span
                            class="text-[13px] font-extrabold animate-pop inline-block transition-colors duration-300
            {isHovered || showDial ? 'text-gray-900' : 'text-white'}"
                        >
                            {quantityInCart}{!(isHovered || showDial)
                                ? " ct"
                                : ""}
                        </span>
                    {/key}
                </div>
                <button
                    onclick={handleIncrement}
                    class="rounded-full flex items-center justify-center text-[#0aad0a] hover:bg-gray-50 font-extrabold text-sm focus:outline-none transition-all duration-300 ease-out
        {isHovered || showDial
                        ? 'w-6 h-6 opacity-100 scale-100'
                        : 'w-0 h-0 opacity-0 scale-50 pointer-events-none'}"
                    aria-label="Add item"
                >
                    +
                </button>
            </div>
        {:else}
            <button
                onclick={handleIncrement}
                class="absolute top-2 right-2 z-20 bg-[#0aad0a] hover:bg-[#099409] hover:border-2 hover:border-[#0aad0a] text-white text-[13px] font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 transition-all active:scale-95 focus:outline-none"
            >
                <svg
                    class="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3.5"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 4v16m8-8H4"
                    />
                </svg>
                <span>Add</span>
            </button>
        {/if}

        <button
            onclick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(product.id);
            }}
            class="absolute bottom-2 left-2 z-10 w-6.5 h-6.5 rounded-full bg-white/90 hover:bg-white flex items-center justify-center border border-gray-100 text-gray-400 hover:text-red-500 transition-all active:scale-90 focus:outline-none"
            aria-label="Save item"
        >
            <svg
                class="w-3 h-3 transition-transform {isFavorited
                    ? 'fill-red-500 stroke-red-500 scale-110'
                    : 'stroke-gray-400'}"
                fill="none"
                stroke-width="2.5"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    </div>
    <div class="mt-2.5 flex-1 flex flex-col justify-between">
        <div class="space-y-1">
            <div class="flex items-start text-gray-900 leading-none py-0.5">
                <span class="text-[10.5px] font-bold mt-1 mr-0.5 text-gray-500"
                    >UGX</span
                >
                <span class="text-lg font-extrabold tracking-tight"
                    >{priceParts.major}</span
                >
                {#if priceParts.minor}
                    <span class="text-[11px] font-bold mt-0.5"
                        >{priceParts.minor}</span
                    >
                {/if}
            </div>
            <h4
                class="text-[13.5px] text-gray-700 font-medium line-clamp-2 leading-tight"
            >
                {parsed.name}
            </h4>
            {#if product.reviews}
                <div class="flex items-center gap-1 text-[10px] py-0.5">
                    <span class="text-amber-400 tracking-tighter">★★★★★</span>
                    <span class="text-gray-400 font-semibold"
                        >({product.reviews})</span
                    >
                </div>
            {/if}
        </div>
        <div class="pt-1 select-none">
            <div class="text-[11.5px] text-gray-400 font-medium leading-none">
                {parsed.size}
            </div>
            {#if product.stockStatus === "Many in stock"}
                <div
                    class="inline-flex items-center gap-1 text-[10.5px] font-bold mt-1.5 px-1.5 py-0.5 -ml-1.5 rounded-full"
                    style="color: #0B8A00;"
                >
                    <span
                        class="w-1.5 h-1.5 rounded-full"
                        style="background: #0B8A00;"
                    ></span>
                    <span>Many in stock</span>
                </div>
            {:else if product.stockStatus === "Out of stock" || product.stockStatus === "Sold Out"}
                <div
                    class="inline-flex items-center gap-1 text-[10.5px] font-bold mt-1.5 px-1.5 py-0.5 -ml-1.5 rounded-full text-rose-600"
                >
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>Out of stock</span>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    @keyframes scale-pop {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.12);
        }
        100% {
            transform: scale(1);
        }
    }
    .animate-pop {
        animation: scale-pop 0.38s cubic-bezier(0.25, 1, 0.5, 1);
    }
</style>
