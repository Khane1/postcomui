<!-- src/routes/+page.svelte -->
<script>
  import { goto } from '$app/navigation';
  import { appState } from '$lib/state.svelte.js';
  import ProductGrid from '$lib/components/ProductGrid.svelte';
  import AdBanners from '$lib/components/AdBanners.svelte';  // <-- ADD THIS
  import { products } from '$lib/data/products.js';

  let favoritedProducts = $state({});

  let filteredProducts = $derived(
    products.filter(p => {
      const matchesCategory =
        appState.selectedCategory === 'All' || p.category === appState.selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
        p.seller.toLowerCase().includes(appState.searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
  );

  function handleProductRedirect(product) {
    goto(`/${product.id}`);
  }

  function handleFavoriteToggle(id) {
    if (favoritedProducts[id]) {
      delete favoritedProducts[id];
      appState.favoritesCount -= 1;
      appState.addToast('Removed item from Favorites', 'info');
    } else {
      favoritedProducts[id] = true;
      appState.favoritesCount += 1;
      appState.addToast('Saved item to Favorites');
    }
  }

  function handleAddToCart(product) {
    const existing = appState.cartItems.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      appState.cartItems.push({
        product,
        quantity: 1,
        fulfillment: appState.fulfillmentMode,
      });
    }
    appState.addToast(`Added ${product.name} to basket`);
  }

  function claimCoupon(campaignName) {
    appState.addToast(`Coupon Applied: ${campaignName}!`);
  }
</script>

<div class="space-y-8 pb-12">

  <!-- AD BANNERS (replaces the old static grid + countdown) -->
  <AdBanners onClaimCoupon={claimCoupon} />

  <!-- PRODUCT GRID -->
  <ProductGrid
    products={filteredProducts}
    favoritedMap={favoritedProducts}
    title={appState.selectedCategory === 'All' ? 'Vibrant Marketplace Catalog' : appState.selectedCategory}
    onProductSelect={handleProductRedirect}
    onToggleFavorite={handleFavoriteToggle}
    onAddToCart={handleAddToCart}
  />

</div>