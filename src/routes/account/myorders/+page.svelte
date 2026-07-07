<!-- routes/account/myorders/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import Header from "$lib/components/templates/settings/header.svelte";
  import { appState } from "$lib/state.svelte.js";
  import { resolveImageUrl } from "$lib/utils/mappers.js";
  import { publicApi } from "$lib/config/api.js";

  const ACCENT = "#0aad0a";

  onMount(() => {
    appState.fetchOrders();
    appState.fetchProducts();
  });

  // Which order row is expanded to show full detail, if any
  let expandedOrderId = $state(null);
  // Which order is currently shown in the Track Order modal, if any
  let trackingOrder = $state(null);
  // Detailed tracking log entries from GET /api/v1/orders/track
  let trackingLogs = $state([]);
  // Loading status spinner state inside the modal
  let isFetchingTracking = $state(false);

  function toggleExpand(orderId) {
    expandedOrderId = expandedOrderId === orderId ? null : orderId;
  }

  // Fetches tracking logs from /api/v1/orders/track using order reference
  async function openTracking(order, e) {
    e?.stopPropagation();
    trackingOrder = order;
    trackingLogs = [];
    isFetchingTracking = true;

    try {
      const res = await publicApi.get("orders/track", {
        params: { reference: order.reference }
      });
      const data = res.data !== undefined ? res.data : res;
      
      // Map TrackingLog[] directly from API response wrapper
      trackingLogs = data.logs || data.content || data.data || (Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("[Tracking API] Failed to fetch live tracking logs:", err);
      // Fallback: populate initial log entry using current order parameters
      trackingLogs = [
        {
          id: "m-initial",
          status: "ORDER_PLACED",
          notes: "Your request has been routed to Posta logistics coordinates.",
          createdAt: order.date || new Date().toISOString()
        }
      ];
    } finally {
      isFetchingTracking = false;
    }
  }

  function closeTracking() {
    trackingOrder = null;
    trackingLogs = [];
  }

  // Maps backend status strings to styled pills
  function status(statusVal) {
    const s = (statusVal || "PENDING").toLowerCase();
    const label = statusVal
      ? statusVal.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Pending";

    if (
      s.includes("fulfilled") ||
      s.includes("confirmed") ||
      s.includes("successful") ||
      s.includes("received")
    ) {
      return {
        type: "confirmed",
        label,
        dot: "bg-[#0B8A00]",
        text: "text-[#0B8A00]",
        bg: "bg-[#EAF7E9]",
      };
    }
    if (s.includes("cancel") || s.includes("fail") || s.includes("reject")) {
      return {
        type: "cancelled",
        label,
        dot: "bg-rose-600",
        text: "text-rose-700",
        bg: "bg-rose-50",
      };
    }
    return {
      type: "inprogress",
      label,
      dot: "bg-amber-500",
      text: "text-amber-700",
      bg: "bg-amber-50",
    };
  }

  // Derives the 3-stage tracking state shown in the modal
  function trackingStages(order) {
    const s = (order?.status || "").toLowerCase();
    const cancelled =
      s.includes("cancel") || s.includes("fail") || s.includes("reject");
    const confirmed =
      s.includes("fulfilled") ||
      s.includes("confirmed") ||
      s.includes("successful") ||
      s.includes("received");
    return { cancelled, confirmed, pending: !cancelled && !confirmed };
  }

  // Resolves item images defensively
  function getProductImage(productImage) {
    if (productImage) {
      return resolveImageUrl(productImage);
    }
    return "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&q=80";
  }

  // Parses payment method type from notes metadata
  function getPaymentMethod(notes) {
    if (!notes) return "Mobile Wallet";
    const n = notes.toLowerCase();
    if (n.includes("momo")) return "MTN MoMo";
    if (n.includes("airtel")) return "Airtel Money";
    if (n.includes("card")) return "Debit / Credit Card";
    return "Counter Branch Payment";
  }

  async function handleCancel(orderId, e) {
    e?.stopPropagation();
    await appState.cancelOrder(orderId);
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
  <link
    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div
  class="max-w-4xl text-gray-900 py-6 select-none flex flex-col gap-7"
  style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;"
>
  <div class="pb-1">
    <Header
      header="Order history"
      description="Keep track of your current active deliveries and view your past orders."
    />
  </div>

  {#if appState.mappedOrders.length === 0}
    <div class="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
      <div class="w-32 h-32 relative mb-6">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="w-full h-full"
        >
          <circle cx="50" cy="50" r="45" fill="#F7F7F5" />
          <circle cx="50" cy="50" r="30" fill="#EFEFEA" />
          <g transform="translate(10, 10)">
            <circle
              cx="45"
              cy="35"
              r="16"
              stroke="#111827"
              stroke-width="4.5"
              fill="#ffffff"
            />
            <path
              d="M34 44L22 56"
              stroke="#111827"
              stroke-width="5"
              stroke-linecap="round"
            />
          </g>
        </svg>
      </div>
      <h3 class="text-[17px] font-extrabold text-gray-900 tracking-tight">
        Your order history is empty
      </h3>
      <p class="text-sm text-gray-500 mt-2 leading-relaxed">
        Current and past orders will appear here so you can track your packages.
      </p>
    </div>
  {:else}
    <!-- Table shell -->
    <div class="border border-gray-200 bg-white rounded-[20px] overflow-hidden">
      <!-- Column header, desktop only -->
      <div
        class="hidden sm:grid sm:grid-cols-[1fr_130px_140px_120px_150px] gap-4 px-6 py-3 bg-gray-50/70 border-b border-gray-100"
      >
        <span class="text-[11.5px] font-bold text-gray-400 tracking-wide">Order</span>
        <span class="text-[11.5px] font-bold text-gray-400 tracking-wide">Date</span>
        <span class="text-[11.5px] font-bold text-gray-400 tracking-wide">Status</span>
        <span class="text-[11.5px] font-bold text-gray-400 tracking-wide text-right">Total</span>
        <span></span>
      </div>

      <div class="divide-y divide-gray-100">
        {#each appState.mappedOrders as order, index (order?.id || order?.reference || index)}
          {@const statusConf = status(order?.status)}
          {@const isExpanded = expandedOrderId === (order.id ?? index)}
          {@const itemCount = order?.order_items?.length || 0}

          <div>
            <!-- Row summary: click to expand -->
            <button
              onclick={() => toggleExpand(order.id ?? index)}
              class="w-full text-left grid grid-cols-1 sm:grid-cols-[1fr_130px_140px_120px_150px] gap-2 sm:gap-4 sm:items-center px-6 py-4 hover:bg-gray-50/60 transition-colors focus:outline-none cursor-pointer {isExpanded
                ? 'bg-gray-50/60'
                : ''}"
            >
              <!-- Order / items -->
              <div class="flex items-center justify-between sm:block min-w-0">
                <div class="min-w-0">
                  <p class="text-[14.5px] font-extrabold text-gray-900 truncate">
                    {order.reference}
                  </p>
                  <p class="text-[12px] text-gray-500 font-medium sm:hidden">
                    {order.date
                      ? new Date(order.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Recently"} · {itemCount} item{itemCount === 1 ? "" : "s"}
                  </p>
                  <p class="hidden sm:block text-[12px] text-gray-500 font-medium">
                    {itemCount} item{itemCount === 1 ? "" : "s"}
                  </p>
                </div>
                <svg
                  class="w-4 h-4 text-gray-400 shrink-0 sm:hidden transition-transform {isExpanded
                    ? 'rotate-180'
                    : ''}"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <!-- Date, desktop -->
              <div class="hidden sm:block text-[13px] text-gray-500 font-medium">
                {order.date
                  ? new Date(order.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Recently"}
              </div>

              <!-- Status -->
              <div class="flex sm:block">
                <span class="{statusConf.bg} inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-3 py-1.5">
                  <span class="w-1.5 h-1.5 rounded-full {statusConf.dot}"></span>
                  <span class="{statusConf.text} text-[12px] font-bold whitespace-nowrap">{statusConf.label}</span>
                </span>
              </div>

              <!-- Total -->
              <div class="text-left sm:text-right">
                <span class="text-[14.5px] font-extrabold text-gray-900">{Number(order.total_amount).toLocaleString()} UGX</span>
              </div>

              <!-- Actions: track + chevron (desktop) -->
              <div class="flex items-center justify-start sm:justify-end gap-3">
                <div
                  onclick={(e) => openTracking(order, e)}
                  class="text-[12.5px] font-bold hover:underline focus:outline-none cursor-pointer"
                  style="color: {ACCENT};"
                >
                  Track order
                </div>
                <svg
                  class="hidden sm:block w-4 h-4 text-gray-400 shrink-0 transition-transform {isExpanded
                    ? 'rotate-180'
                    : ''}"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            <!-- Expanded detail -->
            {#if isExpanded}
              <div class="px-6 pb-6 pt-1 bg-gray-50/40 border-t border-gray-100 animate-in fade-in duration-150">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                  <!-- Left: items breakdown -->
                  <div class="bg-white border border-gray-100 rounded-2xl p-4">
                    <p class="text-[12.5px] font-bold text-gray-500 mb-2">Items</p>
                    <div class="flex flex-col divide-y divide-gray-100">
                      {#each order?.order_items || [] as item, itemIndex (item?.id || item?.product_id || itemIndex)}
                        {@const price = Number(item.price || 0)}
                        <div class="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                          <div class="flex items-center gap-3 min-w-0">
                            <div class="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                              <img
                                src={getProductImage(item.product_image)}
                                alt={item.product_name}
                                class="w-full h-full object-cover animate-in fade-in"
                              />
                            </div>
                            <div class="min-w-0">
                              <h4 class="text-[13.5px] font-bold text-gray-900 leading-snug line-clamp-1">
                                {item.product_name}
                              </h4>
                              <p class="text-[12px] text-gray-500 font-medium mt-0.5">
                                Qty {item.quantity} · {price > 0
                                  ? price.toLocaleString() + " UGX each"
                                  : "Resolving price..."}
                              </p>
                            </div>
                          </div>
                          <span class="text-[13.5px] font-extrabold text-gray-900 shrink-0">
                            {Number(item.total || 0).toLocaleString()} UGX
                          </span>
                        </div>
                      {/each}
                    </div>
                  </div>

                  <!-- Right: fulfillment, payment, and actions -->
                  <div class="flex flex-col gap-3">
                    <div class="bg-white border border-gray-100 p-4 rounded-2xl">
                      <p class="text-[14px] font-bold text-gray-900">
                        {order.delivery_method === "DOOR_DELIVERY"
                          ? "Alternative Home Courier"
                          : "Smart Post Office Pickup"}
                      </p>
                      {#if order.delivery_fees > 0}
                        <p class="text-[12.5px] text-gray-500 font-medium mt-0.5">
                          +{order.delivery_fees.toLocaleString()} UGX delivery postage
                        </p>
                      {:else}
                        <p class="text-[12.5px] font-bold mt-0.5" style="color: #0B8A00;">
                          Free branch pickup
                        </p>
                      {/if}
                    </div>

                    <div class="bg-white border border-gray-100 p-4 rounded-2xl">
                      <p class="text-[14px] font-bold text-gray-900">
                        {getPaymentMethod(order.notes)}
                      </p>
                      {#if order.notes}
                        <p class="text-[12.5px] text-gray-500 font-medium mt-0.5 leading-normal line-clamp-2">
                          {order.notes}
                        </p>
                      {:else}
                        <p class="text-[12.5px] text-gray-500 font-medium mt-0.5">
                          Payment method on file
                        </p>
                      {/if}
                    </div>

                    <div class="flex items-center justify-between pt-1 mt-auto">
                      {#if order.status === "PENDING" || order.status === "pending_payment" || order.status === "pending"}
                        <button
                          onclick={(e) => handleCancel(order.id, e)}
                          class="text-[13px] font-bold text-rose-600 hover:text-rose-700 hover:underline focus:outline-none cursor-pointer"
                        >
                          Cancel order
                        </button>
                      {:else}
                        <span class="text-[13px] font-bold text-gray-400">
                          {order.delivery_method === "DOOR_DELIVERY"
                            ? "Home Courier"
                            : "GPO Station"}
                        </span>
                      {/if}

                      <button
                        onclick={(e) => openTracking(order, e)}
                        class="text-[13px] font-bold hover:underline focus:outline-none cursor-pointer"
                        style="color: {ACCENT};"
                      >
                        Track order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- Track Order modal -->
{#if trackingOrder}
  {@const st = trackingStages(trackingOrder)}
  {@const rowStatus = status(trackingOrder.status)}

  <div
    class="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center p-4"
    style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;"
  >
    <div
      class="absolute inset-0"
      onclick={closeTracking}
      aria-hidden="true"
    ></div>

    <div
      class="bg-white rounded-[24px] max-w-sm w-full p-6 relative shadow-xl z-10 flex flex-col gap-5 animate-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto"
    >
      <button
        onclick={closeTracking}
        class="absolute top-5 right-5 text-gray-400 hover:text-gray-700 focus:outline-none cursor-pointer"
        aria-label="Close"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div class="pr-6">
        <h3 class="text-[17px] font-extrabold text-gray-900 tracking-tight">Track order</h3>
        <p class="text-[12.5px] text-gray-500 font-medium mt-0.5">{trackingOrder.reference}</p>
      </div>

      <!-- Macro Stage Tracker -->
      <div class="space-y-4 border-b border-gray-100 pb-4">
        <!-- Stage 1 -->
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-[#0aad0a] text-white">1</div>
          <div>
            <p class="text-[13px] font-bold text-gray-900">Order placed</p>
            <p class="text-[11px] text-gray-400">We've received your order.</p>
          </div>
        </div>

        <!-- Stage 2 -->
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
            {st.cancelled
              ? 'bg-rose-600 text-white'
              : st.confirmed
                ? 'bg-[#0aad0a] text-white'
                : 'bg-amber-400 text-gray-950 animate-pulse'}"
          >
            {#if st.cancelled}✕{:else}2{/if}
          </div>
          <div>
            <p class="text-[13px] font-bold text-gray-900">{st.cancelled ? "Order cancelled" : "Order confirmed"}</p>
            <p class="text-[11px] text-gray-400">
              {st.cancelled
                ? "This order will not be processed further."
                : st.confirmed
                  ? "Payment verified and order accepted."
                  : "Awaiting confirmation."}
            </p>
          </div>
        </div>

        <!-- Stage 3 -->
        <div class="flex items-center gap-3">
          <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
            {st.confirmed ? 'bg-[#0aad0a] text-white' : 'bg-gray-100 text-gray-400'}">3</div>
          <div>
            <p class="text-[13px] font-bold text-gray-900">
              {trackingOrder.delivery_method === "DOOR_DELIVERY"
                ? "Out for delivery"
                : "Ready for pickup"}
            </p>
            <p class="text-[11px] text-gray-400">
              {st.confirmed
                ? "On its way to you."
                : "Will update once confirmed."}
            </p>
          </div>
        </div>
      </div>

      <!-- MICRO-TIMELINE POLLING ACTIVITY LOG -->
      <div class="space-y-3">
        <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-wider px-1">Detailed Timeline</h4>

        {#if isFetchingTracking}
          <div class="flex flex-col items-center justify-center py-6 gap-2">
            <div class="w-6 h-6 rounded-full border-2 border-slate-200 border-t-[#0aad0a] animate-spin"></div>
            <span class="text-[11px] text-gray-400 font-medium">Fetching real-time logs...</span>
          </div>
        {:else if trackingLogs.length === 0}
          <p class="text-xs text-gray-400 text-center py-6 font-light">No tracking events logged yet.</p>
        {:else}
          <!-- Vertical Timeline -->
          <div class="relative border-l border-gray-200 ml-3 pl-6 space-y-5 max-h-48 overflow-y-auto pr-1">
            {#each trackingLogs as log, index (log.id || index)}
              {@const isFirst = index === 0}
              <div class="relative">
                <!-- Timeline circle marker -->
                <span class="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-white 
                  {isFirst ? 'bg-[#0aad0a] ring-4 ring-emerald-100' : 'bg-gray-300'}"></span>
                
                <div class="flex flex-col gap-0.5">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-gray-900 tracking-tight">
                      {log.status ? log.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Status Updated"}
                    </span>
                    <span class="text-[10px] text-gray-400 font-mono font-normal">
                      {log.createdAt ? new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  <p class="text-[11.5px] text-gray-500 font-light leading-normal mt-0.5">
                    {log.notes || "Status transition verified."}
                  </p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Summary Info -->
      <div class="flex items-center justify-between border-t border-gray-100 pt-4">
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full {rowStatus.bg}">
          <span class="w-1.5 h-1.5 rounded-full {rowStatus.dot}"></span>
          <span class="{rowStatus.text} text-[11.5px] font-bold">{rowStatus.label}</span>
        </div>
        <button
          onclick={closeTracking}
          class="bg-gray-900 hover:bg-black text-white text-[12px] font-bold px-4 py-2 rounded-xl transition-all focus:outline-none cursor-pointer"
        >
          Close Log
        </button>
      </div>
    </div>
  </div>
{/if}