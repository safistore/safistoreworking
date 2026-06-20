// ==========================================================================
// SafiStore - Main Application Controller (Vanilla JS)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // --- APPLICATION STATE ---
  const state = {
    productsList: [],
    cart: [],
    activeCategory: "All",
    searchQuery: "",
    selectedCategories: [],
    minPrice: 0,
    maxPrice: 999999,
    selectedRatings: [],
    selectedDiscounts: [],
    sortOption: "popularity",
    appliedPromo: null,
    userPincode: localStorage.getItem("safistore_pincode") || null,
    currentSlide: 0,
    activeProduct: null,
    currentCheckoutStep: 1,
    selectedDetailRating: 5
  };

  // --- DOM ELEMENTS ---
  const elements = {
    productsGrid: document.getElementById("products-grid"),
    sortSelect: document.getElementById("sort-select"),
    searchInput: document.getElementById("search-input"),
    searchBtn: document.getElementById("search-btn"),
    searchSuggestions: document.getElementById("search-suggestions"),
    themeToggle: document.getElementById("theme-toggle"),
    cartToggleBtn: document.getElementById("cart-toggle-btn"),
    cartCount: document.getElementById("cart-count"),
    cartDrawerOverlay: document.getElementById("cart-drawer-overlay"),
    closeCartBtn: document.getElementById("close-cart-btn"),
    cartItemsList: document.getElementById("cart-items-list"),
    cartSubtotal: document.getElementById("cart-subtotal"),
    cartDiscountRow: document.getElementById("cart-discount-row"),
    cartDiscount: document.getElementById("cart-discount"),
    cartDeliveryCost: document.getElementById("cart-delivery-cost"),
    cartTotalCost: document.getElementById("cart-total-cost"),
    shippingStatusText: document.getElementById("shipping-status-text"),
    shippingThresholdDiff: document.getElementById("shipping-threshold-diff"),
    shippingProgressFill: document.getElementById("shipping-progress-fill"),
    promoInput: document.getElementById("promo-input"),
    promoApplyBtn: document.getElementById("promo-apply-btn"),
    promoMsg: document.getElementById("promo-msg"),
    proceedCheckoutBtn: document.getElementById("proceed-checkout-btn"),
    
    // Product Detail Modal
    productDetailModal: document.getElementById("product-detail-modal"),
    closeDetailModalBtn: document.getElementById("close-detail-modal-btn"),
    detailBrand: document.getElementById("detail-brand"),
    detailName: document.getElementById("detail-name"),
    detailMainImg: document.getElementById("detail-main-img"),
    detailThumbnails: document.getElementById("detail-thumbnails-container"),
    detailRatingBadge: document.getElementById("detail-rating-badge"),
    detailReviewsCount: document.getElementById("detail-reviews-count"),
    detailPrice: document.getElementById("detail-price"),
    detailMrp: document.getElementById("detail-mrp"),
    detailDiscount: document.getElementById("detail-discount"),
    detailDesc: document.getElementById("detail-desc"),
    detailSpecsTable: document.getElementById("detail-specs-table"),
    pincodeCheckInput: document.getElementById("pincode-check-input"),
    pincodeCheckBtn: document.getElementById("pincode-check-btn"),
    pincodeResult: document.getElementById("pincode-result"),
    modalAddToCartBtn: document.getElementById("modal-add-to-cart-btn"),
    modalBuyNowBtn: document.getElementById("modal-buy-now-btn"),
    reviewsListContainer: document.getElementById("reviews-list-container"),
    ratingSelector: document.getElementById("rating-selector"),
    reviewCommentInput: document.getElementById("review-comment-input"),
    submitReviewBtn: document.getElementById("submit-review-btn"),
    headerPincode: document.getElementById("header-pincode"),
    toastContainer: document.getElementById("toast-container"),
    
    // Carousel Slides
    slides: document.querySelectorAll(".carousel-slide"),
    dots: document.querySelectorAll(".dot"),
    prevBtn: document.querySelector(".carousel-prev-btn"),
    nextBtn: document.querySelector(".carousel-next-btn"),
    clearFiltersBtn: document.getElementById("clear-filters-btn")
  };

  // --- INITIALIZATION ---
  async function init() {
    setupTheme();
    
    // Fetch products from Firebase Firestore with a 3-second timeout fallback
    const fallbackProducts = window.products || [];
    try {
      if (window.firebaseDb && typeof window.firebaseDb.loadProducts === "function" && window.firebaseDb.isLive()) {
        const dbPromise = window.firebaseDb.loadProducts(fallbackProducts);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Firebase query timed out")), 3000)
        );
        state.productsList = await Promise.race([dbPromise, timeoutPromise]);
        
        // Update connection status UI
        const statusDot = document.getElementById("db-status-dot");
        const statusText = document.getElementById("db-status-text");
        if (statusDot && statusText) {
          statusDot.style.backgroundColor = "var(--success-color)";
          statusText.innerText = "Firebase Live";
        }
      } else {
        throw new Error("firebaseDb is offline or not defined");
      }
    } catch (e) {
      console.warn("Failed to load products from Firebase, falling back to local database.", e);
      state.productsList = [...fallbackProducts];
      
      // Update connection status UI to offline
      const statusDot = document.getElementById("db-status-dot");
      const statusText = document.getElementById("db-status-text");
      if (statusDot && statusText) {
        statusDot.style.backgroundColor = "var(--error-color)";
        statusText.innerText = "Local Offline";
      }
    }

    renderProducts();
    setupCarousel();
    setupDealCountdown();
    setupEventListeners();
    updatePincodeHeader();
    lucide.createIcons();
  }

  // --- THEME MANAGEMENT ---
  function setupTheme() {
    const savedTheme = localStorage.getItem("safistore_theme") || "light";
    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme");
      elements.themeToggle.innerHTML = `<i data-lucide="sun"></i>`;
    } else {
      document.body.classList.remove("dark-theme");
      elements.themeToggle.innerHTML = `<i data-lucide="moon"></i>`;
    }
  }

  function toggleTheme() {
    const isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("safistore_theme", isDark ? "dark" : "light");
    elements.themeToggle.innerHTML = isDark ? `<i data-lucide="sun"></i>` : `<i data-lucide="moon"></i>`;
    lucide.createIcons();
    showToast(isDark ? "Switched to Dark Mode" : "Switched to Light Mode", "info");
  }

  // --- PRODUCT RENDERING & FILTERING ---
  function renderProducts() {
    let filtered = [...state.productsList];

    // Filter by Active Category (from navigation links)
    if (state.activeCategory !== "All") {
      filtered = filtered.filter(p => p.category === state.activeCategory);
    }

    // Filter by Search Query
    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Filter by Sidebar Categories
    if (state.selectedCategories.length > 0) {
      filtered = filtered.filter(p => state.selectedCategories.includes(p.category));
    }

    // Filter by Price Bounds
    filtered = filtered.filter(p => p.price >= state.minPrice && p.price <= state.maxPrice);

    // Filter by Rating
    if (state.selectedRatings.length > 0) {
      const minSelectedRating = Math.min(...state.selectedRatings);
      filtered = filtered.filter(p => p.rating >= minSelectedRating);
    }

    // Filter by Discount
    if (state.selectedDiscounts.length > 0) {
      const minSelectedDiscount = Math.min(...state.selectedDiscounts);
      filtered = filtered.filter(p => {
        const discountPct = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
        return discountPct >= minSelectedDiscount;
      });
    }

    // Sort products
    if (state.sortOption === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (state.sortOption === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (state.sortOption === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      // default: popularity (reviewsCount)
      filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    // Render Grid
    elements.productsGrid.innerHTML = "";
    if (filtered.length === 0) {
      elements.productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
          <i data-lucide="frown" style="width: 48px; height: 48px; margin-bottom: 12px;"></i>
          <h3>No products match your criteria</h3>
          <p style="margin-top: 8px;">Try clearing filters or adjusting your search term.</p>
          <button id="reset-filters-btn" class="quick-add-btn" style="max-width: 180px; margin: 16px auto 0 auto;">Reset Filters</button>
        </div>
      `;
      document.getElementById("reset-filters-btn")?.addEventListener("click", resetAllFilters);
      lucide.createIcons();
      return;
    }

    filtered.forEach(p => {
      const price = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0;
      const originalPrice = typeof p.originalPrice === 'number' ? p.originalPrice : parseFloat(p.originalPrice) || price;
      const discountPct = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
      const brand = p.brand || "Generic";
      const name = p.name || "Unnamed Product";
      const image = p.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400";
      const rating = typeof p.rating === 'number' ? p.rating : parseFloat(p.rating) || 5.0;
      const reviewsCount = typeof p.reviewsCount === 'number' ? p.reviewsCount : parseInt(p.reviewsCount) || 0;
      const deliveryDays = p.deliveryDays || 3;

      const card = document.createElement("div");
      card.className = "product-card";
      card.dataset.id = p.id;
      
      card.innerHTML = `
        ${p.isDeal ? `<div class="card-badge">Deal of the Day</div>` : ""}
        <button class="card-wishlist-btn" title="Add to Wishlist"><i data-lucide="heart" style="width: 16px; height: 16px;"></i></button>
        <div class="product-img-wrapper">
          <img src="${image}" alt="${name}">
        </div>
        <div class="product-card-info">
          <span class="product-brand">${brand}</span>
          <span class="product-name">${name}</span>
          <div class="product-rating-row">
            <span class="rating-badge">${rating.toFixed(1)} <i data-lucide="star" style="width: 10px; height: 10px; fill: white; stroke: white;"></i></span>
            <span class="reviews-count">(${reviewsCount.toLocaleString()})</span>
          </div>
          <div class="product-price-row">
            <span class="current-price">₹${price.toLocaleString()}</span>
            <span class="original-price">₹${originalPrice.toLocaleString()}</span>
            <span class="discount-percentage">${discountPct}% Off</span>
          </div>
          <div class="delivery-estimate">
            <i data-lucide="truck" style="width: 12px; height: 12px; display: inline; vertical-align: middle; margin-right: 4px;"></i> Delivery in ${deliveryDays} days
          </div>
          <button class="quick-add-btn add-to-cart-btn-click" data-id="${p.id}">
            <i data-lucide="shopping-cart" style="width: 14px; height: 14px;"></i> Add to Cart
          </button>
        </div>
      `;
      
      // Card click event (except Add to Cart & Wishlist buttons)
      card.addEventListener("click", (e) => {
        if (e.target.closest(".add-to-cart-btn-click") || e.target.closest(".card-wishlist-btn")) {
          return;
        }
        openProductDetailModal(p);
      });

      // Quick add to cart
      card.querySelector(".add-to-cart-btn-click").addEventListener("click", () => {
        addToCart(p);
      });

      card.querySelector(".card-wishlist-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        const btn = e.currentTarget;
        const icon = btn.querySelector("svg");
        btn.classList.toggle("wished");
        if (btn.classList.contains("wished")) {
          icon.style.fill = "var(--error-color)";
          icon.style.stroke = "var(--error-color)";
          showToast("Added to wishlist", "success");
        } else {
          icon.style.fill = "none";
          icon.style.stroke = "currentColor";
          showToast("Removed from wishlist", "info");
        }
      });

      elements.productsGrid.appendChild(card);
    });

    lucide.createIcons();
  }

  // --- CAROUSEL BANNER ---
  function setupCarousel() {
    let slideInterval = setInterval(nextSlide, 5000);

    function showSlide(index) {
      elements.slides.forEach(slide => slide.classList.remove("active"));
      elements.dots.forEach(dot => dot.classList.remove("active"));
      
      state.currentSlide = (index + elements.slides.length) % elements.slides.length;
      elements.slides[state.currentSlide].classList.add("active");
      elements.dots[state.currentSlide].classList.add("active");
    }

    function nextSlide() {
      showSlide(state.currentSlide + 1);
    }

    function prevSlide() {
      showSlide(state.currentSlide - 1);
    }

    elements.nextBtn.addEventListener("click", () => {
      clearInterval(slideInterval);
      nextSlide();
      slideInterval = setInterval(nextSlide, 5000);
    });

    elements.prevBtn.addEventListener("click", () => {
      clearInterval(slideInterval);
      prevSlide();
      slideInterval = setInterval(nextSlide, 5000);
    });

    elements.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        clearInterval(slideInterval);
        showSlide(index);
        slideInterval = setInterval(nextSlide, 5000);
      });
    });

    document.querySelectorAll(".shop-now-banner-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelector(".main-layout").scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  // --- TIMER BAR ---
  function setupDealCountdown() {
    // End time set to 4 hours from now
    const duration = 4 * 60 * 60 * 1000;
    const endTime = Date.now() + duration;

    function updateTimer() {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        elements.dealTimerContainer.style.display = "none";
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      const hh = hours.toString().padStart(2, "0");
      const mm = mins.toString().padStart(2, "0");
      const ss = secs.toString().padStart(2, "0");
      
      document.getElementById("deal-timer").innerText = `${hh}:${mm}:${ss}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // --- SEARCH AUTOCOMPLETE ---
  elements.searchInput.addEventListener("input", (e) => {
    const val = e.target.value.trim().toLowerCase();
    elements.searchSuggestions.innerHTML = "";

    if (val.length < 2) {
      elements.searchSuggestions.style.display = "none";
      return;
    }

    // Find matches in products (brand, name, category)
    const matches = new Set();
    state.productsList.forEach(p => {
      if (p.name.toLowerCase().includes(val)) matches.add(p.name);
      if (p.brand.toLowerCase().includes(val)) matches.add(p.brand);
      if (p.category.toLowerCase().includes(val)) matches.add(p.category);
    });

    const matchesArr = Array.from(matches).slice(0, 6);

    if (matchesArr.length === 0) {
      elements.searchSuggestions.style.display = "none";
      return;
    }

    matchesArr.forEach(m => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      item.innerHTML = `<i data-lucide="search" style="width: 14px; height: 14px;"></i> <span>${m}</span>`;
      item.addEventListener("click", () => {
        elements.searchInput.value = m;
        state.searchQuery = m;
        elements.searchSuggestions.style.display = "none";
        renderProducts();
        document.querySelector(".main-layout").scrollIntoView({ behavior: "smooth" });
      });
      elements.searchSuggestions.appendChild(item);
    });

    elements.searchSuggestions.style.display = "block";
    lucide.createIcons();
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      elements.searchSuggestions.style.display = "none";
    }
  });

  elements.searchBtn.addEventListener("click", () => {
    state.searchQuery = elements.searchInput.value.trim();
    renderProducts();
    document.querySelector(".main-layout").scrollIntoView({ behavior: "smooth" });
  });

  elements.searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      state.searchQuery = elements.searchInput.value.trim();
      elements.searchSuggestions.style.display = "none";
      renderProducts();
      document.querySelector(".main-layout").scrollIntoView({ behavior: "smooth" });
    }
  });

  // --- SHOPPING CART DRAWER LOGIC ---
  function openCartDrawer() {
    elements.cartDrawerOverlay.classList.add("open");
    renderCart();
  }

  function closeCartDrawer() {
    elements.cartDrawerOverlay.classList.remove("open");
  }

  function addToCart(product) {
    const existing = state.cart.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({ product, quantity: 1 });
    }
    
    // Animate badge
    elements.cartCount.classList.add("bounce");
    setTimeout(() => elements.cartCount.classList.remove("bounce"), 300);

    updateCartBadge();
    showToast(`${product.name.slice(0, 20)}... added to cart!`, "success");
    renderCart();
  }

  function updateCartBadge() {
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartCount.innerText = count;
  }

  function renderCart() {
    elements.cartItemsList.innerHTML = "";
    if (state.cart.length === 0) {
      elements.cartItemsList.innerHTML = `
        <div class="empty-cart-message">
          <i data-lucide="shopping-cart"></i>
          <h4>Your cart is empty</h4>
          <p>Add items to start shopping!</p>
        </div>
      `;
      elements.cartSubtotal.innerText = "₹0";
      elements.cartTotalCost.innerText = "₹0";
      elements.cartDeliveryCost.innerText = "₹0";
      elements.cartDiscountRow.style.display = "none";
      elements.shippingStatusText.innerHTML = `Add <span>₹10,000</span> more for <span>Free Shipping!</span>`;
      elements.shippingProgressFill.style.width = "0%";
      elements.proceedCheckoutBtn.disabled = true;
      elements.proceedCheckoutBtn.style.opacity = "0.5";
      elements.proceedCheckoutBtn.style.cursor = "not-allowed";
      lucide.createIcons();
      return;
    }

    elements.proceedCheckoutBtn.disabled = false;
    elements.proceedCheckoutBtn.style.opacity = "1";
    elements.proceedCheckoutBtn.style.cursor = "pointer";

    let subtotal = 0;
    state.cart.forEach((item, index) => {
      subtotal += item.product.price * item.quantity;
      const itemRow = document.createElement("div");
      itemRow.className = "cart-item";
      
      itemRow.innerHTML = `
        <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-img">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.product.name}</span>
          <div class="cart-item-price-row">
            <span class="cart-item-price">₹${(item.product.price * item.quantity).toLocaleString()}</span>
          </div>
          <div class="cart-item-qty-row">
            <div class="qty-control">
              <button class="qty-btn dec-qty-btn" data-index="${index}">-</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn inc-qty-btn" data-index="${index}">+</button>
            </div>
            <button class="cart-item-remove-btn remove-item-btn" data-index="${index}">
              <i data-lucide="trash-2" style="width: 12px; height: 12px;"></i> Remove
            </button>
          </div>
        </div>
      `;

      itemRow.querySelector(".dec-qty-btn").addEventListener("click", () => {
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.cart.splice(index, 1);
        }
        updateCartBadge();
        renderCart();
      });

      itemRow.querySelector(".inc-qty-btn").addEventListener("click", () => {
        item.quantity += 1;
        updateCartBadge();
        renderCart();
      });

      itemRow.querySelector(".remove-item-btn").addEventListener("click", () => {
        state.cart.splice(index, 1);
        updateCartBadge();
        showToast("Item removed from cart", "info");
        renderCart();
      });

      elements.cartItemsList.appendChild(itemRow);
    });

    // Subtotal Calculations
    elements.cartSubtotal.innerText = `₹${subtotal.toLocaleString()}`;
    
    // Promo/Coupon calculations
    let discount = 0;
    if (state.appliedPromo) {
      discount = Math.round(subtotal * state.appliedPromo.pct);
      elements.cartDiscountRow.style.display = "flex";
      elements.cartDiscount.innerText = `-₹${discount.toLocaleString()}`;
      elements.promoMsg.innerText = `Promo ${state.appliedPromo.code} Applied (${state.appliedPromo.pct*100}% off)`;
      elements.promoMsg.className = "promo-message success";
    } else {
      elements.cartDiscountRow.style.display = "none";
    }

    // Shipping calculations (free shipping above 10000)
    const shippingThreshold = 10000;
    let deliveryCost = subtotal >= shippingThreshold ? 0 : 149;
    elements.cartDeliveryCost.innerText = deliveryCost === 0 ? "FREE" : `₹${deliveryCost}`;

    // Free shipping threshold text & bar updates
    if (subtotal >= shippingThreshold) {
      elements.shippingStatusText.innerHTML = `Your order qualifies for <span>Free Shipping!</span>`;
      elements.shippingProgressFill.style.width = "100%";
    } else {
      const diff = shippingThreshold - subtotal;
      elements.shippingStatusText.innerHTML = `Add <span>₹${diff.toLocaleString()}</span> more for <span>Free Shipping!</span>`;
      const pct = (subtotal / shippingThreshold) * 100;
      elements.shippingProgressFill.style.width = `${pct}%`;
    }

    const finalTotal = subtotal - discount + deliveryCost;
    elements.cartTotalCost.innerText = `₹${finalTotal.toLocaleString()}`;

    lucide.createIcons();
  }

  // Coupon code logic
  elements.promoApplyBtn.addEventListener("click", () => {
    const val = elements.promoInput.value.trim().toUpperCase();
    if (val === "SAFI20" || val === "PURE20") {
      state.appliedPromo = { code: val, pct: 0.20 };
      renderCart();
      showToast("Coupon applied successfully!", "success");
    } else if (val === "") {
      state.appliedPromo = null;
      renderCart();
    } else {
      elements.promoMsg.innerText = "Invalid coupon code!";
      elements.promoMsg.className = "promo-message error";
      showToast("Invalid coupon code", "error");
    }
  });

  // --- PRODUCT DETAIL MODAL ---
  function openProductDetailModal(product) {
    state.activeProduct = product;
    const brand = product.brand || "Generic";
    const name = product.name || "Unnamed Product";
    const image = product.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400";
    const rating = typeof product.rating === 'number' ? product.rating : parseFloat(product.rating) || 5.0;
    const reviewsCount = typeof product.reviewsCount === 'number' ? product.reviewsCount : parseInt(product.reviewsCount) || 0;
    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
    const originalPrice = typeof product.originalPrice === 'number' ? product.originalPrice : parseFloat(product.originalPrice) || price;
    const discountPct = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    const description = product.description || "No description available.";

    elements.detailBrand.innerText = brand;
    elements.detailName.innerText = name;
    elements.detailMainImg.src = image;
    elements.detailRatingBadge.innerHTML = `${rating.toFixed(1)} <i data-lucide="star" style="width: 10px; height: 10px; fill: white; stroke: white;"></i>`;
    elements.detailReviewsCount.innerText = `${reviewsCount.toLocaleString()} reviews`;
    elements.detailPrice.innerText = `₹${price.toLocaleString()}`;
    elements.detailMrp.innerText = `₹${originalPrice.toLocaleString()}`;
    elements.detailDiscount.innerText = `${discountPct}% off`;
    elements.detailDesc.innerText = description;

    // Reset pincode check UI
    elements.pincodeCheckInput.value = state.userPincode || "";
    elements.pincodeResult.style.display = "none";

    // Setup Specifications table
    elements.detailSpecsTable.innerHTML = "";
    for (const [key, value] of Object.entries(product.specs || {})) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="specs-label">${key}</td>
        <td class="specs-value">${value}</td>
      `;
      elements.detailSpecsTable.appendChild(row);
    }

    // Setup Image Gallery thumbnails (using product.image and Unsplash alternatives)
    elements.detailThumbnails.innerHTML = "";
    const galleryImages = [
      product.image,
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150",
      "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=150"
    ];

    galleryImages.forEach((imgSrc, idx) => {
      const thumb = document.createElement("img");
      thumb.className = `thumb-img ${idx === 0 ? 'active' : ''}`;
      thumb.src = imgSrc;
      thumb.addEventListener("click", () => {
        document.querySelectorAll(".thumb-img").forEach(t => t.classList.remove("active"));
        thumb.classList.add("active");
        elements.detailMainImg.src = imgSrc;
      });
      elements.detailThumbnails.appendChild(thumb);
    });

    // Tab resets
    document.querySelectorAll(".tab-link").forEach(l => l.classList.remove("active"));
    document.querySelector('[data-tab="specs-pane"]').classList.add("active");
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    document.getElementById("specs-pane").classList.add("active");

    // Render Reviews
    renderReviews(product);

    // Add modal click actions
    elements.productDetailModal.classList.add("open");
    lucide.createIcons();
  }

  function closeProductDetailModal() {
    elements.productDetailModal.classList.remove("open");
    state.activeProduct = null;
  }

  // pincode checking logic
  elements.pincodeCheckBtn.addEventListener("click", () => {
    const pin = elements.pincodeCheckInput.value.trim();
    if (/^\d{6}$/.test(pin)) {
      state.userPincode = pin;
      localStorage.setItem("safistore_pincode", pin);
      updatePincodeHeader();

      // Mock response based on first digit
      let days = 3;
      if (pin.startsWith("5")) days = 1;
      else if (pin.startsWith("1")) days = 2;
      
      elements.pincodeResult.innerText = `Delivery available by tomorrow (within ${days} days)`;
      elements.pincodeResult.className = "pincode-result available";
      showToast("Pincode verified", "success");
    } else {
      elements.pincodeResult.innerText = "Please enter a valid 6-digit numeric pincode.";
      elements.pincodeResult.className = "pincode-result unavailable";
      showToast("Invalid Pincode", "error");
    }
  });

  function updatePincodeHeader() {
    if (state.userPincode) {
      elements.headerPincode.innerText = `Pincode: ${state.userPincode}`;
    } else {
      elements.headerPincode.innerText = "Select location";
    }
  }

  // --- REVIEW SYSTEM ---
  function renderReviews(product) {
    elements.reviewsListContainer.innerHTML = "";
    const reviewsList = product.reviews || [];
    if (reviewsList.length === 0) {
      elements.reviewsListContainer.innerHTML = `<p style="font-size: 13px; color: var(--text-secondary); padding: 12px 0;">No reviews yet. Be the first to review this product!</p>`;
      return;
    }

    reviewsList.forEach(r => {
      const item = document.createElement("div");
      item.className = "review-item";
      
      const rating = typeof r.rating === 'number' ? r.rating : parseInt(r.rating) || 5;
      const user = r.user || "Verified Buyer";
      const date = r.date || new Date().toISOString().split("T")[0];
      const comment = r.comment || "";

      let starsHTML = "";
      for (let i = 1; i <= 5; i++) {
        starsHTML += `<i data-lucide="star" style="width: 11px; height: 11px; ${i <= rating ? 'fill: var(--secondary-color); stroke: var(--secondary-color);' : ''}"></i> `;
      }

      item.innerHTML = `
        <div class="review-header-row">
          <span class="review-user-name">${user}</span>
          <span class="review-date">${date}</span>
        </div>
        <div class="review-stars">${starsHTML}</div>
        <p class="review-comment">${comment}</p>
      `;
      elements.reviewsListContainer.appendChild(item);
    });
    lucide.createIcons();
  }

  // Modal tab switching
  document.querySelectorAll(".tab-link").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".tab-link").forEach(l => l.classList.remove("active"));
      document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
      
      link.classList.add("active");
      const targetPane = link.dataset.tab;
      document.getElementById(targetPane).classList.add("active");
    });
  });

  // Star selector within reviews
  elements.ratingSelector.querySelectorAll(".star-select").forEach(star => {
    star.addEventListener("click", () => {
      const rating = parseInt(star.dataset.rating);
      state.selectedDetailRating = rating;
      
      elements.ratingSelector.querySelectorAll(".star-select").forEach(s => {
        const r = parseInt(s.dataset.rating);
        if (r <= rating) {
          s.classList.add("active");
          s.style.fill = "var(--secondary-color)";
          s.style.stroke = "var(--secondary-color)";
        } else {
          s.classList.remove("active");
          s.style.fill = "none";
          s.style.stroke = "currentColor";
        }
      });
    });
  });

  elements.submitReviewBtn.addEventListener("click", () => {
    const comment = elements.reviewCommentInput.value.trim();
    if (comment === "") {
      showToast("Please write a review comment", "error");
      return;
    }

    const newReview = {
      user: "Verified Buyer",
      rating: state.selectedDetailRating,
      date: new Date().toISOString().split("T")[0],
      comment: comment
    };

    // Update product reviews in Firestore and locally
    const product = state.activeProduct;
    
    // Show loading state
    elements.submitReviewBtn.innerText = "Submitting...";
    elements.submitReviewBtn.disabled = true;

    window.firebaseDb.addReview(product.id, newReview)
      .then(updatedProduct => {
        // Sync local list item
        const idx = state.productsList.findIndex(p => p.id === product.id);
        if (idx !== -1) {
          state.productsList[idx] = updatedProduct;
        }
        state.activeProduct = updatedProduct;

        // re-render detail view
        elements.detailRatingBadge.innerHTML = `${updatedProduct.rating.toFixed(1)} <i data-lucide="star" style="width: 10px; height: 10px; fill: white; stroke: white;"></i>`;
        elements.detailReviewsCount.innerText = `${updatedProduct.reviewsCount.toLocaleString()} reviews`;
        renderReviews(updatedProduct);
        renderProducts();
        showToast("Review submitted successfully", "success");
      })
      .catch(err => {
        console.error("Failed to post review to Firebase:", err);
        // local memory fallback
        product.reviews.unshift(newReview);
        const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        product.rating = totalRating / product.reviews.length;
        product.reviewsCount = product.reviews.length;
        
        elements.detailRatingBadge.innerHTML = `${product.rating.toFixed(1)} <i data-lucide="star" style="width: 10px; height: 10px; fill: white; stroke: white;"></i>`;
        elements.detailReviewsCount.innerText = `${product.reviewsCount.toLocaleString()} reviews`;
        renderReviews(product);
        renderProducts();
        showToast("Review saved locally", "info");
      })
      .finally(() => {
        elements.submitReviewBtn.innerText = "Submit Review";
        elements.submitReviewBtn.disabled = false;
        // Reset inputs
        elements.reviewCommentInput.value = "";
        state.selectedDetailRating = 5;
        elements.ratingSelector.querySelectorAll(".star-select").forEach(s => {
          s.style.fill = "var(--secondary-color)";
          s.style.stroke = "var(--secondary-color)";
        });
      });
  });

  // Modal Buy Now and Add to Cart
  elements.modalAddToCartBtn.addEventListener("click", () => {
    if (state.activeProduct) {
      addToCart(state.activeProduct);
      closeProductDetailModal();
    }
  });

  elements.modalBuyNowBtn.addEventListener("click", () => {
    if (state.activeProduct) {
      addToCart(state.activeProduct);
      closeProductDetailModal();
      
      // Save state and redirect to dedicated checkout page
      localStorage.setItem("safistore_cart", JSON.stringify(state.cart));
      localStorage.setItem("safistore_promo", JSON.stringify(state.appliedPromo));
      window.location.href = "checkout.html";
    }
  });

  // --- FILTERS LOGIC ---
  function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener("click", toggleTheme);

    // Drawer toggles
    elements.cartToggleBtn.addEventListener("click", openCartDrawer);
    elements.closeCartBtn.addEventListener("click", closeCartDrawer);
    elements.cartDrawerOverlay.addEventListener("click", (e) => {
      if (e.target === elements.cartDrawerOverlay) closeCartDrawer();
    });

    // Pincode Header click to prompt change
    elements.pincodeSelectorBtn?.addEventListener("click", () => {
      const pin = prompt("Enter delivery pincode:", state.userPincode || "");
      if (pin === null) return;
      if (/^\d{6}$/.test(pin)) {
        state.userPincode = pin;
        localStorage.setItem("safistore_pincode", pin);
        updatePincodeHeader();
        showToast(`Delivery location set to ${pin}`, "success");
        renderProducts();
      } else {
        showToast("Please enter a valid 6-digit pincode", "error");
      }
    });

    // Modals Close
    elements.closeDetailModalBtn.addEventListener("click", closeProductDetailModal);
    elements.productDetailModal.addEventListener("click", (e) => {
      if (e.target === elements.productDetailModal) closeProductDetailModal();
    });

    elements.proceedCheckoutBtn.addEventListener("click", () => {
      // Save cart state and redirect to dedicated checkout page
      localStorage.setItem("safistore_cart", JSON.stringify(state.cart));
      localStorage.setItem("safistore_promo", JSON.stringify(state.appliedPromo));
      window.location.href = "checkout.html";
    });

    // Sorting Dropdown selector
    elements.sortSelect.addEventListener("change", (e) => {
      state.sortOption = e.target.value;
      renderProducts();
    });

    // Navigation Category links click
    document.querySelectorAll(".sub-menu-item").forEach(item => {
      item.addEventListener("click", (e) => {
        document.querySelectorAll(".sub-menu-item").forEach(i => i.classList.remove("active"));
        item.classList.add("active");
        
        state.activeCategory = item.dataset.category;
        
        // Sync checkmarks in sidebar
        document.querySelectorAll(".category-checkbox").forEach(chk => {
          chk.checked = false;
        });
        state.selectedCategories = [];
        if (state.activeCategory !== "All") {
          const matchingCheckbox = document.querySelector(`.category-checkbox[value="${state.activeCategory}"]`);
          if (matchingCheckbox) {
            matchingCheckbox.checked = true;
            state.selectedCategories.push(state.activeCategory);
          }
        }

        renderProducts();
        document.querySelector(".main-layout").scrollIntoView({ behavior: "smooth" });
      });
    });

    // Circular Category clicks
    document.querySelectorAll(".category-circle-card").forEach(circle => {
      circle.addEventListener("click", () => {
        const cat = circle.dataset.category;
        
        // Update subheader active link
        document.querySelectorAll(".sub-menu-item").forEach(item => {
          item.classList.remove("active");
          if (item.dataset.category === cat) item.classList.add("active");
        });

        // Set state
        state.activeCategory = cat;

        // Sync sidebar
        document.querySelectorAll(".category-checkbox").forEach(chk => {
          chk.checked = (chk.value === cat);
        });
        state.selectedCategories = [cat];

        renderProducts();
        document.querySelector(".main-layout").scrollIntoView({ behavior: "smooth" });
      });
    });

    // Sidebar Checkboxes Filters change
    document.querySelectorAll(".category-checkbox").forEach(chk => {
      chk.addEventListener("change", () => {
        const activeChks = Array.from(document.querySelectorAll(".category-checkbox:checked")).map(c => c.value);
        state.selectedCategories = activeChks;
        
        // sync main subheader
        document.querySelectorAll(".sub-menu-item").forEach(item => item.classList.remove("active"));
        if (activeChks.length === 1) {
          state.activeCategory = activeChks[0];
          document.querySelector(`.sub-menu-item[data-category="${activeChks[0]}"]`)?.classList.add("active");
        } else {
          state.activeCategory = "All";
          document.querySelector('.sub-menu-item[data-category="All"]').classList.add("active");
        }

        renderProducts();
      });
    });

    // Price select bounds filters change
    const minPriceSelect = document.getElementById("price-min-select");
    const maxPriceSelect = document.getElementById("price-max-select");

    minPriceSelect.addEventListener("change", (e) => {
      state.minPrice = parseInt(e.target.value) || 0;
      renderProducts();
    });

    maxPriceSelect.addEventListener("change", (e) => {
      state.maxPrice = parseInt(e.target.value) || 999999;
      renderProducts();
    });

    // Rating checkboxes filters change
    document.querySelectorAll(".rating-checkbox").forEach(chk => {
      chk.addEventListener("change", () => {
        state.selectedRatings = Array.from(document.querySelectorAll(".rating-checkbox:checked")).map(c => parseInt(c.value));
        renderProducts();
      });
    });

    // Discount checkboxes filters change
    document.querySelectorAll(".discount-checkbox").forEach(chk => {
      chk.addEventListener("change", () => {
        state.selectedDiscounts = Array.from(document.querySelectorAll(".discount-checkbox:checked")).map(c => parseInt(c.value));
        renderProducts();
      });
    });

    // Clear Filters btn click
    elements.clearFiltersBtn.addEventListener("click", resetAllFilters);
  }

  function resetAllFilters() {
    // Reset state values
    state.activeCategory = "All";
    state.searchQuery = "";
    state.selectedCategories = [];
    state.minPrice = 0;
    state.maxPrice = 999999;
    state.selectedRatings = [];
    state.selectedDiscounts = [];
    state.sortOption = "popularity";

    // Reset controls UI
    elements.searchInput.value = "";
    elements.sortSelect.value = "popularity";
    
    document.querySelectorAll(".sub-menu-item").forEach(item => item.classList.remove("active"));
    document.querySelector('.sub-menu-item[data-category="All"]').classList.add("active");
    
    document.querySelectorAll(".category-checkbox").forEach(c => c.checked = false);
    document.querySelectorAll(".rating-checkbox").forEach(c => c.checked = false);
    document.querySelectorAll(".discount-checkbox").forEach(c => c.checked = false);
    
    document.getElementById("price-min-select").value = "0";
    document.getElementById("price-max-select").value = "999999";

    renderProducts();
    showToast("Filters reset successfully", "info");
  }

  // --- MOCK NOTIFICATIONS TOAST SYSTEM ---
  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let iconName = "check-circle";
    if (type === "error") iconName = "alert-circle";
    else if (type === "info") iconName = "info";

    toast.innerHTML = `<i data-lucide="${iconName}" style="width: 16px; height: 16px;"></i> <span>${message}</span>`;
    elements.toastContainer.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Run the initializer
  init();
});
