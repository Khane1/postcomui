<script>
  let { item, adjustQuantity, iscart = true } = $props();

  const ACCENT = '#0aad0a';
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet" />
</svelte:head>

<div class="py-5 xl:flex xl:justify-between" style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;">
  <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center first:pt-0 last:pb-0 w-full">
    <div class="flex items-center gap-4 min-w-0 w-full">
      <div class="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
        <img
          src={item.product.images[0]}
          alt=""
          class="w-full h-full object-cover"
        />
      </div>

      <div class="min-w-0 w-full">
        <h4 class="text-[13.5px] md:text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 truncate max-w-[200px] sm:max-w-md">
          {item.product.name}
        </h4>
        <p class="text-[12.5px] text-gray-500 font-medium mt-0.5">
          By {item.product.seller} · {item.product.price.toLocaleString()} UGX each
        </p>
        <p class="text-[14px] md:text-[15px] font-extrabold text-gray-900 mt-1.5">
          {(item.product.price * item.quantity).toLocaleString()} UGX
        </p>
      </div>
    </div>

    {#if iscart}
      <div class="flex items-center gap-3 shrink-0">
        <div class="flex items-center border border-gray-300 rounded-full h-9 bg-white select-none overflow-hidden">
          <button
            onclick={() => adjustQuantity(item, -1)}
            aria-label={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
            class="w-9 h-full flex items-center justify-center font-extrabold text-lg hover:bg-gray-50 focus:outline-none transition-colors"
            style={item.quantity > 1 ? `color: ${ACCENT};` : 'color: #e11d48;'}
          >
            {#if item.quantity === 1}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 30 30"
                class="w-4 h-4 fill-current"
              >
                <path
                  d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"
                />
              </svg>
            {:else}
              −
            {/if}
          </button>
          <span class="px-1 min-w-[2rem] text-center text-[15px] font-extrabold text-gray-900">{item.quantity}</span>
          <button
            onclick={() => adjustQuantity(item, +1)}
            aria-label="Increase quantity"
            class="w-9 h-full flex items-center justify-center font-extrabold text-lg hover:bg-gray-50 focus:outline-none transition-colors"
            style="color: {ACCENT};"
          >
            +
          </button>
        </div>
      </div>
    {:else}
      <slot />
    {/if}
  </div>
</div>