<!-- lib/components/CategoryShowcase.svelte -->
<script>
  import { appState } from '$lib/state.svelte.js';

  // Categories mapped to realistic organic images representing local Ugandan goods
  const categoryCards = [
    {
      id: "Agro Products",
      title: "Agro Products",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "Food & Beverages",
      title: "Food & Drinks",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "Arts & Crafts",
      title: "Arts & Crafts",
      image: "https://images.unsplash.com/photo-1504198266287-1659872e6590?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "Health & Beauty",
      title: "Health & Beauty",
      image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=400"
    }
  ];

  function handleCategoryClick(categoryId) {
    appState.selectedCategory = categoryId;
    
    // Smooth scroll down to the product feed anchor instantly
    const anchor = document.getElementById("catalog-grid-anchor");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
</script>

<!-- Outer Container matching the reference image's card box -->
<div class="bg-white rounded-3xl p-6 space-y-6 select-none">
  
  <!-- Jumia × Instacart Inspired Header -->
  <div class="flex items-start gap-3">
    <!-- Vector Lightbulb Icon -->
     
    <div class="space-y-0.5">
      <h3 class="text-sm sm:text-base text-slate-500 font-bold text-slate-300 uppercase tracking-wider">Categories you might like</h3>
      <p class="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Find the latest best deals by category</p>
    </div>
  </div>
  
  <!-- Category Cards Grid (2 columns on mobile, 4 columns on desktop) -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    {#each categoryCards as card}
      <button 
        onclick={() => handleCategoryClick(card.id)}
        class="relative aspect-[16/5] w-full rounded-2xl overflow-hidden border-2 border-transparent hover:border-red-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md focus:outline-none group cursor-pointer"
      >
        <!-- Background Image -->
        <img 
          src={card.image} 
          alt="" 
          loading="lazy"
          class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        <!-- Dark Overlay for contrast -->
        <div class="absolute inset-0 bg-slate-950/45 group-hover:bg-slate-950/35 transition-colors"></div>
        
        <!-- Centered Typography -->
        <div class="absolute inset-0 flex items-center justify-center p-3 text-center">
          <span class="text-white text-xs sm:text-sm font-black tracking-wide uppercase drop-shadow-sm select-none">
            {card.title}
          </span>
        </div>
      </button>
    {/each}
  </div>

</div>

<style>
  /* Prevents image dragging */
  img {
    -webkit-user-drag: none;
  }
</style>