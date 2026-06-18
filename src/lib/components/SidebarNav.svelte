<!-- lib/components/SidebarNav.svelte -->
<script>
  import { appState } from '$lib/state.svelte.js';
  import { goto } from '$app/navigation';

  let { 
    selectedCategory = "All", 
    fulfillmentMode = "pickup",
    onCategoryChange,
    onFulfillmentChange,
    onClaimCoupon
  } = $props();

  let showAllDepartments = $state(false);

  // Instacart Sidebar Menu Map (Aligned to Postcom categories)
  const primaryMenu = [
    { id: "All", label: "Home", type: "home", icon: "home" },
    { id: "Brands", label: "Brands", type: "route", icon: "brands" },
    { id: "Agro Products", label: "Grocery (Agro)", type: "category", icon: "grocery" },
    { id: "Food & Beverages", label: "Beverages & Staples", type: "category", icon: "restaurants" },
    { id: "Arts & Crafts", label: "Arts & Retail", type: "category", icon: "retail" },
    // { id: "Offers", label: "Offers", type: "route", icon: "offers" },
  ];

  const secondaryMenu = [
    { id: "Health & Beauty", label: "Health & Beauty", type: "category", icon: "convenience" },
    { id: "Lockers", label: "Smart Pickups", type: "route", icon: "convenience" }
  ];

  // Handles navigation and automatically closes drawer on mobile
  function handleNavigate(item) {
    appState.isSidebarOpen = false; // Smooth slide close on select
    
    if (item.type === "home") {
      onCategoryChange?.("All");
      goto("/");
    } else if (item.type === "category") {
      onCategoryChange?.(item.id);
      goto("/products");
    } else if (item.type === "route") {
      if (item.id === "Brands") {
         goto("/brands");
      } else {
        appState.isLocationModalOpen = true;
      }
    }
  }
</script>

<!-- Responsive layout: Fixed Drawer on mobile, sticky inline viewport panel on lg -->
<aside 
  class="fixed inset-y-0 left-0 z-50 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] lg:overflow-y-auto lg:z-30 lg:flex w-60 bg-white border-r border-slate-100/50 flex-col justify-between p-4 flex-shrink-0 select-none font-sans transition-transform duration-300 ease-in-out lg:transform-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
    {appState.isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} "
>
  
  <div class="space-y-4">
    <!-- Header Row -->
    <div class="flex items-center justify-between">
      <h3 class="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase select-none">Categories</h3>
      <button 
        onclick={() => appState.isSidebarOpen = false}
        class="lg:hidden text-slate-400 hover:text-slate-600 focus:outline-none p-1"
        aria-label="Close sidebar"
      >
        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Main Instacart Category Block -->
    <nav class="space-y-1" aria-label="Sidebar navigation">
      {#each primaryMenu as item}
        {@const isSelected = selectedCategory === item.id || (item.id === "All" && selectedCategory === "All" && appState.searchQuery === "")}
        
        <button 
          onclick={() => handleNavigate(item)}
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all text-left focus:outline-none
            {isSelected 
              ? 'bg-black text-white shadow-xs' 
              : 'text-slate-800 hover:bg-[#F1EFE9]'}"
        >
          <!-- SVG Icon matching -->
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.1" viewBox="0 0 24 24">
            {#if item.icon === "home"}
              <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            {:else if item.icon === "grocery"}
              <!-- Premium Banana crescent shape outline -->
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 3.5a16.5 16.5 0 0 1-5.1 11c-3.1 3.1-7.1 4-9 2s-1.1-5.9 2-9a16.5 16.5 0 0 1 11-5m1.1 1c1 1 1.7 2.7 1.7 4.2a6.4 6.4 0 0 1-1.7 3.8C16.5 13.5 13 14.5 11 14.5" />
            {:else if item.icon === "restaurants"}
              <!-- Cloche/Dish icon outline -->
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.25v-1.5m-9 12h18m-18 0a1.5 1.5 0 0 0 1.5 1.5h15a1.5 1.5 0 0 0 1.5-1.5m-18 0c0-4.5 3.582-8 8-8s8 3.5 8 8" />
            {:else if item.icon === "retail"}
              <!-- Shopping Bag outline -->
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            {:else if item.icon === "brands"}
              <!-- Price tag outline -->
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39 1.593 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            {/if}
          </svg>
          <span class="tracking-tight">{item.label}</span>
        </button>
      {/each}

      <!-- Dynamic Expandable items under the "Show More" Trigger -->
      {#if showAllDepartments}
        {#each secondaryMenu as item}
          <button 
            onclick={() => handleNavigate(item)}
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all text-left text-slate-800 hover:bg-[#F1EFE9] focus:outline-none"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.1" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 6v6l4 2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="tracking-tight">{item.label}</span>
          </button>
        {/each}
      {/if}

      <!-- Expand Toggle Link -->
      <button 
        onclick={() => showAllDepartments = !showAllDepartments}
        class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-semibold text-slate-700 hover:bg-[#F1EFE9] focus:outline-none text-left"
      >
        <span>{showAllDepartments ? 'Show less' : 'Show more'}</span>
        <svg class="w-4 h-4 text-slate-500 transform transition-transform {showAllDepartments ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
    </nav>

    <!-- Separator Rule -->
    <div class="border-t border-slate-200/60 my-2"></div>

    <!-- YOU SECTION -->
    <div class="space-y-1">
      <h3 class="px-3 text-[14px] font-black text-slate-900 tracking-tight select-none">You</h3>
      
      <!-- Flyers/My Orders Link -->
      <!-- <button 
        onclick={() => { appState.isSidebarOpen = false; goto('/cart'); }}
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-slate-800 hover:bg-[#F1EFE9] focus:outline-none text-left"
      >
        <svg class="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" stroke-width="2.1" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <span>Flyers</span>
      </button> -->

      <!-- Account Profile Link -->
      <button 
        onclick={() => { appState.isSidebarOpen = false; goto('/account'); }}
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-slate-800 hover:bg-[#F1EFE9] focus:outline-none text-left"
      >
        <svg class="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" stroke-width="2.1" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        <span>Account</span>
      </button>
    </div>
  </div>

  <!-- Unified cooperative disclaimer badge -->
  <div class="bg-[#F1EFE9]/40 p-3.5 rounded-xl border border-slate-200/50 mt-auto select-none">
    <p class="text-[9px] font-bold text-slate-400 tracking-wider uppercase">ePosta Network</p>
    <p class="text-[11px] text-slate-600 font-bold mt-1 leading-snug">Flat-rate national postage logistics active.</p>
  </div>
</aside>