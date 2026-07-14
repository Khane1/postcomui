<!-- routes/cart/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import CartProductCard from "$lib/components/cards&grids/cartProductCard.svelte";
  import { appState } from "$lib/state.svelte.js";
  import { stations } from "$lib/utils/stations.js";

  let trackingId = $state("");
  let shippingFee = $state(0);

  // Status Check & Polling states
  let isCheckingStatus = $state(false);
  let currentOrderStatus = $state("PENDING_CONFIRMATION");

  // Mobile Summary Expansion State
  let isMobileSummaryOpen = $state(false);

  // Form payment routing states
  let paymentType = $state("momo"); // momo or card
  let paymentProvider = $state("mtn"); // mtn or airtel
  let phoneNumberInput = $state("");

  let cardNo = $state("");
  let cardExpiry = $state("");
  let cardCvv = $state("");

  // International Shipping Input Fields
  let selectedShippingDestinationId = $state("");
  let selectedShippingDestinationName = $state("");
  let receiverNameInput = $state("");
  let receiverAddressInput = $state("");
  let receiverPhoneInput = $state("");
  let receiverCityInput = $state("");
  let receiverStateInput = $state("");
  let receiverZipInput = $state("");
  let shippingNotesInput = $state("");

  let subtotal = $derived(
    appState.cartItems.reduce((acc, item) => {
      const price = Number(item?.product?.price || 0);
      const qty = Number(item?.quantity || 0);
      return acc + price * qty;
    }, 0),
  );

  let fulfillmentMode = $derived(
    appState.cartItems[0]?.fulfillment || "pickup",
  );

  let total = $derived(subtotal + shippingFee);

  // Safely strips empty strings, non-UUID labels, or unresolved properties
  function sanitizeUuid(val) {
    if (!val) return null;
    const s = String(val).trim();
    if (
      s === "" ||
      s.toLowerCase() === "null" ||
      s.toLowerCase() === "undefined"
    ) {
      return null;
    }
    if (s.includes(" ") || (s.match(/[A-Z]/) && !s.match(/[a-f]/i))) {
      return null;
    }
    return s;
  }

  onMount(async () => {
    appState.fetchPaymentMethods();
    appState.fetchCustomerAddresses();
    appState.fetchPickupCenters();
    appState.fetchShippingCountries();

    // Populate profile phone coordinates
    const user = await appState.getCurrentUser();
    if (user && user.phone_number) {
      phoneNumberInput = user.phone_number;
    }
  });

  // Watcher effect for auto-filling destination label
  $effect(() => {
    const selected = appState.shippingCountries.find(
      (d) => d.id === selectedShippingDestinationId,
    );
    selectedShippingDestinationName = selected?.label || "";
  });

  $effect(() => {
    if (appState.user) {
      if (!receiverNameInput) {
        receiverNameInput =
          `${appState.user.first_name || ""} ${appState.user.last_name || ""}`.trim();
      }
      if (!receiverPhoneInput) {
        receiverPhoneInput = appState.user.phone_number || "";
      }
    }
  });

  $effect(() => {
    if (appState.customerAddresses.length > 0 && !appState.selectedAddressId) {
      const defaultAddr =
        appState.customerAddresses.find((a) => a.is_default) ||
        appState.customerAddresses[0];
      appState.selectedAddressId = defaultAddr.id;
      appState.activeBranch = defaultAddr.street || defaultAddr.line1;
    }
  });

  // Calculate delivery fees reactively
  $effect(() => {
    async function calculateFee() {
      if (appState.cartItems.length === 0) {
        shippingFee = 0;
        return;
      }

      const totalGrams = appState.cartItems.reduce((acc, item) => {
        const wt = Number(item.product.weight || 500);
        return acc + wt * item.quantity;
      }, 0);
      const packageWeightKg = Math.max(0.5, totalGrams / 1000);

      // Handle International Shipping Option
      if (fulfillmentMode === "shipping") {
        if (!selectedShippingDestinationId) {
          shippingFee = 0;
          return;
        }
        const payload = {
          delivery_method: "SHIPPING",
          package_weight: packageWeightKg,
          shipping_destination_id: selectedShippingDestinationId,
        };
        const fee = await appState.getDeliveryFee(payload);
        shippingFee = fee;
        return;
      }

      // Handle GPO Station Pickups and Domestic Deliveries
      const activeCenter = appState.allPickUpCenters.find(
        (c) =>
          c.name === appState.activeBranch ||
          String(c.id) === String(appState.activeBranch),
      );

      const cleanAddrId =
        fulfillmentMode === "delivery"
          ? sanitizeUuid(appState.selectedAddressId)
          : null;
      const cleanCenterId =
        fulfillmentMode === "pickup" ? sanitizeUuid(activeCenter?.id) : null;

      if (fulfillmentMode === "delivery" && !cleanAddrId) {
        shippingFee = 5500; // Static fallback
        return;
      }
      if (fulfillmentMode === "pickup" && !cleanCenterId) {
        shippingFee = 0; // Free pickup fallback
        return;
      }

      const payload = {
        delivery_method:
          fulfillmentMode === "delivery" ? "DOOR_DELIVERY" : "PICKUP_STATION",
        package_weight: packageWeightKg,
        delivery_address_id: cleanAddrId,
        pickup_center_id: cleanCenterId,
        shipping_destination_id: null,
      };

      const fee = await appState.getDeliveryFee(payload);
      shippingFee = fee;
    }
    calculateFee();
  });

  function adjustQuantity(item, adjustment) {
    if (adjustment === 1) {
      appState.addCartItem(item.product, 1);
    } else {
      appState.removeCartItem(item.product);
    }
  }

  function startStatusPolling(orderId) {
    let pollCount = 0;
    const maxPolls = 30;

    const interval = setInterval(async () => {
      pollCount++;

      if (pollCount > maxPolls) {
        clearInterval(interval);
        appState.addToast("Payment verification timeout.", "info");
        isCheckingStatus = false;
        goto("/account/myorders");
        return;
      }

      if (orderId) {
        const orderRes = await appState.getOrderStatus(orderId);
        if (orderRes && orderRes.success) {
          const status = (orderRes.status || "").toUpperCase();
          currentOrderStatus = status;

          if (
            ["CONFIRMED", "SUCCESSFUL", "RECEIVED", "COMPLETED"].includes(
              status,
            )
          ) {
            clearInterval(interval);
            appState.addToast("Payment Confirmed! Order complete.", "success");
            setTimeout(() => {
              isCheckingStatus = false;
              goto("/account/myorders");
            }, 1500);
          } else if (
            ["FAILED_PAYMENT", "FAILED", "CANCELLED"].includes(status)
          ) {
            clearInterval(interval);
            appState.addToast("Transaction did not clear.", "error");
            isCheckingStatus = false;
            goto("/account/myorders");
          }
        }
      } else {
        if (pollCount === 2) {
          currentOrderStatus = "PROCESSING_PAYMENT";
        } else if (pollCount === 4) {
          clearInterval(interval);
          appState.addToast("Mock checkout confirmed.", "success");
          setTimeout(() => {
            isCheckingStatus = false;
            goto("/account/myorders");
          }, 1500);
        }
      }
    }, 2000);
  }

  async function processOrder() {
    const matchedPayment = appState.availablePaymentMethods.find((m) => {
      const nameLower = (m.name || "").toLowerCase();
      if (paymentType === "card") {
        return (
          nameLower.includes("card") ||
          nameLower.includes("visa") ||
          nameLower.includes("mastercard")
        );
      }
      return paymentProvider === "mtn"
        ? nameLower.includes("mtn") || nameLower.includes("momo")
        : nameLower.includes("airtel");
    });

    let cleanAddrId = null;
    let cleanCenterId = null;
    let cleanDestId = null;
    let deliveryMethod = "PICKUP_STATION";

    if (fulfillmentMode === "delivery") {
      cleanAddrId = sanitizeUuid(appState.selectedAddressId);
      deliveryMethod = "DOOR_DELIVERY";
    } else if (fulfillmentMode === "pickup") {
      const activeCenter = appState.allPickUpCenters.find(
        (c) =>
          c.name === appState.activeBranch ||
          String(c.id) === String(appState.activeBranch),
      );
      cleanCenterId = sanitizeUuid(activeCenter?.id);
      deliveryMethod = "PICKUP_STATION";
    } else if (fulfillmentMode === "shipping") {
      cleanDestId = selectedShippingDestinationId;
      deliveryMethod = "SHIPPING";
    }

    // Validation checks for each mode
    if (fulfillmentMode === "delivery" && !cleanAddrId) {
      appState.addToast(
        "Please select or add a delivery address to complete your order.",
        "error",
      );
      return;
    }
    if (fulfillmentMode === "pickup" && !cleanCenterId) {
      appState.addToast(
        "Retrieving pickup center parameters. Please wait...",
        "info",
      );
      return;
    }
    if (fulfillmentMode === "shipping") {
      if (!cleanDestId) {
        appState.addToast(
          "Please select an international shipping destination country.",
          "error",
        );
        return;
      }
      if (
        !receiverNameInput.trim() ||
        !receiverAddressInput.trim() ||
        !receiverPhoneInput.trim() ||
        !receiverCityInput.trim() ||
        !receiverStateInput.trim() ||
        !receiverZipInput.trim()
      ) {
        appState.addToast(
          "Please fill in all international receiver address fields.",
          "error",
        );
        return;
      }
    }

    const selectedAddress = appState.customerAddresses.find(
      (a) => String(a.id) === String(appState.selectedAddressId),
    );

    const notesDetail =
      fulfillmentMode === "shipping"
        ? shippingNotesInput.trim()
        : `Checked out via pay form. ${paymentType === "momo" ? "MoMo: " + phoneNumberInput : "Card"}.${fulfillmentMode === "pickup" ? " Selected Pickup Station: " + appState.activeBranch : ""}`;

    const payload = {
      delivery_address_id: cleanAddrId,
      pickup_center_id: cleanCenterId,
      delivery_method: deliveryMethod,
      shipping_destination_id: cleanDestId,
      shipping_destination:
        fulfillmentMode === "shipping" ? selectedShippingDestinationName : "",
      shipping_receiver_name:
        fulfillmentMode === "shipping"
          ? receiverNameInput.trim()
          : appState.user
            ? `${appState.user.first_name || ""} ${appState.user.last_name || ""}`.trim()
            : "Postal Customer",
      shipping_receiver_address:
        fulfillmentMode === "shipping"
          ? receiverAddressInput.trim()
          : selectedAddress
            ? selectedAddress.street || selectedAddress.line1 || ""
            : "",
      shipping_receiver_phone_number:
        fulfillmentMode === "shipping"
          ? receiverPhoneInput.trim()
          : phoneNumberInput || appState.user?.phone_number || "",
      shipping_receiver_city:
        fulfillmentMode === "shipping"
          ? receiverCityInput.trim()
          : selectedAddress
            ? selectedAddress.city || "Kampala"
            : "Kampala",
      shipping_receiver_state:
        fulfillmentMode === "shipping"
          ? receiverStateInput.trim()
          : selectedAddress
            ? selectedAddress.state || selectedAddress.city || "Central"
            : "Central",
      shipping_receiver_zip_code:
        fulfillmentMode === "shipping"
          ? receiverZipInput.trim()
          : selectedAddress
            ? selectedAddress.zip_code || "00000"
            : "00000",
      notes: notesDetail,
    };

    try {
      isCheckingStatus = true;
      currentOrderStatus = "PENDING_CONFIRMATION";
      const orderRes = await appState.submitOrder(payload);
      const orderId = orderRes?.id;
      trackingId =
        orderRes?.reference ||
        orderId ||
        `UG-POSTA-${Math.floor(100000 + Math.random() * 900000)}`;

      if (orderId && matchedPayment?.id) {
        const finalAmount = Math.max(0, total);
        try {
          if (paymentType === "momo") {
            await appState.addOrderPayment(
              orderId,
              finalAmount,
              matchedPayment.id,
              phoneNumberInput.trim(),
            );
            await appState.payOrder(orderId, {});
          } else {
            await appState.addOrderPayment(
              orderId,
              finalAmount,
              matchedPayment.id,
              null,
            );
            await appState.payOrder(orderId, {
              card_number: cardNo.trim(),
              expiry_date: cardExpiry.trim(),
              cvv: cardCvv.trim(),
            });
          }
        } catch (paymentErr) {
          console.warn("[Payment Flow] Payment trigger skipped:", paymentErr);
        }
      }

      appState.cartItems = [];
      startStatusPolling(orderId);
    } catch (err) {
      console.error("[Cart Checkout Failure] Processing error:", err);
      isCheckingStatus = false;
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Checkout request could not be completed.";
      appState.addToast(serverMessage, "error");
    }
  }

  function setAllFulfillment(mode) {
    appState.cartItems.forEach((item) => {
      item.fulfillment = mode;
    });
    appState.cartItems = [...appState.cartItems];
  }

  // --- REAL-TIME PAYMENT VALIDATORS ---

  function validateLuhn(cardNumber) {
    const clean = cardNumber.replace(/\D/g, "");
    if (!clean || clean.length < 13 || clean.length > 19) return false;

    let sum = 0;
    let shouldDouble = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let digit = parseInt(clean.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

  function validateExpiry(expiry) {
    const clean = expiry.replace(/\s/g, "");
    if (!/^\d{2}\/\d{2}$/.test(clean)) return false;

    const [mStr, yStr] = clean.split("/");
    const month = parseInt(mStr, 10);
    const year = parseInt("20" + yStr, 10);

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
  }

  function validateCvv(cvv) {
    const clean = cvv.replace(/\D/g, "");
    return clean.length === 3 || clean.length === 4;
  }

  // --- INPUT FORMATTERS / MASKS ---

  function handleCardInput(e) {
    let value = e.target.value.replace(/\D/g, "");
    let matches = value.substring(0, 16).match(/\d{1,4}/g);
    cardNo = matches ? matches.join(" ") : "";
  }

  function handleExpiryInput(e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) {
      cardExpiry = value.substring(0, 2) + "/" + value.substring(2, 4);
    } else {
      cardExpiry = value;
    }
  }

  function handleCvvInput(e) {
    cardCvv = e.target.value.replace(/\D/g, "").substring(0, 4);
  }

  // --- REACTIVE VALIDATION MAPS ---

  let isCardNoValid = $derived(validateLuhn(cardNo));
  let isExpiryValid = $derived(validateExpiry(cardExpiry));
  let isCvvValid = $derived(validateCvv(cardCvv));

  let isCardFormValid = $derived(isCardNoValid && isExpiryValid && isCvvValid);
  let isMomoValid = $derived(
    /^\+?\d{9,15}$/.test(phoneNumberInput.replace(/\s/g, "")),
  );

  let isPlaceOrderDisabled = $derived.by(() => {
    if (appState.cartItems.length === 0) return true;

    if (fulfillmentMode === "delivery") {
      if (
        appState.customerAddresses.length === 0 ||
        !appState.selectedAddressId
      )
        return true;
    }
    if (fulfillmentMode === "shipping") {
      if (!selectedShippingDestinationId) return true;
      if (
        !receiverNameInput.trim() ||
        !receiverAddressInput.trim() ||
        !receiverPhoneInput.trim() ||
        !receiverCityInput.trim() ||
        !receiverStateInput.trim() ||
        !receiverZipInput.trim()
      )
        return true;
    }

    if (paymentType === "card") {
      return !isCardFormValid;
    } else {
      return !isMomoValid;
    }
  });
</script>

<div class="space-y-8 select-none font-sans py-2">
  <nav class="flex items-center gap-2 text-xs font-semibold text-slate-400">
    <a href="/" class="hover:text-slate-900 transition-colors">Catalog</a>
    <span class="text-slate-300">/</span>
    <span class="text-slate-900 font-bold">Checkout</span>
  </nav>

  {#if isCheckingStatus}
    <!-- LOADING INTERFACE: STEP PROGRESS TRACKER -->
    <div
      class="max-w-xl mx-auto py-16 text-center space-y-8 animate-in fade-in duration-300"
    >
      <div class="relative w-16 h-16 mx-auto">
        <div
          class="absolute inset-0 rounded-full border-4 border-slate-100 animate-pulse"
        ></div>
        <div
          class="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0aad0a] animate-spin"
        ></div>
      </div>

      <div class="space-y-2">
        <h2 class="text-lg font-bold text-slate-900 tracking-tight">
          Verifying Payment Status
        </h2>
        <p
          class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-light"
        >
          Securing authorization from your payment provider. Please wait.
        </p>
      </div>

      <div
        class="bg-white border border-slate-200 p-6 rounded-2xl max-w-sm mx-auto space-y-4 text-left"
      >
        <!-- Stage 1 -->
        <div class="flex items-center gap-3">
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
            {[
              'PENDING_CONFIRMATION',
              'PENDING_PAYMENT',
              'PROCESSING_PAYMENT',
              'CONFIRMED',
            ].includes(currentOrderStatus)
              ? 'bg-[#0aad0a] text-white'
              : 'bg-slate-100 text-slate-400'}"
          >
            1
          </div>
          <div>
            <p class="text-xs font-bold text-slate-900">Order Created</p>
            <p class="text-[10px] text-slate-400 font-light">
              Fulfillment coordinates locked.
            </p>
          </div>
        </div>

        <!-- Stage 2 -->
        <div class="flex items-center gap-3">
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
            {['PROCESSING_PAYMENT', 'CONFIRMED'].includes(currentOrderStatus)
              ? 'bg-[#0aad0a] text-white'
              : currentOrderStatus === 'PENDING_PAYMENT'
                ? 'bg-amber-400 text-slate-950 animate-pulse'
                : 'bg-slate-100 text-slate-400'}"
          >
            2
          </div>
          <div>
            <p class="text-xs font-bold text-slate-900">
              Payment Authorization
            </p>
            <p class="text-[10px] text-slate-400 font-light">
              Verifying with carrier network.
            </p>
          </div>
        </div>

        <!-- Stage 3 -->
        <div class="flex items-center gap-3">
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
            {currentOrderStatus === 'CONFIRMED'
              ? 'bg-[#0aad0a] text-white'
              : 'bg-slate-100 text-slate-400'}"
          >
            3
          </div>
          <div>
            <p class="text-xs font-bold text-slate-900">Logistics Dispatch</p>
            <p class="text-[10px] text-slate-400 font-light">
              Redirecting to Order History log...
            </p>
          </div>
        </div>
      </div>

      <div
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500 font-mono tracking-wide uppercase"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-[#0aad0a] animate-ping"></span>
        Status: {currentOrderStatus.replace(/_/g, " ")}
      </div>
    </div>
  {:else if appState.cartItems.length === 0}
    <!-- EMPTY BASKET -->
    <div class="text-center py-20 space-y-4 max-w-md mx-auto">
      <div
        class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400"
      >
        <svg
          class="w-8 h-8"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375 3.75 0 1 1-.75 0 .375 3.75 0 0 1 .75 0Z"
          />
        </svg>
      </div>
      <div class="space-y-1">
        <h2 class="text-sm text-slate-800 tracking-tight font-bold">
          Your basket is empty
        </h2>
      </div>
      <a
        href="/"
        class="inline-block bg-[#0aad0a] hover:bg-[#099409] text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-all"
      >
        Continue Shopping
      </a>
    </div>
  {:else}
    <!-- ACTIVE CHECKOUT VIEW -->
    <div
      class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start rounded-lg bg-slate-50 p-3 pb-24 lg:pb-3"
    >
      <div class="lg:col-span-8 space-y-6">
        <!-- Fulfillment Mode -->
        <div class="rounded-2xl p-6 bg-white space-y-4">
          <div class="border-b border-slate-100 pb-3">
            <h3
              class="text-xs font-black text-slate-400 uppercase tracking-widest"
            >
              Delivery Options
            </h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onclick={() => setAllFulfillment("pickup")}
              class="w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 focus:outline-none
                {fulfillmentMode === 'pickup'
                ? 'border-[#0aad0a] bg-emerald-50/10'
                : 'border-slate-200 bg-white hover:border-slate-300'}"
            >
              <div class="pt-0.5">
                <div
                  class="w-4 h-4 rounded-full border flex items-center justify-center {fulfillmentMode ===
                  'pickup'
                    ? 'border-[#0aad0a]'
                    : 'border-slate-300'}"
                >
                  {#if fulfillmentMode === "pickup"}
                    <div class="w-2 h-2 rounded-full bg-[#0aad0a]"></div>
                  {/if}
                </div>
              </div>
              <div>
                <span class="text-sm font-bold text-slate-900 block"
                  >Post Office Pickup</span
                >
              </div>
            </button>

            <button
              type="button"
              onclick={() => setAllFulfillment("delivery")}
              class="w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 focus:outline-none
                {fulfillmentMode === 'delivery'
                ? 'border-[#0aad0a] bg-emerald-50/10'
                : 'border-slate-200 bg-white hover:border-slate-300'}"
            >
              <div class="pt-0.5">
                <div
                  class="w-4 h-4 rounded-full border flex items-center justify-center {fulfillmentMode ===
                  'delivery'
                    ? 'border-[#0aad0a]'
                    : 'border-slate-300'}"
                >
                  {#if fulfillmentMode === "delivery"}
                    <div class="w-2 h-2 rounded-full bg-[#0aad0a]"></div>
                  {/if}
                </div>
              </div>
              <div>
                <span class="text-sm text-slate-900 block font-bold"
                  >Alternative Delivery</span
                >
              </div>
            </button>

            <button
              type="button"
              onclick={() => setAllFulfillment("shipping")}
              class="w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 focus:outline-none
                {fulfillmentMode === 'shipping'
                ? 'border-[#0aad0a] bg-emerald-50/10'
                : 'border-slate-200 bg-white hover:border-slate-300'}"
            >
              <div class="pt-0.5">
                <div
                  class="w-4 h-4 rounded-full border flex items-center justify-center {fulfillmentMode ===
                  'shipping'
                    ? 'border-[#0aad0a]'
                    : 'border-slate-300'}"
                >
                  {#if fulfillmentMode === "shipping"}
                    <div class="w-2 h-2 rounded-full bg-[#0aad0a]"></div>
                  {/if}
                </div>
              </div>
              <div>
                <span class="text-sm text-slate-900 block font-bold"
                  >International Shipping</span
                >
              </div>
            </button>
          </div>
        </div>

        <!-- Coordinates Details -->
        <div class="rounded-2xl p-6 bg-white space-y-4">
          <div
            class="flex items-center justify-between border-b border-slate-100 pb-3"
          >
            <h3
              class="text-xs font-black text-slate-400 uppercase tracking-widest"
            >
              Delivery Location
            </h3>
            {#if fulfillmentMode !== "shipping"}
              <button
                onclick={() => (appState.isLocationModalOpen = true)}
                class="text-xs font-bold text-[#0aad0a] hover:underline focus:outline-none"
              >
                Change
              </button>
            {/if}
          </div>

          <div class="flex items-start gap-4">
            <div
              class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0z"
                />
              </svg>
            </div>

            <div class="space-y-3 flex-1 min-w-0">
              {#if fulfillmentMode === "delivery"}
                {#if appState.customerAddresses.length > 0}
                  {@const currentAddr =
                    appState.customerAddresses.find(
                      (a) =>
                        String(a.id) === String(appState.selectedAddressId),
                    ) || appState.customerAddresses[0]}
                  {#if currentAddr}
                    <p class="text-sm font-semibold text-slate-900">
                      Direct Delivery
                    </p>
                    <p class="text-xs text-slate-500 font-light">
                      {currentAddr.building_name &&
                      currentAddr.building_name !== "N/A"
                        ? currentAddr.building_name + " • "
                        : ""}
                      {currentAddr.street || "Sourced Coordinates"},
                      {currentAddr.city || "Kampala"}
                    </p>
                  {:else}
                    <p class="text-sm font-semibold text-slate-900">
                      Direct Delivery
                    </p>
                    <p class="text-xs text-slate-500 font-light">
                      Loading coordinates...
                    </p>
                  {/if}

                  {#if appState.customerAddresses.length > 1}
                    <div class="pt-2">
                      <label
                        for="address-selector"
                        class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
                        >Select Delivery Coordinates</label
                      >
                      <select
                        id="address-selector"
                        bind:value={appState.selectedAddressId}
                        class="w-full text-base font-semibold text-slate-700 border-2 border-[#0aad0a] rounded-xl px-3 py-2.5 focus:border-[#003d29] focus:outline-none cursor-pointer transition-colors"
                      >
                        {#each appState.customerAddresses as addr (addr.id)}
                          <option value={addr.id}>
                            {addr.building_name && addr.building_name !== "N/A"
                              ? addr.building_name + " • "
                              : ""}
                            {addr.street || "Saved Location"} ({addr.city})
                          </option>
                        {/each}
                      </select>
                    </div>
                  {/if}
                {:else}
                  <p class="text-sm font-semibold text-slate-900">
                    No Shipping Address Saved
                  </p>
                  <a
                    href="/account/myaddress"
                    class="text-xs text-red-500 hover:underline"
                    >Register address coordinates in settings</a
                  >
                {/if}
              {:else if fulfillmentMode === "pickup"}
                <p class="text-sm font-semibold text-slate-900">
                  Post Office Smart Pickup
                </p>
                <p class="text-xs text-slate-500 font-light mb-1.5">
                  Hold safely at {appState.activeBranch}
                </p>

                <div class="pt-2">
                  <label
                    for="station-selector"
                    class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
                    >Select Pickup Station</label
                  >
                  <select
                    id="station-selector"
                    bind:value={appState.activeBranch}
                    class="w-full text-base font-semibold text-slate-700 border-2 border-[#0aad0a] rounded-xl px-3 py-2.5 focus:border-[#003d29] focus:outline-none cursor-pointer transition-colors"
                  >
                    {#each stations as station}
                      <option value={station.value}>{station.label}</option>
                    {/each}
                  </select>
                </div>
              {:else if fulfillmentMode === "shipping"}
                <div class="space-y-4 w-full">
                  <!-- International Destination Country Selector -->
                  <div class="space-y-1.5">
                    <label
                      for="shipping-dest-select"
                      class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                      >Destination Country</label
                    >
                    <select
                      id="shipping-dest-select"
                      bind:value={selectedShippingDestinationId}
                      class="w-full text-base font-semibold text-slate-700 bg-slate-50 border-2 border-[#0aad0a] rounded-xl px-3 py-2.5 focus:border-[#003d29] focus:outline-none cursor-pointer transition-colors"
                    >
                      <option value="" disabled
                        >Select destination country...</option
                      >
                      {#each appState.shippingCountries as country (country.id)}
                        <option value={country.id}>{country.label}</option>
                      {/each}
                    </select>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Receiver Name -->
                    <div
                      class="border border-slate-200 rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white"
                    >
                      <label
                        for="recv-name"
                        class="text-[11px] text-neutral-500 font-normal mb-0.5"
                        >Receiver Name</label
                      >
                      <input
                        id="recv-name"
                        type="text"
                        bind:value={receiverNameInput}
                        placeholder="John Doe"
                        class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                      />
                    </div>

                    <!-- Receiver Phone -->
                    <div
                      class="border border-slate-200 rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white"
                    >
                      <label
                        for="recv-phone"
                        class="text-[11px] text-neutral-500 font-normal mb-0.5"
                        >Receiver Phone</label
                      >
                      <input
                        id="recv-phone"
                        type="text"
                        bind:value={receiverPhoneInput}
                        placeholder="+1 555-0199"
                        class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                      />
                    </div>
                  </div>

                  <!-- Receiver Address -->
                  <div
                    class="border border-slate-200 rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white"
                  >
                    <label
                      for="recv-addr"
                      class="text-[11px] text-neutral-500 font-normal mb-0.5"
                      >Street Address</label
                    >
                    <input
                      id="recv-addr"
                      type="text"
                      bind:value={receiverAddressInput}
                      placeholder="123 Main St, Apt 4B"
                      class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                    />
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <!-- City -->
                    <div
                      class="border border-slate-200 rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white"
                    >
                      <label
                        for="recv-city"
                        class="text-[11px] text-neutral-500 font-normal mb-0.5"
                        >City</label
                      >
                      <input
                        id="recv-city"
                        type="text"
                        bind:value={receiverCityInput}
                        placeholder="New York"
                        class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                      />
                    </div>

                    <!-- State / Region -->
                    <div
                      class="border border-slate-200 rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white"
                    >
                      <label
                        for="recv-state"
                        class="text-[11px] text-neutral-500 font-normal mb-0.5"
                        >State / Region</label
                      >
                      <input
                        id="recv-state"
                        type="text"
                        bind:value={receiverStateInput}
                        placeholder="NY"
                        class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                      />
                    </div>

                    <!-- Zip Code -->
                    <div
                      class="border border-slate-200 rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white"
                    >
                      <label
                        for="recv-zip"
                        class="text-[11px] text-neutral-500 font-normal mb-0.5"
                        >Zip / Postal Code</label
                      >
                      <input
                        id="recv-zip"
                        type="text"
                        bind:value={receiverZipInput}
                        placeholder="10001"
                        class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                      />
                    </div>
                  </div>

                  <!-- Shipping Notes -->
                  <div
                    class="border border-slate-200 rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white"
                  >
                    <label
                      for="recv-notes"
                      class="text-[11px] text-neutral-500 font-normal mb-0.5"
                      >Shipping Notes</label
                    >
                    <textarea
                      id="recv-notes"
                      bind:value={shippingNotesInput}
                      placeholder="Special instructions for customs or international delivery..."
                      rows="2"
                      class="outline-none text-[13px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal resize-none"
                    ></textarea>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Payment Selection -->
        <div class="rounded-2xl p-6 bg-white space-y-4">
          <div
            class="flex items-center justify-between border-b border-slate-100 pb-3"
          >
            <h3
              class="text-xs font-black text-slate-400 uppercase tracking-widest"
            >
              Pay with
            </h3>
          </div>

          <div
            class="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0 w-full select-none"
          >
            <button
              type="button"
              onclick={() => (paymentType = "momo")}
              class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all focus:outline-none cursor-pointer
                {paymentType === 'momo'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'}"
            >
              Mobile Money
            </button>
            <button
              type="button"
              onclick={() => (paymentType = "card")}
              class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all focus:outline-none cursor-pointer
                {paymentType === 'card'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'}"
            >
              Debit / Credit Card
            </button>
          </div>

          {#if paymentType === "momo"}
            <div class="space-y-4 animate-in fade-in duration-200">
              <div class="grid sm:grid-cols-2  gap-3 select-none">
                <button
                  type="button"
                  onclick={() => (paymentProvider = "mtn")}
                  class="p-3.5 rounded-xl border-2 transition-all flex items-center justify-between focus:outline-none text-left cursor-pointer
                    {paymentProvider === 'mtn'
                    ? 'border-[#0aad0a]'
                    : 'border-gray-200 bg-white hover:border-gray-300'}"
                  style={paymentProvider === "mtn"
                    ? "background: #EAF7E9;"
                    : ""}
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="w-8 h-6 bg-[#FFCC00] rounded-md flex items-center justify-center text-[9px] font-black text-gray-950"
                      >momo</span
                    >
                    <span class="text-[13px] font-bold text-gray-900"
                      >MTN MoMo</span
                    >
                  </div>
                  <div
                    class="w-4 h-4 rounded-full border flex items-center justify-center {paymentProvider ===
                    'mtn'
                      ? 'border-[#0aad0a]'
                      : 'border-gray-300'}"
                  >
                    {#if paymentProvider === "mtn"}
                      <div class="w-2 h-2 rounded-full bg-[#0aad0a]"></div>
                    {/if}
                  </div>
                </button>

                <button
                  type="button"
                  onclick={() => (paymentProvider = "airtel")}
                  class="p-3.5 rounded-xl border-2 transition-all flex items-center justify-between focus:outline-none text-left cursor-pointer
                    {paymentProvider === 'airtel'
                    ? 'border-[#0aad0a]'
                    : 'border-gray-200 bg-white hover:border-gray-300'}"
                  style={paymentProvider === "airtel"
                    ? "background: #EAF7E9;"
                    : ""}
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="w-8 h-6 bg-[#E11900] rounded-md flex items-center justify-center text-[9px] font-black text-white"
                      >airtel</span
                    >
                    <span class="text-[13px] font-bold text-gray-900"
                      >Airtel Money</span
                    >
                  </div>
                  <div
                    class="w-4 h-4 rounded-full border flex items-center justify-center {paymentProvider ===
                    'airtel'
                      ? 'border-[#0aad0a]'
                      : 'border-gray-300'}"
                  >
                    {#if paymentProvider === "airtel"}
                      <div class="w-2 h-2 rounded-full bg-[#0aad0a]"></div>
                    {/if}
                  </div>
                </button>
              </div>

              <div
                class="border rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white transition-colors
                  {phoneNumberInput.length > 0 && !isMomoValid
                  ? 'border-rose-500 focus-within:border-rose-500'
                  : 'border-gray-300 focus-within:border-[#0aad0a]'}"
              >
                <label
                  for="payment-phone"
                  class="text-[11px] text-gray-500 font-medium select-none mb-0.5"
                  >Mobile Wallet Phone Number</label
                >
                <input
                  type="text"
                  id="payment-phone"
                  bind:value={phoneNumberInput}
                  placeholder="+256 772 123456"
                  class="outline-none text-[14px] text-gray-800 bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal font-medium"
                />
              </div>
            </div>
          {:else}
            <div class="space-y-4 animate-in fade-in duration-200">
              <div
                class="border rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white transition-colors
                {cardNo.length > 0 && !isCardNoValid
                  ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500'
                  : 'border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-[#1a1a1a]'}"
              >
                <label
                  for="card-no"
                  class="text-[11px] text-neutral-500 font-normal select-none mb-0.5"
                  >Card Number</label
                >
                <input
                  type="text"
                  id="card-no"
                  value={cardNo}
                  oninput={handleCardInput}
                  placeholder="0000 0000 0000 0000"
                  class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal font-mono text-xs"
                />
              </div>

              <div class="grid sm:grid-cols-2 gap-3">
                <div
                  class="border rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white transition-colors
                  {cardExpiry.length > 0 && !isExpiryValid
                    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500'
                    : 'border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-[#1a1a1a]'}"
                >
                  <label
                    for="card-expiry"
                    class="text-[11px] text-neutral-500 font-normal select-none mb-0.5"
                    >Expiry Date</label
                  >
                  <input
                    type="text"
                    id="card-expiry"
                    value={cardExpiry}
                    oninput={handleExpiryInput}
                    placeholder="MM/YY"
                    class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal font-mono text-xs"
                  />
                </div>

                <div
                  class="border rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white transition-colors
                  {cardCvv.length > 0 && !isCvvValid
                    ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500'
                    : 'border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-[#1a1a1a]'}"
                >
                  <label
                    for="card-cvv"
                    class="text-[11px] text-neutral-500 font-normal select-none mb-0.5"
                    >Security Code (CVV)</label
                  >
                  <input
                    type="text"
                    id="card-cvv"
                    value={cardCvv}
                    oninput={handleCvvInput}
                    placeholder="123"
                    class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          {/if}
        </div>

        <div class="rounded-2xl p-6 bg-white space-y-4">
          <div class="border-b border-slate-100 pb-3">
            <h3
              class="text-xs font-black text-slate-400 uppercase tracking-widest"
            >
              Your Items ({appState.cartCount})
            </h3>
          </div>
          <div class="divide-y divide-slate-100">
            {#each appState.cartItems as item (item.product.id)}
              <CartProductCard {item} {adjustQuantity} />
            {/each}
          </div>
        </div>
      </div>

      <!-- DESKTOP SUMMARY CARD (HIDDEN ON MOBILE) -->
      <div class="hidden lg:block lg:col-span-4 h-fit lg:sticky lg:top-24">
        <div class="rounded-2xl p-6 bg-white space-y-5 shadow-xs">
          <h4
            class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3"
          >
            Summary
          </h4>

          <div class="space-y-2.5 text-xs text-slate-500">
            <div class="flex justify-between">
              <span>Items cost</span>
              <span class="text-slate-900 font-bold"
                >{subtotal.toLocaleString()} UGX</span
              >
            </div>

            <div class="flex justify-between items-center">
              <span>Delivery fee</span>
              {#if shippingFee === 0}
                <span class="text-emerald-700 font-bold">Free</span>
              {:else}
                <span class="text-slate-900 font-bold"
                  >+{shippingFee.toLocaleString()} UGX</span
                >
              {/if}
            </div>
          </div>

          <div
            class="border-t border-slate-200 pt-4 flex justify-between items-baseline"
          >
            <span class="text-xs font-bold text-slate-900">Subtotal</span>
            <span class="text-lg font-extrabold text-slate-900">
              {Math.max(0, total).toLocaleString()} UGX
            </span>
          </div>

          <button
            onclick={processOrder}
            disabled={isPlaceOrderDisabled}
            class="w-full bg-[#0aad0a] hover:bg-[#099409] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs h-11 rounded-full flex items-center justify-center transition-all shadow-md focus:outline-none cursor-pointer"
          >
            Place Order
          </button>

          <p class="text-[10px] text-slate-400 leading-normal text-center">
            By completing checkout, you authorize ePosta package logistics
            coordinates.
          </p>
        </div>
      </div>
    </div>

    <!-- MOBILE FLOATING BOTTOM BAR -->
    <div
      class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-40 px-5 py-3 pb-safe"
    >
      <div class="flex items-center justify-between gap-4">
        <button
          type="button"
          onclick={() => (isMobileSummaryOpen = true)}
          class="flex flex-col text-left focus:outline-none"
        >
          <span
            class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"
          >
            Subtotal
            <svg
              class="w-3 h-3 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </span>
          <span class="text-base font-extrabold text-slate-900">
            {Math.max(0, total).toLocaleString()} UGX
          </span>
        </button>

        <button
          onclick={() => (isMobileSummaryOpen = true)}
          class="flex-1 max-w-[180px] bg-[#0aad0a] hover:bg-[#099409] text-white font-extrabold text-xs h-11 rounded-full flex items-center justify-center transition-all shadow-md focus:outline-none cursor-pointer"
        >
          Pay
        </button>
      </div>
    </div>

    <!-- MOBILE EXPANDABLE BOTTOM DRAWER -->
    {#if isMobileSummaryOpen}
      <!-- Backdrop overlay -->
      <button
        class="lg:hidden fixed inset-0 bg-black/40 z-45 transition-opacity duration-300 border-0 cursor-default w-full text-left p-0"
        onclick={() => (isMobileSummaryOpen = false)}
        aria-label="Close summary"
      ></button>
    {/if}

    <div
      class="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl border-t border-slate-200 shadow-[0_-15px_30px_rgba(0,0,0,0.12)] z-50 transition-transform duration-300 transform max-h-[85vh] flex flex-col
        {isMobileSummaryOpen ? 'translate-y-0' : 'translate-y-full'}"
    >
      <!-- Drawer Header -->
      <div
        class="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100 shrink-0"
      >
        <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">
          Order Summary
        </h4>
        <button
          type="button"
          onclick={() => (isMobileSummaryOpen = false)}
          class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors focus:outline-none"
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
      </div>

      <!-- Drawer Body Content -->
      <div class="px-6 py-4 space-y-4 overflow-y-auto">
        <div class="space-y-2.5 text-xs text-slate-500">
          <div class="flex justify-between">
            <span>Items cost</span>
            <span class="text-slate-900 font-bold"
              >{subtotal.toLocaleString()} UGX</span
            >
          </div>

          <div class="flex justify-between items-center">
            <span>Delivery fee</span>
            {#if shippingFee === 0}
              <span class="text-emerald-700 font-bold">Free</span>
            {:else}
              <span class="text-slate-900 font-bold"
                >+{shippingFee.toLocaleString()} UGX</span
              >
            {/if}
          </div>
        </div>

        <!-- Form Completion Helper (Inside the Drawer if fields are missing) -->
        {#if isPlaceOrderDisabled && appState.cartItems.length > 0}
          <div
            class="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 space-y-1"
          >
            <p class="font-bold flex items-center gap-1">
              <svg
                class="w-3.5 h-3.5 shrink-0 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              Details needed before placing order:
            </p>
            <ul class="list-disc list-inside space-y-0.5 text-amber-700">
              {#if fulfillmentMode === "delivery" && (appState.customerAddresses.length === 0 || !appState.selectedAddressId)}
                <li>Please select or register a delivery address</li>
              {/if}
              {#if fulfillmentMode === "shipping" && (!selectedShippingDestinationId || !receiverNameInput.trim() || !receiverAddressInput.trim() || !receiverPhoneInput.trim() || !receiverCityInput.trim() || !receiverStateInput.trim() || !receiverZipInput.trim())}
                <li>Please complete international receiver details</li>
              {/if}
              {#if paymentType === "card" && !isCardFormValid}
                <li>Please enter a valid credit card</li>
              {/if}
              {#if paymentType === "momo" && !isMomoValid}
                <li>Please enter a valid mobile number</li>
              {/if}
            </ul>
          </div>
        {/if}

        <div
          class="border-t border-slate-200 pt-4 flex justify-between items-baseline"
        >
          <span class="text-xs font-bold text-slate-900">Subtotal</span>
          <span class="text-lg font-extrabold text-slate-900">
            {Math.max(0, total).toLocaleString()} UGX
          </span>
        </div>
      </div>

      <!-- Drawer Footer Action -->
      <div class="p-6 pt-0 shrink-0 border-t border-slate-100">
        <button
          onclick={() => {
            isMobileSummaryOpen = false;
            processOrder();
          }}
          disabled={isPlaceOrderDisabled}
          class="w-full bg-[#0aad0a] hover:bg-[#099409] disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs h-11 rounded-full flex items-center justify-center transition-all shadow-md focus:outline-none cursor-pointer"
        >
          Confirm & Place Order
        </button>
        <p class="text-[10px] text-slate-400 leading-normal text-center mt-3">
          By completing checkout, you authorize ePosta package logistics
          coordinates.
        </p>
      </div>
    </div>
  {/if}
</div>