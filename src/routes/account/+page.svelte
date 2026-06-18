<!-- routes/account/+page.svelte -->
<script>
    import { goto } from "$app/navigation";
    import { fade } from "svelte/transition";
    import { appState } from "$lib/state.svelte.js";

    let inputVal = $state("");
    let loginMethod = $state("email"); // "email" | "phone"
    let isLoggedIn = $state(false);
    let userIdentifier = $state("");
    let isConnecting = $state(false);
let inputPhone = $state("");
    function toggleLoginMethod() {
        loginMethod = loginMethod === "email" ? "phone" : "email";
        inputVal = "";
        inputPhone = "";
    }
    function handleContinue() {
        if (!inputVal) return;
        isConnecting = true;

        // Simulate a professional, brief OAuth / verification handshake
        setTimeout(() => {
            userIdentifier = inputVal;
            isConnecting = false;
            isLoggedIn = true;
            appState.addToast("Successfully logged in!");

            // Auto follow-through to continue the shopping experience after 1s
            setTimeout(() => {
                goto("/");
            }, 1000);
        }, 1200);
    }

    function handleSocialLogin(provider, mockVal) {
        isConnecting = true;
        setTimeout(() => {
            userIdentifier = mockVal;
            isConnecting = false;
            isLoggedIn = true;
            appState.addToast(`Connected with ${provider}!`);
            setTimeout(() => {
                goto("/");
            }, 1000);
        }, 1000);
    }

    function logout() {
        isLoggedIn = false;
        inputVal = "";
        userIdentifier = "";
        appState.addToast("Logged out safely.", "info");
    }
</script>

