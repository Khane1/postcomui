<!-- routes/account/myorders/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import Header from "$lib/components/templates/settings/header.svelte";
  import { appState } from "$lib/state.svelte.js";
  import { resolveImageUrl } from "$lib/utils/mappers.js";

  onMount(() => {
    appState.fetchOrders();
    appState.fetchProducts();
  });

  // Maps backend status strings to styled pills
  function status(statusVal) {
    const s = (statusVal || "PENDING").toLowerCase();
    const label = statusVal ? statusVal.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Pending";

    if (s.includes("fulfilled") || s.includes("confirmed") || s.includes("successful") || s.includes("received")) {
      return { type: "confirmed", label, dot: "bg-[#0B8A00]", text: "text-[#0B8A00]", bg: "bg-[#EAF7E9]" };
    }
    if (s.includes("cancel") || s.includes("fail") || s.includes("reject")) {
      return { type: "cancelled", label, dot: "bg-rose-600", text: "text-rose-700", bg: "bg-rose-50" };
    }
    return { type: "inprogress", label, dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" };
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

  async function handleCancel(orderId) {
    await appState.cancelOrder(orderId);
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet" />
</svelte:head>

<div class="max-w-2xl text-gray-900 py-6 select-none flex flex-col gap-7" style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;">
  <div class="pb-1">
    <Header
      header="Order history"
      description="Keep track of your current active deliveries and view your past orders."
    />
  </div>

  {#if appState.mappedOrders.length === 0}
    <div class="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
      <div class="w-32 h-32 relative mb-6">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="#F7F7F5" />
          <circle cx="50" cy="50" r="30" fill="#EFEFEA" />
          <g transform="translate(10, 10)">
            <circle cx="45" cy="35" r="16" stroke="#111827" stroke-width="4.5" fill="#ffffff" />
            <path d="M34 44L22 56" stroke="#111827" stroke-width="5" stroke-linecap="round" />
          </g>
        </svg>
      </div>
      <h3 class="text-[17px] font-extrabold text-gray-900 tracking-tight">Your order history is empty</h3>
      <p class="text-sm text-gray-500 mt-2 leading-relaxed">
        Current and past orders will appear here so you can track your packages.
      </p>
    </div>
  {:else}
    <div class="flex flex-col gap-5 animate-in fade-in duration-200">
      {#each appState.mappedOrders as order, index (order?.id || order?.reference || index)}
        {@const statusConf = status(order?.status)}
        <div class="border border-gray-200 bg-white rounded-[20px] p-6 flex flex-col gap-5 transition-shadow hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)]">

          <!-- Card Header: mirrors the "name / subtitle" pattern with a status badge in the avatar slot -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex flex-col gap-0.5 min-w-0">
              <h3 class="text-[16px] font-extrabold text-gray-900 tracking-tight truncate">
                {order.reference}
              </h3>
              <p class="text-[13px] text-gray-500 font-medium">
                Ordered {order.date ? new Date(order.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "recently"}
              </p>
            </div>

            <span class="{statusConf.bg} shrink-0 rounded-full pl-2.5 pr-3 py-1.5 inline-flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full {statusConf.dot}"></span>
              <span class="{statusConf.text} text-[12px] font-bold whitespace-nowrap">{statusConf.label}</span>
            </span>
          </div>

          <!-- Items Breakdown -->
          <div class="flex flex-col divide-y divide-gray-100">
            {#each order?.order_items || [] as item, itemIndex (item?.id || item?.product_id || itemIndex)}
              {@const price = Number(item.price || 0)}
              <div class="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div class="flex items-center gap-3.5 min-w-0">
                  <div class="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={getProductImage(item.product_image)}
                      alt={item.product_name}
                      class="w-full h-full object-cover animate-in fade-in"
                    />
                  </div>
                  <div class="min-w-0">
                    <h4 class="text-[14px] font-bold text-gray-900 leading-snug line-clamp-1">
                      {item.product_name}
                    </h4>
                    <p class="text-[12.5px] text-gray-500 font-medium mt-0.5">
                      Qty {item.quantity} · {price > 0 ? price.toLocaleString() + " UGX each" : "Resolving price..."}
                    </p>
                  </div>
                </div>
                <span class="text-[14px] font-extrabold text-gray-900 shrink-0">
                  {Number(item.total || 0).toLocaleString()} UGX
                </span>
              </div>
            {/each}
          </div>

          <!-- Fulfillment & Payment Meta Panel -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="bg-[#FAFAF8] border border-gray-100 p-4 rounded-2xl">
              <p class="text-[14px] font-bold text-gray-900">
                {order.delivery_method === "DOOR_DELIVERY" ? "Alternative Home Courier" : "Smart Post Office Pickup"}
              </p>
              {#if order.delivery_fees > 0}
                <p class="text-[12.5px] text-gray-500 font-medium mt-0.5">+{order.delivery_fees.toLocaleString()} UGX delivery postage</p>
              {:else}
                <p class="text-[12.5px] font-bold mt-0.5" style="color: #0B8A00;">Free branch pickup</p>
              {/if}
            </div>

            <div class="bg-[#FAFAF8] border border-gray-100 p-4 rounded-2xl">
              <p class="text-[14px] font-bold text-gray-900">
                {getPaymentMethod(order.notes)}
              </p>
              {#if order.notes}
                <p class="text-[12.5px] text-gray-500 font-medium mt-0.5 leading-normal line-clamp-2">
                  {order.notes}
                </p>
              {:else}
                <p class="text-[12.5px] text-gray-500 font-medium mt-0.5">Payment method on file</p>
              {/if}
            </div>
          </div>

          <!-- Bottom Summary Row: total mirrors the loyalty card's bold-primary treatment, cancel mirrors its green link -->
          <div class="flex items-center justify-between pt-1">
            {#if order.status === "PENDING" || order.status === "pending_payment" || order.status === "pending"}
              <button
                onclick={() => handleCancel(order.id)}
                class="text-[13px] font-bold text-rose-600 hover:text-rose-700 hover:underline focus:outline-none cursor-pointer"
              >
                Cancel order
              </button>
            {:else}
              <span class="text-[13px] font-bold text-gray-400">
                {order.delivery_method === "DOOR_DELIVERY" ? "Home Courier" : "GPO Station"}
              </span>
            {/if}

            <div class="text-right">
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Total</p>
              <p class="text-[17px] font-extrabold text-gray-900 leading-tight">{Number(order.total_amount).toLocaleString()} UGX</p>
            </div>
          </div>

        </div>
      {/each}
    </div>
  {/if}
</div>