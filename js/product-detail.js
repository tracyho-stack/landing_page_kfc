/**
 * KFC Product Detail Page Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // State
  const state = {
    allProducts: [],
    currentProduct: null,
    quantity: 1,
  };

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

  // DOM Elements
  const breadcrumbCategory = document.getElementById("breadcrumb-category");
  const breadcrumbProduct = document.getElementById("breadcrumb-product");
  const productImg = document.getElementById("detail-product-img");
  const productCategoryBadge = document.getElementById("detail-category-badge");
  const productPromoBadge = document.getElementById("detail-promo-badge");
  const productName = document.getElementById("detail-product-name");
  const productPrice = document.getElementById("detail-product-price");
  const productOriginalPrice = document.getElementById("detail-product-original-price");
  const productDesc = document.getElementById("detail-product-desc");
  const qtyValue = document.getElementById("detail-qty-value");
  const qtyDecreaseBtn = document.getElementById("detail-qty-decrease");
  const qtyIncreaseBtn = document.getElementById("detail-qty-increase");
  const addToCartBtn = document.getElementById("detail-add-to-cart-btn");
  const buyNowBtn = document.getElementById("detail-buy-now-btn");
  const relatedGrid = document.getElementById("related-products-grid");
  const productDetailSection = document.getElementById("product-detail-container");
  const notFoundSection = document.getElementById("product-not-found");
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const navMenu = document.getElementById("nav-menu");

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
   * Mobile Navigation Toggle
   */
  function setupMobileNav() {
    if (!hamburgerBtn || !navMenu) return;
    hamburgerBtn.addEventListener("click", () => {
      const isExpanded = hamburgerBtn.classList.toggle("active");
      navMenu.classList.toggle("open");
      hamburgerBtn.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    });
  }

  /**
   * Fetch and render product detail
   */
  async function loadProductDetail() {
    try {
      const response = await fetch("data/products.csv");
      if (!response.ok) throw new Error("Could not load products.csv");
      const csvText = await response.text();
      const parsedRows = parseCSV(csvText);
      const products = transformCSVToProducts(parsedRows);
      state.allProducts = products && products.length > 0 ? products : defaultFallbackProducts;

      const urlParams = new URLSearchParams(window.location.search);
      const targetId = urlParams.get("id") || "P001";

      state.currentProduct = state.allProducts.find((p) => p.id === targetId);

      if (!state.currentProduct) {
        showNotFound();
        return;
      }

      renderProductDetail(state.currentProduct);
      renderRelatedProducts(state.currentProduct);
    } catch (err) {
      console.warn("Dùng dữ liệu mặc định do không fetch được CSV:", err);
      state.allProducts = defaultFallbackProducts;
      const urlParams = new URLSearchParams(window.location.search);
      const targetId = urlParams.get("id") || "P001";
      state.currentProduct = state.allProducts.find((p) => p.id === targetId);

      if (!state.currentProduct) {
        showNotFound();
        return;
      }

      renderProductDetail(state.currentProduct);
      renderRelatedProducts(state.currentProduct);
    }
  }

  /**
   * Show Not Found Error State
   */
  function showNotFound() {
    if (productDetailSection) productDetailSection.style.display = "none";
    if (notFoundSection) notFoundSection.style.display = "block";
  }

  /**
   * Render Main Product Detail
   */
  function renderProductDetail(product) {
    if (productDetailSection) productDetailSection.style.display = "grid";
    if (notFoundSection) notFoundSection.style.display = "none";

    document.title = `${product.name} | KFC Việt Nam`;

    const displayCategory = getDisplayCategory(product.category);

    if (breadcrumbCategory) breadcrumbCategory.textContent = displayCategory;
    if (breadcrumbProduct) breadcrumbProduct.textContent = product.name;

    if (productImg) {
      productImg.src = product.image;
      productImg.alt = product.name;
    }

    if (productCategoryBadge) {
      productCategoryBadge.textContent = displayCategory;
    }

    if (productPromoBadge) {
      if (product.name.includes("Best Seller") || product.featured) {
        productPromoBadge.style.display = "inline-block";
        productPromoBadge.textContent = product.name.includes("Best Seller") ? "🔥 Bán Chạy Nhất" : "⭐ Được Yêu Thích";
      } else {
        productPromoBadge.style.display = "none";
      }
    }

    if (productName) productName.textContent = product.name;
    if (productPrice) productPrice.textContent = currencyFormatter.format(product.price);

    if (productOriginalPrice) {
      if (product.originalPrice) {
        productOriginalPrice.style.display = "inline-block";
        productOriginalPrice.textContent = currencyFormatter.format(product.originalPrice);
      } else {
        productOriginalPrice.style.display = "none";
      }
    }

    if (productDesc) productDesc.textContent = product.description;

    updateQuantityDisplay();
  }

  /**
   * Update Quantity Display
   */
  function updateQuantityDisplay() {
    if (qtyValue) qtyValue.textContent = state.quantity;
  }

  /**
   * Render Related Products
   */
  function renderRelatedProducts(currentProduct) {
    if (!relatedGrid) return;

    const related = state.allProducts
      .filter((p) => p.id !== currentProduct.id)
      .slice(0, 4);

    if (related.length === 0) {
      relatedGrid.innerHTML = `<p class="products-message">Không có món liên quan.</p>`;
      return;
    }

    relatedGrid.innerHTML = related
      .map((item) => {
        const itemPrice = currencyFormatter.format(item.price);
        const itemDisplayCat = getDisplayCategory(item.category);
        return `
          <article class="product-card" data-category="${item.category}">
            <a href="product-detail.html?id=${item.id}" class="card-media-link" title="Xem chi tiết ${item.name}">
              <div class="card-media">
                <img src="${item.image}" alt="${item.name}" class="card-img" onerror="this.src='assets/images/original-chicken.webp'" loading="lazy" />
                <span class="card-category-tag">${itemDisplayCat}</span>
              </div>
            </a>
            <div class="card-body">
              <a href="product-detail.html?id=${item.id}" title="Xem chi tiết ${item.name}">
                <h3 class="card-title">${item.name}</h3>
              </a>
              <p class="card-desc">${item.description}</p>
              <div class="card-footer">
                <div class="card-price-box">
                  <span class="card-price">${itemPrice}</span>
                </div>
                <button class="btn btn-primary btn-sm quick-add-btn" data-id="${item.id}" aria-label="Thêm ${item.name} vào giỏ">
                  + Thêm
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    relatedGrid.querySelectorAll(".quick-add-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const product = state.allProducts.find((p) => p.id === id);
        if (product && typeof CartManager !== "undefined") {
          CartManager.addItem(product, 1);
        }
      });
    });
  }

  /**
   * Setup Event Listeners for Product Detail
   */
  function setupEvents() {
    setupMobileNav();

    if (qtyDecreaseBtn) {
      qtyDecreaseBtn.addEventListener("click", () => {
        if (state.quantity > 1) {
          state.quantity--;
          updateQuantityDisplay();
        }
      });
    }

    if (qtyIncreaseBtn) {
      qtyIncreaseBtn.addEventListener("click", () => {
        if (state.quantity < 99) {
          state.quantity++;
          updateQuantityDisplay();
        }
      });
    }

    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        if (!state.currentProduct) return;
        if (typeof CartManager !== "undefined") {
          CartManager.addItem(state.currentProduct, state.quantity);
        }
      });
    }

    if (buyNowBtn) {
      buyNowBtn.addEventListener("click", () => {
        if (!state.currentProduct) return;
        if (typeof CartManager !== "undefined") {
          CartManager.addItem(state.currentProduct, state.quantity);
          CartManager.openCart();
        }
      });
    }
  }

  // Init
  setupEvents();
  loadProductDetail();
});
