/**
 * KFC SQLite Database Manager (Client-Side & Server API Sync)
 * Quản lý cơ sở dữ liệu SQLite `orders.db` gồm 2 bảng `orders` và `order_items`
 */

const DatabaseManager = (() => {
  let dbInstance = null;
  let SQL = null;
  const DB_STORAGE_KEY = "kfc_sqlite_orders_db";

  // Khởi tạo SQL.js WebAssembly SQLite engine
  async function init() {
    try {
      if (typeof window.initSqlJs === "function") {
        SQL = await window.initSqlJs({
          locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`,
        });
        loadStoredDatabase();
      }
    } catch (err) {
      console.warn("Chạy ở chế độ tiêu chuẩn lưu trữ SQLite API:", err);
    }
  }

  function loadStoredDatabase() {
    if (!SQL) return;
    try {
      const savedData = localStorage.getItem(DB_STORAGE_KEY);
      if (savedData) {
        const uInt8Array = new Uint8Array(JSON.parse(savedData));
        dbInstance = new SQL.Database(uInt8Array);
      } else {
        dbInstance = new SQL.Database();
        createTables(dbInstance);
      }
    } catch (e) {
      console.error("Lỗi tải database từ bộ nhớ:", e);
      dbInstance = new SQL.Database();
      createTables(dbInstance);
    }
  }

  function createTables(db) {
    if (!db) return;
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        customer_note TEXT,
        payment_method TEXT NOT NULL,
        total_amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'CONFIRMED'
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
      );
    `);

    seedSampleOrders(db);
    persistDatabase();
  }

  function seedSampleOrders(db) {
    const sampleOrders = [
      {
        orderId: "KFC-102941",
        customer: { name: "Nguyễn Văn Hùng", phone: "0903123456", address: "88 Đồng Khởi, P. Bến Nghé, Quận 1, TP.HCM", note: "Giao giờ hành chính, gọi trước khi đến 5 phút" },
        method: "Ví MoMo (Quét mã QR)",
        total: 130000,
        items: [
          { id: "P002", name: "Gà Rán Cay (Best Seller)", price: 45000, quantity: 2 },
          { id: "P003", name: "Khoai Tây Chiên", price: 20000, quantity: 1 },
          { id: "P007", name: "Pepsi (Ly)", price: 10000, quantity: 2 },
        ],
      },
      {
        orderId: "KFC-204859",
        customer: { name: "Trần Thị Mai Lan", phone: "0918888999", address: "Toà nhà Landmark 81, P. 22, Bình Thạnh, TP.HCM", note: "Để tại quầy lễ tân tầng 1 giúp mình" },
        method: "Thẻ ATM / Internet Banking (Vietcombank)",
        total: 209000,
        items: [
          { id: "P010", name: "Combo Xô Gà Gia Đình", price: 189000, quantity: 1 },
          { id: "P008", name: "Coca Cola (Ly)", price: 10000, quantity: 2 },
        ],
      },
      {
        orderId: "KFC-385912",
        customer: { name: "Lê Hoàng Long", phone: "0987654321", address: "215 Nguyễn Văn Trỗi, Phường 10, Phú Nhuận, TP.HCM", note: "Lấy thêm tương cà và tương ớt" },
        method: "Tiền mặt khi nhận hàng (COD)",
        total: 140000,
        items: [
          { id: "P005", name: "Hamburger Bò", price: 50000, quantity: 1 },
          { id: "P006", name: "Hamburger Tôm", price: 50000, quantity: 1 },
          { id: "P003", name: "Khoai Tây Chiên", price: 20000, quantity: 1 },
          { id: "P009", name: "7Up (Ly)", price: 10000, quantity: 2 },
        ],
      },
      {
        orderId: "KFC-492018",
        customer: { name: "Phạm Minh Quân", phone: "0932456789", address: "12 Đường số 7, KDC Him Lam, Tân Hưng, Quận 7, TP.HCM", note: "Giao nóng giòn, không lấy đá nước ngọt" },
        method: "Ví MoMo (Quét mã QR)",
        total: 240000,
        items: [
          { id: "P001", name: "Gà Rán Truyền Thống", price: 40000, quantity: 3 },
          { id: "P004", name: "Hamburger Gà", price: 50000, quantity: 2 },
          { id: "P007", name: "Pepsi (Ly)", price: 10000, quantity: 2 },
        ],
      },
      {
        orderId: "KFC-573920",
        customer: { name: "Đỗ Thu Trang", phone: "0976112233", address: "65 Lê Duẩn, P. Bến Nghé, Quận 1, TP.HCM", note: "Giao lên phòng 402 lầu 4" },
        method: "Thẻ ATM / Internet Banking (Techcombank)",
        total: 203000,
        items: [
          { id: "P011", name: "Combo Burger Tiết Kiệm", price: 79000, quantity: 2 },
          { id: "P002", name: "Gà Rán Cay (Best Seller)", price: 45000, quantity: 1 },
        ],
      },
    ];

    sampleOrders.forEach((order) => {
      try {
        db.run(
          `INSERT OR IGNORE INTO orders (order_id, customer_name, customer_phone, customer_address, customer_note, payment_method, total_amount)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [order.orderId, order.customer.name, order.customer.phone, order.customer.address, order.customer.note, order.method, order.total]
        );

        order.items.forEach((item) => {
          db.run(
            `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [order.orderId, item.id, item.name, item.price, item.quantity, item.price * item.quantity]
          );
        });
      } catch (err) {
        console.warn("Lỗi nạp đơn mẫu:", err);
      }
    });
  }

  function persistDatabase() {
    if (!dbInstance) return;
    try {
      const data = dbInstance.export();
      const array = Array.from(data);
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(array));
    } catch (e) {
      console.warn("Không thể lưu cache SQLite vào localStorage:", e);
    }
  }

  /**
   * Lưu đơn hàng mới vào SQLite
   * Đồng thời ghi vào SQLite WASM Client và gửi API về Python Server (nếu có)
   */
  async function saveOrder(orderData) {
    const orderId = orderData.orderId || `KFC-${Math.floor(100000 + Math.random() * 900000)}`;
    const customer = orderData.customer || {};
    const name = customer.name || "Khách hàng";
    const phone = customer.phone || "";
    const address = customer.address || "";
    const note = customer.note || "";
    const method = orderData.method || "COD";
    const total = Number(orderData.total || 0);
    const items = orderData.items || [];

    // 1. Lưu vào SQLite Client-side (SQL.js / WASM)
    if (dbInstance) {
      try {
        dbInstance.run(
          `INSERT OR REPLACE INTO orders (
            order_id, customer_name, customer_phone, customer_address, customer_note, payment_method, total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [orderId, name, phone, address, note, method, total]
        );

        items.forEach((item) => {
          const pId = String(item.id || item.productId || "0");
          const pName = item.name || "Món ăn";
          const price = Number(item.price || 0);
          const qty = Number(item.quantity || 1);
          const subtotal = price * qty;

          dbInstance.run(
            `INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orderId, pId, pName, price, qty, subtotal]
          );
        });

        persistDatabase();
        console.log(`✅ [SQLite] Đã lưu đơn hàng #${orderId} vào orders.db cục bộ!`);
      } catch (err) {
        console.error("Lỗi ghi SQLite Client:", err);
      }
    }

    // 2. Gửi API về Backend Python để ghi trực tiếp vào orders.db trên ổ cứng
    const orderPayload = {
      orderId,
      customer: { name, phone, address, note },
      method,
      total,
      items,
    };

    const apiUrls = [
      window.location.origin && window.location.origin.startsWith("http") ? "/api/orders" : null,
      "http://localhost:8000/api/orders",
      "http://127.0.0.1:8000/api/orders",
    ].filter(Boolean);

    let serverSaved = false;
    for (const url of apiUrls) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });
        if (response.ok) {
          const result = await response.json();
          console.log(`✅ [SQLite Server] Đồng bộ đơn hàng thành công vào orders.db trên đĩa (${url}):`, result);
          serverSaved = true;
          break;
        }
      } catch (err) {
        // thử endpoint tiếp theo
      }
    }

    if (!serverSaved) {
      console.log("ℹ️ Server Python chưa bật. Hãy chạy 'python3 server.py' để tự động ghi đơn mới vào file orders.db trên ổ cứng.");
    }

    return true;
  }

  /**
   * Tải tệp SQLite orders.db về máy tính người dùng
   */
  function exportDatabase() {
    if (!dbInstance) {
      alert("Đang khởi tạo cơ sở dữ liệu SQLite hoặc chưa có đơn hàng nào.");
      return;
    }

    try {
      const binaryArray = dbInstance.export();
      const blob = new Blob([binaryArray], { type: "application/x-sqlite3" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orders.db";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Lỗi xuất file SQLite:", err);
      alert("Không thể tải file database lúc này.");
    }
  }

  /**
   * Lấy danh sách tất cả các đơn hàng từ bảng orders
   */
  function getAllOrders() {
    if (!dbInstance) return [];
    try {
      const stmt = dbInstance.prepare("SELECT * FROM orders ORDER BY created_at DESC");
      const orders = [];
      while (stmt.step()) {
        orders.push(stmt.getAsObject());
      }
      stmt.free();
      return orders;
    } catch (e) {
      console.error("Lỗi truy vấn orders:", e);
      return [];
    }
  }

  return {
    init,
    saveOrder,
    exportDatabase,
    getAllOrders,
  };
})();

// Tự động khởi tạo khi tài liệu sẵn sàng
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    DatabaseManager.init();
  });
}