<div class="max-w-md mx-auto py-12 select-none font-sans px-4">
    {#if !isLoggedIn}
        <!-- LOGIN DIALOG (Identical to Screenshot) -->
        <div
            class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 relative animate-in fade-in duration-200"
        >
            <!-- Top header strip -->
            <div class="flex items-center justify-between">
                <!-- Close (X) button routing back to marketplace -->
               
 <span
          class="text-lg font-black text-black tracking-tight flex items-center gap-1.5"
        >
          <img
            src="https://postcom.ug/assets/postcom-logo-white-B0oZfjq1.jpg"
            class="size-10"
          />
          <span>postcom</span>
        </span>
                <!-- Sign-Up pill on right -->
                <button
                    onclick={() =>
                        handleSocialLogin("Email", "newuser@coop.ug")}
                    class="bg-slate-100 text-sm font-bold hover:bg-slate-200 text-slate-800  px-4 py-1.5 rounded-full transition-all focus:outline-none cursor-pointer"
                >
                    Sign up
                </button>
            </div>

            <!-- Main Heading -->
            <div class="text-center pt-2">
                <h3
                    class="text-base sm:text-lg font-semibold text-slate-800 tracking-tight"
                >
                    {#if loginMethod === "phone"}Log in with phone{:else}Log In with Email{/if}
                </h3>
                
            </div>

            <!-- Loading / Connecting overlay state -->
            {#if isConnecting}
                <div class="py-10 text-center space-y-2 animate-pulse">
                    <span class="text-2xl block">⚡</span>
                    <p class="text-xs font-bold text-slate-500">
                        Securing connection route...
                    </p>
                </div>
            {:else}
                <!-- Core Form Fields -->
                <div class="space-y-4">
                    <!-- Dynamic Input Box -->
                    <div>
                        {#if loginMethod === "email"}
                            <div class="relative" in:fade={{ duration: 100 }}>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    bind:value={inputVal}
                                    class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-black focus:border-2 focus:ring-0 focus:outline-none transition-colors"
                                />
                            </div>
                        {:else}
                            <div class="relative animate-in fade-in duration-100">
                                <input
                                    type="tel"
                                    placeholder="+256 772 123456"
                                    bind:value={inputPhone}
                                    class="w-full pl-5 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:border-black focus:border-2 focus:ring-0 focus:outline-none transition-colors"
                                />
                            </div>
                        {/if}
                    </div>

                    <!-- Instacart Signature Green Action Button -->
                    <button
                        onclick={handleContinue}
                        disabled={(!inputVal && loginMethod === "email") ||
                            (loginMethod === "phone" && !inputPhone)}
                        class="w-full bg-red-500 hover:bg-red-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-extrabold text-sm h-12 rounded-full transition-all focus:outline-none flex items-center justify-center shadow-xs cursor-pointer"
                    >
                        Continue
                    </button>

                    <!-- Divider -->
                    <div
                        class="flex items-center justify-center gap-3 py-2 select-none"
                    >
                        <div class="h-px bg-slate-200 flex-1"></div>
                        <span
                            class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                            >Or continue with</span
                        >
                        <div class="h-px bg-slate-200 flex-1"></div>
                    </div>

                    <!-- Social Buttons Pill Bar -->
                    <div
                        class="flex  flex-wrap items-center justify-center gap-2"
                    >
                        <!-- Google -->
                        <button
                            onclick={() =>
                                handleSocialLogin(
                                    "Google",
                                    "user.google@gmail.com",
                                )}
                            class="bg-slate-100 text-xs font-bold hover:bg-slate-200 text-slate-800 t font-semi px-3.5 py-2.5 rounded-full flex items-center gap-2 transition-all focus:outline-none cursor-pointer"
                        >
                            <svg  viewBox="0 0 24 24">
                                <img class="w-3.5 h-3.5 rounded-full" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2sSeQqjaUTuZ3gRgkKjidpaipF_l6s72lBw&s" alt="">
                            </svg>
                            <span>Google</span>
                        </button>

                        <!-- Facebook -->
                        <button
                            onclick={() =>
                                handleSocialLogin(
                                    "Facebook",
                                    "user.facebook@fb.com",
                                )}
                            class="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-extrabold px-3.5 py-2.5 rounded-full flex items-center gap-2 transition-all focus:outline-none cursor-pointer"
                        >
                            <svg
                                class="w-3.5 h-3.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8Z"
                                />
                            </svg>
                            <span>Facebook</span>
                        </button>

                        <!-- Toggle Phone Input -->
                        <button
                            onclick={toggleLoginMethod}
                            class="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-extrabold px-3.5 py-2.5 rounded-full flex items-center gap-2 transition-all focus:outline-none cursor-pointer"
                        >
                            <svg
                                class="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.5"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                                />
                            </svg>
                            <span
                                >{#if loginMethod === "email"}Phone{:else}Email{/if}</span
                            >
                        </button>
                    </div>
                </div>
            {/if}
        </div>
    {:else}
        <!-- USER PROFILE VIEWPORT (Instacart Style Dashboard) -->
        <div class="space-y-6 animate-in fade-in duration-200">
            <div
                class="border border-slate-200 rounded-3xl p-6 bg-white space-y-5 shadow-xs"
            >
                <!-- User Header Details -->
                <div
                    class="flex items-center gap-3 border-b border-slate-100 pb-4"
                >
                    <div
                        class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-lg shadow-xs font-bold border border-emerald-100"
                    >
                        👤
                    </div>
                    <div>
                        <h3
                            class="text-sm font-black text-slate-900 truncate max-w-[180px]"
                        >
                            {userIdentifier}
                        </h3>
                        <span
                            class="text-[9px] font-black text-[#003d29] bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider"
                            >Postcom Buyer</span
                        >
                    </div>
                </div>

                <!-- System Preferences -->
                <div class="space-y-3 text-xs font-medium text-slate-600">
                    <div
                        class="flex justify-between items-center border-b border-slate-50 pb-2.5"
                    >
                        <span class="text-slate-400">Postal Branch</span>
                        <span class="text-slate-800 font-extrabold"
                            >{appState.activeBranch}</span
                        >
                    </div>
                    <div
                        class="flex justify-between items-center border-b border-slate-50 pb-2.5"
                    >
                        <span class="text-slate-400">Active Cart Items</span>
                        <span class="text-slate-800 font-extrabold"
                            >{appState.cartCount} items</span
                        >
                    </div>
                    <div
                        class="flex justify-between items-center border-b border-slate-50 pb-2.5"
                    >
                        <span class="text-slate-400"
                            >Sustainable Sourcing Level</span
                        >
                        <span
                            class="text-emerald-700 font-black flex items-center gap-0.5"
                            >🌱 Level 1</span
                        >
                    </div>
                </div>

                <!-- Follow-through Shopping Redirection Block -->
                <div
                    class="bg-emerald-50 border border-emerald-100/50 p-4 rounded-2xl text-center space-y-1"
                >
                    <p class="text-xs font-bold text-emerald-900 leading-snug">
                        Connecting to regional markets...
                    </p>
                    <a
                        href="/"
                        class="text-xs font-black text-emerald-700 hover:underline block"
                        >Settle co-op deals immediately →</a
                    >
                </div>

                <!-- Minimal Log-Out -->
                <button
                    onclick={logout}
                    class="w-full border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 font-bold text-xs h-10 rounded-full transition-all focus:outline-none flex items-center justify-center gap-2 bg-white cursor-pointer"
                >
                    Logout Safely
                </button>
            </div>
        </div>
    {/if}
</div>
