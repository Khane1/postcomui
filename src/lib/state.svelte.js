// src/lib/state.svelte.js
class AppState {
  searchQuery = $state("");
  selectedCategory = $state("All");
  fulfillmentMode = $state("pickup");
  cartItems = $state([]); // Stores array of { product, quantity, fulfillment }
  favoritesCount = $state(0);
  activeBranch = $state("Kampala GPO");
  isLocationModalOpen = $state(false);
  
  // Real-time toast notifications list
  toasts = $state([]);

  // Svelte 5 Getter to dynamically calculate derived cart items count
  get cartCount() {
    return this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }

  // Pushes a notification and auto-removes it after 3 seconds
  addToast(message, type = "success") {
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts.push({ id, message, type });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 3000);
  }
}

export const appState = new AppState();