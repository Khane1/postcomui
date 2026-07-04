<!-- routes/account/brands/+page.svelte -->
<script>
import { goto } from "$app/navigation";
import { appState } from "$lib/state.svelte.js";
const brands = [
{
            name: "Sipi Falls Growers Co-op",
            category: "Agro Products",
            location: "Kapchorwa, Elgon Region",
            impact: "Directly funds volcanic water purification systems.",
            initials: "SF",
            rating: "4.9",
            reviews: "142",
            speed: "Delivery by 9:30 AM",
            badge: "No markups",
            banner: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80",
},
{
            name: "Busoga Bee Keepers",
            category: "Food & Beverages",
            location: "Kamuli, Busoga Region",
            impact: "Maintains wild multi-floral forest canopies.",
            initials: "B",
            rating: "4.9",
            reviews: "95",
            speed: "Delivery within 1 hr",
            badge: "100% Organic",
            banner: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
},
{
            name: "Kibinge Coffee Growers Co-op",
            category: "Food & Beverages",
            location: "Bukomansimbi District",
            impact: "Funds fair-trade shade-composting equipment.",
            initials: "KB",
            rating: "4.9",
            reviews: "83",
            speed: "Delivery by 11:15 AM",
            badge: "No markups",
            banner: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80",
},
{
            name: "Luweero Fruit Growers Union",
            category: "Food & Beverages",
            location: "Luweero District",
            impact: "Establishes community solar fruit dehydrators.",
            initials: "LF",
            rating: "4.7",
            reviews: "45",
            speed: "Delivery within 1 hr",
            badge: "Co-op Price",
            banner: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600&q=80",
},
{
            name: "Northern Shea Organics",
            category: "Health & Beauty",
            location: "Lira, Northern Nile",
            impact: "Guarantees direct wages to women-led pickers.",
            initials: "NS",
            rating: "4.8",
            reviews: "122",
            speed: "Delivery by 11:30 AM",
            badge: "No markups",
            banner: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80",
},
{
            name: "Kampala Artisans Guild",
            category: "Arts & Crafts",
            location: "Masaka District",
            impact: "Sustains heritage barkcloth beating guilds.",
            initials: "AG",
            rating: "4.7",
            reviews: "34",
            speed: "Delivery within 24 hr",
            badge: "UNESCO Heritage",
            banner: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80",
},
{
            name: "Lake Victoria Fisheries Co-op",
            category: "Food & Beverages",
            location: "Kiyindi Landing Site",
            impact: "Funds raised-netting fish sanitization racks.",
            initials: "LV",
            rating: "4.6",
            reviews: "41",
            speed: "Delivery within 1 hr",
            badge: "No markups",
            banner: "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&q=80",
},
{
            name: "Rwenzori Vanilla Association",
            category: "Agro Products",
            location: "Bundibugyo District",
            impact: "Sustains direct micro-grants for soil health.",
            initials: "RV",
            rating: "4.9",
            reviews: "73",
            speed: "Delivery by next-morning",
            badge: "Export Grade",
            banner: "https://images.unsplash.com/photo-1595122245594-a55086ee50a6?w=600&q=80",
},
    ];
// Bold, punchy color per slot — this is the paid "front of book" placement,
// so the slot number is real information (it's the rank they bought),
// not decoration.
const cardDesigns = [
{ bg: "bg-[#f04a43]", text: "text-[#f04a43]", radius: "rounded-full", rotate: 0 },
{ bg: "bg-[#fca800]", text: "text-[#fca800]", radius: "rounded-[38px]", rotate: 3 },
{ bg: "bg-[#2f2e5a]", text: "text-[#2f2e5a]", radius: "rounded-[30px]", rotate: -6 },
{ bg: "bg-[#d758c9]", text: "text-[#d758c9]", radius: "rounded-[44px]", rotate: 6 },
{ bg: "bg-[#c20054]", text: "text-[#c20054]", radius: "rounded-[34px]", rotate: 0 },
{ bg: "bg-[#3424d6]", text: "text-[#3424d6]", radius: "rounded-[40px]", rotate: -3 },
{ bg: "bg-[#058a8a]", text: "text-[#058a8a]", radius: "rounded-full", rotate: 5 },
{ bg: "bg-[#51137c]", text: "text-[#51137c]", radius: "rounded-[38px]", rotate: -4 },
    ];
