<!-- lib/components/CheckoutModal.svelte -->
<script>
  import { appState } from '$lib/state.svelte.js';

  let checkoutStep = $state(1); // 1: Sign-In, 2: Location, 3: Payment, 4: Success
  let phone = $state("");
  let otpCode = $state("");
  let isOtpSent = $state(false);
  let deliveryAddress = $state("");
  let paymentProvider = $state("mtn");
  let paymentPhone = $state("");
  let trackingId = $state("");

  let subtotal = $derived(
    appState.cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );
  let hasDelivery = $derived(
    appState.cartItems.some(item => item.fulfillment === "delivery")
  );
  let shippingFee = $derived(hasDelivery ? 5500 : 0);
  let total = $derived(subtotal + shippingFee);

  function close() {
    appState.isCheckoutOpen = false;
    checkoutStep = 1;
    isOtpSent = false;
    phone = "";
    otpCode = "";
  }

  function triggerOtp() {
    if (!phone) return;
    isOtpSent = true;
  }

  function verifyOtp() {
    if (otpCode.length === 4) checkoutStep = 2;
  }

  function confirmLocation() {
    checkoutStep = 3;
  }

  function processOrder() {
    trackingId = `UG-POSTA-${Math.floor(100000 + Math.random() * 900000)}`;
    checkoutStep = 4;
  }

  function finalizeCheckout() {
    appState.cartItems = [];
    appState.isCheckoutOpen = false;
    checkoutStep = 1;
    isOtpSent = false;
    phone = "";
    otpCode = "";
  }
</script>

