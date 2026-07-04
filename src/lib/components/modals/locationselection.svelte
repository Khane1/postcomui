<script>
  import { appState } from "$lib/state.svelte";
  import { goto } from "$app/navigation";

  const ACCENT = "#0aad0a";
  const ACCENT_TINT = "#EAF7E9";

  let locationSearchQuery = $state("");
  let isLocating = $state(false);
  let placeSuggestions = $state([]); // Google Maps places predictions array
  let resolvedUserAddress = $state(""); // Reverse geocoded location address
  let tempSelectedAddress = $state(""); // Tracks active address before confirming save
  let saveToAddressBook = $state(false);
  let aptInput = $state("");
  let businessInput = $state("");
  let commentsInput = $state("");
  let isSavingAddress = $state(false);

  // Tracks active form toggle state
  let showAddNewForm = $state(false);

  // Map coordinate bounds
  let selectedLat = $state(0.3476);
  let selectedLng = $state(32.5825);

  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  $effect(() => {
    if (locationSearchQuery.trim() && window.google) {
      const autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        {
          input: locationSearchQuery,
          componentRestrictions: { country: "UG" }, // Restrict search strictly to Uganda
        },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            placeSuggestions = predictions.map((p) => ({
              description: p.description,
              placeId: p.place_id,
            }));
          } else {
            placeSuggestions = [];
          }
        },
      );
    } else {
      placeSuggestions = [];
    }
  });

  // Reverse geocoding fetch call to Google Geocode API
  async function reverseGeocodeAddress(lat, lng) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`,
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        resolvedUserAddress = address;
        tempSelectedAddress = address; // Set temporary preview selection
        appState.addToast(`Located near: ${address}`);
      }
    } catch (err) {
      console.warn("Could not geocode coordinates.", err);
    }
  }

  // Request browser GPS position
  function requestCustomerLocationOnOpen() {
    if (!navigator.geolocation) {
      appState.addToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    isLocating = true;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        selectedLat = latitude;
        selectedLng = longitude;
        await reverseGeocodeAddress(latitude, longitude);
        isLocating = false;
      },
      () => {
        isLocating = false;
        appState.addToast("Permission denied or location lookup failed.", "error");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }

  // Handle product searches via header form
  function handleSearchSubmit(e) {
    e.preventDefault();
    appState.fetchProducts();
    goto("/products");
  }

  function selectSuggestion(suggestion) {
    tempSelectedAddress = suggestion.description;
    locationSearchQuery = "";
    placeSuggestions = [];

    if (window.google && suggestion.placeId) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ placeId: suggestion.placeId }, (results, status) => {
        if (status === "OK" && results[0]) {
          selectedLat = results[0].geometry.location.lat();
          selectedLng = results[0].geometry.location.lng();
        }
      });
    }
  }

  // Pack variables into target payload and execute backend save
  async function saveSelectedAddress() {
    if (tempSelectedAddress) {
      appState.activeBranch = tempSelectedAddress;

      if (saveToAddressBook && appState.isLoggedIn) {
        isSavingAddress = true;

        const payload = {
          building_name: businessInput.trim() || "N/A",
          city: "Kampala",
          contact_email: appState.user?.email || "",
          contact_phone: appState.user?.phone_number || "",
          country: "Uganda",
          door: aptInput.trim() || "N/A",
          floor: "1",
          landmark: commentsInput.trim() || "N/A",
          street: tempSelectedAddress,
          line1: tempSelectedAddress,
          latitude: Number(selectedLat) || 0.3476,
          longitude: Number(selectedLng) || 32.5825,
        };

        const res = await appState.createCustomerAddress(payload);
        isSavingAddress = false;

        if (res.success) {
          aptInput = "";
          businessInput = "";
          commentsInput = "";
          saveToAddressBook = false;
        }
      }
    }
    appState.isLocationModalOpen = false;
  }

  function updateCategory(cat) {
    appState.selectedCategory = cat;
    appState.fetchProducts();
    goto("/products");
  }

  // Monitor location modal trigger state
  $effect(() => {
    if (appState.isLocationModalOpen) {
      locationSearchQuery = "";
      placeSuggestions = [];
      resolvedUserAddress = "";
      tempSelectedAddress = appState.activeBranch || "";

      // Default to adding a new location if the user has no saved addresses
      showAddNewForm = appState.customerAddresses.length === 0;

      saveToAddressBook = false;
      aptInput = "";
      businessInput = "";
      commentsInput = "";
      isSavingAddress = false;
    }
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet" />
</svelte:head>

{#if appState.isLocationModalOpen}
  <div
    class="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4"
    style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;"
  >
    <!-- Click outside backdrop to close -->
    <div
      class="absolute inset-0"
      onclick={() => (appState.isLocationModalOpen = false)}
      aria-hidden="true"
    ></div>

    <div
      class="bg-white rounded-[28px] max-w-sm w-full p-6 relative shadow-xl z-10 flex flex-col gap-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
    >
      <!-- Absolute Close Button -->
      <button
        onclick={() => (appState.isLocationModalOpen = false)}
        class="absolute top-6 left-6 text-gray-800 hover:text-gray-600 focus:outline-none cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Header Text Block -->
      <div class="flex flex-col gap-1.5 mt-2 text-center select-none">
        <h3 class="text-xl font-extrabold text-gray-900 tracking-tight">
          Set delivery location
        </h3>
        <p class="text-[13px] text-gray-500 leading-normal">
          Select from your saved addresses or search for a new area in Uganda.
        </p>
      </div>

      <!-- Toggle Flow Action Button -->
      {#if appState.customerAddresses.length > 0}
        <button
          onclick={() => (showAddNewForm = !showAddNewForm)}
          class="w-full border border-gray-300 hover:border-gray-400 text-gray-800 text-[13px] font-bold h-10 px-4 rounded-full flex items-center justify-center gap-2 focus:outline-none transition-colors cursor-pointer shrink-0"
        >
          <span>{showAddNewForm ? "View saved locations" : "Add new location"}</span>
        </button>
      {/if}

      {#if !showAddNewForm}
        <!-- VIEW 1: LIST OF SAVED DESTINATIONS -->
       <!-- Inside saved addresses list map in routes/+layout.svelte -->
        <div class="space-y-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-none">
          <div class="text-[12.5px] font-semibold text-gray-500 px-1">
            Saved locations
          </div>
          {#each appState.customerAddresses as addr (addr.id)}
            <button
              onclick={() => {
                appState.activeBranch = addr.street || addr.line1;
                appState.selectedAddressId = addr.id; // Updates checkout state globally
                appState.isLocationModalOpen = false;
                appState.addToast(`Delivery destination set to: ${addr.street || addr.line1}`);
              }}
              class="w-full text-left p-3.5 rounded-xl border transition-all focus:outline-none cursor-pointer flex items-center justify-between group
                {appState.activeBranch === (addr.street || addr.line1)
                  ? 'border-[#0aad0a]'
                  : 'border-gray-100 hover:border-gray-300 bg-white'}"
              style={appState.activeBranch === (addr.street || addr.line1) ? `background: ${ACCENT_TINT};` : ''}
            >
              <div class="flex items-center gap-3 min-w-0">
                <svg
                  class="w-4.5 h-4.5 text-gray-400 group-hover:text-[#0aad0a] transition-colors shrink-0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0z" />
                </svg>
                <div class="min-w-0">
                  <p class="font-bold text-gray-800 text-[13px] truncate">
                    {addr.building_name && addr.building_name !== "N/A" ? addr.building_name : "Saved Destination"}
                  </p>
                  <p class="text-[11.5px] text-gray-500 truncate">
                    {addr.street || addr.line1}, {addr.city}
                  </p>
                </div>
              </div>
              {#if appState.activeBranch === (addr.street || addr.line1)}
                <span class="text-[10.5px] font-bold px-2 py-0.5 rounded-full shrink-0" style="color: #0B8A00; background: #d9f0d5;">
                  Active
                </span>
              {/if}
            </button>
          {/each}
        </div>
      {:else}
        <!-- VIEW 2: NEW LOCATION REGISTRATION FORM -->
        <div class="space-y-4 animate-in fade-in duration-200">
          <!-- Use GPS Trigger Button -->
          <button
            onclick={requestCustomerLocationOnOpen}
            disabled={isLocating || isSavingAddress}
            class="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 text-[13px] font-bold h-10 px-4 rounded-full flex items-center justify-center gap-2 focus:outline-none transition-colors cursor-pointer"
          >
            <svg
              class="w-4 h-4 text-gray-500 shrink-0"
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
            {#if isLocating}
              <span>Locating delivery address...</span>
            {:else}
              <span>Use current location</span>
            {/if}
          </button>

          <!-- Autocomplete Search Input Field -->
          <div
            class="border border-gray-300 focus-within:border-[#0aad0a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white transition-colors"
          >
            <label
              class="text-[11px] text-gray-500 font-medium select-none mb-0.5"
              >Search location or city</label
            >
            <input
              type="text"
              bind:value={locationSearchQuery}
              disabled={isSavingAddress}
              placeholder="e.g. Kampala, Gulu, Jinja..."
              class="outline-none text-[14px] text-gray-800 bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
            />
          </div>

          <!-- Autocomplete Matches List & Selected Destination Preview -->
          <div class="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-none">
            {#if placeSuggestions.length > 0}
              <div
                class="text-[12.5px] text-gray-500 font-semibold px-1 pb-1"
              >
                Geographical matches
              </div>
              {#each placeSuggestions as suggestion}
                <button
                  onclick={() => selectSuggestion(suggestion)}
                  disabled={isSavingAddress}
                  class="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-gray-300 bg-white text-gray-700 text-[13px] font-semibold transition-all focus:outline-none cursor-pointer"
                >
                  <span>{suggestion.description}</span>
                </button>
              {/each}
            {:else if tempSelectedAddress}
              <div
                class="text-[12.5px] text-gray-500 font-semibold px-1 pb-1"
              >
                Selected destination
              </div>
              <div
                class="w-full text-left p-3 rounded-xl border border-[#0aad0a] text-[13px] font-bold flex justify-between items-center transition-all select-none"
                style="background: {ACCENT_TINT}; color: #0B8A00;"
              >
                <span class="truncate pr-2 text-[13px]">{tempSelectedAddress}</span>
                <svg
                  class="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                  style="color: #0aad0a;"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              </div>
            {:else}
              <p class="text-[13px] text-gray-400 text-center py-4">
                Search your delivery location above.
              </p>
            {/if}
          </div>

          <!-- NEW: Address Details Sub-Form (Only shows when logged in and an address is selected) -->
          {#if appState.isLoggedIn && tempSelectedAddress}
            <div
              class="border-t border-gray-100 pt-3 flex flex-col gap-3 select-none"
            >
              <label
                class="flex items-center gap-2.5 text-[13px] font-semibold text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  bind:checked={saveToAddressBook}
                  disabled={isSavingAddress}
                  class="rounded border-gray-300 text-[#0aad0a] focus:ring-[#0aad0a]"
                />
                <span>Add this destination to my address book</span>
              </label>

              {#if saveToAddressBook}
                <div
                  class="flex flex-col gap-3 mt-1 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <!-- Apt/Door Input -->
                  <div
                    class="border border-gray-300 focus-within:border-[#0aad0a] rounded-[12px] px-3 pt-2 pb-2 flex flex-col bg-white transition-colors"
                  >
                    <label
                      class="text-[10px] text-gray-500 font-medium select-none mb-0.5"
                      >Door / Apartment</label
                    >
                    <input
                      type="text"
                      bind:value={aptInput}
                      disabled={isSavingAddress}
                      placeholder="e.g. Apartment 4B"
                      class="outline-none text-[13px] text-gray-800 bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                    />
                  </div>

                  <!-- Building Name Input -->
                  <div
                    class="border border-gray-300 focus-within:border-[#0aad0a] rounded-[12px] px-3 pt-2 pb-2 flex flex-col bg-white transition-colors"
                  >
                    <label
                      class="text-[10px] text-gray-500 font-medium select-none mb-0.5"
                      >Building name (optional)</label
                    >
                    <input
                      type="text"
                      bind:value={businessInput}
                      disabled={isSavingAddress}
                      placeholder="e.g. Office / Building Name"
                      class="outline-none text-[13px] text-gray-800 bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                    />
                  </div>

                  <!-- Landmark Input -->
                  <div
                    class="border border-gray-300 focus-within:border-[#0aad0a] rounded-[12px] px-3 pt-2 pb-2 flex flex-col bg-white transition-colors"
                  >
                    <label
                      class="text-[10px] text-gray-500 font-medium select-none mb-0.5"
                      >Landmark</label
                    >
                    <input
                      type="text"
                      bind:value={commentsInput}
                      disabled={isSavingAddress}
                      placeholder="e.g. Next to GPO main entrance"
                      class="outline-none text-[13px] text-gray-800 bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                    />
                  </div>
                </div>
              {/if}
            </div>
          {/if}

          <button
            onclick={saveSelectedAddress}
            disabled={isSavingAddress || !tempSelectedAddress}
            class="w-full bg-[#0aad0a] hover:bg-[#099409] disabled:bg-gray-200 disabled:text-gray-400 text-white text-[13px] font-bold h-11 px-6 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
          >
            {#if isSavingAddress}
              <span>Saving address details...</span>
            {:else if saveToAddressBook}
              <span>Save to address book & branch</span>
            {:else}
              <span>Save location choice</span>
            {/if}
          </button>
        </div>
      {/if}

    </div>
  </div>
{/if}