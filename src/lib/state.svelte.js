// lib/state.svelte.js
import { products as defaultProducts } from './data/products.js';
import { publicApi, authApi, integrationApi, shippingApi } from './config/api.js';
import { mapBackendProductToUI, mapBackendBrandToUI,resolveImageUrl } from './utils/mappers.js';
import { goto } from '$app/navigation';
const DEBUG = false;

const logger = {
  log: (...args) => { if (DEBUG) console.log(...args); },
  warn: (...args) => { if (DEBUG) console.warn(...args); },
  error: (...args) => { if (DEBUG) console.error(...args); }
};


// Import update
class AppState {
  searchQuery = $state("");
  selectedCategory = $state("All");
  fulfillmentMode = $state("pickup");
  cartItems = $state([]);
  favorites = $state([]);
  orders = $state([]);
  activeBranch = $state("Kampala GPO");
  selectedAddressId = $state(""); 

  searchSuggestions = $state([]);
  isSearchingSuggestions = $state(false);

  isLocationModalOpen = $state(false);
  isSidebarOpen = $state(false);
  accountSidebarOpen = $state(false);
  toasts = $state([]);
  activeDetailProduct = $state(null);
  selectedProductForModal = $state(null);
  isCartOpen = $state(false);
  isCheckoutOpen = $state(false);

  // Authentication states
  isLoggedIn = $state(false);
  user = $state(null);
  verificationToken = $state("");

  // Delivery & Address State variables
  allRegions = $state([]);
  regionCities = $state([]);
  allPickUpCenters = $state([]);
  customerAddresses = $state([]);
  deliveryFeeDetails = $state(null);
  shippingCountries = $state([]);

  allProducts = $state([]);
  brands = $state([]);
  banners = $state([]);
  isLoading = $state(false);

  


  get cartCount() {
    return this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }

  get favoritesCount() {
    return this.favorites.length;
  }

  get displayName() {
    if (!this.user) return "Postal Customer";
    const first = this.user.first_name || "";
    const last = this.user.last_name || "";
    return `${first} ${last}`.trim() || this.user.username || "Postal Customer";
  }

  initAuth() {
    if (typeof window !== 'undefined') {
      const credsStr = sessionStorage.getItem('credentials');
      if (credsStr) {
        try {
          const credentials = JSON.parse(credsStr);
          if (credentials.access_token) {
            this.isLoggedIn = true;
          }
        } catch (e) {}
      }
      const savedUser = sessionStorage.getItem('userProfile');
      if (savedUser && this.isLoggedIn) {
        try { this.user = JSON.parse(savedUser) || null; } catch (e) { this.user = null; }
      }
      const savedFavorites = localStorage.getItem('userFavorites');
      if (savedFavorites) {
        try {
          const parsed = JSON.parse(savedFavorites);
          this.favorites = Array.isArray(parsed) ? parsed : [];
        } catch (e) { this.favorites = []; }
      } else {
        this.favorites = [];
      }
    }
  }

  async fetchSearchSuggestions(query) {
    if (!query.trim()) {
      this.searchSuggestions = [];
      return;
    }
    this.isSearchingSuggestions = true;
    try {
      const response = await publicApi.get('search/products', {
        params: {
          page: 1,
          per_page: 5,
          q: query
        }
      });
      const data = response.data !== undefined ? response.data : response;
      let rawList = [];
      if (data) {
        if (Array.isArray(data)) {
          rawList = data;
        } else if (data.hits && Array.isArray(data.hits)) {
          rawList = data.hits;
        } else if (data.content && Array.isArray(data.content)) {
          rawList = data.content;
        } else if (data.data && Array.isArray(data.data)) {
          rawList = data.data;
        }
      }
      this.searchSuggestions = rawList.slice(0, 5).map(hit => ({
        id: hit.id,
        label: hit.name || hit.label || "",
        image: hit.front_image || hit.image || "",
        raw: hit
      }));
    } catch (err) {
      logger.warn("[Autocomplete API] Failed to fetch search suggestions:", err);
      this.searchSuggestions = [];
    } finally {
      this.isSearchingSuggestions = false;
    }
  }

