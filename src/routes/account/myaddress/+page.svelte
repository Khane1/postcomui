<!-- routes/account/myaddress/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import Header from "$lib/components/templates/settings/header.svelte";
  import { appState } from "$lib/state.svelte.js";

  // Derive saved addresses reactively from state arrays
  let savedAddresses = $derived(
    appState.customerAddresses.length > 0
      ? appState.customerAddresses
      : appState.user?.addresses ||
          appState.user?.delivery_addresses ||
          appState.user?.customer_addresses ||
          [],
  );

  let isModalOpen = $state(false);
  let isLoading = $state(false);

  // Field values matching the backend schema
  let streetInput = $state("");
  let aptInput = $state("");
  let businessInput = $state("");
  let commentsInput = $state("");
  let cityInput = $state("Kampala");
  let countryInput = $state("Uganda");

  // Fetch coordinates on entry
  onMount(() => {
    appState.fetchCustomerAddresses();
  });

  function openAddModal() {
    streetInput = "";
    aptInput = "";
    businessInput = "";
    commentsInput = "";
    cityInput = "Kampala";
    countryInput = "Uganda";
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }

  async function saveAddress() {
    if (!streetInput.trim()) return;

    isLoading = true;

    // Structured payload sent to POST /api/v1/customers/{customerId}/addresses
    const payload = {
      building_name: businessInput.trim() || "N/A",
      city: cityInput.trim() || "Kampala",
      contact_email: appState.user?.email || "",
      contact_phone: appState.user?.phone_number || "",
      country: countryInput.trim() || "Uganda",
      door: aptInput.trim() || "N/A",
      floor: "1",
      landmark: commentsInput.trim() || "N/A",
      street: streetInput.trim(),
      line1: streetInput.trim(),
      latitude: 0.3476,
      longitude: 32.5825,
    };

    const result = await appState.createCustomerAddress(payload);
    isLoading = false;

    if (result.success) {
      closeModal();
    }
  }

  // Format helper to display nested components nicely
  function formatAddressDetail(address) {
    const parts = [];
    if (address.door && address.door !== "N/A")
      parts.push(`Door/Apt: ${address.door}`);
    if (address.landmark && address.landmark !== "N/A")
      parts.push(`Landmark: ${address.landmark}`);
    if (address.city) parts.push(address.city);
    if (address.country) parts.push(address.country);
    return parts.join(" • ");
  }
</script>

<div class="max-w-2xl text-slate-900 py-6 select-none flex flex-col gap-6">
  <div class="border-b border-slate-100 pb-4">
    <Header
      header={"My Address Book"}
      description="Manage the locations used for physical home deliveries or post office pickups."
    />
  </div>

  <div class="flex flex-col gap-4">
    {#if savedAddresses.length === 0}
      <!-- Minimalist vector Empty State (No emojis) -->
      <div
        class="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center space-y-4"
      >
        <div
          class="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2.1"
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
        <div class="space-y-1">
          <p class="text-sm font-bold text-slate-900">
            No delivery addresses saved yet
          </p>
          <p
            class="text-xs text-slate-400 max-w-xs mx-auto leading-normal font-light"
          >
            Register a coordinate to coordinate faster courier checkouts and
            subsidized postal routing.
          </p>
        </div>
        <button
          onclick={openAddModal}
          class="bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold h-9 px-4 rounded-full transition-colors focus:outline-none cursor-pointer"
        >
          Add First Address
        </button>
      </div>
    {:else}
      <!-- Saved Addresses divided list exactly matching the profile list aesthetic -->
      <div class="flex flex-col gap-1">
        <h3
          class="text-xs font-black text-slate-400 uppercase tracking-widest px-1 mb-2"
        >
          Saved destinations
        </h3>

        <div
          class="flex flex-col border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white"
        >
          {#each savedAddresses as address, i (address.id || i)}
            {@const locationLabel =
              address.building_name !== "N/A"
                ? address.building_name
                : "Home Location"}
            <div
              class="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors"
            >
              <div class="flex flex-col">
                <span class="text-[12px] text-slate-400 font-normal"
                  >{locationLabel}</span
                >
                <span class="text-[15px] font-semibold text-slate-900 mt-0.5"
                  >{address.street || address.line1}</span
                >
                <span class="text-[12px] text-slate-500 font-light mt-0.5">
                  {formatAddressDetail(address)}
                </span>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="pt-2">
        <button
          onclick={() => (appState.isLocationModalOpen = true)}
          class="w-full bg-[#1a1a1a] hover:bg-slate-800 text-white text-xs font-semibold h-11 px-6 rounded-full flex items-center justify-center transition-colors cursor-pointer"
        >
          Add Another Address
        </button>
      </div>
    {/if}
  </div>
</div>

