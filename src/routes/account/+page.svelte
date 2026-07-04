<!-- routes/account/+page.svelte -->
<script>
    import Header from "$lib/components/templates/settings/header.svelte";
    import { appState } from "$lib/state.svelte.js";

    // Personal information inputs matching split name model
    let tempFirst = $state("");
    let tempLast = $state("");
    let tempMiddle = $state("");
    let tempEmail = $state("");
    let tempPhone = $state("");

    // Profile Completion states for GET /customers
    let dateOfBirth = $state("");
    let gender = $state("MALE");
    let marketingPreferences = $state("SMS");

    // Inline edit states
    let isEditingName = $state(false);
    let isEditingEmail = $state(false);
    let isEditingPhone = $state(false);
    let isEditingCompletion = $state(false);

    let isLoading = $state(false);

   // Initial load sync
    $effect(() => {
        if (appState.user) {
            tempFirst = appState.user.first_name || "";
            tempLast = appState.user.last_name || "";
            tempEmail = appState.user.email || "";
            tempPhone = appState.user.phone_number || "";
            tempMiddle = appState.user.middle_name === "-" ? "" : (appState.user.middle_name || "");
            
            // Populate extended customer onboarding fields if present
            if (appState.user.date_of_birth) {
                dateOfBirth = appState.user.date_of_birth.split("T")[0]; // YYYY-MM-DD
            }
            if (appState.user.gender) {
                gender = appState.user.gender;
            }
            if (appState.user.marketing_preferences) {
                marketingPreferences = appState.user.marketing_preferences === 'true' || appState.user.marketing_preferences === true;
            }
        }
    });

    // Save profile details using UpdateProfileInput model
    async function saveName() {
        if (!tempFirst.trim() || !tempLast.trim()) {
            appState.addToast("First and last names cannot be empty.", "error");
            return;
        }
        isLoading = true;
        const res = await appState.updateProfile({
            first_name: tempFirst.trim(),
            last_name: tempLast.trim(),
            middle_name: tempMiddleName(),
            phone_number: tempPhone
        });
        isLoading = false;
        if (res.success) {
            isEditingName = false;
        }
    }

    function tempMiddleName() {
        return tempMiddle.trim() || "-";
    }

    async function saveEmail() {
        if (!tempEmail.trim()) return;
        isLoading = true;
        const res = await appState.updateProfile({
            first_name: tempFirst,
            last_name: tempLast,
            middle_name: tempMiddleName(),
            phone_number: tempPhone,
            email: tempEmail.trim()
        });
        isLoading = false;
        if (res.success) {
            isEditingEmail = false;
        }
    }

    async function savePhone() {
        if (!tempPhone.trim()) return;
        isLoading = true;
        const res = await appState.updateProfile({
            first_name: tempFirst,
            last_name: tempLast,
            middle_name: tempMiddleName(),
            phone_number: tempPhone.trim()
        });
        isLoading = false;
        if (res.success) {
            isEditingPhone = false;
        }
    }

    // Save extended onboarding inputs using CompleteProfile model
    async function saveProfileCompletion() {
        if (!dateOfBirth) {
            appState.addToast("Please select your date of birth.", "error");
            return;
        }
        isLoading = true;
        const res = await appState.completeProfile(dateOfBirth, gender, marketingPreferences);
        isLoading = false;
        if (res.success) {
            isEditingCompletion = false;
        }
    }
</script>

