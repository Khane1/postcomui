<!-- routes/account/+layout.svelte -->
<script>
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { appState } from "$lib/state.svelte.js";
  import { publicApi } from "$lib/config/api.js";
  import AccountSidebarNav from "$lib/components/sidebars/AccountSidebarNav.svelte";
  import Signupin from "$lib/components/auth/signup&in.svelte";

  let { children } = $props();

  const menuItems = [
    { id: "Account Information", path: "/account", label: "Account Information" },
    { id: "My Orders", path: "/account/myorders", label: "My Orders" },
    { id: "Favourites", path: "/account/favorites", label: "Favourites" },
    { id: "Payment method", path: "/account/paymentmethod", label: "Payment method" },
    { id: "My Address", path: "/account/myaddress", label: "My Address" },
    { id: "Notification", path: "/account/notification", label: "Notification" },
    { id: "Help", path: "/account/help", label: "Help" }
  ];

  let activeItem = $derived(
    menuItems.find(item => item.path === page.url.pathname) || menuItems[0]
  );
</script>

<div class="w-full flex-1 min-h-screen">
  {#if !appState.isLoggedIn}
    <!-- SECURE SIGN-IN WALL -->
    <Signupin />
  {:else}
    <!-- WORKSPACE WRAPPER -->
    <div class="flex flex-col lg:flex-row flex-1 min-h-[calc(100vh-73px)] w-full">
      
      <!-- DESKTOP FIXED SIDEBAR MENU -->
      <AccountSidebarNav isDrawer={false} />

      <!-- MOBILE RESPONSIVE OVERLAY DRAWER -->
      {#if appState.accountSidebarOpen}
        <button
          onclick={() => { appState.accountSidebarOpen = !appState.accountSidebarOpen; }}
          transition:fade={{ duration: 150 }}
          class="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[60] lg:hidden focus:outline-none cursor-default"
          aria-label="Dismiss sidebar overlay"
        ></button>

        <AccountSidebarNav isDrawer={true} onClose={() => { appState.accountSidebarOpen = false; }} />
      {/if}

      <!-- CONTAINER VIEWPORT SLOT -->
      <section class="flex-1 p-6 sm:py-10 overflow-y-auto bg-white h-[calc(100vh-73px)] px-5 sm:px-10 md:px-20 2xl:pr-40">
        {@render children?.()}
      </section>

    </div>
  {/if}
</div>