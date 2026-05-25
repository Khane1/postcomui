<!-- lib/components/FlashStockDealAd.svelte -->
<script>
  import { browser } from '$app/environment';

  let { onClaimCoupon } = $props();

  let remainingStock = $state(9);
  let totalStock = 15;
  let secondsLeft = $state(840); // 14 minutes
  let isClaimed = $state(false);

  // Derive simple timer format
  let timeString = $derived(
    `${Math.floor(secondsLeft / 60)}m ${String(secondsLeft % 60).padStart(2, '0')}s`
  );

  function handleClaim() {
    if (isClaimed) return;
    isClaimed = true;
    remainingStock--;
    onClaimCoupon?.("HONEY30");
  }

  $effect(() => {
    if (!browser) return;

    // Slowly decrease countdown timer
    const timer = setInterval(() => {
      if (secondsLeft > 0) secondsLeft--;
    }, 1000);

    // Occasional simulated stock purchase
    const stockTimer = setInterval(() => {
      if (remainingStock > 2 && Math.random() > 0.7) {
        remainingStock--;
      }
    }, 18000);

    return () => {
      clearInterval(timer);
      clearInterval(stockTimer);
    };
  });
</script>

<div class="bg-red-50/70 border border-red-200/50 p-3.5 rounded-xl flex flex-col justify-between min-h-[155px] shadow-xs">
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center">
      <span class="text-[8px] font-black uppercase tracking-wider text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
        Flash Overstock
      </span>
      <span class="text-[9px] font-bold text-slate-500 font-mono tracking-tight flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
        {timeString} left
      </span>
    </div>

    <!-- Product Info -->
    <div class="mt-2">
      <h5 class="text-xs font-black text-slate-900 leading-snug">Kitgum Wildflower Honey (1KG)</h5>
      <div class="flex items-baseline gap-1.5 mt-0.5">
        <span class="text-xs font-bold text-red-600">UGX 16,000</span>
        <span class="text-[9px] text-slate-400 line-through">UGX 24,000</span>
      </div>
    </div>

    <!-- Depleting Inventory Bar -->
    <div class="mt-3.5 space-y-1">
      <div class="flex justify-between text-[8px] font-bold text-slate-500">
        <span>Stock Status</span>
        <span>{remainingStock} of {totalStock} jars left</span>
      </div>
      <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div 
          class="bg-red-500 h-full transition-all duration-1000 rounded-full"
          style="width: {(remainingStock / totalStock) * 100}%"
        ></div>
      </div>
    </div>
  </div>

  <!-- Action Button -->
  <button 
    onclick={handleClaim}
    disabled={remainingStock <= 0}
    class="w-full mt-3.5 text-[10px] font-extrabold py-1.5 rounded-lg transition-all active:scale-98
      {isClaimed 
        ? 'bg-emerald-600 text-white' 
        : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'}"
  >
    {#if remainingStock <= 0}
      Sold Out
    {:else if isClaimed}
      ✓ Coupon Claimed — HONEY30
    {:else}
      Lock in 30% Off
    {/if}
  </button>
</div>