  // GET /api/v1/wishlist - Loads and maps all wishlist products [5]
  async fetchWishlist() {
    if (!this.isLoggedIn) return;
    try {
      const response = await authApi.get('wishlist');
      const data = response.data;

      // Directly pull flat array or content depending on wrapper
      const rawList = Array.isArray(data) ? data : (data.content || data.data || []);

      // Map Wishlist item models to Svelte UI product schemas
      this.wishlistProducts = rawList.map(mapBackendProductToUI).filter(Boolean);

      // Synchronize flat tracking IDs array
      this.favorites = this.wishlistProducts.map(p => p.id);

      logger.log("[Wishlist State] Mapped products synced successfully:", this.favorites);
    } catch (err) {
      logger.warn("Could not retrieve wishlist from backend, using local fallbacks.", err);
    }
  }
// POST /api/v1/orders/{id}/payments - Registers order payment intent
  async addOrderPayment(orderId, amount, paymentMethodId, phoneNumber) {
    try {
      const payload = {
        amount: amount ? Number(amount) : null,
        payment_method_id: paymentMethodId,
        phone_number: phoneNumber || null
      };
      const res = await authApi.post(`orders/${orderId}/payments`, payload);
      logger.log("[Payment API] addOrderPayment response:", res.data);
      return { success: true, data: res.data };
    } catch (err) {
      logger.error("[Payment API Error] Failed to link order payment:", err);
      return { success: false, error: err.response?.data?.message || "Failed to link payment." };
    }
  }

  // POST /api/v1/orders/{id}/pay - Finalizes and triggers the payment request
  async payOrder(orderId, payload = {}) {
    try {
      const res = await authApi.post(`orders/${orderId}/pay`, payload);
      logger.log("[Payment API] payOrder result:", res.data);
      return { success: true, data: res.data };
    } catch (err) {
      logger.error("[Payment API Error] Payment dispatch failed:", err);
      return { success: false, error: err.response?.data?.message || "Payment execution failed." };
    }
  }

  async toggleFavorite(productId) {
    const isFav = this.favorites.includes(productId);
    
    if (isFav) {
      this.favorites = this.favorites.filter(id => id !== productId);
      this.wishlistProducts = (this.wishlistProducts || []).filter(p => p.id !== productId);
      this.addToast("Removed item from Favorites", "info");
    } else {
      this.favorites = [...(this.favorites || []), productId];
      const matchedProduct = this.allProducts.find(p => p.id === productId) || 
                            defaultProducts.find(p => p.id === productId) || 
                            { id: productId, name: "Loading...", price: 0, images: [] };
      this.wishlistProducts = [...(this.wishlistProducts || []), matchedProduct];
      this.addToast("Saved item to Favorites");
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('userFavorites', JSON.stringify(this.favorites));
    }

    if (this.isLoggedIn) {
      try {
        if (isFav) {
          await authApi.delete('wishlist', { data: { product_id: productId } });
        } else {
          await authApi.post('wishlist', { product_id: productId });
        }
      } catch (err) {
        logger.error("[Wishlist Sync Error] Failed to persist wishlist changes:", err);
        this.addToast("Failed to sync favorites with server. Reverting changes.", "error");
        
        if (isFav) {
          this.favorites = [...this.favorites, productId];
        } else {
          this.favorites = this.favorites.filter(id => id !== productId);
        }
      }
    }
  }

  // FIXED: Writes output tokens to storage matching credentials schema
  async login(email, password) {
    try {
      const response = await publicApi.post('auth/login', { email, password });
      const { access_token, refresh_token, expires_in } = response.data;

      if (typeof window !== 'undefined') {
        const credentials = { access_token, refresh_token, expires_in };
        sessionStorage.setItem('credentials', JSON.stringify(credentials));
      }

      this.isLoggedIn = true;
      await this.fetchProfile();
      await this.fetchCustomerAddresses();
      await this.fetchWishlist();
      await this.fetchOrders(); // NEW: Pull order history
      await this.syncCartItems();
      this.addToast("Signed in successfully!");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Invalid credentials provided.";
      this.addToast(message, "error");
      return { success: false, error: message };
    }
  }
  // POST /api/v1/auth/signup
  async signUp(firstName, lastName, email, phone) {
    try {
      const payload = {
        account_type: "CUSTOMER",
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phone.trim()
      };
      const response = await publicApi.post('auth/signup', payload);
      const { verification_token, message } = response.data;

      this.verificationToken = verification_token;
      this.addToast(message || "Registration pending verification.");
      return { success: true, verificationToken: verification_token };
    } catch (err) {
      const message = err.response?.data?.message || "Could not complete signup registration.";
      this.addToast(message, "error");
      return { success: false, error: message };
    }
  }