let activeBrands = $derived(appState.brands.length > 0 ? appState.brands : brands);
$effect(() => {
appState.fetchBrands();
});
function handleBrandSelect(brand) {
appState.searchQuery = brand.name.split(" ")[0];
appState.selectedCategory = brand.category;
goto("/products");
}
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet" />
</svelte:head>

<div class="space-y-6 select-none py-4" style="font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;">
<!-- Header Block -->
<div class="border-b border-gray-100 pb-4">
<h2 class="text-[20px] font-extrabold text-gray-900 tracking-tight">Featured brand stores</h2>
<p class="text-[13px] text-gray-500 font-medium mt-1">Our top-ranked cooperatives, artisan guilds, and community-led growers.</p>
</div>
<!-- Ticket Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 py-4">
{#each activeBrands as brand, index}
{@const design = cardDesigns[index % cardDesigns.length]}
{@const slotNum = (index + 1).toString().padStart(2, '0')}
<!-- Outermost ticket card container: hover transform lives here so the
                 notches (absolutely positioned against THIS element) scale together
                 with the button instead of staying fixed in place. -->
<div class="group relative overflow-visible h-full transition-transform duration-200 hover:scale-[1.015]">
<!-- Physical Ticket Notch (Top Center) -->
<div class="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full z-10"></div>
<!-- Main Interactive Ticket Button -->
<button
onclick={() => handleBrandSelect(brand)}
class="{design.bg} text-white w-full aspect-[3/4] rounded-[28px] p-6 flex flex-col justify-between  duration-200  focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 text-left cursor-pointer relative overflow-hidden"
>
<!-- Premium sheen -->
<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/10"></div>
<!-- Top Row: Featured tag + Slot number -->
<div class="relative z-10 flex items-center justify-between">
<span class="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide bg-white/20 px-2 py-1 rounded-full">
<span class="text-[10px] leading-none">✦</span> Featured Partner
</span>
<span class="text-xs font-semibold opacity-65 tracking-wider">
{slotNum}
</span>
</div>
<!-- Headline -->
<div class="relative z-10 space-y-1.5 mt-3">
<h4 class="text-lg font-extrabold tracking-tight leading-tight">
{brand.name}
</h4>
<p class="text-[12px] italic font-medium opacity-75">
{brand.category}
</p>
{#if brand.badge}
<span class="inline-block text-[9px] font-semibold bg-white/15 text-white/90 px-2 py-0.5 rounded-full">
{brand.badge}
</span>
{/if}
</div>
<!-- Organic Photo Blob -->
<div class="relative z-10 flex items-center justify-center py-3">
<div
class="w-28 h-28 bg-white {design.radius} p-1.5  transition-transform group-hover:scale-[1.06] duration-500 relative overflow-hidden"
style="transform: rotate({design.rotate}deg)"
>
<div class="w-full h-full {design.radius} overflow-hidden relative bg-gray-100">
<img
src={brand.banner}
alt={brand.name}
loading="lazy"
class="absolute inset-0 w-full h-full object-cover"
style="transform: rotate({-design.rotate}deg) scale(1.35);"
/>
</div>
<!-- Action indicator -->
<span
class="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-white {design.text} flex items-center justify-center text-xs font-bold shadow-sm"
style="transform: rotate({-design.rotate}deg)"
>
                                ↗
</span>
</div>
</div>
<!-- Footer: trust + logistics -->
<div class="relative z-10 flex justify-between items-end text-[11px] text-white/85 font-medium leading-tight mt-auto border-t border-white/15 pt-4">
<div class="flex flex-col gap-0.5">
<span class="font-semibold">{brand.location}</span>
<span class="opacity-75 font-medium">{brand.speed}</span>
</div>
<div class="flex flex-col items-end gap-0.5">
<span class="font-semibold">★ {brand.rating}</span>
<span class="opacity-75 font-medium">{brand.reviews} reviews</span>
</div>
</div>
</button>
<!-- Physical Ticket Notch (Bottom Center) -->
<div class="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full z-10 "></div>
</div>
{/each}
</div>
</div>