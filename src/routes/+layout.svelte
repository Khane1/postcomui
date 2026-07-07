<script>
  import "./layout.css";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { appState } from "$lib/state.svelte.js";
  import SidebarNav from "$lib/components/sidebars/SidebarNav.svelte";
  import ProductDetailModal from "$lib/components/modals/ProductDetailModal.svelte";
  import CartDrawer from "$lib/components/drawers/CartDrawer.svelte";
  import { onMount } from "svelte";
  import AccountSidebarNav from "$lib/components/sidebars/AccountSidebarNav.svelte";
  import Locationselection from "$lib/components/modals/locationselection.svelte";
  import {
    mapBackendProductToUI,
    resolveImageUrl,
  } from "$lib/utils/mappers.js";

  let isSearchFocused = $state(false);
  let debounceTimer;
  let { children } = $props();

  // Search input & suggestion states
  let locationSearchQuery = $state("");
  let isLocating = $state(false);
  let placeSuggestions = $state([]); // Google Maps places predictions array
  let resolvedUserAddress = $state(""); // Reverse geocoded location address
  let tempSelectedAddress = $state(""); // Tracks active address before confirming save
  let searchQuery = $state("");

  // NEW: Address book fields state
  let saveToAddressBook = $state(false);
  let aptInput = $state("");
  let businessInput = $state("");
  let commentsInput = $state("");
  let isSavingAddress = $state(false);

  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  // NEW: Detail fields state & maps coordinate markers
  let selectedLat = $state(0.3476); // Default Kampala coordinates
  let selectedLng = $state(32.5825);

  // Request browser GPS position [6]
  function requestCustomerLocationOnOpen() {
    if (!navigator.geolocation) {
      appState.addToast(
        "Geolocation is not supported by your browser.",
        "error",
      );
      return;
    }

    isLocating = true;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        selectedLat = latitude;
        selectedLng = longitude;
        await reverseGeocodeAddress(latitude, longitude);
        isLocating = false;
      },
      () => {
        isLocating = false;
        appState.addToast(
          "Permission denied or location lookup failed.",
          "error",
        );
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }

  onMount(() => {
    appState.initAuth();
    loadGoogleMapsScript();
  });

  // Dynamically load Google Maps Places Library [3]
  function loadGoogleMapsScript() {
    if (typeof window === "undefined" || window.google) return;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  let isAccountProfile = $derived(
    page.url.pathname.startsWith("/account") && appState.isLoggedIn,
  );

  let mainClass = $derived.by(() => {
    if (isAccountProfile) {
      return "flex-1 min-w-0 bg-white rounded-tl-3xl border-t border-l border-slate-100/5 flex";
    }
    return "flex-1 min-w-0 p-4 sm:p-6 bg-white rounded-tl-3xl border-t border-l border-slate-100/5 2xl:px-20";
  });

  // Track the local typed searchQuery to fetch live autocomplete suggestions (200ms debounce)
  $effect(() => {
    const q = searchQuery;
    clearTimeout(debounceTimer);
    if (!q.trim()) {
      appState.searchSuggestions = [];
      return;
    }
    debounceTimer = setTimeout(() => {
      appState.fetchSearchSuggestions(q);
    }, 200);
    return () => clearTimeout(debounceTimer);
  });

  function handleSuggestionClick(suggestion) {
    if (suggestion.raw) {
      const mapped = mapBackendProductToUI(suggestion.raw);
      if (mapped) {
        appState.selectedProductForModal = mapped;
      }
    }
    searchQuery = suggestion.label;
    isSearchFocused = false;
  }

  $effect(() => {
    if (typeof window !== "undefined") {
      const handleAuthFailure = () => {
        appState.addToast("Session expired. Please log in again.", "info");
        goto("/account");
      };
      window.addEventListener("unauthorized-session", handleAuthFailure);
      return () =>
        window.removeEventListener("unauthorized-session", handleAuthFailure);
    }
  });

  function updateFulfillment(mode) {
    appState.fulfillmentMode = mode;
  }

  // Handle product searches via form submission
  function handleSearchSubmit(e) {
    e.preventDefault();
    appState.searchQuery = searchQuery;
    appState.fetchProducts();
    isSearchFocused = false;
    goto("/products");
  }

  function updateCategory(cat) {
    appState.selectedCategory = cat;
    appState.fetchProducts();
    goto("/products");
  }

  function handleClaimCoupon(coupon) {
    appState.addToast(`Coupon "${coupon}" successfully applied!`);
  }
  const ACCENT = "#0aad0a";
</script>

<ProductDetailModal />
<CartDrawer />

<div
  class="min-h-screen bg-white text-gray-800 flex flex-col"
  style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;"
>
  <header
    class="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 select-none sticky top-0 z-50"
  >
    <div class="flex items-center gap-5 shrink-0">
      <button
        onclick={() => {
          !isAccountProfile
            ? (appState.isSidebarOpen = !appState.isSidebarOpen)
            : (appState.accountSidebarOpen = !appState.accountSidebarOpen);
        }}
        class="lg:hidden text-gray-800 hover:text-gray-900 focus:outline-none p-1.5 hover:bg-gray-100 rounded-lg transition-all"
        aria-label="Menu"
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <a
        href="/"
        onclick={() => {
          appState.searchQuery = "";
        }}
        class="flex items-center gap-1.5 group focus:outline-none text-left"
      >
        <img
          src="https://postcom.ug/assets/postcom-logo-white-B0oZfjq1.jpg"
          class="size-9 rounded-lg"
          alt="Logo"
        />
        <span class="text-[19px] font-extrabold text-gray-900 tracking-tight">
          postcom
        </span>
      </a>

      <button
        onclick={() => (appState.isLocationModalOpen = true)}
        class="hidden sm:flex items-center gap-1.5 bg-gray-100 border border-transparent hover:border-gray-300 px-3.5 py-1.5 rounded-full text-[12.5px] font-bold text-gray-700 transition-all focus:outline-none cursor-pointer"
      >
        <span class="text-[13px] leading-none">UG</span>
        <span class="truncate max-w-[140px]"
          >{appState.activeBranch || "Set delivery address"}</span
        >
        <span class="text-gray-400 text-[10px]">▼</span>
      </button>
    </div>

    <form
      onsubmit={handleSearchSubmit}
      class="flex-1 max-w-lg hidden md:block relative"
    >
      <div
        class="flex items-center bg-gray-100 border border-transparent rounded-full pl-4 pr-1.5 py-1.5 transition-all focus-within:bg-white focus-within:border-[#0aad0a] focus-within:shadow-[0_0_0_3px_rgba(10,173,10,0.08)]"
      >
        <svg
          class="w-4 h-4 text-gray-400 mr-2.5 shrink-0"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          placeholder="Search products, coffee, Kanga..."
          bind:value={searchQuery}
          onfocus={() => (isSearchFocused = true)}
          onblur={() => setTimeout(() => (isSearchFocused = false), 200)}
          class="w-full bg-transparent border-0 focus:outline-none text-[13.5px] font-medium focus:ring-0 text-gray-800 placeholder-gray-500 py-1"
        />
        <button
          type="submit"
          class="bg-[#0aad0a] hover:bg-[#099409] text-white text-xs font-bold px-4 py-2 rounded-full shrink-0 transition-colors focus:outline-none cursor-pointer"
        >
          Search
        </button>
      </div>

      <!-- Autocomplete Dropdown (Limit: 5) -->
      {#if isSearchFocused && appState.searchSuggestions.length > 0}
        <div
          class="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {#each appState.searchSuggestions as suggestion (suggestion.id)}
            <button
              type="button"
              onclick={() => handleSuggestionClick(suggestion)}
              class="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors focus:outline-none"
            >
              <div
                class="w-8 h-8 rounded-lg border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center bg-gray-50"
              >
                <img
                  src={resolveImageUrl(suggestion.image) ||
                    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=100"}
                  alt=""
                  class="max-w-full max-h-full object-cover mix-blend-multiply"
                />
              </div>
              <span
                class="text-[13px] font-semibold text-gray-800 line-clamp-1 truncate"
                >{suggestion.label}</span
              >
            </button>
          {/each}
        </div>
      {/if}
    </form>

    <div class="flex items-center gap-2.5 shrink-0">
      {#if appState.isLoggedIn}
        <button
          onclick={() => goto("/account")}
          class="hidden md:flex items-center gap-1.5 text-gray-800 text-[12.5px] font-bold focus:outline-none transition-colors px-3.5 py-2 hover:bg-gray-100 rounded-full"
        >
          <svg
            class="w-4.5 h-4.5 stroke-gray-800"
            fill="none"
            stroke-width="2.1"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <span>Account</span>
        </button>
      {:else}
        <button
          onclick={() => goto("/account")}
          class="hidden md:inline-flex items-center justify-center text-gray-700 hover:bg-gray-100 text-[12.5px] font-bold h-9 px-4 rounded-full transition-colors focus:outline-none cursor-pointer"
        >
          Log in
        </button>

        <button
          onclick={() => goto("/account")}
          class="hidden md:inline-flex items-center justify-center text-white text-[12.5px] font-bold h-9 px-4 rounded-full transition-colors focus:outline-none cursor-pointer"
          style="background: {ACCENT};"
          onmouseover={(e) => (e.currentTarget.style.background = "#099409")}
          onmouseout={(e) => (e.currentTarget.style.background = ACCENT)}
        >
          Sign up
        </button>
      {/if}

      <button
        onclick={() => (appState.isCartOpen = true)}
        class="bg-gray-900 hover:bg-black text-white font-bold text-[12.5px] px-4 py-2.5 rounded-full flex items-center gap-2 transition-all active:scale-95 focus:outline-none"
      >
        <svg
          class="w-4.5 h-4.5 stroke-white"
          fill="none"
          stroke-width="2.5"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          />
        </svg>
        <span>Cart</span>
        {#if appState.cartCount > 0}
          <span
            class="bg-white text-gray-900 text-[10.5px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center select-none animate-bounce-in"
          >
            {appState.cartCount}
          </span>
        {/if}
      </button>
    </div>
  </header>

  <div class="flex-1 flex min-h-screen">
    {#if !isAccountProfile}
      <SidebarNav
        selectedCategory={appState.selectedCategory}
        fulfillmentMode={appState.fulfillmentMode}
        onCategoryChange={updateCategory}
        onFulfillmentChange={updateFulfillment}
        onClaimCoupon={handleClaimCoupon}
      />
    {/if}

    <main class={mainClass}>
      {@render children?.()}
    </main>
  </div>

  {#if appState.isSidebarOpen}
    <button
      onclick={() => (appState.isSidebarOpen = false)}
      class="fixed inset-0 bg-gray-950/20 z-40 lg:hidden transition-opacity"
      aria-label="Close menu drawer"
    ></button>
  {/if}
</div>

<div
  class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-full max-w-xs sm:max-w-sm pointer-events-none px-4 sm:px-0"
  aria-live="polite"
>
  {#each appState.toasts as toast (toast.id)}
    <div
      class="pointer-events-auto bg-white text-white border-4 border-slate-800 rounded-2xl px-4 py-3.5 shadow-lg flex items-center justify-between gap-3 text-[12.5px] font-bold animate-in slide-in-from-bottom-3 duration-200"
      style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;"
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <span
          class="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
          style="background: {toast.type === 'error'
            ? '#f43f5e'
            : toast.type === 'success'
              ? '#0aad0a'
              : '#9ca3af'};"
        ></span>
        <span class="truncate text-slate-900">{toast.message}</span>
      </div>
      <button
        onclick={() =>
          (appState.toasts = appState.toasts.filter((t) => t.id !== toast.id))}
        class="text-gray-400 hover:text-white transition-colors focus:outline-none shrink-0"
        aria-label="Dismiss"
      >
        <svg
          class="w-3.5 h-3.5"
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
  {/each}
</div>

<!-- Inside routes/+layout.svelte inside the location modal structure -->
<Locationselection />

<style>
  @keyframes bounce-in {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.12);
    }
    100% {
      transform: scale(1);
    }
  }
  .animate-bounce-in {
    animation: bounce-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
</style>
