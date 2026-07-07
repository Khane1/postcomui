<!-- lib/components/auth/signup&in.svelte -->
<script>
    import { goto } from "$app/navigation";
    import { appState } from "$lib/state.svelte.js";

    // Authentication States
    let isSignUp = $state(false);
    let isLoading = $state(false);
    
    // Onboarding Wizard Steps
    // 1 = Enter Name, Email & Phone
    // 2 = Verify OTP (OtpVerificationInput)
    // 3 = Set Account Password (SetPasswordInput)
    let signupStep = $state(1);

    // Inputs
    let firstName = $state("");
    let lastName = $state("");
    let email = $state("");
    let phone = $state("");
    let password = $state("");
    let confirmPassword = $state("");
    let otpValue = $state("");
    async function handleGoogleLogin(){
        
    }
    // Handle form submissions
   // Handle form submissions
    async function handleAuthSubmit(event) {
        event.preventDefault();

        if (isSignUp) {
            // STEP 1: INITIAL REGISTRATION
            if (signupStep === 1) {
                if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
                    appState.addToast("Please fill in all registration fields.", "error");
                    return;
                }
                isLoading = true;
                const res = await appState.signUp(firstName, lastName, email, phone);
                isLoading = false;
                if (res.success) {
                    appState.addToast("Account registered successfully! Please sign in.", "success");
                    isSignUp = false; // Toggle view back to Sign In
                    signupStep = 1;
                    password = "";
                    confirmPassword = "";
                }
            } 
            // STEP 2: OTP CODE VALIDATION (Retained for validation safety)
            else if (signupStep === 2) {
                if (!otpValue.trim()) {
                    appState.addToast("Please enter the verification code.", "error");
                    return;
                }
                isLoading = true;
                const res = await appState.verifyOtpCode(otpValue);
                isLoading = false;
                if (res.success) {
                    signupStep = 3;
                }
            } 
            // STEP 3: PASSWORD SETTING (Retained for validation safety)
            else if (signupStep === 3) {
                if (!password || !confirmPassword) {
                    appState.addToast("Password values cannot be empty.", "error");
                    return;
                }
                if (password !== confirmPassword) {
                    appState.addToast("Passwords do not match.", "error");
                    return;
                }
                isLoading = true;
                const res = await appState.setPassword(password, confirmPassword);
                isLoading = false;
                if (res.success) {
                    isSignUp = false;
                    signupStep = 1;
                    password = "";
                    confirmPassword = "";
                }
            }
        } else {
            // LOGIN FLOW
            if (!email.trim() || !password) {
                appState.addToast("Please fill in email and password fields.", "error");
                return;
            }
            isLoading = true;
            const res = await appState.login(email.trim(), password);
            isLoading = false;
            if (res.success) {
                goto("/");
            }
        }
    }

    async function handleResendCode() {
        isLoading = true;
        await appState.resendOtpCode();
        isLoading = false;
    }

    function resetFlow() {
        isSignUp = false;
        signupStep = 1;
        firstName = "";
        lastName = "";
        email = "";
        phone = "";
        password = "";
        confirmPassword = "";
        otpValue = "";
    }
</script>