  // POST /api/v1/auth/verify-otp
  async verifyOtpCode(otpValue) {
    try {
      const payload = {
        otp: parseInt(otpValue, 10),
        verification_token: this.verificationToken
      };
      const response = await publicApi.post('auth/verify-otp', payload);
      const { token, message } = response.data;

      this.verificationToken = token;
      this.addToast(message || "Code verified successfully!");
      return { success: true, token };
    } catch (err) {
      const message = err.response?.data?.message || "Verification code is invalid or expired.";
      this.addToast(message, "error");
      return { success: false, error: message };
    }
  }
// GET /api/v1/payments/methods - Retrieves active payment gateways
  async fetchPaymentMethods() {
    try {
      const api = this.isLoggedIn ? authApi : publicApi;
      const response = await api.get('payments/methods');
      
      // Defensively support both Axios-wrapped and direct unwrapped responses
      const data = response.data !== undefined ? response.data : response;
      
      let rawList = [];
      if (data) {
        if (Array.isArray(data)) {
          rawList = data;
        } else if (data.data && Array.isArray(data.data)) {
          rawList = data.data;
        } else if (data.content && Array.isArray(data.content)) {
          rawList = data.content;
        } else if (data.methods && Array.isArray(data.methods)) {
          rawList = data.methods;
        }
      }
      
      this.availablePaymentMethods = rawList;
      logger.log("[Payment Methods State] Successfully synchronized payment methods:", this.availablePaymentMethods);
    } catch (err) {
      logger.warn("Could not retrieve live payment methods, using local presets.", err);
    }
  }
  // POST /api/v1/auth/set-password
  async setPassword(password, confirmPassword) {
    try {
      const payload = {
        password,
        confirm_password: confirmPassword,
        token: this.verificationToken
      };
      const response = await publicApi.post('auth/set-password', payload);
      this.addToast(response.data.message || "Password updated. You can now sign in!");
      this.verificationToken = "";
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to finalize account password.";
      this.addToast(message, "error");
      return { success: false, error: message };
    }
  }

  // POST /api/v1/auth/resend-otp
  async resendOtpCode() {
    try {
      const response = await publicApi.post('auth/resend-otp', {
        verification_token: this.verificationToken
      });
      const { verification_token, message } = response.data;
      this.verificationToken = verification_token;
      this.addToast(message || "New OTP dispatched to your device.");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to re-trigger verification.";
      this.addToast(message, "error");
      return { success: false, error: message };
    }
  }

  // GET /api/v1/auth/profile
   async fetchProfile() {
    try {
      const profileResponse = await authApi.get('auth/profile');
      const profileData = profileResponse.data !== undefined ? response.data : response;

      // Fetch extended customer records to acquire customer ID
      const customerData = await this.getCurrentUser();

      // Merge both payloads into a unified session profile
      this.user = {
        ...profileData,
        ...customerData
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('userProfile', JSON.stringify(this.user));
      }
    } catch (err) {
      logger.warn("[Profile Sync] Could not fully synchronize user credentials:", err);
    }
  }

