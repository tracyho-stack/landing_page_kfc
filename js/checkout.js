/**
 * KFC Payment & Checkout Controller (Module Thanh Toán)
 * Hỗ trợ thanh toán mã QR MoMo và thẻ ATM / Internet Banking
 */

const CheckoutManager = (() => {
  const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  // State
  let state = {
    orderId: "",
    selectedMethod: "momo", // 'momo', 'atm', 'cod'
    cartItems: [],
    totalPrice: 0,
    timerInterval: null,
    timeLeftSeconds: 300, // 5 minutes
  };

  // DOM Elements
  let dom = {};

  function init() {
    dom = {
      checkoutModal: document.getElementById("checkout-modal"),
      checkoutCloseBtn: document.getElementById("checkout-close-btn"),
      checkoutForm: document.getElementById("checkout-form"),
      checkoutItemsList: document.getElementById("checkout-items-list"),
      checkoutSubtotal: document.getElementById("checkout-subtotal"),
      checkoutTotal: document.getElementById("checkout-total"),
      
      // Payment Method Tabs
      paymentMethodInputs: document.querySelectorAll("input[name='payment_method']"),
      momoPaymentBox: document.getElementById("momo-payment-box"),
      atmPaymentBox: document.getElementById("atm-payment-box"),
      codPaymentBox: document.getElementById("cod-payment-box"),
      
      // MoMo specifics
      momoQrImg: document.getElementById("momo-qr-img"),
      momoAmount: document.getElementById("momo-amount"),
      momoOrderId: document.getElementById("momo-order-id"),
      momoCountdown: document.getElementById("momo-countdown"),
      
      // ATM specifics
      atmBankSelect: document.getElementById("atm-bank-select"),
      atmCardNumber: document.getElementById("atm-card-number"),
      atmCardHolder: document.getElementById("atm-card-holder"),
      atmCardExpiry: document.getElementById("atm-card-expiry"),
      
      // Submit & Actions
      submitPaymentBtn: document.getElementById("submit-payment-btn"),
      
      // Receipt Modal
      receiptModal: document.getElementById("receipt-modal"),
      receiptCloseBtn: document.getElementById("receipt-close-btn"),
      receiptOrderId: document.getElementById("receipt-order-id"),
      receiptDate: document.getElementById("receipt-date"),
      receiptCustomerName: document.getElementById("receipt-customer-name"),
      receiptCustomerPhone: document.getElementById("receipt-customer-phone"),
      receiptCustomerAddress: document.getElementById("receipt-customer-address"),
      receiptPaymentMethod: document.getElementById("receipt-payment-method"),
      receiptItemsList: document.getElementById("receipt-items-list"),
      receiptTotal: document.getElementById("receipt-total"),
      continueShoppingBtn: document.getElementById("continue-shopping-btn"),
      exportDbBtn: document.getElementById("export-db-btn"),
    };

    setupEventListeners();
  }

  function setupEventListeners() {
    if (dom.checkoutCloseBtn) {
      dom.checkoutCloseBtn.addEventListener("click", closeCheckout);
    }

    if (dom.exportDbBtn) {
      dom.exportDbBtn.addEventListener("click", () => {
        if (typeof DatabaseManager !== "undefined") {
          DatabaseManager.exportDatabase();
        }
      });
    }

    if (dom.checkoutModal) {
      dom.checkoutModal.addEventListener("click", (e) => {
        if (e.target === dom.checkoutModal) closeCheckout();
      });
    }

    if (dom.receiptCloseBtn) {
      dom.receiptCloseBtn.addEventListener("click", closeReceipt);
    }

    if (dom.continueShoppingBtn) {
      dom.continueShoppingBtn.addEventListener("click", () => {
        closeReceipt();
        window.location.href = "index.html#menu";
      });
    }

    // Payment method radio change
    if (dom.paymentMethodInputs) {
      dom.paymentMethodInputs.forEach((input) => {
        input.addEventListener("change", (e) => {
          switchPaymentMethod(e.target.value);
        });
      });
    }

    // Card Number Formatter (add space every 4 digits)
    if (dom.atmCardNumber) {
      dom.atmCardNumber.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "").substring(0, 19);
        value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
        e.target.value = value;
      });
    }

    // Expiry Formatter (MM/YY)
    if (dom.atmCardExpiry) {
      dom.atmCardExpiry.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "").substring(0, 4);
        if (value.length >= 2) {
          value = value.substring(0, 2) + "/" + value.substring(2, 4);
        }
        e.target.value = value;
      });
    }

    // Submit Checkout Form
    if (dom.checkoutForm) {
      dom.checkoutForm.addEventListener("submit", handlePaymentSubmit);
    }
  }

  /**
   * Open Checkout Modal
   */
  function openCheckout() {
    if (typeof CartManager === "undefined" || CartManager.getItems().length === 0) {
      alert("Giỏ hàng của bạn đang trống. Vui lòng chọn món ăn trước khi thanh toán!");
      return;
    }

    // Close Cart Drawer first
    if (CartManager.closeCart) CartManager.closeCart();

    state.cartItems = CartManager.getItems();
    state.totalPrice = CartManager.getTotalPrice();
    state.orderId = "KFC-" + Math.floor(100000 + Math.random() * 900000);

    renderCheckoutItems();
    switchPaymentMethod(state.selectedMethod);
    startCountdown();

    if (dom.checkoutModal) {
      dom.checkoutModal.classList.add("open");
      dom.checkoutModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      const bodyEl = dom.checkoutModal.querySelector(".checkout-modal-body");
      if (bodyEl) bodyEl.scrollTop = 0;
    }
  }

  /**
   * Close Checkout Modal
   */
  function closeCheckout() {
    if (!dom.checkoutModal) return;
    dom.checkoutModal.classList.remove("open");
    dom.checkoutModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    clearInterval(state.timerInterval);
  }

  /**
   * Render order summary items in checkout modal
   */
  function renderCheckoutItems() {
    if (!dom.checkoutItemsList) return;

    dom.checkoutItemsList.innerHTML = state.cartItems
      .map(
        (item) => `
        <div class="checkout-item-row">
          <div class="checkout-item-title">
            <span class="checkout-item-qty">${item.quantity}x</span>
            <span class="checkout-item-name">${item.name}</span>
          </div>
          <span class="checkout-item-price">${currencyFormatter.format(item.price * item.quantity)}</span>
        </div>
      `
      )
      .join("");

    const formattedTotal = currencyFormatter.format(state.totalPrice);
    if (dom.checkoutSubtotal) dom.checkoutSubtotal.textContent = formattedTotal;
    if (dom.checkoutTotal) dom.checkoutTotal.textContent = formattedTotal;
    if (dom.submitPaymentBtn) {
      dom.submitPaymentBtn.innerHTML = `<span>🔒 Đặt Hàng & Thanh Toán</span> <span style="margin: 0 4px; opacity: 0.7;">•</span> <span>${formattedTotal}</span>`;
    }
  }

  /**
   * Switch Active Payment Method UI
   */
  function switchPaymentMethod(method) {
    state.selectedMethod = method;

    if (dom.momoPaymentBox) dom.momoPaymentBox.style.display = method === "momo" ? "block" : "none";
    if (dom.atmPaymentBox) dom.atmPaymentBox.style.display = method === "atm" ? "block" : "none";
    if (dom.codPaymentBox) dom.codPaymentBox.style.display = method === "cod" ? "block" : "none";

    if (method === "momo") {
      setupMoMoQR();
    }
  }

  /**
   * Generate MoMo QR Code & Info
   */
  function setupMoMoQR() {
    const formattedAmount = currencyFormatter.format(state.totalPrice);
    if (dom.momoAmount) dom.momoAmount.textContent = formattedAmount;
    if (dom.momoOrderId) dom.momoOrderId.textContent = state.orderId;

    // Generate real VietQR / MoMo dynamic QR code image URL
    if (dom.momoQrImg) {
      const qrData = encodeURIComponent(`2|99|0909123456|KFC VIETNAM|support@kfc.vn|0|0|${state.totalPrice}|${state.orderId}|transfer_myqr`);
      dom.momoQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}&color=a50064`;
    }
  }

  /**
   * 5-minute Countdown Timer for QR Payment
   */
  function startCountdown() {
    clearInterval(state.timerInterval);
    state.timeLeftSeconds = 300;
    updateCountdownDisplay();

    state.timerInterval = setInterval(() => {
      state.timeLeftSeconds--;
      updateCountdownDisplay();

      if (state.timeLeftSeconds <= 0) {
        clearInterval(state.timerInterval);
        alert("Mã thanh toán QR đã hết hạn. Vui lòng tạo lại đơn hàng!");
        closeCheckout();
      }
    }, 1000);
  }

  function updateCountdownDisplay() {
    if (!dom.momoCountdown) return;
    const minutes = Math.floor(state.timeLeftSeconds / 60);
    const seconds = state.timeLeftSeconds % 60;
    dom.momoCountdown.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  /**
   * Handle Payment Form Submission
   */
  function handlePaymentSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById("customer-name");
    const phoneInput = document.getElementById("customer-phone");
    const addressInput = document.getElementById("customer-address");
    const noteInput = document.getElementById("customer-note");

    const name = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const address = addressInput ? addressInput.value.trim() : "";
    const note = noteInput ? noteInput.value.trim() : "";

    if (!name || !phone || !address) {
      alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!");
      return;
    }

    // Validate ATM if chosen
    if (state.selectedMethod === "atm") {
      const cardNum = dom.atmCardNumber ? dom.atmCardNumber.value.trim() : "";
      const cardHolder = dom.atmCardHolder ? dom.atmCardHolder.value.trim() : "";
      const cardExpiry = dom.atmCardExpiry ? dom.atmCardExpiry.value.trim() : "";

      if (cardNum.length < 15 || !cardHolder || cardExpiry.length < 5) {
        alert("Vui lòng nhập đầy đủ và chính xác thông tin thẻ ATM (Số thẻ, Tên chủ thẻ, Ngày phát hành MM/YY)!");
        return;
      }
    }

    // Order Success Object
    const orderData = {
      orderId: state.orderId,
      date: new Date().toLocaleString("vi-VN"),
      customer: { name, phone, address, note },
      method: getMethodName(state.selectedMethod),
      items: state.cartItems,
      total: state.totalPrice,
    };

    // Close Checkout and Show Receipt
    closeCheckout();
    showReceipt(orderData);

    // Save order data to SQLite database (orders.db)
    if (typeof DatabaseManager !== "undefined") {
      DatabaseManager.saveOrder(orderData);
    }

    // Clear cart
    if (typeof CartManager !== "undefined" && CartManager.clearCart) {
      CartManager.clearCart();
    }
  }

  function getMethodName(method) {
    if (method === "momo") return "Ví điện tử MoMo (Quét QR)";
    if (method === "atm") return "Thẻ ATM / Internet Banking";
    return "Thanh toán tiền mặt khi nhận hàng (COD)";
  }

  /**
   * Show Order Receipt Modal
   */
  function showReceipt(order) {
    if (!dom.receiptModal) return;

    if (dom.receiptOrderId) dom.receiptOrderId.textContent = "#" + order.orderId;
    if (dom.receiptDate) dom.receiptDate.textContent = order.date;
    if (dom.receiptCustomerName) dom.receiptCustomerName.textContent = order.customer.name;
    if (dom.receiptCustomerPhone) dom.receiptCustomerPhone.textContent = order.customer.phone;
    if (dom.receiptCustomerAddress) dom.receiptCustomerAddress.textContent = order.customer.address;
    if (dom.receiptPaymentMethod) dom.receiptPaymentMethod.textContent = order.method;
    if (dom.receiptTotal) dom.receiptTotal.textContent = currencyFormatter.format(order.total);

    if (dom.receiptItemsList) {
      dom.receiptItemsList.innerHTML = order.items
        .map(
          (item) => `
          <div class="receipt-item-row">
            <span>${item.quantity}x ${item.name}</span>
            <span>${currencyFormatter.format(item.price * item.quantity)}</span>
          </div>
        `
        )
        .join("");
    }

    dom.receiptModal.classList.add("open");
    dom.receiptModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeReceipt() {
    if (!dom.receiptModal) return;
    dom.receiptModal.classList.remove("open");
    dom.receiptModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  return {
    init,
    openCheckout,
    closeCheckout,
  };
})();

// Auto initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  CheckoutManager.init();
});
