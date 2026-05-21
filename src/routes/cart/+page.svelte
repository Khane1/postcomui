<!-- src/routes/cart/+page.svelte -->
<script>
  import { appState } from '$lib/state.svelte.js';

  // Checkout Wizard States
  let isCheckoutOpen = $state(false);
  let checkoutStep = $state(1); // 1: Sign-In, 2: Location, 3: Payment, 4: Success
  
  // Form Field States
  let phone = $state("");
  let otpCode = $state("");
  let isOtpSent = $state(false);
  let deliveryAddress = $state("");
  let paymentProvider = $state("mtn"); // "mtn", "airtel", "counter"
  let paymentPhone = $state("");
  let trackingId = $state("");

  // Dynamic order calculations
  let subtotal = $derived(
    appState.cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  let hasDelivery = $derived(
    appState.cartItems.some(item => item.fulfillment === "delivery")
  );
  let shippingFee = $derived(hasDelivery ? 5500 : 0);
  let total = $derived(subtotal + shippingFee);

  function adjustQuantity(itemId, adjustment) {
    const item = appState.cartItems.find(i => i.product.id === itemId);
    if (item) {
      item.quantity = Math.max(1, item.quantity + adjustment);
    }
  }

  function removeItem(itemId) {
    appState.cartItems = appState.cartItems.filter(i => i.product.id !== itemId);
  }

  function triggerOtp() {
    if (!phone) return;
    isOtpSent = true;
  }

  function verifyOtp() {
    if (otpCode.length === 4) {
      checkoutStep = 2;
    }
  }

  function confirmLocation() {
    checkoutStep = 3;
  }

  function processOrder() {
    // Generate a simulated Ugandan Postal tracking code
    trackingId = `UG-POSTA-${Math.floor(100000 + Math.random() * 900000)}`;
    checkoutStep = 4;
  }

  function finalizeCheckout() {
    appState.cartItems = [];
    isCheckoutOpen = false;
    checkoutStep = 1;
    isOtpSent = false;
    phone = "";
    otpCode = "";
  }
</script>

<div class="space-y-6">
  
  <!-- Page Header / Breadcrumbs -->
  <nav class="flex items-center gap-2 text-xs font-semibold text-slate-500 border-b border-slate-100 pb-4">
    <a href="/" class="hover:text-slate-900 transition-colors">Catalog</a>
    <svg class="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
    </svg>
    <span class="text-slate-900 font-bold">Shopping Basket</span>
  </nav>

  {#if appState.cartItems.length === 0}
    <!-- Empty Cart Fallback -->
    <div class="text-center py-16 space-y-4 max-w-md mx-auto">
      <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
        <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
      </div>
      <div class="space-y-1">
        <h2 class="text-base font-bold text-slate-800">Your basket is empty</h2>
        <p class="text-xs text-slate-500 leading-relaxed font-medium">Subsidized national logistics are active. Settle farm products and crafts directly from rural districts.</p>
      </div>
      <a href="/" class="inline-block bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all">
        Continue Sourcing
      </a>
    </div>
  {:else}
    <!-- Active Cart Layout -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
      
      <!-- Left: Itemized Basket list -->
      <div class="xl:col-span-8 space-y-4">
        {#each appState.cartItems as item (item.product.id)}
          <div class="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            
            <div class="flex items-center gap-4 min-w-0">
              <div class="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex-shrink-0">
                <img src={item.product.images[0]} alt={item.product.name} class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0">
                <h4 class="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">{item.product.name}</h4>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">By {item.product.seller}</p>
                
                <!-- Per-Item Fulfillment Toggles -->
                <div class="flex items-center gap-2 mt-2">
                  <button 
                    onclick={() => item.fulfillment = 'pickup'}
                    class="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded border transition-all
                      {item.fulfillment === 'pickup' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500'}"
                  >
                    Post Pickup
                  </button>
                  <button 
                    onclick={() => item.fulfillment = 'delivery'}
                    class="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded border transition-all
                      {item.fulfillment === 'delivery' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500'}"
                  >
                    Home Delivery
                  </button>
                </div>
              </div>
            </div>

            <!-- Price & Quantity mods -->
            <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
              <div class="flex items-center border border-slate-200 rounded-xl overflow-hidden h-9 bg-slate-50">
                <button onclick={() => adjustQuantity(item.product.id, -1)} class="px-3 hover:bg-slate-100 font-bold text-xs focus:outline-none">−</button>
                <span class="w-8 text-center text-xs font-black text-slate-900">{item.quantity}</span>
                <button onclick={() => adjustQuantity(item.product.id, 1)} class="px-3 hover:bg-slate-100 font-bold text-xs focus:outline-none">+</button>
              </div>

              <div class="text-right min-w-[100px]">
                <p class="text-xs font-black text-slate-900">{(item.product.price * item.quantity).toLocaleString()} UGX</p>
                <p class="text-[9px] text-slate-400 font-semibold mt-0.5">{item.product.price.toLocaleString()} UGX each</p>
              </div>

              <button 
                onclick={() => removeItem(item.product.id)}
                class="text-slate-400 hover:text-red-600 p-2 hover:bg-slate-50 rounded-xl transition-all focus:outline-none"
                aria-label="Remove item"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

          </div>
        {/each}
      </div>

      <!-- Right: Summary checkout sidebar -->
      <div class="xl:col-span-4">
        <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <h4 class="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2">Order Summary</h4>
          
          <div class="space-y-2 text-xs font-semibold text-slate-500">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="text-slate-900 font-bold">{subtotal.toLocaleString()} UGX</span>
            </div>
            
            <div class="flex justify-between">
              <span>National Logistics (Posta)</span>
              {#if shippingFee === 0}
                <span class="text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">FREE PICKUP</span>
              {:else}
                <span class="text-slate-900 font-bold">+{shippingFee.toLocaleString()} UGX</span>
              {/if}
            </div>

            <p class="text-[10px] text-slate-400 leading-relaxed pt-1">
              {#if hasDelivery}
                Flat-rate courier shipping covers all selected home delivery segments directly.
              {:else}
                Free collection is automatically routed to your selected branch: <strong class="text-slate-700">{appState.activeBranch}</strong>.
              {/if}
            </p>
          </div>

          <div class="border-t border-slate-200 pt-3 flex justify-between items-baseline">
            <span class="text-xs font-bold text-slate-900">Total Price</span>
            <span class="text-lg font-black text-slate-900">{total.toLocaleString()} UGX</span>
          </div>

          <!-- Triggers the multi-step signing and location modal -->
          <button 
            onclick={() => isCheckoutOpen = true}
            class="w-full bg-slate-900 hover:bg-red-600 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            Place Subsidized Order
          </button>

          <div class="pt-2 flex items-center gap-2 text-[10px] text-slate-400 font-medium select-none">
            <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span>Payments secured via Mobile Money & Branch Pay</span>
          </div>

        </div>
      </div>

    </div>
  {/if}

</div>

<!-- UNIFIED SIGN-IN & CHECKOUT FLOW OVERLAY (Stepped Interface) -->
{#if isCheckoutOpen}
  <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
    <div class="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto scrollbar-none flex flex-col justify-between">
      
      <!-- Stepped Header Track Indicators -->
      {#if checkoutStep < 4}
        <div>
          <!-- MOBILE ONLY COMPACT PROGRESS INDICATOR (Under sm) -->
          <div class="sm:hidden flex items-center justify-between mb-5 border-b border-slate-100 pb-3 select-none">
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Step {checkoutStep} of 3</span>
            <span class="text-xs font-black text-slate-800">
              {#if checkoutStep === 1}Secure Sign-In{:else if checkoutStep === 2}Location Details{:else}Subsidized Payment{/if}
            </span>
          </div>

          <!-- DESKTOP ONLY NODE TRACKER (sm and up) -->
          <div class="hidden sm:flex items-center justify-between mb-6 border-b border-slate-100 pb-4 select-none">
            <div class="flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black {checkoutStep >= 1 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}">1</span>
              <span class="text-[10px] font-black uppercase tracking-wider {checkoutStep === 1 ? 'text-slate-900' : 'text-slate-400'}">Sign-In</span>
            </div>
            <svg class="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            <div class="flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black {checkoutStep >= 2 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}">2</span>
              <span class="text-[10px] font-black uppercase tracking-wider {checkoutStep === 2 ? 'text-slate-900' : 'text-slate-400'}">Location</span>
            </div>
            <svg class="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            <div class="flex items-center gap-1.5">
              <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black {checkoutStep >= 3 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-400'}">3</span>
              <span class="text-[10px] font-black uppercase tracking-wider {checkoutStep === 3 ? 'text-slate-900' : 'text-slate-400'}">Payment</span>
            </div>
          </div>
        </div>
      {/if}

      <!-- STEP 1: PHONE SECURE SIGN-IN -->
      {#if checkoutStep === 1}
        <div class="space-y-4">
          <div class="space-y-1">
            <h3 class="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">Secure Phone Sign-In</h3>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">Verify your phone number with a secure One-Time PIN. No passwords required.</p>
          </div>

          <div class="space-y-3">
            <div>
              <label for="checkout-phone" class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Mobile Phone Number</label>
              <div class="relative">
                <input 
                  id="checkout-phone"
                  type="tel" 
                  placeholder="e.g. +256 772 123456" 
                  bind:value={phone}
                  disabled={isOtpSent}
                  class="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                />
                <span class="absolute left-4 top-3 text-xs font-extrabold text-slate-400 select-none">🇺🇬</span>
              </div>
            </div>

            {#if isOtpSent}
              <div class="space-y-1.5 animate-in fade-in duration-200">
                <label for="checkout-otp" class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Verification PIN (SMS)</label>
                <input 
                  id="checkout-otp"
                  type="text" 
                  maxlength="4" 
                  placeholder="Enter 4-digit code" 
                  bind:value={otpCode}
                  oninput={verifyOtp}
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold tracking-[0.25em] text-center focus:outline-none"
                />
                <span class="text-[10px] text-slate-400 leading-relaxed block font-medium">Enter PIN received on your phone to continue.</span>
              </div>
            {/if}
          </div>

          <div class="pt-2">
            {#if !isOtpSent}
              <button 
                onclick={triggerOtp}
                disabled={!phone}
                class="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold text-xs py-3 rounded-xl transition-all focus:outline-none"
              >
                Send Verification PIN
              </button>
            {:else}
              <button 
                onclick={() => isOtpSent = false}
                class="w-full text-center text-xs text-red-600 font-bold hover:underline focus:outline-none"
              >
                Change Phone Number
              </button>
            {/if}
          </div>
        </div>

      <!-- STEP 2: COLLECTION POINT & LOCATION ROUTING -->
      {:else if checkoutStep === 2}
        <div class="space-y-4">
          <div class="space-y-1">
            <h3 class="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">Confirm Fulfillment Location</h3>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">Configure where national couriers will route your items.</p>
          </div>

          {#if hasDelivery}
            <!-- Home Delivery Form -->
            <div class="space-y-2">
              <label for="checkout-address" class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Delivery Address Details</label>
              <textarea 
                id="checkout-address"
                rows="3" 
                placeholder="District, Village, Street Name, House Number or Landmarking cues..." 
                bind:value={deliveryAddress}
                class="w-full p-4 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-semibold focus:outline-none placeholder-slate-400 leading-relaxed resize-none"
              ></textarea>
            </div>
          {:else}
            <!-- Post Office Pickup Info -->
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p class="text-[10px] font-black tracking-wider text-slate-400 uppercase select-none">Selected Posta Branch</p>
              <p class="text-xs font-bold text-slate-900">{appState.activeBranch}</p>
              <p class="text-[11px] text-slate-500 leading-relaxed pt-1 font-medium">Your package will be held securely here. You'll receive an SMS arrival alert.</p>
              <button 
                onclick={() => { isLocationModalOpen = true; isCheckoutOpen = false; }} 
                class="text-[10px] text-red-600 font-black hover:underline mt-2 block focus:outline-none"
              >
                Change Pickup Office →
              </button>
            </div>
          {/if}

          <button 
            onclick={confirmLocation}
            disabled={hasDelivery && !deliveryAddress}
            class="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold text-xs py-3 rounded-xl transition-all focus:outline-none"
          >
            Continue to Payment
          </button>
        </div>

      <!-- STEP 3: PAYMENT ROUTING SELECTOR (Fully Responsive Grid) -->
      {:else if checkoutStep === 3}
        <div class="space-y-4">
          <div class="space-y-1">
            <h3 class="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">Subsidized Payment Routing</h3>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">Select a payment provider. Secure transaction routed instantly.</p>
          </div>

          <!-- Responsive Grid: Stacks vertically on mobile, lines up side-by-side on desktop -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <!-- MTN MoMo Option -->
            <button 
              onclick={() => paymentProvider = "mtn"}
              class="border-2 p-3 sm:p-4 rounded-2xl flex flex-row sm:flex-col items-center justify-start sm:justify-between gap-3 sm:gap-2 transition-all focus:outline-none w-full text-left sm:text-center
                {paymentProvider === 'mtn' ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}"
            >
              <span class="w-6 h-6 sm:w-5 sm:h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900 flex-shrink-0">M</span>
              <span class="text-[10px] font-black text-slate-800 uppercase tracking-wide">MTN MoMo</span>
            </button>

            <!-- Airtel Money Option -->
            <button 
              onclick={() => paymentProvider = "airtel"}
              class="border-2 p-3 sm:p-4 rounded-2xl flex flex-row sm:flex-col items-center justify-start sm:justify-between gap-3 sm:gap-2 transition-all focus:outline-none w-full text-left sm:text-center
                {paymentProvider === 'airtel' ? 'border-red-600 bg-red-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}"
            >
              <span class="w-6 h-6 sm:w-5 sm:h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">A</span>
              <span class="text-[10px] font-black text-slate-800 uppercase tracking-wide">Airtel Money</span>
            </button>

            <!-- Over Counter Option -->
            <button 
              onclick={() => paymentProvider = "counter"}
              class="border-2 p-3 sm:p-4 rounded-2xl flex flex-row sm:flex-col items-center justify-start sm:justify-between gap-3 sm:gap-2 transition-all focus:outline-none w-full text-left sm:text-center
                {paymentProvider === 'counter' ? 'border-slate-950 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'}"
            >
              <span class="w-6 h-6 sm:w-5 sm:h-5 bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">P</span>
              <span class="text-[10px] font-black text-slate-800 uppercase tracking-wide">Branch Pay</span>
            </button>
          </div>

          {#if paymentProvider !== "counter"}
            <!-- Mobile money specific input -->
            <div class="space-y-1.5 animate-in fade-in duration-150">
              <label for="checkout-pay-phone" class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Mobile Wallet Phone</label>
              <div class="relative">
                <input 
                  id="checkout-pay-phone"
                  type="tel" 
                  placeholder="e.g. +256 772 123456" 
                  bind:value={paymentPhone}
                  class="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold focus:outline-none"
                />
                <span class="absolute left-4 top-3.5 text-[10px] font-extrabold text-slate-400 select-none">🇺🇬</span>
              </div>
              <p class="text-[10px] text-slate-400 leading-relaxed font-medium">A push USSD prompt will be sent to this phone wallet to authorize payment of <strong class="text-slate-800">{total.toLocaleString()} UGX</strong>.</p>
            </div>
          {:else}
            <!-- Over counter note -->
            <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl animate-in fade-in duration-150">
              <p class="text-[10px] text-slate-500 leading-relaxed font-semibold">Pay over the counter at any designated Post Office branch when picking up your items. Order reservation is valid for 7 business days.</p>
            </div>
          {/if}

          <div class="pt-2">
            <button 
              onclick={processOrder}
              disabled={paymentProvider !== "counter" && !paymentPhone}
              class="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold text-xs py-3 rounded-xl transition-all focus:outline-none"
            >
              {paymentProvider === "counter" ? "Confirm Reservation" : "Trigger USSD Payment Prompt"}
            </button>
          </div>
        </div>

      <!-- STEP 4: ORDER PLACEMENT SUCCESS -->
      {:else}
        <div class="space-y-5 text-center py-4">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div class="space-y-1.5">
            <h3 class="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">Subsidized Order Processed</h3>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">Your request has been routed to Posta national logistics.</p>
          </div>

          <!-- Tracking credentials box -->
          <div class="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-1.5">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest select-none">National Postal Tracking Code</p>
            <p class="text-sm sm:text-base font-black text-slate-900 select-all tracking-wide">{trackingId}</p>
            <p class="text-[10px] text-slate-500 leading-relaxed pt-1 font-semibold">Use this code to track your shipment. An SMS confirmation with instructions has been dispatched.</p>
          </div>

          <button 
            onclick={finalizeCheckout}
            class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all focus:outline-none"
          >
            Return to Marketplace
          </button>
        </div>
      {/if}

      <!-- Close popup modal trigger -->
      {#if checkoutStep < 4}
        <button 
          onclick={() => isCheckoutOpen = false}
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
          aria-label="Close checkout"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}

    </div>
  </div>
{/if}

<style>
  /* Clean scrollbar overrides */
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>