/**
 * KFC Landing Page Application
 * Pure Vanilla JavaScript implementation
 */

document.addEventListener("DOMContentLoaded", () => {
  // App State
  const state = {
    products: [],
    currentCategory: "all",
    selectedProduct: null,
    orderQuantity: 1,
  };

  // DOM Elements
  const productsContainer = document.getElementById("products-grid");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  // Modal Elements
  const modalOverlay = document.getElementById("order-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalImg = document.getElementById("modal-product-img");
  const modalCategory = document.getElementById("modal-product-category");
  const modalName = document.getElementById("modal-product-name");
  const modalDesc = document.getElementById("modal-product-desc");
  const modalQtyValue = document.getElementById("modal-qty-value");
  const modalTotalPrice = document.getElementById("modal-total-price");
  const qtyDecreaseBtn = document.getElementById("qty-decrease-btn");
  const qtyIncreaseBtn = document.getElementById("qty-increase-btn");
  const confirmOrderBtn = document.getElementById("confirm-order-btn");
  const toastNotification = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");

  // Currency Formatter for VND
  const currencyFormatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  // Category Display Translator
  const categoryDisplayMap = {
    "all": "Tất Cả",
    "fried chicken": "Gà Rán",
    "gà rán": "Gà Rán",
    "burger": "Burger",
    "combo": "Combo Tiết Kiệm",
    "combo tiết kiệm": "Combo Tiết Kiệm",
    "sides": "Món Ăn Kèm",
    "món ăn kèm": "Món Ăn Kèm",
    "món kèm": "Món Ăn Kèm",
    "drinks": "Thức Uống",
    "thức uống": "Thức Uống",
  };

  function getDisplayCategory(cat) {
    if (!cat) return "Khác";
    return categoryDisplayMap[cat.trim().toLowerCase()] || cat;
  }

  // Fallback data in case fetch() is blocked by file:// CORS
  const defaultFallbackProducts = [
    { id: "P001", name: "Gà Rán Truyền Thống", category: "Fried Chicken", description: "Gà rán công thức truyền thống với lớp da giòn rụm và thịt mềm mọng nước đặc trưng KFC", price: 40000, originalPrice: null, image: "assets/images/ga_ran_truyen_thong.jpg", featured: true },
    { id: "P002", name: "Gà Rán Cay (Best Seller)", category: "Fried Chicken", description: "Miếng gà vàng ươm giòn tan tẩm ướp sốt ớt cay nồng bùng nổ vị giác", price: 45000, originalPrice: null, image: "assets/images/ga_ran_cay.jpg", featured: true },
    { id: "P003", name: "Khoai Tây Chiên", category: "Sides", description: "Khoai tây chiên vàng giòn rụm bên ngoài và thơm bùi nóng hổi bên trong", price: 20000, originalPrice: null, image: "assets/images/khoai_tay_chien.jpg", featured: false },
    { id: "P004", name: "Hamburger Gà", category: "Burger", description: "Burger kẹp thịt gà rán giòn rụm xà lách tươi và sốt mayonnaise béo ngậy", price: 50000, originalPrice: null, image: "assets/images/burger_ga.jpg", featured: true },
    { id: "P005", name: "Hamburger Bò", category: "Burger", description: "Burger bò nướng đậm vị phô mai béo ngậy cùng rau xà lách tươi ngon hảo hạng", price: 50000, originalPrice: null, image: "assets/images/burger_bo.jpg", featured: false },
    { id: "P006", name: "Hamburger Tôm", category: "Burger", description: "Burger nhân chả tôm tươi ngọt chiên xù giòn tan cùng sốt tartar độc quyền", price: 50000, originalPrice: null, image: "assets/images/burger_tom.jpg", featured: false },
    { id: "P007", name: "Pepsi (Ly)", category: "Drinks", description: "Nước ngọt có gas Pepsi tươi mát lạnh xua tan cơn khát", price: 10000, originalPrice: null, image: "assets/images/pepsi.jpg", featured: false },
    { id: "P008", name: "Coca Cola (Ly)", category: "Drinks", description: "Nước giải khát Coca Cola mát lạnh sảng khoái từng ngụm", price: 10000, originalPrice: null, image: "assets/images/pepsi.jpg", featured: false },
    { id: "P009", name: "7Up (Ly)", category: "Drinks", description: "Nước ngọt 7Up vị chanh tươi mát sảng khoái bừng tỉnh", price: 10000, originalPrice: null, image: "assets/images/7up.jpg", featured: false },
    { id: "P010", name: "Combo Xô Gà Gia Đình", category: "Combo", description: "6 miếng gà rán giòn, 1 khoai tây chiên lớn, 2 ly Pepsi mát lạnh", price: 219000, originalPrice: 249000, image: "assets/images/xo_ga.jpg", featured: true },
    { id: "P011", name: "Combo Burger Siêu Tiết Kiệm", category: "Combo", description: "1 Hamburger gà giòn, 1 phần khoai tây chiên vừa, 1 ly nước ngọt tự chọn", price: 75000, originalPrice: 80000, image: "assets/images/combo_burger.jpg", featured: true }
  ];

  /**
   * Parse CSV text into an array of rows and columns.
   */
  function parseCSV(text) {
    const lines = [];
    let row = [];
    let cell = "";
    let insideQuote = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          cell += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === "," && !insideQuote) {
        row.push(cell.trim());
        cell = "";
      } else if ((char === "\r" || char === "\n") && !insideQuote) {
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
        row.push(cell.trim());
        if (row.length > 0 && row.some((c) => c !== "")) {
          lines.push(row);
        }
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    if (cell.length > 0 || row.length > 0) {
      row.push(cell.trim());
      if (row.some((c) => c !== "")) {
        lines.push(row);
      }
    }

    return lines;
  }

  /**
   * Converts raw CSV rows into typed Product objects
   */
  function transformCSVToProducts(rows) {
    if (!rows || rows.length < 2) return [];

    const headers = rows[0].map((h) => h.toLowerCase().trim());
    const idIdx = headers.indexOf("id");
    const nameIdx = headers.indexOf("name");
    const categoryIdx = headers.indexOf("category");
    const descIdx = headers.indexOf("description");
    const priceIdx = headers.indexOf("price");
    const originalPriceIdx = headers.indexOf("original_price");
    const imageIdx = headers.indexOf("image");
    const featuredIdx = headers.indexOf("featured");

    const products = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length <= 1 && !row[0]) continue;

      const price = parseFloat(row[priceIdx]) || 0;
      const originalPriceRaw = row[originalPriceIdx];
      const originalPrice = originalPriceRaw ? parseFloat(originalPriceRaw) : null;
      const featured = (row[featuredIdx] || "").toLowerCase() === "true";

      products.push({
        id: row[idIdx] || `P${i}`,
        name: row[nameIdx] || "Món ăn KFC",
        category: row[categoryIdx] || "Fried Chicken",
        description: row[descIdx] || "",
        price: price,
        originalPrice: originalPrice,
        image: row[imageIdx] || "assets/images/original-chicken.webp",
        featured: featured,
      });
    }

    return products;
  }

  /**
   * Fetch products from data/products.csv with fallback
   */
  async function loadProducts() {
    try {
      const response = await fetch("data/products.csv");
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.statusText}`);
      }
      const csvText = await response.text();
      const parsedRows = parseCSV(csvText);
      const products = transformCSVToProducts(parsedRows);

      if (!products || products.length === 0) {
        state.products = defaultFallbackProducts;
      } else {
        state.products = products;
      }
      renderFilteredProducts();
    } catch (error) {
      console.warn("Không thể fetch CSV qua mạng, sử dụng dữ liệu mặc định:", error);
      state.products = defaultFallbackProducts;
      renderFilteredProducts();
    }
  }

  /**
   * Filter and render products based on state.currentCategory
   */
  function renderFilteredProducts() {
    if (!productsContainer) return;

    let filtered = state.products;
    if (state.currentCategory !== "all") {
      const targetCat = state.currentCategory.toLowerCase().trim();
      filtered = state.products.filter((p) => {
        const prodCat = (p.category || "").toLowerCase().trim();
        const displayCat = getDisplayCategory(p.category).toLowerCase();
        return prodCat === targetCat || displayCat === targetCat || targetCat.includes(prodCat) || prodCat.includes(targetCat);
      });
    }

    if (filtered.length === 0) {
      productsContainer.innerHTML = `
        <div class="products-message">
          <p>Chưa có món ăn nào trong danh mục này.</p>
        </div>
      `;
      return;
    }

    productsContainer.innerHTML = filtered
      .map((product) => createProductCardHTML(product))
      .join("");

    // Attach click listeners to all "Đặt món ngay" buttons on cards
    productsContainer.querySelectorAll(".order-card-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const productId = e.currentTarget.getAttribute("data-id");
        openOrderModal(productId);
      });
    });
  }

  /**
   * Generate HTML markup for a single product card
   */
  function createProductCardHTML(product) {
    const formattedPrice = currencyFormatter.format(product.price);
    const originalPriceHTML = product.originalPrice
      ? `<span class="card-original-price">${currencyFormatter.format(product.originalPrice)}</span>`
      : "";
    
    const discountBadgeHTML = product.name.includes("Best Seller")
      ? `<span class="card-discount-tag" style="background-color: var(--primary-red);">BÁN CHẠY</span>`
      : product.originalPrice
      ? `<span class="card-discount-tag">ƯU ĐÃI</span>`
      : "";

    const displayCategory = getDisplayCategory(product.category);

    return `
      <article class="product-card" data-category="${product.category}">
        <a href="product-detail.html?id=${product.id}" class="card-media-link" title="Xem chi tiết ${product.name}">
          <div class="card-media">
            <img src="${product.image}" alt="${product.name}" class="card-img" onerror="this.src='assets/images/original-chicken.webp'" loading="lazy" />
            <span class="card-category-tag">${displayCategory}</span>
            ${discountBadgeHTML}
          </div>
        </a>
        <div class="card-body">
          <a href="product-detail.html?id=${product.id}" title="Xem chi tiết ${product.name}">
            <h3 class="card-title">${product.name}</h3>
          </a>
          <p class="card-desc">${product.description}</p>
          <div class="card-footer">
            <div class="card-price-box">
              <span class="card-price">${formattedPrice}</span>
              ${originalPriceHTML}
            </div>
            <button class="btn btn-primary btn-sm order-card-btn" data-id="${product.id}" aria-label="Đặt món ${product.name}">
              Đặt món ngay
            </button>
          </div>
        </div>
      </article>
    `;
  }

  /**
   * Setup Category Filter button listeners
   */
  function setupCategoryFilters() {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        state.currentCategory = button.getAttribute("data-category") || "all";
        renderFilteredProducts();
      });
    });
  }

  /**
   * Mobile Navigation Menu Toggle
   */
  function setupMobileNav() {
    if (!hamburgerBtn || !navMenu) return;

    hamburgerBtn.addEventListener("click", () => {
      const isExpanded = hamburgerBtn.classList.toggle("active");
      navMenu.classList.toggle("open");
      hamburgerBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        hamburgerBtn.classList.remove("active");
        navMenu.classList.remove("open");
        hamburgerBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /**
   * Open the order modal for a specific product
   */
  function openOrderModal(productId) {
    const product = state.products.find((p) => p.id === productId);
    if (!product) return;

    state.selectedProduct = product;
    state.orderQuantity = 1;

    modalImg.src = product.image;
    modalImg.alt = product.name;
    modalCategory.textContent = getDisplayCategory(product.category);
    modalName.textContent = product.name;
    modalDesc.textContent = product.description;

    updateModalCalculations();
    modalOverlay.classList.add("open");
    modalOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  /**
   * Close the order modal
   */
  function closeOrderModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("open");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    state.selectedProduct = null;
  }

  /**
   * Update modal quantity & total price display
   */
  function updateModalCalculations() {
    if (!state.selectedProduct) return;
    modalQtyValue.textContent = state.orderQuantity;
    const total = state.selectedProduct.price * state.orderQuantity;
    modalTotalPrice.textContent = currencyFormatter.format(total);
  }

  /**
   * Show confirmation toast notification
   */
  function showToast(message) {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = message;
    toastNotification.classList.add("show");

    setTimeout(() => {
      toastNotification.classList.remove("show");
    }, 3500);
  }

  /**
   * Setup Modal interaction listeners
   */
  function setupModalHandlers() {
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", closeOrderModal);
    }

    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
          closeOrderModal();
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalOverlay.classList.contains("open")) {
        closeOrderModal();
      }
    });

    if (qtyDecreaseBtn) {
      qtyDecreaseBtn.addEventListener("click", () => {
        if (state.orderQuantity > 1) {
          state.orderQuantity--;
          updateModalCalculations();
        }
      });
    }

    if (qtyIncreaseBtn) {
      qtyIncreaseBtn.addEventListener("click", () => {
        if (state.orderQuantity < 99) {
          state.orderQuantity++;
          updateModalCalculations();
        }
      });
    }

    if (confirmOrderBtn) {
      confirmOrderBtn.addEventListener("click", () => {
        if (!state.selectedProduct) return;
        const selected = state.selectedProduct;
        const qty = state.orderQuantity;

        closeOrderModal();
        if (typeof CartManager !== "undefined" && CartManager.addItem) {
          CartManager.addItem(selected, qty);
        } else {
          showToast(`Đã thêm ${qty}x ${selected.name} vào giỏ hàng!`);
        }
      });
    }

    // Header & Hero CTA "Đặt Món Ngay" trigger
    const globalOrderBtns = document.querySelectorAll(".cta-order-trigger");
    globalOrderBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (state.products.length > 0) {
          const featured = state.products.find((p) => p.featured) || state.products[0];
          openOrderModal(featured.id);
        } else {
          const menuSection = document.getElementById("menu");
          if (menuSection) menuSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }

  // Initialize
  setupCategoryFilters();
  setupMobileNav();
  setupModalHandlers();
  loadProducts();
});
