<!-- lib/components/ProductDetailModal.svelte -->
<script>
  import { appState } from "$lib/state.svelte.js";
  import { products } from "$lib/data/products.js";
  import { resolveImageUrl } from "$lib/utils/mappers.js";
  import ProductCard from "../cards&grids/ProductCard.svelte";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  const ACCENT = "#0aad0a";

  let product = $derived(appState.selectedProductForModal);
  let cartEntry = $derived(
    appState.cartItems.find((item) => item.product.id === product?.id),
  );
  let quantityInCart = $derived(cartEntry ? cartEntry.quantity : 0);
  let selectedThumbnailIndex = $state(0);

  let modalShell = $state();
  let scrollContainer = $state();

  // Selected variations tracking
  let selectedVariations = $state({});
  let activeImageOverride = $state(null);

  // Dynamic Fallbacks for Categories (Shows when API array is empty)
  let categoriesToShow = $derived(
    product && product.categories && product.categories.length > 0
      ? product.categories
      : [
          { id: "cat-dummy-1", name: product?.category || "Agro Products" },
          { id: "cat-dummy-2", name: "Premium Sourced" },
          { id: "cat-dummy-3", name: "Cooperative Certified" },
        ],
  );

  // Dynamic Fallbacks for Variations (Shows when API array is empty)
  let variationsToShow = $derived(
    product && product.variations && product.variations.length > 0
      ? product.variations
      : [
          {
            variationTypeId: "var-size",
            variationType: "Pack Size",
            variations: [
              {
                id: "v-size-sm",
                label: "Standard 250g",
                description: "Standard single size",
                priceVariation: 0,
                image: "",
              },
              {
                id: "v-size-md",
                label: "Value Pack 500g",
                description: "Double size pack",
                priceVariation: 1500,
                image: "",
              },
              {
                id: "v-size-lg",
                label: "Bulk 1KG",
                description: "Bulk family pack",
                priceVariation: 3000,
                image: "",
              },
            ],
          },
          {
            variationTypeId: "var-style",
            variationType: "Item Style",
            variations: [
              {
                id: "v-style-trad",
                label: "Traditional Family-Grown",
                description: "Sourced from family lots",
                priceVariation: 0,
                image: "",
              },
              {
                id: "v-style-org",
                label: "100% Certified Organic",
                description: "Pesticide-free certified soils",
                priceVariation: 1000,
                image: "",
              },
            ],
          },
        ],
  );

  // Compute total price incorporating selected variations additions
  let totalPrice = $derived.by(() => {
    if (!product) return 0;
    const additions = Object.values(selectedVariations).reduce(
      (acc, v) => acc + (v.priceVariation || 0),
      0,
    );
    return product.price + additions;
  });

  function scrollToTop() {
    if (modalShell) modalShell.scrollTop = 0;
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }

  $effect(() => {
    if (product) {
      selectedThumbnailIndex = 0;
      activeImageOverride = null;
      selectedVariations = {}; // clear selections on switch
      scrollToTop();
    }
  });

  let detailsExpanded = $state(true);
  let returnsExpanded = $state(false);
  let isFavorited = $derived(appState.favorites.includes(product?.id));

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

  // Shared quantity setter backing both the stepper buttons
  function setQuantity(qty) {
    if (!product) return;
    qty = Math.max(1, Math.min(9, qty));
    if (cartEntry) {
      cartEntry.quantity = qty;
    } else {
      appState.addCartItem(product, qty);
    }
  }

  function handleIncrement() {
    if (!product) return;
    appState.addCartItem(product);
  }

  function handleFavoriteToggle(id) {
    appState.toggleFavorite(id);
  }

  function handleImageError(e) {
    const rawUrl =
      activeImageOverride || product.images[selectedThumbnailIndex];
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
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
  <link
    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap"
    rel="stylesheet"
  />
</svelte:head>

{#if product}
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
                {#each product.images as img, index}
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
              >
                <img
                  src={activeImageOverride ||
                    product.images[selectedThumbnailIndex]}
                  alt={product.name}
                  onerror={handleImageError}
                  class="w-full h-full object-cover mix-blend-multiply transition-all duration-200"
                />
                {#if product.badge}
                  <span
                    class="absolute top-4 left-4 bg-gray-900 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full z-10"
                  >
                    {product.badge}
                  </span>
                {/if}
              </div>
            </div>

            <div class="space-y-2 pt-2">
              {#if product.reviews}
                <div class="flex items-center gap-1.5 text-[13px] font-bold">
                  <span class="text-amber-400">★★★★★</span>
                  <span class="text-gray-900">{product.rating}</span>
                  <span class="text-gray-400 font-medium"
                    >({product.reviews})</span
                  >
                </div>
              {/if}

              <h2
                class="text-xl sm:text-[26px] font-extrabold text-gray-900 leading-tight tracking-tight"
              >
                {product.name}
              </h2>
              <p class="text-[13px] text-gray-500 font-medium">
                {product.size}
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
                  appState.selectedCategory = product.category;
                  close();
                }}
                class="text-[13px] font-bold hover:underline cursor-pointer focus:outline-none block pt-2"
                style="color: {ACCENT};"
              >
                Shop all {product.seller}
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
                    {product.description}
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
                        >{product.origin || "Local Co-op"}</span
                      >
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-400 font-medium">Altitude</span
                      ><span class="text-gray-900 font-bold"
                        >{product.altitude || "Sustainable Sourced"}</span
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

            
              <!-- Corrected template variable referencing variationsToShow -->
              <!-- {#if variationsToShow.length > 0}
                <div class="space-y-4 pt-3 border-t border-gray-100">
                  {#each variationsToShow as group}
                    <div class="space-y-2">
                      <span class="text-[12.5px] font-bold text-gray-500 block"
                        >{group.variationType}</span
                      >
                      <div class="flex flex-wrap gap-2">
                        {#each group.variations as variation}
                          {@const isSelected =
                            selectedVariations[group.variationType]?.id ===
                            variation.id}

                          <button
                            onclick={() =>
                              handleSelectVariation(
                                group.variationType,
                                variation,
                              )}
                            class="px-3.5 py-2 rounded-full border text-[13px] font-bold transition-all focus:outline-none text-left"
                            style={isSelected
                              ? `border-color: ${ACCENT}; color: ${ACCENT}; background: #EAF7E9;`
                              : "border-color: #e5e7eb; color: #374151; background: #ffffff;"}
                          >
                            <span>{variation.label}</span>
                            {#if variation.priceVariation}
                              <span
                                class="text-[11px] font-bold ml-1 opacity-70"
                              >
                                (+{variation.priceVariation.toLocaleString()} UGX)
                              </span>
                            {/if}
                          </button>
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              {/if} -->
              {#if product.stockStatus === "Many in stock"}
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
              {:else if product.stockStatus === "Out of stock" || product.stockStatus === "Sold Out"}
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
                onclick={() => appState.toggleFavorite(product.id)}
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

        <!-- Inside lib/components/modals/ProductDetailModal.svelte [5] -->
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
                  <!-- FIXED: Added standard props to allow live favoriting & cart additions inside suggestions -->
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
