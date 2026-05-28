<!-- lib/components/SubcategoryScroller.svelte -->
<script>
  import { appState } from '$lib/state.svelte.js';

  // 1:1 translation of the quick-scroller into verified Ugandan catalog items
  const subcategoryBubbles = [
    { 
      label: "Coffee", 
      query: "Coffee", 
      category: "Agro Products",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Honey", 
      query: "Honey", 
      category: "Food & Beverages",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Flours", 
      query: "Flour", 
      category: "Agro Products",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Shea Butter", 
      query: "Shea", 
      category: "Health & Beauty",
      image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Baskets", 
      query: "Basket", 
      category: "Arts & Crafts",
      image: "https://images.unsplash.com/photo-1504198266287-1659872e6590?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Vanilla", 
      query: "Vanilla", 
      category: "Agro Products",
      image: "https://images.unsplash.com/photo-1595122245594-a55086ee50a6?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Dried Fish", 
      query: "Mukene", 
      category: "Food & Beverages",
      image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&q=80&w=150" 
    },
    { 
      label: "Horn Cups", 
      query: "Horn", 
      category: "Arts & Crafts",
      image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=150" 
    }
  ];

  function handleBubbleClick(query, category) {
    appState.searchQuery = query;
    if (category) {
      appState.selectedCategory = category;
    }
    
    // Smooth scroll down to the product feed anchor instantly
    const anchor = document.getElementById("catalog-grid-anchor");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
</script>

<section class="space-y-4 select-none">
  <!-- Dynamic Title Header -->
  <div class="flex justify-between items-baseline border-b border-slate-200 pb-2">
    <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest">
      {#if appState.selectedCategory === "All"}
        Shop Popular Staples
      {:else}
        Popular in {appState.selectedCategory}
      {/if}
    </h3>
    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Swipe to Browse</span>
  </div>
  
  <!-- Swipeable Horizontal Row -->
  <div class="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x" style="-webkit-overflow-scrolling: touch;">
    {#each subcategoryBubbles as bubble}
      <!-- Render corresponding category or let it fall back safely -->
      {#if appState.selectedCategory === "All" || bubble.category === appState.selectedCategory}
        <button 
          onclick={() => handleBubbleClick(bubble.query, bubble.category)}
          class="snap-start flex-shrink-0 flex flex-col items-center group focus:outline-none"
        >
          <!-- Soft-blue rounded square container -->
          <div class="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50/70 hover:bg-red-50 border border-blue-100/40 rounded-2xl flex items-center justify-center p-3.5 transition-all duration-300 transform group-hover:scale-105 group-hover:border-red-200 group-hover:shadow-sm">
            <img 
              src={bubble.image} 
              alt={bubble.label}
              class="w-full h-full object-contain rounded-xl mix-blend-multiply transition-transform duration-300"
            />
          </div>
          
          <!-- Label centered directly below the box -->
          <span class="text-[10px] sm:text-[11px] font-extrabold text-slate-500 text-center mt-2 group-hover:text-red-600 transition-colors uppercase tracking-wider select-none truncate max-w-[80px] sm:max-w-[96px]">
            {bubble.label}
          </span>
        </button>
      {/if}
    {/each}
  </div>
</section>

<style>
  /* Prevent image dragging on touch targets */
  img {
    -webkit-user-drag: none;
  }
</style>