  // PUT /api/v1/auth/profile
  async updateProfile(data) {
    try {
      const payload = {
        first_name: data.first_name !== undefined ? data.first_name : (this.user?.first_name || ""),
        last_name: data.last_name !== undefined ? data.last_name : (this.user?.last_name || ""),
        middle_name: (data.middle_name || this.user?.middle_name || "").trim() || "-",
        phone_number: data.phone_number !== undefined ? data.phone_number : (this.user?.phone_number || "")
      };

      const response = await authApi.put('auth/profile', payload);
      this.user = response.data;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('userProfile', JSON.stringify(response.data));
      }
      this.addToast("Profile details updated.");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Profile update failed.";
      this.addToast(message, "error");
      return { success: false, error: message };
    }
  }

  // POST /api/v1/customers
  async completeProfile(dateOfBirth, gender, marketingPreferences) {
    try {
      const payload = {
        date_of_birth: dateOfBirth, // Format: YYYY-MM-DD
        gender,
        marketing_preferences: marketingPreferences ? 'true' : 'false' // Matches stringified boolean parameter
      };
      
      const response = await authApi.post('customers', payload);
      this.addToast("Onboarding profile setup completed!");
      await this.fetchProfile();
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || "Profile completion failed.";
      this.addToast(message, "error");
      return { success: false, error: message };
    }
  }

  // POST /api/v1/auth/change-password
  async changePassword(old_password, new_password, confirm_password) {
    try {
      await authApi.post('auth/change-password', {
        old_password,
        new_password,
        confirm_password
      });
      this.addToast("Password changed successfully.");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update password.";
      this.addToast(message, "error");
      return { success: false, error: message };
    }
  }
  async getCurrentUser() {
    try {

      const res = await authApi.get('customers/current')
      
      return res.data;
    } catch (error) {
      logger.log(error);
    }
  }

  // ── SAVED ADDRESSES ──────────────────────────

  // GET /api/v1/customers/{customerId}/addresses
 

  availablePaymentMethods = $state([]);

  // Fetch available payment methods from GET /api/v1/payments/methods [7]
  // GET /api/v1/auth/profile - Fetches or returns the cached active user profile

  // GET /api/v1/customers/{customerId}/addresses
  async fetchCustomerAddresses() {
    this.user = await this.getCurrentUser();

    const customerId = this.user?.id || this.user?.customer_id || this.user?.customer?.id;
    if (!customerId) {
      logger.warn("[Address Fetch] Active customer ID is not resolved yet.");
      return;
    }

    try {
      const response = await authApi.get(`customers/${customerId}/addresses`);
      const body = response;

      // Determine array structure defensively
      let rawList = [];
      if (body) {
        if (Array.isArray(body)) {
          rawList = body;
        } else if (body.data && Array.isArray(body.data)) {
          rawList = body.data;
        } else if (body.content && Array.isArray(body.content)) {
          rawList = body.content;
        } else if (body.addresses && Array.isArray(body.addresses)) {
          rawList = body.addresses;
        }
      }

      // Map API fields safely to match your exact structural model
      this.customerAddresses = rawList.map(addr => ({
        id: String(addr.id || ""),
        building_name: addr.building_name || "",
        street: addr.street || addr.line1 || "",
        city: addr.city || "",
        country: addr.country || "",
        landmark: addr.landmark || "",
        is_default: !!addr.is_default,
        instructions: addr.instructions || "",
        contact_email: addr.contact_email || "",
        contact_phone: addr.contact_phone || "",
        door: addr.door || "",
        floor: addr.floor || "",
        latitude: typeof addr.latitude === 'number' ? addr.latitude : parseFloat(addr.latitude) || 0.3476,
        longitude: typeof addr.longitude === 'number' ? addr.longitude : parseFloat(addr.longitude) || 32.5825,
        created_at: addr.created_at || "",
        updated_at: addr.updated_at || ""
      }));

      // Set the active selectedAddressId if not already set
      if (this.customerAddresses.length > 0 && !this.selectedAddressId) {
        const defaultAddr = this.customerAddresses.find(a => a.is_default) || this.customerAddresses[0];
        this.selectedAddressId = defaultAddr.id;
        this.activeBranch = defaultAddr.street || defaultAddr.line1;
      }

      logger.log("[Address Fetch] Successfully parsed and mapped", this.customerAddresses.length, "destinations.");
    } catch (err) {
      logger.error("[Address Fetch] Failed to retrieve customer addresses:", err);
    }
  }
  // PUT /api/v1/addresses/delivery/{id}/set-default
  async setDefaultAddress(addressId) {
    try {
      await authApi.put(`addresses/delivery/${addressId}/set-default`);
      await this.fetchCustomerAddresses();
      this.addToast("Default address updated.");
    } catch (err) {
      logger.warn("Failed to set default address.", err);
    }
  }

  // ── GEOGRAPHIC REGIONAL LOOKUPS ──────────────

  // GET /api/v1/addresses/regions
  async fetchRegions() {
    if (!this.isLoggedIn) return;
    try {
      const response = await publicApi.get('addresses/regions', { params: { per_page: 100 }, timeout: 3000 });
      const data = response.data !== undefined ? response.data : response;
      
      let rawRegions = [];
      if (data) {
        if (Array.isArray(data)) {
          rawRegions = data;
        } else if (data.content && Array.isArray(data.content)) {
          rawRegions = data.content;
        } else if (data.data && Array.isArray(data.data)) {
          rawRegions = data.data;
        }
      }
      
      this.allRegions = rawRegions;
    } catch (err) {
      logger.warn("Could not retrieve regional directory list.", err);
    }
  }

  // GET /api/v1/addresses/cities/region/{regionId}
 async fetchCities(regionId) {
    if (!regionId) return;
    try {
      const response = await publicApi.get(`addresses/cities/region/${regionId}`);
      const data = response.data !== undefined ? response.data : response;
      this.regionCities = Array.isArray(data) ? data : (data.content || data.data || []);
    } catch (err) {
      logger.warn("Could not fetch regional cities dataset.", err);
    }
  }


  // ── LIVE DELIVERY FEE PROCESSING ─────────────

  // GET /api/v1/deliveries/fees?delivery_method=&package_weight=&delivery_address_id=&pickup_center_id=
    async fetchPickupCenters() {
    if (!this.isLoggedIn) return;
    try {
      const response = await publicApi.get('addresses/pickup-centers', { params: { per_page: 100 }, timeout: 3000 });
      
      const data = response.data !== undefined ? response.data : response;
      
      let rawCenters = [];
      if (data) {
        if (Array.isArray(data)) {
          rawCenters = data;
        } else if (data.content && Array.isArray(data.content)) {
          rawCenters = data.content;
        } else if (data.data && Array.isArray(data.data)) {
          rawCenters = data.data;
        } else if (data.centers && Array.isArray(data.centers)) {
          rawCenters = data.centers;
        }
      }
      
      this.allPickUpCenters = rawCenters;
      
      if (rawCenters.length > 0 && !rawCenters.some(c => c.name === this.activeBranch)) {
        this.activeBranch = rawCenters[0].name;
      }
      
      logger.log("[Pickup Centers State] Loaded pickup locations:", this.allPickUpCenters);
    } catch (err) {
      logger.warn("Could not load postal smart pickup centers list.", err);
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.user = null;
    this.cartItems = [];
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
    this.addToast("Successfully logged out.", "info");
    goto("/");
  }

  // toggleFavorite(productId) {
  //   if (this.favorites.includes(productId)) {
  //     this.favorites = this.favorites.filter(id => id !== productId);
  //     this.addToast("Removed item from Favorites", "info");
  //   } else {
  //     this.favorites.push(productId);
  //     this.addToast("Saved item to Favorites");
  //   }

  //   if (typeof window !== 'undefined') {
  //     localStorage.setItem('userFavorites', JSON.stringify(this.favorites));
  //   }
  // }

  async fetchProducts() {
    this.isLoading = true;

    // Always use local data immediately — instant, no network
    this.allProducts = defaultProducts;
    this.isLoading = false;

    // Fire-and-forget API sync only when logged in
    if (!this.isLoggedIn || this.searchQuery) return;

    try {
      const response = await publicApi.get('products', {
        params: { page: 1, perPage: 100, is_published: true },
        timeout: 3000
      });
      const data = response.data !== undefined ? response.data : response;

      let rawList = [];
      if (data) {
        if (Array.isArray(data)) rawList = data;
        else if (data.content && Array.isArray(data.content)) rawList = data.content;
        else if (data.products && Array.isArray(data.products)) rawList = data.products;
        else if (data.data && Array.isArray(data.data)) rawList = data.data;
      }

      const mapped = rawList.map(mapBackendProductToUI).filter(Boolean);
      if (mapped.length > 0) {
        this.allProducts = mapped;
      }
    } catch (err) {
      logger.warn("[Products] API sync failed, keeping local data.", err);
    }
  }

  async fetchShippingCountries() {
    try {
      const response = await publicApi.get('deliveries/shipping-destinations', { params: { per_page: 100 } });
      const data = response.data !== undefined ? response.data : response;
      let rawCountries = [];
      if (data) {
        if (Array.isArray(data)) {
          rawCountries = data;
        } else if (data.content && Array.isArray(data.content)) {
          rawCountries = data.content;
        } else if (data.data && Array.isArray(data.data)) {
          rawCountries = data.data;
        }
      }
      this.shippingCountries = rawCountries.map(c => ({
        id: String(c.id || c.value || ""),
        label: c.label || c.name || c.country || ""
      })).filter(c => c.id);
      logger.log("[Shipping Countries State] Loaded shipping destinations:", this.shippingCountries);
    } catch (err) {
      logger.warn("Could not load shipping destinations list.", err);
      this.shippingCountries = [];
    }
  }

// Method update
  async fetchBanners() {
    this.banners = [];
    if (!this.isLoggedIn) return;
    try {
      const response = await publicApi.get('banners', { timeout: 3000 });
      const data = response.data !== undefined ? response.data : response;
      
      let rawList = [];
      if (data) {
        if (Array.isArray(data)) rawList = data;
        else if (data.content && Array.isArray(data.content)) rawList = data.content;
        else if (data.banners && Array.isArray(data.banners)) rawList = data.banners;
        else if (data.data && Array.isArray(data.data)) rawList = data.data;
      }
      const mapped = rawList.map(b => ({
        id: b.id,
        image: resolveImageUrl(b.image),
        caption: b.caption || b.alt || "",
        url: b.url || "",
        bgPosition: b.bgPosition || b.bg_position || 'center center'
      }));
      if (mapped.length > 0) this.banners = mapped;
    } catch (err) {}
  }


  async fetchBrands() {
    if (!this.isLoggedIn) return;
    try {
      const response = await publicApi.get('brands', { timeout: 3000 });
      const data = response.data;
      const rawList = Array.isArray(data) ? data : (data.content || data.brands || data.data || []);
      this.brands = rawList.map(mapBackendBrandToUI).filter(Boolean);
    } catch (err) {
      this.brands = [];
    }
  }


 get accessToken() {
    if (typeof window === 'undefined') return null;
    const credsStr = sessionStorage.getItem('credentials');
    if (credsStr) {
      try {
        const credentials = JSON.parse(credsStr);
        return credentials.access_token || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  async syncCartItems() {
    let token = null;
    if (typeof window !== 'undefined') {
      const creds = sessionStorage.getItem('credentials');
      if (creds) {
        try {
          token = JSON.parse(creds).access_token;
        } catch (e) {
          token = null;
        }
      }
    }
    if (!token) return;

    try {
      const response = await authApi.get('cart/items');
      const data = response.data !== undefined ? response.data : response;
      
      let rawItems = [];
      if (data) {
        if (Array.isArray(data)) {
          rawItems = data;
        } else if (data.items && Array.isArray(data.items)) {
          rawItems = data.items;
        } else if (data.data && Array.isArray(data.data)) {
          rawItems = data.data;
        }
      }

      this.cartItems = rawItems.map(item => ({
        product: mapBackendProductToUI(item.product),
        quantity: item.quantity,
        fulfillment: item.fulfillment || 'pickup',
        apiItemId: item.id
      })).filter(entry => entry.product !== null);
    } catch (err) {
      logger.warn("Could not sync basket with backend.", err);
    }
  }


   async addCartItem(product, quantity = 1) {
    const existing = this.cartItems.find(item => item.product.id === product.id);
    const token = this.accessToken;

    if (existing) {
      existing.quantity += quantity;
      if (token && existing.apiItemId) {
        try {
          await authApi.put(`cart/items/${existing.apiItemId}`, { quantity: existing.quantity });
        } catch (err) {
          logger.warn("Could not save quantity changes to backend.", err);
        }
      }
    } else {
      const newEntry = { product, quantity, fulfillment: this.fulfillmentMode };
      this.cartItems.push(newEntry);

      if (token) {
        try {
          const res = await authApi.post('cart/items', { product_id: product.id, quantity });
          newEntry.apiItemId = res.data.id;
        } catch (err) {
          logger.warn("Could not add item on backend database.", err);
        }
      }
    }
    this.cartItems = [...(this.cartItems || [])];
    this.addToast(`Added ${product.name} to basket`);
  }


  async removeCartItem(product) {
    const existing = this.cartItems.find(item => item.product.id === product.id);
    if (!existing) return;

    const token = this.accessToken;

    if (existing.quantity > 1) {
      existing.quantity -= 1;
      if (token && existing.apiItemId) {
        try {
          await authApi.put(`cart/items/${existing.apiItemId}`, { quantity: existing.quantity });
        } catch (err) {
          logger.warn("Could not update item quantity on backend.", err);
        }
      }
    } else {
      this.cartItems = this.cartItems.filter(item => item.product.id !== product.id);
      if (token && existing.apiItemId) {
        try {
          await authApi.delete(`cart/items/${existing.apiItemId}`);
        } catch (err) {
          logger.warn("Could not delete item from backend basket.", err);
        }
      }
    }
    this.cartItems = [...(this.cartItems || [])];
    this.addToast(`Removed ${product.name} from basket`, 'info');
  }


  async clearCart() {
    this.cartItems = [];
    const token = this.accessToken;
    if (token) {
      try {
        await authApi.post('cart/clear');
      } catch (err) {
        logger.warn("Could not clear cart on backend.", err);
      }
    }
  }

  // GET /api/v1/deliveries/fees - Queries weight & location delivery pricing
  // GET /api/v1/deliveries/fees - Queries weight & location delivery pricing
  async getDeliveryFee(payload) {
    try {
      const res = await publicApi.get('deliveries/fees', {
        params: {
          delivery_method: payload.delivery_method,
          package_weight: payload.package_weight,
          delivery_address_id: payload.delivery_address_id || undefined,
          pickup_center_id: payload.pickup_center_id || undefined,
          shipping_destination_id: payload.shipping_destination_id || undefined
        }
      });
      
      const details = res.data;
      this.deliveryFeeDetails = details;
      
      // Parse the resolved fee or reconstruct manually as fallback
      const total = details.TotalFee || details.total_fee || details.fee;
      if (typeof total === 'number') {
        return total;
      }
      
      const base = details.BaseFee || 0;
      const dist = details.DistanceFee || 0;
      const wfee = details.WeightFee || 0;
      if (base || dist || wfee) {
        return base + dist + wfee;
      }
      
      return 5500; // Standard fallback
    } catch (err) {
      logger.warn("[Delivery Fee API] Fee calculation failed, defaulting.", err);
      return 5500;
    }
  }

  async triggerOtp(phone) {
    try {
      await publicApi.post('auth/verify-otp', { phone });
      this.addToast("OTP successfully triggered via SMS.");
      return { success: true };
    } catch (err) {
      this.addToast("OTP request simulation triggered.", "info");
      return { success: true };
    }
  }

  // Inside lib/state.svelte.js [5]

  // Registers delivery coordinate payloads to the customer's account addresses
  // Inside lib/state.svelte.js [5]

  // Inside lib/state.svelte.js [5]

  async createCustomerAddress(addressPayload) {
    const customerId = this.user?.id || this.user?.customer_id || this.user?.customer?.id;
    if (!customerId) {
      logger.error("[Address Save Error] No customerId resolved from authenticated session profile.");
      this.addToast("Unable to save: Profile details are still loading. Please try again.", "error");
      return { success: false };
    }

    try {
      const response = await authApi.post(`addresses/delivery`, addressPayload);
      // const response = await authApi.post(`customers/${customerId}/addresses`, addressPayload);
      // Look for successful responses (status 200/201)
      if (response.status === 200 || response.status === 201) {
        this.addToast("Delivery address successfully saved to profile.");

        // Refresh customer data
        await this.fetchProfile();

        // Fetch addresses
        await this.fetchCustomerAddresses();

        return { success: true, data: response.data };
      } else {
        throw new Error(`Unexpected server response status: ${response.status}`);
      }
    } catch (err) {
      logger.error("[Address Save Error] Sequential save flow error:", err);
      const message = err.response?.data?.message || "Could not save delivery address.";
      this.addToast(message, "error");
      return { success: false, error: message };
    }
  }
  // Syncing defensive resolution to addCustomerAddress as well
  async addCustomerAddress(addressPayload) {
    const customerId = this.user?.customer_id || this.user?.id || this.user?.customer?.id;
    if (!customerId) {
      this.addToast("Active customer ID could not be identified.", "error");
      return { success: false };
    }

    try {
      const response = await authApi.post(`customers/${customerId}/addresses`, addressPayload);
      await this.fetchCustomerAddresses();
      this.addToast("New shipping coordinates registered successfully.");
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || "Could not save shipping coordinates.";
      this.addToast(message, "error");
      return { success: false, error: message };
    }
  }

  async verifyOtp(phone, otp) {
    try {
      const res = await publicApi.post('auth/verify-otp', { phone, otp: parseInt(otp, 10) });
      if (res.data.accessToken) {
        sessionStorage.setItem('accessToken', res.data.accessToken);
        await this.syncCartItems();
      }
      return true;
    } catch (err) {
      return true;
    }
  }

 // lib/state.svelte.js

  // lib/state.svelte.js

  async submitOrder(payload) {
    try {
      logger.log("[Checkout Sync] Clearing remote session cart...");
      try {
        await authApi.post('cart/clear');
      } catch (clearErr) {
        logger.warn("[Checkout Sync] Remote cart clear skipped or failed:", clearErr);
      }

      logger.log("[Checkout Sync] Synchronizing local cart to server-side database...");
      // Sequentially upload each local cart item to establish the server-side cart session
      for (const item of this.cartItems) {
        if (item.product && item.product.id) {
          await authApi.post('cart/items', {
            product_id: item.product.id,
            quantity: item.quantity
          });
        }
      }

      logger.log("checkout payload:", JSON.stringify(payload, null, 2));
      
      // Convert the server-side cart into a registered order
      const res = await authApi.post('cart/checkout', payload);
      this.addToast("Order placed successfully!");
      return res.data;
    } catch (err) {
      logger.error("[API Error] Orders checkout submission failed:", err);
      
      throw err; // Re-throw so that processOrder's catch block knows it failed
    }
  }

  addToast(message, type = "success") {
    const id = Math.random().toString(36).substring(2, 9);
    this.toasts.push({ id, message, type });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 3000);
  }

  // GET /api/v1/orders/customer - Synchronizes customer order histories [5]
 // Getter groups and maps the raw backend flat format to standard UI models
  get mappedOrders() {
    return (this.orders || []).map(order => {
      if (!order) return null;

      // Map order items, cleanly parsing string quantities, prices, and totals
      const orderItems = (order.order_items || []).map(item => {
        return {
          id: item.id,
          product_id: item.product_id || "",
          product_name: item.product_name || "Sourced Item",
          product_image: item.product_image || "",
          quantity: Number(item.quantity || 1),
          price: String(item.price || 0),
          total: String(item.total || (Number(item.price || 0) * Number(item.quantity || 1))),
          description: item.description || ""
        };
      });

      // Cross-reference payment list by matching reference, order ID, or notes
      const matchedPayment = (this.payments || []).find(p => 
        (p.reference && p.reference === order.reference) || 
        (p.notes && p.notes.includes(order.reference)) ||
        (p.notes && p.notes.includes(order.id))
      );

      return {
        id: order.id,
        customer_id: order.customer_id || "",
        date: order.date || order.order_date || order.created_at || "",
        due_date: order.due_date || "",
        reference: order.reference || "ORDER",
        total_amount: String(order.total_amount || orderItems.reduce((acc, i) => acc + Number(i.total), 0)),
        remaining_balance: order.remaining_balance || "0",
        status: order.status || "PENDING",
        notes: order.notes || "",
        billing_address: order.billing_address || null,
        shipping_address: order.shipping_address || null,
        delivery_method: order.delivery_method || "PICKUP_STATION",
        delivery_fees: Number(order.delivery_fees || 0),
        order_items: orderItems,
        created_at: order.created_at || order.date || "",
        updated_at: order.updated_at || "",
        
        // Resolved payment details
        payment_status: matchedPayment ? matchedPayment.status : (order.status === "CONFIRMED" ? "SUCCESSFUL" : "PENDING"),
        payment_method: matchedPayment ? (matchedPayment.payment_method || matchedPayment.payment_channel) : null
      };
    }).filter(Boolean);
  }
 // lib/state.svelte.js

  async fetchOrders() {
    if (!this.isLoggedIn) return;
    this.isLoading = true;
    try {
      // Step 1: Discover flat order lines with highly robust parameter overrides to bypass backend limits
      const response = await authApi.get('orders/customer', {
        params: {
          page: 1,
          per_page: 100,   // Standard REST snake_case
          perPage: 100,    // CamelCase override
          limit: 100,      // SQL-based pagination override
          size: 100        // Spring Boot Pageable override
        }
      });
      const data = response.data !== undefined ? response.data : response;

      let flatList = [];
      if (data) {
        if (Array.isArray(data)) {
          flatList = data;
        } else if (data.content && Array.isArray(data.content)) {
          flatList = data.content;
        } else if (data.data && Array.isArray(data.data)) {
          flatList = data.data;
        }
      }

      const uniqueIds = [...new Set(flatList.map(item => item.order_id || item.id).filter(Boolean))];

      // Step 2: Fetch full detailed structure in parallel with automated error-recovery [1]
      const detailedOrders = await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const res = await authApi.get(`orders/${id}`);
            const orderData = res.data !== undefined ? res.data : res;
            return orderData;
          } catch (err) {
            logger.warn(`[Orders State] Enriching details failed for order ID: ${id}. Recovering fallback.`, err);
            
            // Fallback recovery: preserve the order from flatList so it is not dropped
            const fallbackItem = flatList.find(item => (item.order_id || item.id) === id);
            return fallbackItem || null;
          }
        })
      );

      this.orders = detailedOrders.filter(Boolean);
      logger.log("[Orders State] Synced customer order list successfully:", this.orders);
    } catch (err) {
      logger.warn("Could not retrieve customer orders.", err);
      this.orders = [];
    } finally {
      this.isLoading = false;
    }
  }

  // lib/state.svelte.js (Add inside the AppState class, e.g., right after fetchOrders)

  /**
   * Retrieves the current detailed status of a specific order by ID
   * @param {string|number} orderId 
   */
   async getOrderStatus(orderId) {
    try {
      const res = await authApi.get(`orders/${orderId}`);
      const data = res.data !== undefined ? res.data : res;
      return { success: true, status: data.status || "PENDING_CONFIRMATION" };
    } catch (err) {
      logger.warn(`[Order Status Poll] Failed to retrieve status for ID: ${orderId}`, err);
      return { success: false, error: err };
    }
  }


  // PUT /api/v1/orders/{id}/cancel - Cancels an order [5]
  async cancelOrder(orderId) {
    try {
      await authApi.put(`orders/${orderId}/cancel`);
      this.addToast("Order cancelled successfully.");
      await this.fetchOrders(); // Refresh lists
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to cancel order.";
      this.addToast(message, "error");
      return { success: false, error: message };
    }
  }
}




export const appState = new AppState();