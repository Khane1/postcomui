<!-- routes/account/paymentmethod/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { appState } from "$lib/state.svelte.js";

  // Wallet configurations stored locally to simulate saving/linking credentials
  let mtnWallet = $state("+256 772 123456");
  let airtelWallet = $state("+256 701 654321");
  
  // Modal controllers
  let isModalOpen = $state(false);
  let selectedMethod = $state(null);

  // Form Inputs
  let cardNo = $state("");
  let cardExpiry = $state("");
  let cardCvv = $state("");

  let momoNumberInput = $state("");
  let momoNameInput = $state("");

  let bankNameInput = $state("");
  let bankAccountInput = $state("");
  let bankHolderInput = $state("");

  // Trigger live pull on mount
  onMount(() => {
    appState.fetchPaymentMethods();
  });

  // Dynamic mapping: Safely resolves live APIs to exact UI rendering types
  let mergedMethods = $derived.by(() => {
    const live = appState.availablePaymentMethods;
    if (live.length === 0) {
      // Fallback presets while API is loading or offline
      return [
        { id: "card-preset", name: "Debit/Credit", subtitle: "Add a Visa, Mastercard, or local bank card", type: "card" },
        { id: "mtn-preset", name: "MTN MoMo", subtitle: mtnWallet ? `Active wallet: ${mtnWallet}` : "Configure mobile money wallet", type: "mtn" },
        { id: "airtel-preset", name: "Airtel Money", subtitle: airtelWallet ? `Active wallet: ${airtelWallet}` : "Configure mobile money wallet", type: "airtel" }
      ];
    }

    return live.map(method => {
      const nameLower = (method.name || "").toLowerCase();
      const typeLower = (method.type || method.code || "").toLowerCase();

      // Robust keyword checks covering standard Ugandan payment gateways
      let type = "MM"; // Default to mobile money as the standard Ugandan fallback
      let subtitle = "Configure mobile money wallet";

      if (nameLower.includes("mtn") || nameLower.includes("momo") || typeLower.includes("mtn") || typeLower.includes("momo")) {
        type = "mtn";
        subtitle = mtnWallet ? `Active wallet: ${mtnWallet}` : "Configure mobile money wallet";
      } else if (nameLower.includes("airtel") || typeLower.includes("airtel")) {
        type = "airtel";
        subtitle = airtelWallet ? `Active wallet: ${airtelWallet}` : "Configure mobile money wallet";
      } else if (nameLower.includes("card") || nameLower.includes("visa") || nameLower.includes("mastercard") || typeLower.includes("card")) {
        type = "card";
        subtitle = "Add a Visa, Mastercard, or local bank card";
      } else if (nameLower.includes("bank") || nameLower.includes("counter") || nameLower.includes("branch") || typeLower.includes("bank")) {
        type = "bank";
        subtitle = "Pay directly at your local postal branch";
      }

      return {
        id: method.id, // Real database UUID
        name: method.name,
        subtitle,
        type
      };
    });
  });

  function openModal(method) {
    selectedMethod = method;
    
    // Reset state
    cardNo = "";
    cardExpiry = "";
    cardCvv = "";
    
    // Safely pre-fill input values based on the mapped category
    if (method.type === "mtn" || method.type === "momo") {
      momoNumberInput = mtnWallet;
    } else if (method.type === "airtel") {
      momoNumberInput = airtelWallet;
    } else {
      momoNumberInput = "";
    }
    momoNameInput = "";

    bankNameInput = "";
    bankAccountInput = "";
    bankHolderInput = "";

    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    selectedMethod = null;
  }

  function isSaveDisabled() {
    if (!selectedMethod) return true;
    if (selectedMethod.type === 'card') {
      return !cardNo.trim() || !cardExpiry.trim() || !cardCvv.trim();
    }
    if (selectedMethod.type === 'mtn' || selectedMethod.type === 'airtel' || selectedMethod.type === 'momo') {
      return !momoNumberInput.trim();
    }
    if (selectedMethod.type === 'bank') {
      return !bankNameInput.trim() || !bankAccountInput.trim();
    }
    return true;
  }

  function savePaymentMethod() {
    if (isSaveDisabled()) return;

    if (selectedMethod.type === 'mtn' || selectedMethod.type === 'momo') {
      mtnWallet = momoNumberInput.trim();
      appState.addToast(`${selectedMethod.name} payment details updated.`);
    } else if (selectedMethod.type === 'airtel') {
      airtelWallet = momoNumberInput.trim();
      appState.addToast("Airtel Money payment details updated.");
    } else if (selectedMethod.type === 'card') {
      appState.addToast(`Card ending in ${cardNo.slice(-4) || 'xxxx'} linked successfully.`);
    } else if (selectedMethod.type === 'bank') {
      appState.addToast(`${bankNameInput} account configured.`);
    }

    closeModal();
  }
</script>

