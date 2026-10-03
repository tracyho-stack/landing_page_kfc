/**
 * KFC Landing Page - Module Giỏ Hàng (Shopping Cart Module)
 * Quản lý trạng thái giỏ hàng, lưu trữ localStorage, render giao diện Cart Drawer
 */

const CartManager = (() => {
  const STORAGE_KEY = "kfc_cart_items";

  // Currency Formatter for VND
  const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  // State
  let cartItems = [];

  // DOM Elements cache
  let dom = {};

  /**
   * Load cart from LocalStorage
   */
  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        cartItems = JSON.parse(saved);
      } else {
        cartItems = [];
      }
    } catch (e) {
      console.error("Lỗi khi đọc giỏ hàng từ localStorage:", e);
      cartItems = [];
    }
  }

  /**
   * Save current cart to LocalStorage
   */
  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error("Lỗi khi lưu giỏ hàng vào localStorage:", e);
    }
  }

  /**
   * Initialize DOM references and listeners
   */
  function init() {
    loadFromStorage();

    dom = {
      cartBtn: document.getElementById("cart-toggle-btn"),
      cartBadge: document.getElementById("cart-badge-count"),
      cartDrawer: document.getElementById("cart-drawer"),
      cartDrawerOverlay: document.getElementById("cart-drawer-overlay"),
      cartCloseBtn: document.getElementById("cart-close-btn"),
      cartItemsList: document.getElementById("cart-items-list"),
      cartEmptyView: document.getElementById("cart-empty-view"),
      cartFooter: document.getElementById("cart-footer"),
      cartSubtotal: document.getElementById("cart-subtotal-price"),
      cartTotal: document.getElementById("cart-total-price"),
      clearCartBtn: document.getElementById("clear-cart-btn"),
      checkoutBtn: document.getElementById("cart-checkout-btn"),
      exploreMenuBtn: document.getElementById("cart-explore-menu-btn"),
      toastNotification: document.getElementById("toast-notification"),
      toastMessage: document.getElementById("toast-message"),
    };

    setupEventListeners();
    updateUI();
  }

  /**
   * Set up event listeners for Cart
   */
  function setupEventListeners() {
    if (dom.cartBtn) {
      dom.cartBtn.addEventListener("click", openCart);
    }

    if (dom.cartCloseBtn) {
      dom.cartCloseBtn.addEventListener("click", closeCart);
    }

    if (dom.cartDrawerOverlay) {
      dom.cartDrawerOverlay.addEventListener("click", (e) => {
        if (e.target === dom.cartDrawerOverlay) {
          closeCart();
        }
      });
    }

    if (dom.exploreMenuBtn) {
      dom.exploreMenuBtn.addEventListener("click", () => {
        closeCart();
        const menuSection = document.getElementById("menu");
        if (menuSection) {
          menuSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    if (dom.clearCartBtn) {
      dom.clearCartBtn.addEventListener("click", () => {
        if (confirm("Bạn có chắc chắn muốn xoá toàn bộ món trong giỏ hàng?")) {
          clearCart();
        }
      });
    }

    if (dom.checkoutBtn) {
      dom.checkoutBtn.addEventListener("click", handleCheckout);
    }

    // Keyboard support: Escape closes Cart Drawer
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isCartOpen()) {
        closeCart();
      }
    });
  }

  /**
   * Check if Cart is open
   */
  function isCartOpen() {
    return dom.cartDrawerOverlay && dom.cartDrawerOverlay.classList.contains("open");
  }

  /**
   * Open Cart Drawer
   */
  function openCart() {
    if (!dom.cartDrawerOverlay) return;
    dom.cartDrawerOverlay.classList.add("open");
    dom.cartDrawerOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    renderCartItems();
  }

  /**
   * Close Cart Drawer
   */
  function closeCart() {
    if (!dom.cartDrawerOverlay) return;
    dom.cartDrawerOverlay.classList.remove("open");
    dom.cartDrawerOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  /**
   * Add a product to the cart
   * @param {Object} product - Product object
   * @param {number} quantity - Quantity to add
   */
  function addItem(product, quantity = 1) {
    if (!product || !product.id) return;
    const qty = parseInt(quantity, 10) || 1;

    const existingIndex = cartItems.findIndex((item) => item.id === product.id);

    if (existingIndex > -1) {
      cartItems[existingIndex].quantity += qty;
    } else {
      cartItems.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: Number(product.price),
        image: product.image,
        quantity: qty,
      });
    }

    saveToStorage();
    updateUI();
    animateBadge();
    showToast(`Đã thêm ${qty}x ${product.name} vào giỏ hàng!`);
  }

  /**
   * Update quantity of an item
   * @param {string} productId
   * @param {number} delta - (+1 or -1)
   */
  function updateQuantity(productId, delta) {
    const itemIndex = cartItems.findIndex((item) => item.id === productId);
    if (itemIndex === -1) return;

    cartItems[itemIndex].quantity += delta;

    if (cartItems[itemIndex].quantity <= 0) {
      cartItems.splice(itemIndex, 1);
    }

    saveToStorage();
    updateUI();
  }

  /**
   * Remove item entirely from cart
   * @param {string} productId
   */
  function removeItem(productId) {
    cartItems = cartItems.filter((item) => item.id !== productId);
    saveToStorage();
    updateUI();
  }

  /**
   * Clear all items in cart
   */
  function clearCart() {
    cartItems = [];
    saveToStorage();
    updateUI();
    showToast("Đã làm trống giỏ hàng!");
  }

  /**
   * Total item count
   */
  function getTotalCount() {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Total price calculation
   */
  function getTotalPrice() {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /**
   * Animate Cart Badge on Header
   */
  function animateBadge() {
    if (!dom.cartBadge) return;
    dom.cartBadge.classList.remove("badge-pop");
    void dom.cartBadge.offsetWidth; // trigger reflow
    dom.cartBadge.classList.add("badge-pop");
  }

  /**
   * Update UI (Badge count, Cart List, Summary)
   */
  function updateUI() {
    const totalCount = getTotalCount();
    const totalPrice = getTotalPrice();
    const formattedTotal = currencyFormatter.format(totalPrice);

    // Update Badge
    if (dom.cartBadge) {
      dom.cartBadge.textContent = totalCount;
      dom.cartBadge.style.display = totalCount > 0 ? "inline-flex" : "none";
    }

    // Update Totals
    if (dom.cartSubtotal) dom.cartSubtotal.textContent = formattedTotal;
    if (dom.cartTotal) dom.cartTotal.textContent = formattedTotal;

    // Render items if open
    renderCartItems();
  }

  /**
   * Render cart items in Drawer
   */
  function renderCartItems() {
    if (!dom.cartItemsList || !dom.cartEmptyView || !dom.cartFooter) return;

    if (cartItems.length === 0) {
      dom.cartEmptyView.style.display = "flex";
      dom.cartItemsList.style.display = "none";
      dom.cartFooter.style.display = "none";
      return;
    }

    dom.cartEmptyView.style.display = "none";
    dom.cartItemsList.style.display = "flex";
    dom.cartFooter.style.display = "block";

    dom.cartItemsList.innerHTML = cartItems
      .map((item) => {
        const itemTotal = currencyFormatter.format(item.price * item.quantity);
        const itemUnitPrice = currencyFormatter.format(item.price);

        return `
          <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-media">
              <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/original-chicken.webp'" />
            </div>
            <div class="cart-item-info">
              <div class="cart-item-header">
                <h4 class="cart-item-name">${item.name}</h4>
                <button class="cart-item-remove-btn" data-id="${item.id}" aria-label="Xoá ${item.name} khỏi giỏ" title="Xoá món">
                  🗑️
                </button>
              </div>
              <span class="cart-item-price-unit">${itemUnitPrice}</span>
              <div class="cart-item-bottom">
                <div class="cart-item-stepper">
                  <button class="cart-stepper-btn btn-decrease" data-id="${item.id}" aria-label="Giảm">-</button>
                  <span class="cart-stepper-qty">${item.quantity}</span>
                  <button class="cart-stepper-btn btn-increase" data-id="${item.id}" aria-label="Tăng">+</button>
                </div>
                <span class="cart-item-total-price">${itemTotal}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    // Attach row events
    dom.cartItemsList.querySelectorAll(".btn-decrease").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        updateQuantity(id, -1);
      });
    });

    dom.cartItemsList.querySelectorAll(".btn-increase").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        updateQuantity(id, 1);
      });
    });

    dom.cartItemsList.querySelectorAll(".cart-item-remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        removeItem(id);
      });
    });
  }

  /**
   * Handle checkout action (Open Checkout Modal)
   */
  function handleCheckout() {
    if (cartItems.length === 0) return;
    if (typeof CheckoutManager !== "undefined" && CheckoutManager.openCheckout) {
      CheckoutManager.openCheckout();
    } else {
      const totalCount = getTotalCount();
      const totalPrice = currencyFormatter.format(getTotalPrice());
      closeCart();
      alert(`🎉 ĐẶT HÀNG THÀNH CÔNG!\n\nSố lượng món: ${totalCount}\nTổng thanh toán: ${totalPrice}\n\nCảm ơn bạn đã lựa chọn KFC! Đơn hàng của bạn đang được chuẩn bị.`);
      clearCart();
    }
  }

  /**
   * Toast notification helper
   */
  function showToast(message) {
    if (!dom.toastNotification || !dom.toastMessage) return;
    dom.toastMessage.textContent = message;
    dom.toastNotification.classList.add("show");

    setTimeout(() => {
      dom.toastNotification.classList.remove("show");
    }, 3200);
  }

  return {
    init,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    getItems: () => [...cartItems],
    getTotalCount,
    getTotalPrice,
  };
})();

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  CartManager.init();
});
