<script>
  import { appState } from '$lib/state.svelte.js';

  // Categories mapped to soft pastel backings matching Instacart's department layouts
  const categoryCards = [
    {
      id: "Agro Products",
      title: "Agro & Produce",
      sub: "Fresh from regional co-ops",
      bg: "bg-[#EAF7F0]", // Soft pastel green
      textColor: "text-[#003d29]", // Instacart deep green
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "Food & Beverages",
      title: "Beverages & Staples",
      sub: "Local coffees, honey & grains",
      bg: "bg-[#FFF6EE]", // Soft pastel peach/orange
      textColor: "text-[#4a1500]",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "Arts & Crafts",
      title: "Arts & Crafts",
      sub: "UNESCO certified handmade",
      bg: "bg-[#FAF5FF]", // Soft pastel lavender
      textColor: "text-[#2e104a]",
      image: "https://images.unsplash.com/photo-1504198266287-1659872e6590?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "Health & Beauty",
      title: "Health & Beauty",
      sub: "Raw Shea & organic wellness",
      bg: "bg-[#FFF5F5]", // Soft pastel blush pink
      textColor: "text-[#4a0000]",
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

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet" />
</svelte:head>

<div class="bg-white rounded-2xl select-none" style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;">
  <div class="mb-5 flex items-baseline justify-between">
    <div>
      <h3 class="text-[19px] font-extrabold text-gray-900 tracking-tight">Shop by department</h3>
      <p class="text-[13px] text-gray-500 font-medium mt-0.5">Explore curated, cooperative-verified categories</p>
    </div>
  </div>

  <div class="flex sm:grid sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 scrollbar-none snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
    {#each categoryCards as card}
      <button 
        onclick={() => handleCategoryClick(card.id)}
        class="relative flex flex-col justify-between {card.bg} h-36 sm:h-40 w-[150px] sm:w-full shrink-0 snap-start rounded-2xl overflow-hidden p-4 group transition-all duration-300 transform hover:shadow-md hover:-translate-y-0.5 border border-gray-100 focus:outline-none cursor-pointer"
      >
        <div class="z-10 text-left max-w-[110px] sm:max-w-[140px]">
          <span class="{card.textColor} text-[13px] sm:text-[17px] font-extrabold tracking-tight block leading-tight">
            {card.title}
          </span>
          <span class="text-[10px] sm:text-[11px] text-gray-500/80 font-semibold mt-1 block leading-tight line-clamp-2">
            {card.sub}
          </span>
        </div>

        <div class="absolute bottom-[-8px] right-[-8px] w-20 h-20 sm:bottom-[-10px] sm:right-[-10px] sm:w-28 sm:h-28 z-0">
          <img 
            src={card.image} 
            alt="" 
            loading="lazy"
            class="w-full h-full object-cover rounded-tl-2xl mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div class="absolute top-4 right-4 z-10 w-6 h-6 bg-white/80 rounded-full hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
          <svg class="w-3.5 h-3.5 {card.textColor}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  img {
    -webkit-user-drag: none;
  }
</style>