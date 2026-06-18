<script>
  let { onClaimCoupon } = $props();

  let activeTab = $state('how');
  let isClaimed = $state(false);

  function handleClaim() {
    isClaimed = true;
    onClaimCoupon?.("FREEBOX");
  }
</script>

<div class="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 p-3.5 rounded-xl flex flex-col justify-between min-h-[165px] relative overflow-hidden shadow-xs hover:shadow-md transition-all hover:scale-[1.01]">
  <div class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/5 pointer-events-none"></div>
  <div class="absolute -left-4 -top-4 w-16 h-16 rounded-full bg-emerald-500/5 pointer-events-none"></div>
  
  <div>
    <div class="flex justify-between items-center border-b border-slate-800 pb-1.5">
      <span class="text-[8px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded">
        Smart Pickups
      </span>
      <div class="flex gap-2">
        <button 
          onclick={() => activeTab = 'how'}
          class="text-[9px] font-bold transition-colors {activeTab === 'how' ? 'text-white underline decoration-emerald-400' : 'text-slate-500 hover:text-slate-300'}"
        >
          How It Works
        </button>
        <button 
          onclick={() => activeTab = 'benefit'}
          class="text-[9px] font-bold transition-colors {activeTab === 'benefit' ? 'text-white underline decoration-emerald-400' : 'text-slate-500 hover:text-slate-300'}"
        >
          Benefits
        </button>
      </div>
    </div>

    <div class="mt-2.5 transition-all duration-200">
      {#if activeTab === 'how'}
        <h5 class="text-xs font-bold leading-tight">Pick up on your schedule</h5>
        <p class="text-[9px] text-slate-400 mt-1 leading-normal">
          We ship to any secure Posta smart locker nationwide. You receive an SMS PIN to unlock your package 24/7.
        </p>
      {:else}
        <h5 class="text-xs font-bold leading-tight">No waiting for couriers</h5>
        <ul class="text-[9px] text-slate-400 mt-1 space-y-0.5 list-disc pl-3 leading-normal">
          <li>100% contactless collection</li>
          <li>Protected from sun & weather</li>
          <li>Kept secure for up to 5 days</li>
        </ul>
      {/if}
    </div>
  </div>

  <button 
    onclick={handleClaim}
    class="w-full mt-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-extrabold py-1.5 rounded-lg transition-all active:scale-95 shadow-xs hover:shadow-md"
  >
    {#if isClaimed}
      <span class="flex items-center justify-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Code claimed: FREEBOX
      </span>
    {:else}
      Try Free Lockers — Code FREEBOX
    {/if}
  </button>
</div>
