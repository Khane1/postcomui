<!-- lib/components/modals/ProductDetailModal.svelte -->
<script>
  import { appState } from "$lib/state.svelte.js";
  import { products } from "$lib/data/products.js";
  import { resolveImageUrl } from "$lib/utils/mappers.js";
  import ProductCard from "../cards&grids/ProductCard.svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  const ACCENT = "#0aad0a";

  let product = $derived(appState.selectedProductForModal);
  let activeOption = $state(null);

  // Sync activeOption whenever master product changes
  $effect(() => {
    if (product) {
      activeOption = product;
    }
  });

  let cartEntry = $derived(
    activeOption ? appState.cartItems.find((item) => item.product.id === activeOption.id) : null,
  );
  let quantityInCart = $derived(cartEntry ? cartEntry.quantity : 0);
  let selectedThumbnailIndex = $state(0);

  let modalShell = $state();
  let scrollContainer = $state();

  // Selected variations tracking
  let selectedVariations = $state({});
  let activeImageOverride = $state(null);

  // State for configurable product variants and specifications block
  let variants = $state([]);
  let isLoadingVariants = $state(false);
  let specificationsExpanded = $state(false);

  // Combine parent master product with sibling variants and safely deduplicate by ID to prevent duplicate keys
  let allProductOptions = $derived.by(() => {
    if (!product) return [];
    const pool = [product, ...variants];
    const seen = new Set();
    const unique = [];
    for (const item of pool) {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    return unique;
  });

  // Map variant name/value pairs
  let groupedAttributes = $derived.by(() => {
    if (!activeOption || !activeOption.attributes) return [];
    return activeOption.attributes.map(attr => ({
      name: attr.name,
      value: attr.value
    }));
  });

  // Mapped comma-separated category tree
  let categoryNames = $derived.by(() => {
    if (!activeOption || !activeOption.rawCategories || !activeOption.rawCategories.length) return 'Not specified';
    return activeOption.rawCategories.map(c => c.name || c).join(', ');
  });

  // Direct SKU field
  let sku = $derived(activeOption?.sku || 'N/A');

  // Category tags
  let categoriesToShow = $derived(
    activeOption && activeOption.categories && activeOption.categories.length > 0
      ? activeOption.categories
      : [
          { id: "cat-dummy-1", name: activeOption?.category || "Agro Products" },
          { id: "cat-dummy-2", name: "Premium Sourced" },
          { id: "cat-dummy-3", name: "Cooperative Certified" },
        ],
  );

  let totalPrice = $derived.by(() => {
    if (!activeOption) return 0;
    const additions = Object.values(selectedVariations).reduce(
      (acc, v) => acc + (v.priceVariation || 0),
      0,
    );
    return activeOption.price + additions;
  });

  function scrollToTop() {
    if (modalShell) modalShell.scrollTop = 0;
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }

  $effect(() => {
    if (product) {
      selectedThumbnailIndex = 0;
      activeImageOverride = null;
      selectedVariations = {};
      scrollToTop();

      if (product.type === 'configurable') {
        isLoadingVariants = true;
        variants = [];
        appState.fetchProductVariants(product.id).then(res => {
          variants = res;
          isLoadingVariants = false;
        }).catch(() => {
          isLoadingVariants = false;
        });
      } else {
        variants = [];
      }
    }
  });

  let detailsExpanded = $state(false);
  let returnsExpanded = $state(false);
  let isFavorited = $derived(activeOption ? appState.favorites.includes(activeOption.id) : false);

  let suggestions = $derived(
    product
      ? (appState.allProducts.length > 0
          ? appState.allProducts
          : products
        ).filter((p) => p.id !== product.id && p.category === product.category)
      : [],
  );

  function close() {
    appState.selectedProductForModal = null;
  }

  function handleSelectVariation(groupType, variation) {
    selectedVariations[groupType] = variation;
    if (variation.image) {
      const resolved = resolveImageUrl(variation.image);
      if (resolved) {
        activeImageOverride = resolved;
      }
    }
  }

  function setQuantity(qty) {
    if (!activeOption) return;
    qty = Math.max(1, Math.min(9, qty));
    if (cartEntry) {
      cartEntry.quantity = qty;
    } else {
      appState.addCartItem(activeOption, qty);
    }
  }

  function handleIncrement() {
    if (!activeOption) return;
    appState.addCartItem(activeOption);
  }

  function handleImageError(e) {
    const rawUrl =
      activeImageOverride || (activeOption && activeOption.images[selectedThumbnailIndex]);
    if (!rawUrl) return;
    const filename = rawUrl.split("/").pop();
    const legacyUrl = `${import.meta.env.VITE_APP_BASE_URL || "https://api.postcom.labs.eposta.ug"}/images/${filename}`;

    if (e.currentTarget.src !== legacyUrl) {
      e.currentTarget.src = legacyUrl;
    } else {
      e.currentTarget.src =
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400";
    }
  }

  let priceParts = $derived.by(() => {
    const str = totalPrice.toLocaleString();
    const commaIndex = str.indexOf(",");
    return commaIndex !== -1
      ? { major: str.slice(0, commaIndex), minor: str.slice(commaIndex) }
      : { major: str, minor: "" };
  });

  let isZoomed = $state(false);
  let zoomOrigin = $state("50% 50%");

  function handleImageMouseMove(e) {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    zoomOrigin = `${x}% ${y}%`;
    isZoomed = true;
  }

  function handleImageMouseLeave() {
    isZoomed = false;
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
  <link
    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap"
    rel="stylesheet"
  />
</svelte:head>

{#if product && activeOption}
  <div
    class="fixed inset-0 z-120 bg-slate-950/40 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none"
    style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;"
    role="button"
    tabindex="0"
    onclick={close}
    onkeydown={(e) => e.key === "Escape" && close()}
  >
    <div
      bind:this={modalShell}
      class="bg-white w-full rounded-t-3xl sm:rounded-3xl max-w-4xl sm:max-h-[90vh] h-[85vh] sm:h-auto overflow-y-auto flex flex-col justify-between shadow-2xl border border-gray-200"
      onclick={(e) => e.stopPropagation()}
      role="none"
      transition:fly={{ y: 440, duration: 300, easing: cubicOut }}
    >
      <div
        class="sm:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto my-3 shrink-0"
      ></div>

      <div
        bind:this={scrollContainer}
        class="p-5 sm:p-8 space-y-8 overflow-y-auto flex-1"
      >
        <div class="flex items-center justify-between">
          <button
            onclick={close}
            class="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-[13px] font-bold focus:outline-none"
          >
            <span>← Back</span>
          </button>
          <button
            onclick={close}
            class="text-gray-400 hover:text-gray-600 focus:outline-none hidden sm:block"
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
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start"
        >
          <div class="md:col-span-7 space-y-6">
            <div class="flex gap-4 items-start w-full relative">
              <div class="flex flex-col gap-2 shrink-0 select-none">
                {#each activeOption.images as img, index}
                  <button
                    onclick={() => {
                      selectedThumbnailIndex = index;
                      activeImageOverride = null;
                    }}
                    class="w-12 h-12 rounded-xl bg-white border-2 flex items-center justify-center p-1.5 focus:outline-none transition-all"
                    style={selectedThumbnailIndex === index &&
                    !activeImageOverride
                      ? `border-color: ${ACCENT};`
                      : "border-color: #e5e7eb;"}
                  >
                    <img
                      src={img}
                      alt=""
                      class="max-w-full max-h-full object-contain mix-blend-multiply"
                    />
                  </button>
                {/each}
              </div>

              <div
                class="flex-1 aspect-square bg-gray-50 border border-gray-100 rounded-3xl relative overflow-hidden"
                onmousemove={handleImageMouseMove}
                onmouseleave={handleImageMouseLeave}
              >
                <img
                  src={activeImageOverride ||
                    activeOption.images[selectedThumbnailIndex]}
                  alt={activeOption.name}
                  onerror={handleImageError}
                  class="w-full h-full object-contain mix-blend-multiply transition-transform duration-200 ease-out cursor-zoom-in"
                  style="transform-origin: {zoomOrigin}; transform: scale({isZoomed
                    ? 2
                    : 1});"
                />
                {#if activeOption.badge}
                  <span
                    class="absolute top-4 left-4 bg-gray-900 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full z-10"
                  >
                    {activeOption.badge}
                  </span>
                {/if}
              </div>
            </div>

            <div class="space-y-2 pt-2">
              {#if activeOption.reviews}
                <div class="flex items-center gap-1.5 text-[13px] font-bold">
                  <span class="text-amber-400">★★★★★</span>
                  <span class="text-gray-900">{activeOption.rating}</span>
                  <span class="text-gray-400 font-medium"
                    >({activeOption.reviews})</span
                  >
                </div>
              {/if}

              <h2
                class="text-xl sm:text-[26px] font-extrabold text-gray-900 leading-tight tracking-tight"
              >
                {activeOption.name}
              </h2>
              <p class="text-[13px] text-gray-500 font-medium">
                {activeOption.size}
              </p>

              <!-- Mapped dynamic category tag list -->
              {#if categoriesToShow.length > 0}
                <div class="flex flex-wrap gap-1.5 pt-2">
                  {#each categoriesToShow as cat (cat.id || cat.name)}
                    <span
                      class="text-[11.5px] font-bold px-2.5 py-1 rounded-full"
                      style="color: #0B8A00; background: #EAF7E9;"
                    >
                      {cat.name || cat}
                    </span>
                  {/each}
                </div>
              {/if}

              <button
                onclick={() => {
                  appState.selectedCategory = activeOption.category;
                  close();
                }}
                class="text-[13px] font-bold hover:underline cursor-pointer focus:outline-none block pt-2"
                style="color: {ACCENT};"
              >
                Shop all {activeOption.seller}
              </button>
            </div>

            <div class="border-t border-gray-100 pt-1 space-y-1">
              <div class="border-b border-gray-100">
                <button
                  onclick={() => (detailsExpanded = !detailsExpanded)}
                  class="w-full flex items-center justify-between py-4 focus:outline-none text-left"
                >
                  <span class="text-[15px] font-extrabold text-gray-900"
                    >Details</span
                  >
                  <svg
                    class="w-4.5 h-4.5 text-gray-400 transition-transform {detailsExpanded
                      ? 'rotate-180'
                      : ''}"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {#if detailsExpanded}
                  <div class="pb-4 text-[14px] text-gray-600 leading-relaxed">
                    {activeOption.description}
                  </div>
                {/if}
              </div>

              <!-- Unified specifications section detailing compiled options, attributes, and SKU values -->
              <div class="border-b border-gray-100">
                <button
                  onclick={() => (specificationsExpanded = !specificationsExpanded)}
                  class="w-full flex items-center justify-between py-4 focus:outline-none text-left"
                >
                  <span class="text-[15px] font-extrabold text-gray-900"
                    >Product Details</span
                  >
                  <svg
                    class="w-4.5 h-4.5 text-gray-400 transition-transform {specificationsExpanded
                      ? 'rotate-180'
                      : ''}"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {#if specificationsExpanded}
                  <div class="pb-4 grid grid-cols-2 gap-y-3 gap-x-6 text-[13.5px] animate-in fade-in duration-200 font-sans">
                    <!-- Standard Product Details (Categories, SKU) -->
                    <div class="flex justify-between border-b border-gray-100/60 pb-2 col-span-2">
                      <span class="text-gray-400 font-medium">Category</span>
                      <span class="text-gray-500 font-semibold text-right">{categoryNames}</span>
                    </div>
                    <div class="flex justify-between border-b border-gray-100/60 pb-2 col-span-2 ">
                      <span class="text-gray-400 font-medium">SKU</span>
                      <span class="text-gray-500 font-semibold">{sku}</span>
                    </div>

                    <!-- Dynamic Attribute Specs -->
                    {#each groupedAttributes as attr}
                      <div class="flex justify-between border-b border-gray-100/60 pb-2 col-span-2 sm:col-span-1">
                        <span class="text-gray-400 font-medium">{attr.name || 'Specification'}</span>
                        <span class="text-gray-900 font-bold">{attr.value}</span>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>

              <div class="border-b border-gray-100">
                <button
                  onclick={() => (returnsExpanded = !returnsExpanded)}
                  class="w-full flex items-center justify-between py-4 focus:outline-none text-left"
                >
                  <span class="text-[15px] font-extrabold text-gray-900"
                    >Sourcing & altitude</span
                  >
                  <svg
                    class="w-4.5 h-4.5 text-gray-400 transition-transform {returnsExpanded
                      ? 'rotate-180'
                      : ''}"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {#if returnsExpanded}
                  <div class="pb-4 space-y-2.5 text-[13.5px]">
                    <div class="flex justify-between">
                      <span class="text-gray-400 font-medium">Origin</span><span
                        class="text-gray-900 font-bold"
                        >{activeOption.origin || "Local Co-op"}</span
                      >
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-400 font-medium">Altitude</span
                      ><span class="text-gray-900 font-bold"
                        >{activeOption.altitude || "Sustainable Sourced"}</span
                      >
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-400 font-medium"
                        >Logistics route</span
                      ><span class="text-gray-900 font-bold"
                        >ePosta Subsidized</span
                      >
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <div class="md:col-span-5 h-fit select-none">
            <div
              class="border border-gray-200 rounded-[20px] p-5 bg-white space-y-4 relative"
            >
              <div class="flex items-start text-gray-900 leading-none">
                <span class="text-[13px] font-bold mt-1 mr-0.5 text-gray-500"
                  >UGX</span
                >
                <span class="text-[26px] font-extrabold tracking-tight"
                  >{priceParts.major}</span
                >
                {#if priceParts.minor}
                  <span class="text-[13px] font-bold mt-1"
                    >{priceParts.minor}</span
                  >
                {/if}
              </div>

              <!-- Available Configurable Options with direct Thumbnail Image rendering -->
              {#if allProductOptions.length > 1}
                <div class="space-y-2.5 pt-3 border-t border-gray-100">
                  <span class="text-[12px] font-bold text-gray-500 block uppercase tracking-wider">Available Options</span>
                  {#if isLoadingVariants}
                    <div class="flex items-center gap-2 py-1.5 animate-pulse">
                      <div class="w-4 h-4 rounded-full border-2 border-slate-200 border-t-[#0aad0a] animate-spin"></div>
                      <span class="text-xs text-gray-400 font-medium">Loading choices...</span>
                    </div>
                  {:else}
                    <div class="flex flex-wrap gap-2">
                      {#each allProductOptions as option (option.id)}
                        {@const isSelected = option.id === activeOption?.id}
                        <button
                          onclick={() => { 
                            activeOption = option; 
                            selectedThumbnailIndex = 0; 
                            activeImageOverride = null; 
                          }}
                          class="w-12 h-12 rounded-xl bg-white border-2 flex items-center justify-center p-1 focus:outline-none transition-all hover:border-gray-400 cursor-pointer"
                          style={isSelected ? `border-color: ${ACCENT};` : 'border-color: #e5e7eb;'}
                          title={option.name}
                        >
                          <img
                            src={option.images[0]}
                            alt={option.name}
                            class="max-w-full max-h-full object-contain mix-blend-multiply"
                          />
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/if}

              {#if activeOption.stockStatus === "Many in stock" || activeOption.stockStatus.includes("left")}
                <div
                  class="flex items-center justify-between border border-gray-300 rounded-full overflow-hidden h-12"
                >
                  <button
                    onclick={() => setQuantity((quantityInCart || 1) - 1)}
                    disabled={(quantityInCart || 1) <= 1}
                    aria-label="Decrease quantity"
                    class="w-12 h-full flex items-center justify-center text-gray-700 text-lg font-extrabold disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none cursor-pointer"
                  >
                    −
                  </button>
                  <span
                    class="flex-1 text-center text-[15px] font-extrabold text-gray-900"
                    aria-live="polite"
                  >
                    {quantityInCart || 1}
                  </span>
                  <button
                    onclick={() => setQuantity((quantityInCart || 1) + 1)}
                    disabled={(quantityInCart || 1) >= 9}
                    aria-label="Increase quantity"
                    class="w-12 h-full flex items-center justify-center text-gray-700 text-lg font-extrabold disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onclick={handleIncrement}
                  class="w-full text-white font-extrabold text-[15px] h-12 rounded-full transition-all focus:outline-none cursor-pointer flex items-center justify-center gap-1.5"
                  style="background: {ACCENT};"
                  onmouseover={(e) =>
                    (e.currentTarget.style.background = "#099409")}
                  onmouseout={(e) =>
                    (e.currentTarget.style.background = ACCENT)}
                >
                  <span>Add to cart</span>
                </button>
              {:else if activeOption.stockStatus === "Out of stock" || activeOption.stockStatus === "Sold Out"}
                <div class="flex justify-center">
                  <div
                    class="inline-flex items-center gap-1 text-[10.5px] font-bold mt-1.5 px-1.5 py-0.5 -ml-1.5 rounded-full text-rose-600"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>Out of stock</span>
                  </div>
                </div>
              {/if}

              <button
                onclick={() => appState.toggleFavorite(activeOption.id)}
                class="w-full border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-bold text-[13px] h-11 rounded-full transition-all focus:outline-none flex items-center justify-center gap-2 bg-white"
              >
                <svg
                  class="w-4 h-4 {isFavorited
                    ? 'fill-red-500 stroke-red-500'
                    : 'stroke-gray-500'}"
                  fill="none"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17.593 3.322c1.1.175 1.907 1.125 1.907 2.237v12.014c0 1.24-1.328 1.983-2.378 1.258l-4.622-3.193-4.622 3.193c-1.05.725-2.378-.018-2.378-1.258V5.559c0-1.112.807-2.062 1.907-2.237a48.295 48.295 0 0 1 10.116 0Z"
                  />
                </svg>
                <span>{isFavorited ? "Saved to favorites" : "Save"}</span>
              </button>
            </div>
          </div>
        </div>

        {#if suggestions.length > 0}
          <div class="space-y-3 pt-4 border-t border-gray-100">
            <h4 class="text-[16px] font-extrabold text-gray-900 tracking-tight">
              Customers also considered
            </h4>
            <div
              class="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {#each suggestions as sug (sug.id)}
                <div class="w-36 shrink-0 snap-start">
                  <ProductCard
                    product={sug}
                    isFavorited={appState.favorites.includes(sug.id)}
                    onCardClick={() => {
                      appState.selectedProductForModal = sug;
                      scrollToTop();
                    }}
                    onToggleFavorite={(id) => appState.toggleFavorite(id)}
                    onAddToCart={(p) => appState.addCartItem(p)}
                  />
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
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