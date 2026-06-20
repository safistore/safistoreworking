// ==========================================================================
// SafiStore - Admin Dashboard Logic
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    productsList: [],
    isFirebaseLive: false
  };

  const elements = {
    loginView: document.getElementById("login-view"),
    dashboardView: document.getElementById("dashboard-view"),
    adminPassword: document.getElementById("admin-password"),
    adminLoginBtn: document.getElementById("admin-login-btn"),
    adminLogoutBtn: document.getElementById("admin-logout-btn"),
    
    // Stats
    statProductsCount: document.getElementById("stat-products-count"),
    statDbMode: document.getElementById("stat-db-mode"),
    
    // Add Form
    addProductForm: document.getElementById("add-product-form"),
    specsBuilderContainer: document.getElementById("specs-builder-container"),
    addSpecRowBtn: document.getElementById("add-spec-row-btn"),
    presetImgLinks: document.querySelectorAll(".preset-img-link"),
    
    // Inventory
    inventorySearch: document.getElementById("inventory-search"),
    inventoryTableBody: document.getElementById("inventory-table-body"),
    
    toastContainer: document.getElementById("toast-container")
  };

  // --- INITIALIZATION ---
  function init() {
    setupAuth();
    setupEventListeners();
    lucide.createIcons();
  }

  // --- PASSWORD PROTECTION ---
  function setupAuth() {
    const isLoggedIn = sessionStorage.getItem("safistore_admin_logged_in") === "true";
    if (isLoggedIn) {
      showDashboard();
    } else {
      showLogin();
    }
  }

  function showLogin() {
    elements.loginView.style.display = "block";
    elements.dashboardView.style.display = "none";
  }

  function showDashboard() {
    elements.loginView.style.display = "none";
    elements.dashboardView.style.display = "block";
    loadAdminInventory();
  }
   elements.adminLoginBtn.addEventListener("click", () => {

  const email = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value.trim();

  if (
    email === "safeekestore@gmail.com" &&
    password === "safeek7879mrs"
  ) {
    sessionStorage.setItem("safistore_admin_logged_in", "true");
    showDashboard();

    document.getElementById("admin-email").value = "";
    document.getElementById("admin-password").value = "";

    showToast("Access Granted. Welcome Admin!", "success");

  } else {
    showToast("Invalid Email or Password", "error");
  }
});

  elements.adminPassword.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      elements.adminLoginBtn.click();
    }
  });

  elements.adminLogoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("safistore_admin_logged_in");
    showLogin();
    showToast("Logged out successfully.", "info");
  });

  // --- LOAD PRODUCTS FROM FIREBASE ---
  async function loadAdminInventory() {
    const fallbackProducts = window.products || [];
    try {
      if (window.firebaseDb && typeof window.firebaseDb.loadProducts === "function" && window.firebaseDb.isLive()) {
        // Load with 3-sec timeout race to detect connection status
        const dbPromise = window.firebaseDb.loadProducts(fallbackProducts);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 3000)
        );
        state.productsList = await Promise.race([dbPromise, timeoutPromise]);
        state.isFirebaseLive = true;
        elements.statDbMode.innerText = "Firebase Live";
        elements.statDbMode.style.color = "var(--success-color)";
      } else {
        throw new Error("DB Helper is offline or missing");
      }
    } catch (e) {
      console.warn("Admin panel falling back to local mock storage:", e);
      state.productsList = [...fallbackProducts];
      state.isFirebaseLive = false;
      elements.statDbMode.innerText = "Local Offline";
      elements.statDbMode.style.color = "var(--error-color)";
    }
    
    updateStats();
    renderInventoryTable();
  }

  function updateStats() {
    elements.statProductsCount.innerText = state.productsList.length;
  }

  // --- RENDER TABLE ---
  function renderInventoryTable() {
    elements.inventoryTableBody.innerHTML = "";
    
    const query = elements.inventorySearch.value.trim().toLowerCase();
    const filtered = state.productsList.filter(p => {
      return (
        p.id.toLowerCase().includes(query) ||
        (p.name || "").toLowerCase().includes(query) ||
        (p.brand || "").toLowerCase().includes(query) ||
        (p.category || "").toLowerCase().includes(query)
      );
    });

    if (filtered.length === 0) {
      elements.inventoryTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 20px;">
            No items found.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(p => {
      const price = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0;
      const row = document.createElement("tr");
      
      row.innerHTML = `
        <td><img src="${p.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=150'}" class="inventory-thumb" alt="${p.name}"></td>
        <td style="font-weight: 700;">${p.id}</td>
        <td>${p.name || 'Unnamed'}</td>
        <td>${p.brand || 'Generic'}</td>
        <td><span style="background-color: var(--bg-color); padding: 4px 8px; border-radius: var(--radius-sm); font-size: 11px;">${p.category}</span></td>
        <td>₹${price.toLocaleString()}</td>
        <td>
          <button class="delete-prod-btn" data-id="${p.id}"><i data-lucide="trash-2" style="width: 13px; height: 13px; display: inline-block; vertical-align: middle; margin-right: 2px;"></i> Delete</button>
        </td>
      `;

      row.querySelector(".delete-prod-btn").addEventListener("click", () => {
        deleteProduct(p.id);
      });

      elements.inventoryTableBody.appendChild(row);
    });
    lucide.createIcons();
  }

  // --- ACTIONS: ADD PRODUCT ---
  elements.addSpecRowBtn.addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "specs-builder-row";
    row.innerHTML = `
      <input type="text" class="form-control spec-key" placeholder="Key" required>
      <input type="text" class="form-control spec-val" placeholder="Value" required>
      <button type="button" class="remove-spec-row-btn">×</button>
    `;
    
    row.querySelector(".remove-spec-row-btn").addEventListener("click", () => {
      row.remove();
    });

    elements.specsBuilderContainer.appendChild(row);
  });

  // Preset image links helper
  elements.presetImgLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("prod-img").value = link.dataset.url;
      showToast("Preset image URL set!", "info");
    });
  });

  elements.addProductForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const id = document.getElementById("prod-id").value.trim();
    
    // Check if ID already exists
    if (state.productsList.some(p => p.id === id)) {
      showToast(`Product ID "${id}" already exists. Use a unique ID.`, "error");
      return;
    }

    // Build specs object
    const specsObj = {};
    const keyInputs = elements.specsBuilderContainer.querySelectorAll(".spec-key");
    const valInputs = elements.specsBuilderContainer.querySelectorAll(".spec-val");
    keyInputs.forEach((k, idx) => {
      const keyStr = k.value.trim();
      const valStr = valInputs[idx].value.trim();
      if (keyStr !== "" && valStr !== "") {
        specsObj[keyStr] = valStr;
      }
    });

    const priceVal = parseInt(document.getElementById("prod-price").value);
    const mrpVal = parseInt(document.getElementById("prod-mrp").value);

    const productData = {
      id: id,
      name: document.getElementById("prod-name").value.trim(),
      brand: document.getElementById("prod-brand").value.trim(),
      category: document.getElementById("prod-category").value,
      price: priceVal,
      originalPrice: mrpVal,
      image: document.getElementById("prod-img").value.trim(),
      description: document.getElementById("prod-desc").value.trim(),
      specs: specsObj,
      rating: 5.0,
      reviewsCount: 0,
      reviews: [],
      isDeal: false,
      deliveryDays: 3
    };

    if (state.isFirebaseLive && window.firebaseDb) {
      showToast("Saving product to Firebase...", "info");
      window.firebaseDb.addProduct(productData)
        .then(() => {
          state.productsList.push(productData);
          updateStats();
          renderInventoryTable();
          resetAddForm();
          showToast("Product successfully added to Firebase Database!", "success");
        })
        .catch(err => {
          console.error("Failed to add product:", err);
          showToast("Firebase write failed. Permission denied or misconfigured rules.", "error");
        });
    } else {
      // Local offline fallback addition
      state.productsList.push(productData);
      updateStats();
      renderInventoryTable();
      resetAddForm();
      showToast("Offline Mode: Product added locally in memory.", "info");
    }
  });

  function resetAddForm() {
    elements.addProductForm.reset();
    
    // Reset specifications builder to one empty row
    elements.specsBuilderContainer.innerHTML = `
      <div class="specs-builder-row">
        <input type="text" class="form-control spec-key" placeholder="Key (e.g. Model)" required>
        <input type="text" class="form-control spec-val" placeholder="Value (e.g. iPad Pro)" required>
        <button type="button" class="remove-spec-row-btn" style="visibility: hidden;">×</button>
      </div>
    `;
  }

  // --- ACTIONS: DELETE PRODUCT ---
  function deleteProduct(productId) {
    if (!confirm(`Are you sure you want to delete product "${productId}"?`)) {
      return;
    }

    if (state.isFirebaseLive && window.firebaseDb) {
      showToast("Deleting product from Firebase...", "info");
      window.firebaseDb.deleteProduct(productId)
        .then(() => {
          state.productsList = state.productsList.filter(p => p.id !== productId);
          updateStats();
          renderInventoryTable();
          showToast("Product successfully removed from Firebase!", "success");
        })
        .catch(err => {
          console.error("Delete failed:", err);
          showToast("Firebase delete failed. Check security rules.", "error");
        });
    } else {
      // Local memory fallback deletion
      state.productsList = state.productsList.filter(p => p.id !== productId);
      updateStats();
      renderInventoryTable();
      showToast("Offline Mode: Product removed locally in memory.", "info");
    }
  }

  // --- SEARCH INVENTORY ---
  elements.inventorySearch.addEventListener("input", renderInventoryTable);

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Theme toggle matching index.html
    const savedTheme = localStorage.getItem("safistore_theme") || "light";
    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme");
    }
  }

  // --- TOAST NOTIFICATIONS ---
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

  init();
});
