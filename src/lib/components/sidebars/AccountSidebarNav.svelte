<!-- lib/components/sidebars/AccountSidebarNav.svelte -->
<script>
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { appState } from "$lib/state.svelte.js";

  let { isDrawer = false, onClose } = $props();

  const menuItems = [
    {
      id: "Account Information",
      path: "/account",
      label: "Account Information",
      icon: "user",
    },
    {
      id: "My Orders",
      path: "/account/myorders",
      label: "My Orders",
      icon: "receipt",
    },
    {
      id: "Favourites",
      path: "/account/favorites",
      label: "Favourites",
      icon: "heart",
    },
    {
      id: "Payment method",
      path: "/account/paymentmethod",
      label: "Payment method",
      icon: "card",
    },
    {
      id: "My Address",
      path: "/account/myaddress",
      label: "My Address",
      icon: "pin",
    },
    {
      id: "Notification",
      path: "/account/notification",
      label: "Notification",
      icon: "bell",
    },
    { id: "Help", path: "/account/help", label: "Help", icon: "help" },
  ];

  function handleNavigate(path) {
    if (onClose) onClose();
    goto(path);
  }

  function handleLogout() {
    if (onClose) onClose();
    appState.logout();
  }
</script>

<aside
  class="fixed inset-y-0 left-0 z-50 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] lg:overflow-y-auto lg:z-30 lg:flex w-60 bg-white border-r border-slate-100/50 flex-col justify-between p-4 flex-shrink-0 select-none font-sans transition-transform duration-300 ease-in-out lg:transform-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
    {appState.accountSidebarOpen
    ? 'translate-x-0 fixed inset-y-0 left-0 z-[70] w-64 shadow-2xl border-r border-slate-100 animate-in slide-in-from-left duration-250 lg:hidden '
    : '-translate-x-full lg:translate-x-0'} 
    "
>
  <div class="space-y-4">
    <!-- Close Header for Mobile Drawer or Back link for Desktop -->
    <div
      class="flex items-center justify-between border-b border-slate-100 pb-3 lg:border-0 lg:pb-0"
    >
      {#if appState.accountSidebarOpen}
        <span
          class="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase"
          >Profile options</span
        >
        <button
          onclick={onClose}
          class="p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
          aria-label="Close menu"
        >
          <svg
            class="w-4.5 h-4.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      {:else}
        <button
          onclick={() => goto("/")}
          class="flex items-center gap-1.5 text-sm  mb-4 px-2 py-1 hover:bg-slate-50 rounded transition-all"
        >
           <svg
              class="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.1"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>  Continue Shopping
        </button>
      {/if}
    </div>

    <!-- Active Navigation List matching main category style -->
    <nav class="space-y-1" aria-label="Account navigation">
      {#each menuItems as item}
        {@const isSelected = page.url.pathname === item.path}
        <button
          onclick={() => handleNavigate(item.path)}
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all text-left focus:outline-none
            {isSelected
            ? 'bg-black text-white shadow-xs'
            : 'text-slate-800 hover:bg-[#F1EFE9]'}"
        >
          {#if item.icon === "user"}
            <svg
              class="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.1"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          {:else if item.icon === "receipt"}
            <svg
              class="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.1"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          {:else if item.icon === "heart"}
            <svg
              class="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.1"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          {:else if item.icon === "card"}
            <svg
              class="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.1"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-6.188-12.75h13.376c1.014 0 1.838.824 1.838 1.838v11.324c0 1.014-.824 1.838-1.838 1.838H3.188A1.838 1.838 0 0 1 1.35 15.662V5.338c0-1.014.824-1.838 1.838-1.838Z"
              />
            </svg>
          {:else if item.icon === "pin"}
            <svg
              class="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.1"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z"
              />
            </svg>
          {:else if item.icon === "bell"}
            <svg
              class="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.1"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
              />
            </svg>
          {:else if item.icon === "help"}
            <svg
              class="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              stroke-width="2.1"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>
    
          {/if}
          <span class="tracking-tight">{item.label}</span>
        </button>
      {/each}
    </nav>
  </div>

  <!-- Logout Option styled to match menu layouts exactly -->
  <div class="space-y-4">
    <div class="border-t border-slate-100 my-2"></div>
    <button
      onclick={handleLogout}
      class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-red-500 hover:bg-red-50 transition-all text-left focus:outline-none"
    >
      <svg
        class="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        stroke-width="2.1"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
        />
      </svg>
      <span class="tracking-tight">Log out</span>
    </button>
  </div>
</aside>