{#if appState.isCheckoutOpen}
  <div class="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/50 relative animate-in zoom-in-95 duration-200">
      
      <!-- Stepped Header Indicator -->
      {#if checkoutStep < 4}
        <div class="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 select-none text-[10px] font-black uppercase tracking-wider text-slate-400">
          <span>Checkout step {checkoutStep} of 3</span>
          <span class="text-slate-800">
            {#if checkoutStep === 1}Secure Sign-In{:else if checkoutStep === 2}Location Details{:else}Payment Routing{/if}
          </span>
        </div>
      {/if}

      <!-- STEP 1: SIGN-IN -->
      {#if checkoutStep === 1}
        <div class="space-y-4">
          <div class="space-y-1">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">Secure Phone Sign-In</h3>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">Verify your phone number with a secure One-Time PIN. No passwords required.</p>
          </div>

          <div class="space-y-3">
            <div>
              <label for="modal-phone" class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Mobile Phone Number</label>
              <div class="relative">
                <input 
                  id="modal-phone"
                  type="tel" 
                  placeholder="e.g. +256 772 123456" 
                  bind:value={phone}
                  disabled={isOtpSent}
                  class="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold focus:outline-none"
                />
                <span class="absolute left-4 top-3 text-xs font-extrabold text-slate-400 select-none">🇺🇬</span>
              </div>
            </div>

            {#if isOtpSent}
              <div class="space-y-1.5 animate-in fade-in duration-200">
                <label for="modal-otp" class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Verification PIN (SMS)</label>
                <input 
                  id="modal-otp"
                  type="text" 
                  maxlength="4" 
                  placeholder="Enter 4-digit code" 
                  bind:value={otpCode}
                  oninput={verifyOtp}
                  class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold tracking-[0.25em] text-center focus:outline-none"
                />
              </div>
            {/if}
          </div>

          <div class="pt-2">
            {#if !isOtpSent}
              <button onclick={triggerOtp} disabled={!phone} class="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold text-xs py-3 rounded-xl transition-all focus:outline-none">
                Send Verification PIN
              </button>
            {/if}
          </div>
        </div>

      <!-- STEP 2: LOCATION -->
      {:else if checkoutStep === 2}
        <div class="space-y-4">
          <div class="space-y-1">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">Confirm Fulfillment Location</h3>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">Configure where national couriers will route your items.</p>
          </div>

          {#if hasDelivery}
            <div class="space-y-2">
              <label for="modal-address" class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Delivery Address Details</label>
              <textarea 
                id="modal-address"
                rows="3" 
                placeholder="District, Village, Street Name, House Number or Landmarking cues..." 
                bind:value={deliveryAddress}
                class="w-full p-4 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-semibold focus:outline-none resize-none leading-relaxed"
              ></textarea>
            </div>
          {:else}
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <p class="text-[9px] font-black tracking-wider text-slate-400 uppercase select-none">Selected Posta Branch</p>
              <p class="font-bold text-slate-900">{appState.activeBranch}</p>
              <p class="text-[11px] text-slate-500 leading-relaxed pt-1 font-medium">Your package will be held securely here. You'll receive an SMS arrival alert.</p>
            </div>
          {/if}

          <button onclick={confirmLocation} disabled={hasDelivery && !deliveryAddress} class="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold text-xs py-3 rounded-xl transition-all focus:outline-none">
            Continue to Payment
          </button>
        </div>

      <!-- STEP 3: PAYMENT -->
      {:else if checkoutStep === 3}
        <div class="space-y-4">
          <div class="space-y-1">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">Subsidized Payment Routing</h3>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">Select a payment provider. Secure transaction routed instantly.</p>
          </div>

          <div class="grid grid-cols-3 gap-2.5 select-none">
            <button onclick={() => paymentProvider = "mtn"} class="border-2 p-3 rounded-2xl flex flex-col items-center justify-between h-20 transition-all focus:outline-none {paymentProvider === 'mtn' ? 'border-amber-400 bg-amber-50/50' : 'border-slate-200 bg-white'}">
              <span class="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-black text-slate-950">M</span>
              <span class="text-[9px] font-black text-slate-800 uppercase">MTN MoMo</span>
            </button>
            <button onclick={() => paymentProvider = "airtel"} class="border-2 p-3 rounded-2xl flex flex-col items-center justify-between h-20 transition-all focus:outline-none {paymentProvider === 'airtel' ? 'border-red-600 bg-red-50/50' : 'border-slate-200 bg-white'}">
              <span class="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-black text-white">A</span>
              <span class="text-[9px] font-black text-slate-800 uppercase">Airtel</span>
            </button>
            <button onclick={() => paymentProvider = "counter"} class="border-2 p-3 rounded-2xl flex flex-col items-center justify-between h-20 transition-all focus:outline-none {paymentProvider === 'counter' ? 'border-slate-950 bg-slate-50' : 'border-slate-200 bg-white'}">
              <span class="w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-white">P</span>
              <span class="text-[9px] font-black text-slate-800 uppercase">Branch Pay</span>
            </button>
          </div>

          {#if paymentProvider !== "counter"}
            <div class="space-y-1.5 animate-in fade-in duration-150">
              <label for="modal-pay-phone" class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Mobile Wallet Phone</label>
              <div class="relative">
                <input id="modal-pay-phone" type="tel" placeholder="e.g. +256 772 123456" bind:value={paymentPhone} class="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold focus:outline-none" />
                <span class="absolute left-4 top-3 text-xs font-extrabold text-slate-400 select-none">🇺🇬</span>
              </div>
            </div>
          {/if}

          <button onclick={processOrder} disabled={paymentProvider !== "counter" && !paymentPhone} class="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold text-xs py-3 rounded-xl transition-all focus:outline-none">
            {paymentProvider === "counter" ? "Confirm Reservation" : "Trigger USSD Payment Prompt"}
          </button>
        </div>

      <!-- STEP 4: SUCCESS -->
      {:else}
        <div class="space-y-5 text-center py-4 select-none">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div class="space-y-1.5">
            <h3 class="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">Subsidized Order Processed</h3>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">Your request has been routed to Posta national logistics.</p>
          </div>

          <div class="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-1.5">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">National Postal Tracking Code</p>
            <p class="text-sm sm:text-base font-black text-slate-900 tracking-wide">{trackingId}</p>
          </div>

          <button onclick={finalizeCheckout} class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all focus:outline-none">
            Return to Marketplace
          </button>
        </div>
      {/if}

      <!-- Close popup modal trigger -->
      {#if checkoutStep < 4}
        <button onclick={close} class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}

    </div>
  </div>
{/if}