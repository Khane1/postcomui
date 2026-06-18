<script>
  let { onClaimCoupon } = $props();

  let isClipped = $state(false);

  const artisan = {
    name: "Jalia Namubiru",
    location: "Luweero District",
    craft: "Handwoven Sisal Baskets",
    bio: "Jalia leads a cooperative of 12 mothers weaving heritage sisal baskets using natural organic dyes.",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&auto=format&fit=crop&q=80",
    coupon: "JALIA15"
  };

  function handleClip() {
    if (isClipped) return;
    isClipped = true;
    onClaimCoupon?.(artisan.coupon);
  }
</script>

<div class="bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-200/60 p-3.5 rounded-xl flex flex-col justify-between min-h-[160px] relative overflow-hidden shadow-xs hover:shadow-md transition-all hover:scale-[1.01]">
  <div class="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-amber-200/30 pointer-events-none"></div>
  
  <div>
    <div class="flex items-center gap-2.5">
      <div class="relative">
        <img 
          src={artisan.avatar} 
          alt={artisan.name} 
          class="w-10 h-10 rounded-full object-cover border-2 border-amber-300 shadow-xs"
        />
        <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
      </div>
      <div>
        <span class="text-[8px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
          Artisan Spotlight
        </span>
        <h5 class="text-xs font-bold text-slate-900 mt-0.5 leading-none">{artisan.name}</h5>
        <p class="text-[9px] text-slate-500 font-medium">{artisan.location}</p>
      </div>
    </div>

    <p class="text-[10px] text-slate-600 mt-2.5 leading-relaxed italic">
      "{artisan.bio}"
    </p>
  </div>

  <button 
    onclick={handleClip}
    class="w-full mt-3.5 text-[10px] font-extrabold py-1.5 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1
      {isClipped 
        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs hover:shadow-md'}"
  >
    {#if isClipped}
      <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span>15% Off Clipped</span>
    {:else}
      <span>Support Jalia — Use Code {artisan.coupon}</span>
    {/if}
  </button>
</div>
