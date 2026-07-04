<script>
  import { browser } from '$app/environment';

  let { onClaimCoupon } = $props();

  let remainingStock = $state(9);
  let totalStock = 15;
  let secondsLeft = $state(840);
  let isClaimed = $state(false);
  let pulseTrigger = $state(false);

  let timeString = $derived(
    `${Math.floor(secondsLeft / 60)}m ${String(secondsLeft % 60).padStart(2, '0')}s`
  );

  function handleClaim() {
    if (isClaimed) return;
    isClaimed = true;
    remainingStock--;
    pulseTrigger = true;
    setTimeout(() => pulseTrigger = false, 500);
    onClaimCoupon?.("HONEY30");
  }

  $effect(() => {
    if (!browser) return;

    const timer = setInterval(() => {
      if (secondsLeft > 0) secondsLeft--;
    }, 1000);

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

<div class="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 p-3.5 rounded-xl flex flex-col justify-between min-h-[155px] shadow-xs hover:shadow-md transition-all hover:scale-[1.01]">
  <div>
    <div class="flex justify-between items-center">
      <span class="text-[8px] font-black uppercase tracking-wider text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
        Flash Overstock
      </span>
      <span class="text-[9px] font-bold text-slate-500 font-mono tracking-tight flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
        {timeString} left
      </span>
    </div>

    <div class="mt-2">
      <h5 class="text-xs font-black text-slate-900 leading-snug">Kitgum Wildflower Honey (1KG)</h5>
      <div class="flex items-baseline gap-1.5 mt-0.5">
        <span class="text-xs font-bold text-green-600">UGX 16,000</span>
        <span class="text-[9px] text-slate-400 line-through">UGX 24,000</span>
      </div>
    </div>

    <div class="mt-3.5 space-y-1">
      <div class="flex justify-between text-[8px] font-bold text-slate-500">
        <span>Stock Status</span>
        <span class={remainingStock <= 4 ? 'text-red-600 font-black' : ''}>{remainingStock} of {totalStock} jars left</span>
      </div>
      <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div 
          class="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-1000 rounded-full"
          style="width: {(remainingStock / totalStock) * 100}%"
        ></div>
      </div>
    </div>
  </div>

  <button 
    onclick={handleClaim}
    disabled={remainingStock <= 0}
    class="w-full mt-3.5 text-[10px] font-extrabold py-1.5 rounded-lg transition-all active:scale-95
      {isClaimed 
        ? 'bg-emerald-600 text-white' 
        : remainingStock <= 0
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700 text-white shadow-xs hover:shadow-md'}"
  >
    {#if remainingStock <= 0}
      Sold Out
    {:else if isClaimed}
      <span class="flex items-center justify-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Coupon Claimed — HONEY30
      </span>
    {:else}
      Lock in 30% Off
    {/if}
  </button>
</div>