<div class="max-w-2xl text-slate-900 py-6 select-none flex flex-col gap-8">
    <div class="border-b border-slate-100 pb-4">
        <Header
            header={"Account Settings"}
            description={"Manage your split profile details, contact information, and account preferences."}
        />
    </div>

    <!-- PROFILE DETAILS -->
    <div class="flex flex-col gap-1">
        <h3 class="text-sm font-semibold text-slate-800 px-1 mb-2">Profile details</h3>
        
        <div class="flex flex-col border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
            
            <!-- Split Names Row -->
            {#if !isEditingName}
                <div class="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                    <div class="flex flex-col">
                        <span class="text-[12px] text-slate-400 font-normal">Full name</span>
                        <span class="text-[15px] font-semibold text-slate-900 mt-0.5">
                            {appState.displayName}
                        </span>
                    </div>
                    <button 
                        onclick={() => { isEditingName = true; }} 
                        class="text-sm font-bold text-[#0aad0a] hover:underline cursor-pointer focus:outline-none"
                    >
                        Edit
                    </button>
                </div>
            {:else}
                <div class="w-full flex flex-col gap-4 p-5 bg-slate-50/30">
                    <div class="grid grid-cols-3 gap-3">
                        <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] bg-white rounded-[14px] px-4 pt-2 pb-2.5 flex flex-col transition-shadow">
                            <label class="text-[11px] text-neutral-500 font-normal select-none mb-0.5">First name</label>
                            <input 
                                type="text" 
                                bind:value={tempFirst} 
                                disabled={isLoading}
                                class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                            />
                        </div>

                        <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] bg-white rounded-[14px] px-4 pt-2 pb-2.5 flex flex-col transition-shadow">
                            <label class="text-[11px] text-neutral-500 font-normal select-none mb-0.5">Middle name</label>
                            <input 
                                type="text" 
                                bind:value={tempMiddle} 
                                placeholder="Optional"
                                disabled={isLoading}
                                class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                            />
                        </div>

                        <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] bg-white rounded-[14px] px-4 pt-2 pb-2.5 flex flex-col transition-shadow">
                            <label class="text-[11px] text-neutral-500 font-normal select-none mb-0.5">Last name</label>
                            <input 
                                type="text" 
                                bind:value={tempLast} 
                                disabled={isLoading}
                                class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                            />
                        </div>
                    </div>
                    <div class="flex justify-end gap-3 shrink-0">
                        <button 
                            onclick={() => { 
                                isEditingName = false; 
                                tempFirst = appState.user?.first_name || ""; 
                                tempLast = appState.user?.last_name || "";
                                tempMiddle = appState.user?.middle_name === "-" ? "" : (appState.user?.middle_name || "");
                            }} 
                            disabled={isLoading}
                            class="text-xs font-semibold text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button onclick={saveName} disabled={isLoading} class="text-xs font-bold text-[#0aad0a] hover:underline focus:outline-none">
                            Save Name Changes
                        </button>
                    </div>
                </div>
            {/if}

            <!-- Email Address Row -->
            {#if !isEditingEmail}
                <div class="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                    <div class="flex flex-col">
                        <span class="text-[12px] text-slate-400 font-normal">Email address</span>
                        <span class="text-[15px] font-semibold text-slate-900 mt-0.5">{tempEmail || "Not Configured"}</span>
                    </div>
                    <button 
                        onclick={() => { isEditingEmail = true; }} 
                        class="text-sm font-bold text-[#0aad0a] hover:underline cursor-pointer focus:outline-none"
                    >
                        Edit
                    </button>
                </div>
            {:else}
                <div class="w-full flex items-center justify-between p-5 bg-slate-50/30">
                    <div class="flex-1 max-w-md">
                        <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] bg-white rounded-[14px] px-4 pt-2 pb-2.5 flex flex-col transition-shadow">
                            <label class="text-[11px] text-neutral-500 font-normal select-none mb-0.5">Email address</label>
                            <input 
                                type="email" 
                                bind:value={tempEmail} 
                                disabled={isLoading}
                                class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                            />
                        </div>
                    </div>
                    <div class="flex gap-4 ml-4 shrink-0">
                        <button onclick={saveEmail} disabled={isLoading} class="text-sm font-bold text-[#0aad0a] hover:underline cursor-pointer focus:outline-none">
                            Save
                        </button>
                        <button 
                            onclick={() => { isEditingEmail = false; tempEmail = appState.user?.email || ""; }} 
                            disabled={isLoading}
                            class="text-sm font-semibold text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            {/if}

            <!-- Phone Number Row -->
            {#if !isEditingPhone}
                <div class="w-full flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                    <div class="flex flex-col">
                        <span class="text-[12px] text-slate-400 font-normal">Phone number</span>
                        <span class="text-[15px] font-semibold text-slate-900 mt-0.5">{tempPhone || "Not Configured"}</span>
                    </div>
                    <button 
                        onclick={() => { isEditingPhone = true; }} 
                        class="text-sm font-bold text-[#0aad0a] hover:underline cursor-pointer focus:outline-none"
                    >
                        Edit
                    </button>
                </div>
            {:else}
                <div class="w-full flex items-center justify-between p-5 bg-slate-50/30">
                    <div class="flex-1 max-w-md">
                        <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] bg-white rounded-[14px] px-4 pt-2 pb-2.5 flex flex-col transition-shadow">
                            <label class="text-[11px] text-neutral-500 font-normal select-none mb-0.5">Phone number</label>
                            <input 
                                type="text" 
                                bind:value={tempPhone} 
                                disabled={isLoading}
                                class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                            />
                        </div>
                    </div>
                    <div class="flex gap-4 ml-4 shrink-0">
                        <button onclick={savePhone} disabled={isLoading} class="text-sm font-bold text-[#0aad0a] hover:underline cursor-pointer focus:outline-none">
                            Save
                        </button>
                        <button 
                            onclick={() => { isEditingPhone = false; tempPhone = appState.user?.phone_number || ""; }} 
                            disabled={isLoading}
                            class="text-sm font-semibold text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            {/if}

        </div>
    </div>

    <!-- ONBOARDING COMPLETION SECTION (Only displays contextually if is_complete is false) -->
    <div class="flex flex-col gap-1 pt-2">
        <div class="flex justify-between items-baseline px-1">
            <h3 class="text-sm font-semibold text-slate-800 mb-2">Onboarding Completion</h3>
            {#if appState.user?.is_complete}
                <span class="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider">
                    Completed Profile ✓
                </span>
            {:else}
                <span class="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded uppercase tracking-wider">
                    Pending Completion
                </span>
            {/if}
        </div>

        {#if !appState.user?.is_complete}
            <div class="border border-amber-100 bg-amber-50/30 rounded-2xl p-5 space-y-4">
                <p class="text-xs text-slate-600 leading-relaxed font-light">
                    Your customer profile is incomplete. Provide these extra parameters to unlock regional postal rewards and cashbacks.
                </p>

                <div class="flex flex-col gap-4">
                    <!-- Date of birth input -->
                    <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] bg-white rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col">
                        <label class="text-[11px] text-neutral-500 font-normal select-none mb-0.5">Date of Birth</label>
                        <input 
                            type="date" 
                            bind:value={dateOfBirth} 
                            disabled={isLoading}
                            class="outline-none text-[14px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                        />
                    </div>

                    <!-- Gender selection -->
                    <div class="space-y-1 px-1">
                        <span class="text-[11px] text-neutral-500 font-normal">Gender Identity</span>
                        <div class="flex gap-4 pt-1">
                            <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <input type="radio" bind:group={gender} value="MALE" class="text-red-500 focus:ring-red-500" />
                                <span>Male</span>
                            </label>
                            <label class="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <input type="radio" bind:group={gender} value="FEMALE" class="text-red-500 focus:ring-red-500" />
                                <span>Female</span>
                            </label>
                        </div>
                    </div>

                   <!-- Marketing channel checkbox -->
                    <div class="flex items-center gap-3.5 px-2 py-3 select-none">
                        <input 
                            type="checkbox" 
                            id="marketing-opt-in"
                            bind:checked={marketingPreferences} 
                            disabled={isLoading}
                            class="rounded border-slate-300 text-rose-500 focus:ring-rose-500 h-5 w-5 cursor-pointer shrink-0"
                        />
                        <label for="marketing-opt-in" class="text-xs font-semibold text-slate-700 cursor-pointer leading-normal">
                            I agree to receive promotional updates, mobile wallet cashback alerts.
                        </label>
                    </div>

                    <button 
                        onclick={saveProfileCompletion}
                        disabled={isLoading || !dateOfBirth}
                        class="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white font-bold text-xs h-10 px-6 rounded-full transition-colors w-fit focus:outline-none"
                    >
                        {#if isLoading}Processing...{:else}Complete Account{/if}
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>