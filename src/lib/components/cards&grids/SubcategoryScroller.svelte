<!-- lib/components/SubcategoryScroller.svelte -->
<script>
  import { appState } from '$lib/state.svelte.js';

  const ACCENT = '#0aad0a';

  // Quick-scroller staples mapped into Instacart filter pill layouts
  const subcategoryBubbles = [
    { 
      label: "Sipi Coffee", 
      query: "Coffee", 
      category: "Agro Products",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Forest Honey", 
      query: "Honey", 
      category: "Food & Beverages",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Millet Flour", 
      query: "Flour", 
      category: "Agro Products",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Nile Shea", 
      query: "Shea", 
      category: "Health & Beauty",
      image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Sisal Baskets", 
      query: "Basket", 
      category: "Arts & Crafts",
      image: "https://images.unsplash.com/photo-1504198266287-1659872e6590?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Bourbon Vanilla", 
      query: "Vanilla", 
      category: "Agro Products",
      image: "https://images.unsplash.com/photo-1595122245594-a55086ee50a6?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Dried Mukene", 
      query: "Mukene", 
      category: "Food & Beverages",
      image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Ankole Horn Cups", 
      query: "Horn", 
      category: "Arts & Crafts",
      image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=150" 
    }
  ];

  function handleBubbleClick(query, category) {
    // Toggle filter off if clicked again, otherwise apply it
    if (appState.searchQuery === query) {
      appState.searchQuery = "";
    } else {
      appState.searchQuery = query;
      if (category) {
        appState.selectedCategory = category;
      }
    }
    
    // Smooth scroll down to the product feed anchor instantly
    const anchor = document.getElementById("catalog-grid-anchor");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet" />
</svelte:head>

<section class="space-y-3.5 select-none" style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;">
  <!-- Dynamic Title Header -->
  <!-- Constraining wrapper to prevent parent flexbox blowout on small screens -->
  <div class="w-full overflow-hidden min-w-0">
    <!-- Responsive Track: Swipeable on mobile, multi-row wrap on desktop -->
    <div 
      class="flex flex-nowrap gap-2 sm:gap-2.5 overflow-x-auto pb-3 w-full min-w-0 max-w-full sm:flex-wrap sm:overflow-visible sm:pb-0 scrollbar-none snap-x" 
    style="-webkit-overflow-scrolling: touch;"
    >
      {#each subcategoryBubbles as bubble}
        {#if appState.selectedCategory === "All" || bubble.category === appState.selectedCategory}
          {@const isActive = appState.searchQuery === bubble.query}
          <button 
            onclick={() => handleBubbleClick(bubble.query, bubble.category)}
            class="snap-start shrink-0 flex items-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-full transition-all duration-150 border focus:outline-none cursor-pointer group
              {isActive 
                ? 'text-white border-transparent shadow-xs' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}"
            style="{isActive ? `background: ${ACCENT};` : `border-color: #e5e7eb;`}"
            onmouseover={(e) => { if (!isActive) e.currentTarget.style.borderColor = ACCENT; }}
            onmouseout={(e) => { if (!isActive) e.currentTarget.style.borderColor = '#e5e7eb'; }}
          >
            <!-- Miniature Circular Crop Thumbnail -->
            <div class="w-5 h-5 rounded-full overflow-hidden shrink-0 border bg-gray-50 {isActive ? 'border-white/20' : 'border-gray-100'}">
              <img 
                src={bubble.image} 
                alt=""
                class="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            
            <!-- Pill Text Label -->
            <span class="text-[12.5px] font-bold tracking-tight select-none {isActive ? 'text-white' : 'text-gray-700'}">
              {bubble.label}
            </span>
          </button>
        {/if}
      {/each}
    </div>
  </div>
</section>

<style>
  /* Disable swipe imagery dragging */
  img {
    -webkit-user-drag: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>