<div class="max-w-md mx-auto py-12 px-4 select-none font-sans flex flex-col gap-6">
    
    <!-- Branding Header -->
    <div class="flex flex-col items-center gap-2 mb-2 select-none">
        <img
            src="https://postcom.ug/assets/postcom-logo-white-B0oZfjq1.jpg"
            class="size-16 rounded-2xl shadow-xs border border-slate-100"
            alt="Logo"
        />
        <h2 class="text-[22px] font-bold text-slate-900 tracking-tight mt-1">
            {#if isSignUp}
                {#if signupStep === 1}Create an account{/if}
                {#if signupStep === 2}Verify Your Contact{/if}
                {#if signupStep === 3}Set Secure Password{/if}
            {:else}
                Welcome back
            {/if}
        </h2>
        <p class="text-[13px] text-slate-500 font-light text-center px-4">
            {#if isSignUp}
                {#if signupStep === 1}Sign up to track cooperative harvests, order shipments, and secure your mobile wallets.{/if}
                {#if signupStep === 2}Enter the verification code sent to your registered contact channel.{/if}
                {#if signupStep === 3}Create a password to finalize your account setup.{/if}
            {:else}
                Sign in to manage active deliveries, postal checkouts, and preferences.
            {/if}
        </p>
    </div>

    <!-- Main Ticket Card -->
    <div class="relative overflow-visible w-full">
        <!-- Physical Ticket Notch (Top Center) -->
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-50 border-b border-slate-100 rounded-full z-10"></div>
        
        <div class="bg-white border border-slate-100 rounded-[28px] p-8 flex flex-col gap-5 shadow-xs relative">
            
            <!-- Dual Mode Toggler (Disabled once wizard starts progress) -->
            {#if signupStep === 1}
                <div class="flex bg-slate-100 p-1 rounded-full border border-slate-100 gap-1 shrink-0 w-full select-none">
                    <button 
                        onclick={resetFlow} 
                        class="flex-1 py-2 text-xs font-semibold rounded-full transition-all focus:outline-none cursor-pointer
                            {!isSignUp ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}"
                        disabled={isLoading}
                    >
                        Sign In
                    </button>
                    <button 
                        onclick={() => { isSignUp = true; signupStep = 1; }} 
                        class="flex-1 py-2 text-xs font-semibold rounded-full transition-all focus:outline-none cursor-pointer
                            {isSignUp ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}"
                        disabled={isLoading}
                    >
                        Sign Up
                    </button>
                </div>
            {/if}

            <form onsubmit={handleAuthSubmit} class="flex flex-col gap-4">
                
                {#if isSignUp}
                    <!-- SIGN UP WIZARD STEPS -->
                    
                    {#if signupStep === 1}
                        <!-- STEP 1: BASIC REGISTRATION DETAILS -->
                        <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white">
                            <label class="text-[11px] text-neutral-500 font-normal mb-0.5">First name</label>
                            <input 
                                type="text" 
                                bind:value={firstName} 
                                placeholder="John" 
                                disabled={isLoading}
                                class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                            />
                        </div>

                        <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white">
                            <label class="text-[11px] text-neutral-500 font-normal mb-0.5">Last name</label>
                            <input 
                                type="text" 
                                bind:value={lastName} 
                                placeholder="Doe" 
                                disabled={isLoading}
                                class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                            />
                        </div>

                        <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white">
                            <label class="text-[11px] text-neutral-500 font-normal mb-0.5">Email address</label>
                            <input 
                                type="email" 
                                bind:value={email} 
                                placeholder="johndoe@gmail.com" 
                                disabled={isLoading}
                                class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                            />
                        </div>

                        <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white">
                            <label class="text-[11px] text-neutral-500 font-normal mb-0.5">Phone number</label>
                            <input 
                                type="text" 
                                bind:value={phone} 
                                placeholder="+256 772 123456" 
                                disabled={isLoading}
                                class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                            />
                        </div>
                    {/if}

                    {#if signupStep === 2}
                        <!-- STEP 2: OTP VERIFICATION -->
                        <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white animate-in fade-in duration-200">
                            <label class="text-[11px] text-neutral-500 font-normal mb-0.5 text-center">Enter 6-Digit Code</label>
                            <input 
                                type="text" 
                                bind:value={otpValue} 
                                placeholder="000000" 
                                disabled={isLoading}
                                maxlength="6"
                                class="outline-none text-xl font-bold tracking-[0.2em] text-center text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                            />
                        </div>
                        
                        <div class="flex justify-between items-center text-xs px-1">
                            <span class="text-slate-400">Didn't receive code?</span>
                            <button type="button" onclick={handleResendCode} disabled={isLoading} class="text-[#0aad0a] hover:underline font-bold focus:outline-none">
                                Resend SMS OTP
                            </button>
                        </div>
                    {/if}

                    {#if signupStep === 3}
                        <!-- STEP 3: PASSWORD SETTING -->
                        <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white animate-in fade-in duration-200">
                            <label class="text-[11px] text-neutral-500 font-normal mb-0.5">Password</label>
                            <input 
                                type="password" 
                                bind:value={password} 
                                placeholder="••••••••" 
                                disabled={isLoading}
                                class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                            />
                        </div>

                        <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col bg-white animate-in fade-in duration-200">
                            <label class="text-[11px] text-neutral-500 font-normal mb-0.5">Confirm Password</label>
                            <input 
                                type="password" 
                                bind:value={confirmPassword} 
                                placeholder="••••••••" 
                                disabled={isLoading}
                                class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                            />
                        </div>
                    {/if}

                {:else}
                    <!-- STANDARD LOGIN FIELD BLOCK -->
                    <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col transition-shadow bg-white">
                        <label class="text-[11px] text-neutral-500 font-normal mb-0.5">Email address</label>
                        <input 
                            type="email" 
                            bind:value={email} 
                            placeholder="johndoe@gmail.com" 
                            disabled={isLoading}
                            class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                        />
                    </div>

                    <div class="border border-slate-300 focus-within:border-[#1a1a1a] focus-within:ring-1 focus-within:ring-[#1a1a1a] rounded-[14px] px-4 pt-2.5 pb-3 flex flex-col transition-shadow bg-white">
                        <label class="text-[11px] text-neutral-500 font-normal mb-0.5">Password</label>
                        <input 
                            type="password" 
                            bind:value={password} 
                            placeholder="••••••••" 
                            disabled={isLoading}
                            class="outline-none text-[15px] text-[#333] bg-transparent w-full p-0 border-0 focus:ring-0 leading-normal"
                        />
                    </div>
                {/if}

                <!-- Dynamic Processing Trigger -->
                <button 
                    type="submit"
                    disabled={isLoading}
                    class="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold h-11 px-6 rounded-full transition-colors focus:outline-none cursor-pointer mt-1 flex items-center justify-center gap-2"
                >
                    {#if isLoading}
                        <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing request...</span>
                    {:else}
                        <span>
                            {#if isSignUp}
                                {#if signupStep === 1}Submit Registration{/if}
                                {#if signupStep === 2}Verify Code{/if}
                                {#if signupStep === 3}Save Password{/if}
                            {:else}
                                Sign In to Postcom
                            {/if}
                        </span>
                    {/if}
                </button>
            </form>

            <!-- Social/Google Auth block for login stage -->
            {#if !isSignUp}
                <div class="flex items-center gap-3 select-none my-1">
                    <div class="h-px bg-slate-100 flex-1"></div>
                    <span class="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">or</span>
                    <div class="h-px bg-slate-100 flex-1"></div>
                </div>

                <button
                    onclick={handleGoogleLogin}
                    disabled={isLoading}
                    class="w-full h-11 border border-slate-200 hover:border-slate-300 rounded-full flex items-center justify-center gap-3 transition-colors focus:outline-none cursor-pointer bg-white"
                >
                    <svg class="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span class="text-xs font-semibold text-slate-700">Continue with Google</span>
                </button>

                <button 
                    onclick={() => appState.addToast("Reset verification link dispatched.")} 
                    class="text-xs text-slate-400 hover:text-slate-600 font-light hover:underline text-center cursor-pointer focus:outline-none"
                >
                    Forgot your password?
                </button>
            {/if}

        </div>

        <!-- Physical Ticket Notch (Bottom Center) -->
        <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-50 border-t border-slate-100 rounded-full z-10"></div>
    </div>
</div>