<!-- src/routes/+page.svelte -->
<script>
  import { goto } from '$app/navigation';
  import { appState } from '$lib/state.svelte.js';
  import ProductGrid from '$lib/components/ProductGrid.svelte';
  import { products } from '$lib/data/products.js';

  let favoritedProducts = $state({});

  let filteredProducts = $derived(
    products.filter(p => {
      const currentCategory = appState.selectedCategory;
      const currentSearch = appState.searchQuery;

      const matchesCategory = currentCategory === "All" || p.category === currentCategory;
      const matchesSearch = p.name.toLowerCase().includes(currentSearch.toLowerCase()) || 
                            p.seller.toLowerCase().includes(currentSearch.toLowerCase());
                            
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
    } else {
      favoritedProducts[id] = true;
      appState.favoritesCount += 1;
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
        fulfillment: appState.fulfillmentMode
      });
    }
    // Launch central notification toast
    appState.addToast(`Added ${product.name} to basket`);
  }
</script>

<ProductGrid 
  products={filteredProducts}
  favoritedMap={favoritedProducts}
  title={appState.selectedCategory === "All" ? "Current Catalog Offerings" : appState.selectedCategory}
  onProductSelect={handleProductRedirect}
  onToggleFavorite={handleFavoriteToggle}
  onAddToCart={handleAddToCart}
/>