<script>
  import "./layout.css";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { appState } from "$lib/state.svelte.js";
  import SidebarNav from "$lib/components/SidebarNav.svelte";
  import ProductDetailModal from "$lib/components/ProductDetailModal.svelte";
    import CartDrawer from "$lib/components/CartDrawer.svelte";

  let { children } = $props();

  const branches = [
    "Kampala GPO",
    "Entebbe Post Office",
    "Jinja Post Office",
    "Mbarara Post Office",
    "Gulu Post Office",
    "Mbale Post Office",
  ];

  function updateFulfillment(mode) {
    appState.fulfillmentMode = mode;
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    goto("/products");
  }

  function updateCategory(cat) {
    appState.selectedCategory = cat;
    goto("/products");
  }

  function handleClaimCoupon(coupon) {
    appState.addToast(`Coupon "${coupon}" successfully applied!`);
  }
</script>

<ProductDetailModal />
<CartDrawer />
<div class="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
  <!-- SINGLE ROW MODERN MAIN HEADER -->
  <header
    class="bg-white border-b border-slate-200/60 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 select-none sticky top-0 z-50"
  >
    <!-- Left Logo & Address Dropdown Segment -->
    <div class="flex items-center gap-5 shrink-0">
      <button
        onclick={() => (appState.isSidebarOpen = !appState.isSidebarOpen)}
        class="lg:hidden text-slate-800 hover:text-slate-900 focus:outline-none p-1.5 hover:bg-slate-200/50 rounded-lg transition-all"
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

      <!-- Brand Logo Custom Leaf Accent -->
      <a
        href="/"
        class="flex items-center gap-1 group focus:outline-none text-left"
      >
        <span
          class="text-lg font-black text-[#003d29] tracking-tight flex items-center gap-1.5"
        >
          <img
            src="https://postcom.ug/assets/postcom-logo-white-B0oZfjq1.jpg"
            class="size-10"
          />
          <span>postcom</span>
        </span>
      </a>

      <!-- Address Dropdown -->
      <button
        onclick={() => (appState.isLocationModalOpen = true)}
        class="hidden sm:flex items-center gap-1.5 bg-[#F1EFE9] border border-transparent hover:border-slate-300 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 transition-all focus:outline-none cursor-pointer"
      >
        <span class="text-[13px] leading-none">📍</span>
        <span class="truncate max-w-[140px]">{appState.activeBranch}</span>
        <span class="text-slate-400 text-[10px]">▼</span>
      </button>
    </div>

    <!-- Centered Rounded Search Bar -->
    <form onsubmit={handleSearchSubmit} class="flex-1 max-w-lg hidden md:block">
      <div
        class="flex items-center bg-[#F1EFE9]/60 border border-transparent rounded-full px-4 py-2 transition-all focus-within:bg-white focus-within:border-[#003d29] focus-within:shadow-[0_0_0_3px_rgba(0,61,41,0.06)]"
      >
        <svg
          class="w-4 h-4 text-slate-400 mr-2.5 shrink-0"
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
          bind:value={appState.searchQuery}
          class="w-full bg-transparent border-0 focus:outline-none focus:ring-0 focus:border-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>
    </form>

    <!-- Right Side Basket & Account Controls -->
    <div class="flex items-center gap-4 shrink-0">
      <!-- Account Link -->
      <button
        onclick={() => goto("/cart")}
        class="hidden md:flex items-center gap-1.5 text-slate-800 hover:text-emerald-700 text-xs font-extrabold focus:outline-none transition-colors"
      >
        <svg
          class="w-4.5 h-4.5 stroke-slate-800"
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
        <span>Profile</span>
      </button>

      <!-- Instacart Signature Green Cart Pill -->
      <button
        onclick={() => (appState.isCartOpen = true)}
        class="bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs px-4 py-2 rounded-full flex items-center gap-2 shadow-xs transition-all active:scale-95 focus:outline-none"
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
            class="bg-white text-red-400 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center select-none animate-bounce-in"
          >
            {appState.cartCount}
          </span>
        {/if}
      </button>
    </div>
  </header>

  <!-- INNER CONTENT PANEL (Standard, global scroll bounds) -->
  <div class="flex-1 flex min-h-screen">
    <!-- Sticky Sidebar Nav -->
    <SidebarNav
      selectedCategory={appState.selectedCategory}
      fulfillmentMode={appState.fulfillmentMode}
      onCategoryChange={updateCategory}
      onFulfillmentChange={updateFulfillment}
      onClaimCoupon={handleClaimCoupon}
    />

    <!-- Main Content Stream (Flows naturally into page body scroll) -->
    <main
      class="flex-1 min-w-0 p-4 sm:p-6 bg-white rounded-tl-3xl border-t border-l border-slate-100/5 2xl:px-20"
    >
      {@render children?.()}
    </main>
  </div>

  <!-- Mobile Drawer Backdrop Overlay -->
  {#if appState.isSidebarOpen}
    <button
      onclick={() => (appState.isSidebarOpen = false)}
      class="fixed inset-0 bg-slate-950/20 z-40 lg:hidden transition-opacity"
      aria-label="Close menu drawer"
    ></button>
  {/if}
</div>

<!-- TOAST ALERT SYSTEM -->
<div
  class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-full max-w-xs sm:max-w-sm pointer-events-none px-4 sm:px-0"
  aria-live="polite"
>
  {#each appState.toasts as toast (toast.id)}
    <div
      class="pointer-events-auto bg-slate-900 text-white rounded-xl px-4 py-3 shadow-lg flex items-center justify-between gap-3 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200"
    >
      <div class="flex items-center gap-2 min-w-0">
        <span
          class="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse"
        ></span>
        <span class="truncate">{toast.message}</span>
      </div>
      <button
        onclick={() =>
          (appState.toasts = appState.toasts.filter((t) => t.id !== toast.id))}
        class="text-slate-400 hover:text-white transition-colors focus:outline-none"
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

<!-- BRANCH PICKUP MODAL SELECTOR -->
{#if appState.isLocationModalOpen}
  <div
    class="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-xs flex items-center justify-center p-4"
  >
    <div
      class="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150"
    >
      <h3
        class="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5"
      >
        📍 Pick a Pickup Post Office
      </h3>
      <p class="text-xs text-slate-500 mt-1 leading-normal font-medium">
        Choosing your local branch ensures checkout orders route safely and
        automatically loads subsidized networks.
      </p>

      <div class="mt-4 space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {#each branches as branch}
          <button
            onclick={() => {
              appState.activeBranch = branch;
              appState.isLocationModalOpen = false;
            }}
            class="w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex justify-between items-center transition-all focus:outline-none
              {appState.activeBranch === branch
              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:scale-[1.01]'}"
          >
            <span>{branch}</span>
            {#if appState.activeBranch === branch}
              <span class="text-emerald-600 text-[10px] font-black uppercase"
                >Selected</span
              >
            {/if}
          </button>
        {/each}
      </div>

      <button
        onclick={() => (appState.isLocationModalOpen = false)}
        class="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all focus:outline-none"
      >
        Save Branch Choice
      </button>
    </div>
  </div>
{/if}

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
