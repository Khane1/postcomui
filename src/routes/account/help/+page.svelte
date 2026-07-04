<!-- routes/account/help/+page.svelte -->
<script>
  let activeFaq = $state(null);

  const faqs = [
    {
      q: "How does Post Office pickup work?",
      a: "Selecting 'Post Office Pickup' routes your package directly to your chosen GPO branch with no postage fees. You will receive an SMS containing an arrival collection code as soon as your items are secured on the shelf."
    },
    {
      q: "What are the home delivery timeframes?",
      a: "Home deliveries are dispatched directly to specified regional addresses for a standard fee. Expect your delivery to arrive within 24 to 48 hours depending on transport routes."
    },
    {
      q: "How do I verify mobile money cashbacks?",
      a: "Once a mobile money payment finishes processing (via MTN or Airtel USSD triggers), any eligible promotional discounts are automatically deducted and reflected inside your purchase history log."
    }
  ];

  function toggleFaq(index) {
    activeFaq = activeFaq === index ? null : index;
  }
</script>

<div class="max-w-2xl text-slate-900 py-6 select-none flex flex-col gap-6">
  <!-- Section Header -->
  <div class="border-b border-slate-100 pb-4">
    <h2 class="text-[22px] font-bold text-slate-900 tracking-tight">Help & support</h2>
    <p class="text-[13px] text-slate-500 font-light mt-1">Find answers to frequently asked questions about deliveries, payments, and account support.</p>
  </div>

  <!-- Unified Accordion Container -->
  <div class="flex flex-col border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
    {#each faqs as faq, index}
      {@const isOpen = activeFaq === index}
      <div class="flex flex-col">
        <button 
          onclick={() => toggleFaq(index)}
          class="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors focus:outline-none text-left cursor-pointer"
        >
          <span class="text-[15px] font-semibold text-slate-900 pr-4">{faq.q}</span>
          <svg class="w-4 h-4 text-slate-400 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {#if isOpen}
          <div class="px-5 pb-5 pt-1 text-[13px] text-slate-500 font-light leading-relaxed animate-in fade-in duration-200">
            {faq.a}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Support Footer Contact Box -->
  <div class="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="flex flex-col gap-1 text-center sm:text-left">
      <h4 class="text-sm font-semibold text-slate-900">Need personal assistance?</h4>
      <p class="text-[12px] text-slate-500 font-light leading-normal">Our regional support operators are available to assist you.</p>
    </div>
    
    <!-- Action Button matching overall radius density -->
    <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <a 
        href="tel:+256414255511" 
        class="bg-[#1a1a1a] hover:bg-slate-800 text-white text-xs font-semibold h-11 px-6 rounded-full flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.154-5.145-3.475-6.3-6.3l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v1.75Z" />
        </svg>
        <span>Call GPO Desk</span>
      </a>
    </div>
  </div>
</div>