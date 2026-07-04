<!-- routes/account/notification/+page.svelte -->
<script>
  let notifySMS = $state(true);
  let notifyEmail = $state(false);
  let notifyOffers = $state(true);
</script>

<div class="max-w-2xl text-slate-900 py-6 select-none">
  <!-- Section Title & Description -->
  <div class="mb-6">
    <h2 class="text-[22px] font-bold text-slate-900 tracking-tight">Notification settings</h2>
    <p class="text-[13px] text-slate-500 font-light mt-1">Manage how you receive updates about your active orders, deliveries, and promotional offers.</p>
  </div>

  <!-- Notification Toggle Group -->
  <div class="flex flex-col border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 ">
    
    <!-- SMS Toggle Option -->
    <button 
      onclick={() => notifySMS = !notifySMS} 
      class="w-full flex items-center justify-between p-5 hover:bg-slate-50/80 text-start focus:bg-slate-50/80 focus:outline-none transition-colors group cursor-pointer "
    >
      <div class="flex items-center x gap-4">
        <!-- Icon -->
        <svg class="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
        <div class="flex flex-col ">
          <span class="text-[15px] font-semibold text-slate-900">SMS notifications</span>
          <span class="text-[12px] text-slate-500 font-light mt-0.5">Get real-time updates about your order status on your phone.</span>
        </div>
      </div>
      <!-- Toggle Switch -->
      <div class="w-10 h-6 rounded-full relative transition-colors duration-200 ease-in-out {notifySMS ? 'bg-[#0aad0a]' : 'bg-slate-200'} shrink-0">
        <span class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out {notifySMS ? 'translate-x-4' : 'translate-x-0'} shadow-sm"></span>
      </div>
    </button>

    <!-- Email Toggle Option -->
    <button 
      onclick={() => notifyEmail = !notifyEmail} 
      class="w-full flex items-center justify-between p-5 text-start hover:bg-slate-50/80 focus:bg-slate-50/80 focus:outline-none transition-colors group cursor-pointer"
    >
      <div class="flex items-center gap-4">
        <!-- Icon -->
        <svg class="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
        <div class="flex flex-col">
          <span class="text-[15px] font-semibold text-slate-900">Email notifications</span>
          <span class="text-[12px] text-slate-500 font-light mt-0.5">Receive receipts, account updates, and news about regional cooperative harvests.</span>
        </div>
      </div>
      <!-- Toggle Switch -->
      <div class="w-10 h-6 rounded-full relative transition-colors duration-200 ease-in-out {notifyEmail ? 'bg-[#0aad0a]' : 'bg-slate-200'} shrink-0">
        <span class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out {notifyEmail ? 'translate-x-4' : 'translate-x-0'} shadow-sm"></span>
      </div>
    </button>

    <!-- Offers Toggle Option -->
    <button 
      onclick={() => notifyOffers = !notifyOffers} 
      class="w-full flex items-center text-start justify-between p-5 hover:bg-slate-50/80 focus:bg-slate-50/80 focus:outline-none transition-colors group cursor-pointer"
    >
      <div class="flex items-center gap-4">
        <!-- Icon -->
        <svg class="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l6.499 6.499c.404.404.935.619 1.465.619l1.465-.001L18 13.5l.001-1.465c0-.53-.215-1.061-.619-1.465l-6.499-6.499A2.251 2.251 0 0 0 9.568 3Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 7.5h.008v.008H6V7.5Z" />
        </svg>
        <div class="flex flex-col">
          <span class="text-[15px] font-semibold text-slate-900">Promotions & rewards</span>
          <span class="text-[12px] text-slate-500 font-light mt-0.5">Get notified about active Mobile Money cashbacks, discounts, and custom rewards.</span>
        </div>
      </div>
      <!-- Toggle Switch -->
      <div class="w-10 h-6 rounded-full relative transition-colors duration-200 ease-in-out {notifyOffers ? 'bg-[#0aad0a]' : 'bg-slate-200'} shrink-0">
        <span class="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out {notifyOffers ? 'translate-x-4' : 'translate-x-0'} shadow-sm"></span>
      </div>
    </button>
  </div>
</div>