<div class="max-w-2xl text-slate-900 py-6">
  <!-- Section Title -->
  <h2 class="text-[22px] font-bold text-slate-900 tracking-tight mb-6">Add payment method</h2>

  <!-- Payment Methods Stack -->
  <div class="flex flex-col border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
    {#each mergedMethods as method (method.id)}
      <button 
        onclick={() => openModal(method)}
        class="w-full text-left flex items-center justify-between p-5 hover:bg-slate-50/80 focus:bg-slate-50/80 focus:outline-none transition-colors group cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <!-- Branded Icon Containers (Zero emojis) -->
          {#if method.type === 'card'}
            <div class="w-11 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shadow-xs">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 text-slate-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5A1.5 1.5 0 0018 9H6a1.5 1.5 0 00-1.5 1.5V21M3 21h18" />
              </svg>
            </div>
          {:else if method.type === 'mtn' || (method.type === 'MM' && method.name.toLowerCase().includes('mtn'))}
            <div class="w-11 h-8 bg-[#FFCC00] border border-[#E5B800] rounded-lg flex items-center justify-center shadow-xs select-none">
              <span class="text-[10px] font-black text-[#1a1a1a] tracking-tight">momo</span>
            </div>
          {:else if method.type === 'airtel' || (method.type === 'MM' && method.name.toLowerCase().includes('airtel'))}
            <div class="w-11 h-8 bg-[#E11900] border border-[#B81400] rounded-lg flex items-center justify-center shadow-xs select-none">
              <span class="text-[10px] font-black text-white tracking-tight">airtel</span>
            </div>
          {:else if method.type === 'MM'}
            <!-- Generic Mobile Money -->
            <div class="w-11 h-8 bg-black border border-slate-500 rounded-lg flex items-center justify-center shadow-xs select-none">
              <span class="text-[10px] font-black text-white tracking-tight">Mobile</span>
            </div>
          {:else}
            <div class="w-11 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shadow-xs">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="w-5 h-5 text-slate-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5A1.5 1.5 0 0018 9H6a1.5 1.5 0 00-1.5 1.5V21M3 21h18" />
              </svg>
            </div>
          {/if}

          <!-- Method Name & Description -->
          <div class="flex flex-col">
            <span class="text-[15px] font-semibold text-slate-900">{method.name}</span>
            <span class="text-[12px] text-slate-500 font-light mt-0.5">{method.subtitle}</span>
          </div>
        </div>

        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-800 transition-colors mr-1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    {/each}
  </div>
</div>

<!-- Input Dialog Modal -->
{#if isModalOpen && selectedMethod}
  <div class="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 transition-opacity">
    <div class="absolute inset-0" onclick={closeModal} aria-hidden="true"></div>

    <div class="bg-white rounded-[28px] w-full max-w-md p-6 relative shadow-xl z-10 flex flex-col gap-5">
      <button onclick={closeModal} class="absolute top-6 left-6 text-slate-800 hover:text-slate-600 focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 class="text-xl font-bold text-center text-slate-900 mt-2">Configure {selectedMethod.name}</h2>

      <div class="flex flex-col gap-4">
        {#if selectedMethod.type === 'card'}
          <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col transition-shadow bg-white">
            <label class="text-[11px] text-neutral-500 font-normal select-none mb-0.5">Card number</label>
            <input 
              type="text" 
              bind:value={cardNo} 
              placeholder="0000 0000 0000 0000" 
              class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal font-normal"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col transition-shadow bg-white">
              <label class="text-[11px] text-neutral-500 font-normal select-none mb-0.5">Expiry date</label>
              <input 
                type="text" 
                bind:value={cardExpiry} 
                placeholder="MM/YY" 
                class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal font-normal"
              />
            </div>

            <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col transition-shadow bg-white">
              <label class="text-[11px] text-neutral-500 font-normal select-none mb-0.5">Security code (CVV)</label>
              <input 
                type="text" 
                bind:value={cardCvv} 
                placeholder="123" 
                class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal font-normal"
              />
            </div>
          </div>

        <!-- FIXED: Handles MTN, Airtel, or generic Mobile Money classifications safely inside a unified UI block -->
        {:else if selectedMethod.type === 'mtn' || selectedMethod.type === 'airtel' || selectedMethod.type === 'MM'}
          <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col transition-shadow bg-white">
            <label class="text-[11px] text-neutral-500 font-normal select-none mb-0.5">Mobile Phone number</label>
            <input 
              type="text" 
              bind:value={momoNumberInput} 
              placeholder="+256 772 123456" 
              class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal font-normal"
            />
          </div>

          <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col transition-shadow bg-white">
            <label class="text-[11px] text-neutral-500 font-normal select-none mb-0.5">Account holder name (optional)</label>
            <input 
              type="text" 
              bind:value={momoNameInput} 
              placeholder="e.g. John Doe" 
              class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal font-normal"
            />
          </div>

        {:else}
          <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col transition-shadow bg-white">
            <label class="text-[11px] text-neutral-500 font-normal select-none mb-0.5">Bank name</label>
            <input 
              type="text" 
              bind:value={bankNameInput} 
              placeholder="Stanbic Bank, Centenary Bank, etc." 
              class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
            />
          </div>

          <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col transition-shadow bg-white">
            <label class="text-[11px] text-neutral-500 font-normal select-none mb-0.5">Account number</label>
            <input 
              type="text" 
              bind:value={bankAccountInput} 
              placeholder="0123456789" 
              class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
            />
          </div>
        {/if}
      </div>

      <!-- Save Details Button -->
      <button 
        onclick={savePaymentMethod}
        disabled={isSaveDisabled()}
        class="w-full mt-2 py-4 rounded-full font-bold text-lg text-center transition-all 
          {!isSaveDisabled() 
            ? 'bg-[#1a1a1a] text-white hover:bg-slate-800 cursor-pointer' 
            : 'bg-slate-100 text-slate-300 cursor-not-allowed'}"
      >
        Save Payment Details
      </button>
    </div>
  </div>
{/if}