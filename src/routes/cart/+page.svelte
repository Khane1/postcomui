<!-- src/routes/cart/+page.svelte -->
<script>
  import { appState } from "$lib/state.svelte.js";

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
    appState.cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    ),
  );

  let hasDelivery = $derived(
    appState.cartItems.some((item) => item.fulfillment === "delivery"),
  );
  let shippingFee = $derived(hasDelivery ? 5500 : 0);
  let total = $derived(subtotal + shippingFee);

  function adjustQuantity(item, adjustment) {
    if (adjustment ==1) {
      item.quantity = Math.max(1, item.quantity + adjustment);
    } else if (item.quantity == 1&&adjustment==-1) {

      appState.cartItems = appState.cartItems.filter(
        (i) => i.product.id !== item.product.id,
      );
    }else {
      item.quantity = Math.max(1, item.quantity + adjustment);
    }
  }

  function removeItem(itemId) {
    appState.cartItems = appState.cartItems.filter(
      (i) => i.product.id !== itemId,
    );
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

<div class="space-y-8 select-none font-sans py-2">
  <!-- Breadcrumbs -->
  <nav class="flex items-center gap-2 text-xs font-semibold text-slate-400">
    <a href="/" class="hover:text-slate-900 transition-colors">Catalog</a>
    <span class="text-slate-300">/</span>
    <span class="text-slate-900 font-bold">Shopping Basket</span>
  </nav>

  {#if appState.cartItems.length === 0}
    <!-- Clean Empty State -->
    <div class="text-center py-20 space-y-4 max-w-md mx-auto">
      <div
        class="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-3xl"
      >
        🧺
      </div>
      <div class="space-y-1">
        <h2 class="text-base  text-slate-800 tracking-tight">
          Your basket is empty!
        </h2>
        <p class="text-xs text-slate-500 leading-relaxed font-semibold">
         
        </p>
      </div>
      <a
        href="/"
        class="inline-block bg-[#0aad0a] hover:bg-[#099409] text-white text-xs font-black px-6 py-2.5 rounded-full transition-all"
      >
       Continue Shopping
      </a>
    </div>
  {:else}
    <!-- Active Cart split panel layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <!-- Left Panel: Line Items (No heavy card shells, clean rules) -->
      <div class="lg:col-span-8 space-y-6">
        <div class="border-b border-slate-200/60 pb-3">
          <h2 class="text-base font-black text-slate-900 tracking-tight">
            Basket Items
          </h2>
        </div>

        <div class="divide-y divide-slate-100">
          {#each appState.cartItems as item (item.product.id)}
            <div
              class="py-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-4 min-w-0">
                <div class=" ">
                  <img
                    src={item.product.images[0]}
                    alt=""
                    class="w-14 h-14 rounded-xl bg-slate-50 object-cover"
                  />
                </div>
                <div class="min-w-0">
                  <h4
                    class="text-sm text-slate-900 leading-snug line-clamp-3 max-w-[160px] sm:max-w-[200px] text-slate-900 truncate max-w-[200px] sm:max-w-md"
                  >
                    {item.product.name}
                  </h4>
                  <p
                    class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5"
                  >
                    By {item.product.seller}
                  </p>
                  <div class="text- min-w-[100px]">
                    <p class="text-xs font-black text-slate-900">
                      {(item.product.price * item.quantity).toLocaleString()} UGX
                    </p>
                    <p class="text-[9px] text-slate-400 font-semibold mt-0.5">
                      {item.product.price.toLocaleString()} UGX each
                    </p>
                  </div>
                  <!-- Per-Item Fulfillment Toggles -->
                  <!-- <div class="flex items-center gap-2 mt-2">
                    <button 
                      onclick={() => item.fulfillment = 'pickup'}
                      class="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all focus:outline-none
                        {item.fulfillment === 'pickup' ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}"
                    >
                      Post Pickup
                    </button>
                    <button 
                      onclick={() => item.fulfillment = 'delivery'}
                      class="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all focus:outline-none
                        {item.fulfillment === 'delivery' ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}"
                    >
                      Home Delivery
                    </button>
                  </div> -->
                </div>
              </div>

              <!-- Price & Springy Stepper controls -->

              <div class="flex items-center gap-3 shrink-0">
                <div
                  class="flex items-center border border-slate-200/80 rounded-full h-7 bg-slate-50/50 select-none"
                >
                  <button
                    onclick={() => adjustQuantity(item, -1)}
                    class="{item.quantity > 1
                      ? ' w-8 text-[#0aad0a]  '
                      : 'w-8 text-red-500 px-1.5'} hover:bg-slate-100 h-6 rounded-l-full flex items-center justify-center font-semibold text-xl focus:outline-none"
                  >
                    {#if item.quantity == 1}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        x="0px"
                        y="0px"
                        width="100"
                        height="100"
                        viewBox="0 0 30 30"
                      >
                        <path
                          d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"
                        ></path>
                      </svg>
                    {:else}
                      −
                    {/if}
                  </button>
                  <span class="px-2 text-xl text-slate-800"
                    >{item.quantity}</span
                  >
                  <button
                    onclick={() => adjustQuantity(item, +1)}
                    class="w-8 h-6 rounded-r-full flex items-center justify-center text-[#0aad0a] hover:bg-slate-100 font-semibold text-xl focus:outline-none"
                    >+</button
                  >
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Right Panel: Sticky Summary Box (Sleek minimalist panel) -->
      <div class="lg:col-span-4 h-fit sticky top-24">
        <div
          class="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 shadow-xs"
        >
          <h4
            class="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-2.5 select-none"
          >
            Order Summary
          </h4>

          <div class="space-y-2 text-xs font-semibold text-slate-500">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="text-slate-900 font-bold"
                >{subtotal.toLocaleString()} UGX</span
              >
            </div>

            <div class="flex justify-between items-center">
              <span>National Postage Routing</span>
              {#if shippingFee === 0}
                <span
                  class="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-sm text-[9px] uppercase"
                  >Free Branch Pickup</span
                >
              {:else}
                <span class="text-slate-900 font-bold"
                  >+{shippingFee.toLocaleString()} UGX</span
                >
              {/if}
            </div>

            <!-- Contextual Savings Pill -->
            <div class="flex pt-1.5 select-none">
              <span
                class="bg-[#ffd200] text-slate-900 text-[9px] font-black uppercase px-2 py-1 rounded"
              >
                🏷️ MoMo Cash-back active
              </span>
            </div>
          </div>

          <div
            class="border-t border-slate-200 pt-3 flex justify-between items-baseline"
          >
            <span class="text-xs font-bold text-slate-900">Total Price</span>
            <span class="text-lg font-black text-slate-900"
              >{total.toLocaleString()} UGX</span
            >
          </div>

          <button
            onclick={() => (isCheckoutOpen = true)}
            class="w-full bg-[#0aad0a] hover:bg-[#099409] text-white font-extrabold text-xs h-12 rounded-full transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            Place Subsidized Order
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
<!-- CHECKOUT FLOW WIZARD DIALOG OVERLAY -->
{#if isCheckoutOpen}
  <div
    class="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4"
  >
    <div
      class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/50 relative animate-in zoom-in-95 duration-200"
    >
      <!-- Stepped Header Track Indicators -->
      {#if checkoutStep < 4}
        <div
          class="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 select-none text-[10px] font-black uppercase tracking-wider text-slate-400"
        >
          <span>Checkout step {checkoutStep} of 3</span>
          <span class="text-slate-800">
            {#if checkoutStep === 1}Secure Sign-In{:else if checkoutStep === 2}Location
              Details{:else}Payment Routing{/if}
          </span>
        </div>
      {/if}

      <!-- STEP 1: SMS SECURE ENTER -->
      {#if checkoutStep === 1}
        <div class="space-y-4">
          <div class="space-y-1">
            <h3
              class="text-sm font-black text-slate-900 uppercase tracking-wider"
            >
              Secure Phone Sign-In
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">
              Verify your phone number with a secure One-Time PIN. No passwords
              required.
            </p>
          </div>

          <div class="space-y-3">
            <div>
              <label
                for="checkout-page-phone"
                class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1"
                >Mobile Phone Number</label
              >
              <div class="relative">
                <input
                  id="checkout-page-phone"
                  type="tel"
                  placeholder="e.g. +256 772 123456"
                  bind:value={phone}
                  disabled={isOtpSent}
                  class="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold focus:outline-none"
                />
                <span
                  class="absolute left-4 top-3 text-xs font-extrabold text-slate-400 select-none"
                  >🇺🇬</span
                >
              </div>
            </div>

            {#if isOtpSent}
              <div class="space-y-1.5 animate-in fade-in duration-200">
                <label
                  for="checkout-page-otp"
                  class="text-[10px] font-black uppercase tracking-wider text-slate-400 block"
                  >Verification PIN (SMS)</label
                >
                <input
                  id="checkout-page-otp"
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
              <button
                onclick={triggerOtp}
                disabled={!phone}
                class="w-full bg-[#0aad0a] hover:bg-[#099409] disabled:bg-slate-200 text-white font-bold text-xs py-3 rounded-full transition-all focus:outline-none"
              >
                Send Verification PIN
              </button>
            {/if}
          </div>
        </div>
      {/if}

      <!-- STEP 2: COURIER LOCATION ROUTING -->
      {#if checkoutStep === 2}
        <div class="space-y-4">
          <div class="space-y-1">
            <h3
              class="text-sm font-black text-slate-900 uppercase tracking-wider"
            >
              Confirm Fulfillment Location
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">
              Configure where national couriers will route your items.
            </p>
          </div>

          {#if hasDelivery}
            <div class="space-y-2">
              <label
                for="checkout-page-address"
                class="text-[10px] font-black uppercase tracking-wider text-slate-400 block"
                >Delivery Address Details</label
              >
              <textarea
                id="checkout-page-address"
                rows="3"
                placeholder="District, Village, Street Name, House Number or Landmarking cues..."
                bind:value={deliveryAddress}
                class="w-full p-4 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-semibold focus:outline-none resize-none leading-relaxed"
              ></textarea>
            </div>
          {:else}
            <div
              class="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs"
            >
              <p
                class="text-[9px] font-black tracking-wider text-slate-400 uppercase select-none"
              >
                Selected Posta Branch
              </p>
              <p class="font-bold text-slate-900">{appState.activeBranch}</p>
              <p
                class="text-[11px] text-slate-500 leading-relaxed pt-1 font-medium"
              >
                Your package will be held securely here. You'll receive an SMS
                arrival alert.
              </p>
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
      {/if}

      <!-- STEP 3: COURIER PAYMENT PROVIDER -->
      {#if checkoutStep === 3}
        <div class="space-y-4">
          <div class="space-y-1">
            <h3
              class="text-sm font-black text-slate-900 uppercase tracking-wider"
            >
              Subsidized Payment Routing
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">
              Select a payment provider. Secure transaction routed instantly.
            </p>
          </div>

          <div class="grid grid-cols-3 gap-2.5 select-none">
            <button
              onclick={() => (paymentProvider = "mtn")}
              class="border-2 p-3 rounded-2xl flex flex-col items-center justify-between h-20 transition-all focus:outline-none {paymentProvider ===
              'mtn'
                ? 'border-amber-400 bg-amber-50/50'
                : 'border-slate-200 bg-white'}"
            >
              <span
                class="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] font-black text-slate-950"
                >M</span
              >
              <span class="text-[9px] font-black text-slate-800 uppercase"
                >MTN MoMo</span
              >
            </button>
            <button
              onclick={() => (paymentProvider = "airtel")}
              class="border-2 p-3 rounded-2xl flex flex-col items-center justify-between h-20 transition-all focus:outline-none {paymentProvider ===
              'airtel'
                ? 'border-red-600 bg-red-50/50'
                : 'border-slate-200 bg-white'}"
            >
              <span
                class="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                >A</span
              >
              <span class="text-[9px] font-black text-slate-800 uppercase"
                >Airtel</span
              >
            </button>
            <button
              onclick={() => (paymentProvider = "counter")}
              class="border-2 p-3 rounded-2xl flex flex-col items-center justify-between h-20 transition-all focus:outline-none {paymentProvider ===
              'counter'
                ? 'border-slate-950 bg-slate-50'
                : 'border-slate-200 bg-white'}"
            >
              <span
                class="w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                >P</span
              >
              <span class="text-[9px] font-black text-slate-800 uppercase"
                >Branch Pay</span
              >
            </button>
          </div>

          {#if paymentProvider !== "counter"}
            <div class="space-y-1.5 animate-in fade-in duration-150">
              <label
                for="checkout-page-pay-phone"
                class="text-[10px] font-black uppercase tracking-wider text-slate-400 block"
                >Mobile Wallet Phone</label
              >
              <div class="relative">
                <input
                  id="checkout-page-pay-phone"
                  type="tel"
                  placeholder="e.g. +256 772 123456"
                  bind:value={paymentPhone}
                  class="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl text-xs font-bold focus:outline-none"
                />
                <span
                  class="absolute left-4 top-3 text-xs font-extrabold text-slate-400 select-none"
                  >🇺🇬</span
                >
              </div>
            </div>
          {/if}

          <button
            onclick={processOrder}
            disabled={paymentProvider !== "counter" && !paymentPhone}
            class="w-full bg-[#0aad0a] hover:bg-[#099409] disabled:bg-slate-200 text-white font-bold text-xs py-3 rounded-full transition-all focus:outline-none"
          >
            {paymentProvider === "counter"
              ? "Confirm Reservation"
              : "Trigger USSD Payment Prompt"}
          </button>
        </div>
      {/if}

      <!-- STEP 4: TRACKING ORDER SUCCESS -->
      {#if checkoutStep === 4}
        <div
          class="space-y-5 text-center py-4 select-none animate-in zoom-in-95 duration-200"
        >
          <div
            class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-100"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div class="space-y-1.5">
            <h3
              class="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider"
            >
              Subsidized Order Processed
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed font-medium">
              Your request has been routed to Posta national logistics.
            </p>
          </div>

          <div
            class="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-1.5"
          >
            <p
              class="text-[9px] font-black text-slate-400 uppercase tracking-widest"
            >
              National Postal Tracking Code
            </p>
            <p
              class="text-sm sm:text-base font-black text-slate-900 tracking-wide"
            >
              {trackingId}
            </p>
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
          onclick={close}
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      {/if}
    </div>
    <!-- Closes .bg-white on line 5 -->
  </div>
  <!-- Closes .fixed on. line 4 -->
{/if}

<!-- Closes {#if isCheckoutOpen} on line 3 -->

<style>
  /* Springy pop micro-interaction on update */
  @keyframes scale-pop {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.35);
    }
    100% {
      transform: scale(1);
    }
  }
  .animate-pop {
    animation: scale-pop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
</style>
