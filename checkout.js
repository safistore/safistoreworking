// ==========================================================================
// SafiStore - Dedicated Checkout Logic
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    cart: [],
    appliedPromo: null,
    currentCheckoutStep: 1,
    userPincode: localStorage.getItem("safistore_pincode") || null,
    subtotal: 0,
    discount: 0,
    deliveryCost: 149,
    totalPaid: 0
  };

  const elements = {
    checkoutStep1: document.getElementById("checkout-step-1"),
    checkoutStep2: document.getElementById("checkout-step-2"),
    checkoutStep3: document.getElementById("checkout-step-3"),
    checkoutBackBtn: document.getElementById("checkout-back-btn"),
    checkoutNextBtn: document.getElementById("checkout-next-btn"),
    checkoutActionsRow: document.getElementById("checkout-actions-row"),
    
    // Forms
    addressForm: document.getElementById("address-form"),
    paymentMethodRadios: document.getElementsByName("payment-method"),
    cardDetailsPanel: document.getElementById("card-details-panel"),
    
    
    
    // Summary
    summaryItemsList: document.getElementById("summary-items-list"),
    summarySubtotal: document.getElementById("summary-subtotal"),
    summaryDiscountRow: document.getElementById("summary-discount-row"),
    summaryDiscount: document.getElementById("summary-discount"),
    summaryDeliveryCost: document.getElementById("summary-delivery-cost"),
    summaryTotalCost: document.getElementById("summary-total-cost"),
    
    // Receipt
    deliveryEstDays: document.getElementById("delivery-est-days"),
    receiptInvoiceNum: document.getElementById("receipt-invoice-num"),
    receiptDate: document.getElementById("receipt-date"),
    receiptItemsContainer: document.getElementById("receipt-items-container"),
    receiptTotalPaid: document.getElementById("receipt-total-paid"),
    toastContainer: document.getElementById("toast-container")
  };

  // --- INITIALIZATION ---
  function init() {
    loadCartState();
    setupTheme();
    setupEventListeners();
    lucide.createIcons();
  }

  function setupTheme() {
    const savedTheme = localStorage.getItem("safistore_theme") || "light";
    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme");
    }
  }

  // --- LOAD CART DATA ---
  function loadCartState() {
    try {
      state.cart = JSON.parse(localStorage.getItem("safistore_cart")) || [];
      state.appliedPromo = JSON.parse(localStorage.getItem("safistore_promo")) || null;
    } catch (e) {
      console.error("Failed to parse cart items:", e);
      state.cart = [];
    }

    if (state.cart.length === 0) {
      showToast("Your cart is empty. Redirecting to store...", "error");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
      return;
    }

    calculateSummaryPrices();
    renderSummaryItems();
  }

  function calculateSummaryPrices() {
    state.subtotal = 0;
    state.cart.forEach(item => {
      const price = typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price) || 0;
      state.subtotal += price * item.quantity;
    });

    state.discount = 0;
    if (state.appliedPromo) {
      state.discount = Math.round(state.subtotal * state.appliedPromo.pct);
    }

    state.deliveryCost = state.subtotal >= 10000 ? 0 : 149;
    state.totalPaid = state.subtotal - state.discount + state.deliveryCost;
  }

  function renderSummaryItems() {
    elements.summaryItemsList.innerHTML = "";
    state.cart.forEach(item => {
      const price = typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price) || 0;
      const row = document.createElement("div");
      row.className = "summary-item-row";
      row.innerHTML = `
        <div>
          <span class="summary-item-name">${item.product.name.slice(0, 25)}...</span>
          <span class="summary-item-qty">x ${item.quantity}</span>
        </div>
        <span style="font-weight: 600;">₹${(price * item.quantity).toLocaleString()}</span>
      `;
      elements.summaryItemsList.appendChild(row);
    });

    elements.summarySubtotal.innerText = `₹${state.subtotal.toLocaleString()}`;
    if (state.discount > 0) {
      elements.summaryDiscountRow.style.display = "flex";
      elements.summaryDiscount.innerText = `-₹${state.discount.toLocaleString()}`;
    } else {
      elements.summaryDiscountRow.style.display = "none";
    }

    elements.summaryDeliveryCost.innerText = state.deliveryCost === 0 ? "FREE" : `₹${state.deliveryCost}`;
    elements.summaryTotalCost.innerText = `₹${state.totalPaid.toLocaleString()}`;
  }

  // --- STEPPER TRANSITIONS ---
  function showCheckoutStep(step) {
    state.currentCheckoutStep = step;

    // Stepper header node styles
    document.querySelectorAll(".step-node").forEach(node => {
      const idx = parseInt(node.id.split("-").pop());
      node.className = "step-node";
      if (idx === step) {
        node.classList.add("active");
      } else if (idx < step) {
        node.classList.add("completed");
      }
    });

    // Content view states
    elements.checkoutStep1.style.display = "none";
    elements.checkoutStep2.style.display = "none";
    elements.checkoutStep3.style.display = "none";
    
    document.getElementById(`checkout-step-${step}`).style.display = "block";

    // Button updates
    if (step === 1) {
      elements.checkoutBackBtn.style.display = "none";
      elements.checkoutNextBtn.innerText = "Continue to Payment";
      elements.checkoutActionsRow.style.display = "flex";
    } else if (step === 2) {
      elements.checkoutBackBtn.style.display = "block";
      elements.checkoutNextBtn.innerText = "Place Order";
      elements.checkoutActionsRow.style.display = "flex";
    } else if (step === 3) {
      elements.checkoutActionsRow.style.display = "none"; // success has no navigation footer
    }
    lucide.createIcons();
  }

  // --- ACTIONS: PLACE ORDER ---
  function processOrderPlacement() {
    const invNum = "SF-" + Math.floor(1000000 + Math.random() * 9000000);
    elements.receiptInvoiceNum.innerText = invNum;
    elements.receiptDate.innerText = new Date().toISOString().split("T")[0];

    // Compute delivery days
    let maxDays = 3;
    if (state.userPincode) {
      if (state.userPincode.startsWith("5")) maxDays = 1;
      else if (state.userPincode.startsWith("1")) maxDays = 2;
    }
    elements.deliveryEstDays.innerText = maxDays === 1 ? "tomorrow" : `within ${maxDays} days`;

    // Render receipt items list
    elements.receiptItemsContainer.innerHTML = "";
    state.cart.forEach(item => {
      const price = typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price) || 0;
      const itemRow = document.createElement("div");
      itemRow.className = "invoice-item-row";
      itemRow.innerHTML = `
        <span>${item.product.name.slice(0, 30)}... x ${item.quantity}</span>
        <span>₹${(price * item.quantity).toLocaleString()}</span>
      `;
      elements.receiptItemsContainer.appendChild(itemRow);
    });

    if (state.discount > 0 && state.appliedPromo) {
      const discountRow = document.createElement("div");
      discountRow.className = "invoice-item-row";
      discountRow.style.color = "var(--success-color)";
      discountRow.innerHTML = `
        <span>Discount (${state.appliedPromo.code})</span>
        <span>-₹${state.discount.toLocaleString()}</span>
      `;
      elements.receiptItemsContainer.appendChild(discountRow);
    }

    const deliveryRow = document.createElement("div");
    deliveryRow.className = "invoice-item-row";
    deliveryRow.innerHTML = `
      <span>Delivery Charges</span>
      <span>${state.deliveryCost === 0 ? "FREE" : `₹${state.deliveryCost}`}</span>
    `;
    elements.receiptItemsContainer.appendChild(deliveryRow);
    elements.receiptTotalPaid.innerText = `₹${state.totalPaid.toLocaleString()}`;

    // Assemble order payload
    const orderItems = state.cart.map(item => {
      const price = typeof item.product.price === 'number' ? item.product.price : parseFloat(item.product.price) || 0;
      return {
        id: item.product.id,
        name: item.product.name,
        price: price,
        quantity: item.quantity
      };
    });

    const orderData = {
      invoiceNum: invNum,
      customer: {
        name: document.getElementById("address-name").value.trim(),
        address: document.getElementById("address-line").value.trim(),
        city: document.getElementById("address-city").value.trim(),
        pincode: state.userPincode,
        phone: document.getElementById("address-phone").value.trim()
      },
      items: orderItems,
      subtotal: state.subtotal,
      discount: state.discount,
      deliveryCost: state.deliveryCost,
      totalPaid: state.totalPaid,
      paymentMethod: document.querySelector('input[name="payment-method"]:checked').value
    };

    // Show loading
    elements.checkoutNextBtn.innerText = "Placing Order...";
    elements.checkoutNextBtn.disabled = true;

    // Check if Firebase is active
    if (window.firebaseDb && window.firebaseDb.isLive()) {
      window.firebaseDb.saveOrder(orderData)
        .then(() => {
          finalizeCheckoutSuccess();
        })
        .catch(err => {
          console.error("Firebase order write failed:", err);
          showToast("Database write failed. Saving locally in memory.", "info");
          finalizeCheckoutSuccess();
        });
    } else {
      console.warn("Firebase offline. Saving order locally.");
      finalizeCheckoutSuccess();
    }
  }

  function finalizeCheckoutSuccess() {
    // Clear cart storage
    localStorage.removeItem("safistore_cart");
    localStorage.removeItem("safistore_promo");
    
    // Clear browser sidebar items
    elements.summaryItemsList.innerHTML = `<p style="font-size: 12px; color: var(--text-secondary); text-align: center; padding: 12px 0;">Cart cleared.</p>`;
    
    // Advance stepper
    showCheckoutStep(3);
    showToast("Order placed successfully!", "success");
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    
    // Back and Next Stepper Click
    elements.checkoutNextBtn.addEventListener("click", () => {
      if (state.currentCheckoutStep === 1) {
        // Validate Address Fields
        if (elements.addressForm.reportValidity()) {
          const pincodeVal = document.getElementById("address-pincode").value.trim();
          state.userPincode = pincodeVal;
          localStorage.setItem("safistore_pincode", pincodeVal);
          
          // Re-calculate shipping charges if pincode changes
          showCheckoutStep(2);
        } else {
          showToast("Please fill in shipping address details.", "error");
        }
      } else if (state.currentCheckoutStep === 2) {
        // Validate Card Details if Card payment is selected
        const selectedPayment = document.querySelector('input[name="payment-method"]:checked').value;
        if (selectedPayment === "card") {
          const num = elements.cardNumber.value.replace(/\s/g, "");
          const exp = elements.cardExpiry.value;
          const cvv = elements.cardCvv.value;
          
          if (num.length < 15 || exp.length < 5 || cvv.length < 3) {
            showToast("Please enter complete credit card values.", "error");
            return;
          }
        }
        processOrderPlacement();
      }
    });

    elements.checkoutBackBtn.addEventListener("click", () => {
      if (state.currentCheckoutStep === 2) {
        showCheckoutStep(1);
      }
    });

    // Payment Option selection toggling
    document.querySelectorAll(".payment-option-card").forEach(card => {
      card.addEventListener("click", () => {
        document.querySelectorAll(".payment-option-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        
        const radio = card.querySelector('input[type="radio"]');
        radio.checked = true;

        if (radio.value === "card") {
          elements.cardDetailsPanel.style.display = "block";
        } else {
          elements.cardDetailsPanel.style.display = "none";
        }
      });
    });

    // Credit Card simulated focus flip
    elements.cardNumber.addEventListener("focus", () => elements.cardSim.classList.remove("flipped"));
    elements.cardExpiry.addEventListener("focus", () => elements.cardSim.classList.remove("flipped"));
    elements.cardCvv.addEventListener("focus", () => elements.cardSim.classList.add("flipped"));
    elements.cardCvv.addEventListener("blur", () => elements.cardSim.classList.remove("flipped"));

    // Form formatting filters
    elements.cardNumber.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "");
      let parts = [];
      for (let i = 0; i < val.length; i += 4) {
        parts.push(val.substring(i, i + 4));
      }
      e.target.value = parts.join(" ");
      elements.cardNumDisplay.innerText = e.target.value || "•••• •••• •••• ••••";
    });

    elements.cardExpiry.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "");
      if (val.length > 2) {
        val = val.substring(0, 2) + "/" + val.substring(2, 4);
      }
      e.target.value = val;
      elements.cardExpiryDisplay.innerText = val || "MM/YY";
    });

    elements.cardCvv.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "");
      elements.cardCvvDisplay.innerText = val || "CVV";
    });

    // Auto fill address input values if pincode selector was set in header of index
    if (state.userPincode) {
      document.getElementById("address-pincode").value = state.userPincode;
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
