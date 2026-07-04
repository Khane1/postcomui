<!-- lib/components/SponsoredCompanies.svelte -->
<script>
  import { appState } from '$lib/state.svelte.js';

  // 8 Premium Ugandan Sponsoring Cooperatives mapped with direct imagery
  const companies = [
    {
      name: "Sipi Falls Coffee Growers",
      location: "Kapchorwa District",
      category: "Agro Products",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80"
    },
    {
      name: "Busoga Bee Keepers",
      location: "Kamuli, Busoga",
      category: "Food & Beverages",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80"
    },
    {
      name: "Kibinge Coffee Union",
      location: "Bukomansimbi",
      category: "Food & Beverages",
      image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80"
    },
    {
      name: "Luweero Fruit Union",
      location: "Luweero District",
      category: "Agro Products",
      image: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&q=80"
    },
    {
      name: "Northern Shea Organics",
      location: "Lira, Northern Nile",
      category: "Health & Beauty",
      image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=80"
    },
    {
      name: "Kampala Artisans Guild",
      location: "Masaka District",
      category: "Arts & Crafts",
      image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&q=80"
    },
    {
      name: "Lake Victoria Fisheries",
      location: "Buikwe District",
      category: "Food & Beverages",
      image: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=400&q=80"
    },
    {
      name: "Rwenzori Vanilla Union",
      location: "Bundibugyo",
      category: "Agro Products",
      image: "https://images.unsplash.com/photo-1595122245594-a55086ee50a6?w=400&q=80"
    }
  ];

  function handleCompanyClick(category) {
    appState.selectedCategory = category;
    const anchor = document.getElementById("catalog-grid-anchor");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
</script>

<section class="space-y-4 select-none font-sans">
  <!-- Section Title Header -->
  <div class="flex justify-between items-baseline border-b border-slate-200/60 pb-2">
    <div>
      <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">Featured Brands & Cooperatives</h3>
      <p class="text-[10px] text-slate-500 font-medium">Sourced directly from verified regional collectives</p>
    </div>
  </div>

  <!-- 8 Card Grid (Responsive layout) -->
  <div class="grid grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8  gap-4">
    {#each companies as company}
    <div>

        <button 
          onclick={() => handleCompanyClick(company.category)}
          class="relative flex flex-col justify-between  w-full rounded-lg overflow-hidden p-4 group transition-all duration-300 border border-slate-200/20 focus:outline-none cursor-pointer hover:shadow-md"
        >
          <!-- Background Product Image -->
          
          <!-- Instacart Style Bottom Corner Chevron -->
          <div class="absolute bottom-4 right-4 z-10 w-6 h-6 bg-white/95 rounded-full  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
            <svg class="w-3.5 h-3.5 text-slate-800" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </button>
         <div class="z-10 text-left">
          <span class="text-[8px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">Sponsored co-op</span>
          <h4 class="text-xs sm:text-sm font-black text-white leading-tight tracking-tight">
            {company.name}
          </h4>
         
        </div>
    </div>
      
    {/each}
  </div>
</section>

<style>
  img {
    -webkit-user-drag: none;
  }
</style>