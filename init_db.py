#!/usr/bin/env python3
"""
KFC SQLite Database Manager (orders.db)
Tạo và quản lý 2 bảng: `orders` và `order_items`
"""

import os
import sqlite3
from typing import Dict, List, Any, Optional

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "orders.db")


def get_db_connection(db_path: str = DB_FILE) -> sqlite3.Connection:
    """Kết nối tới cơ sở dữ liệu SQLite và bật hỗ trợ Foreign Key."""
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn


def init_database(db_path: str = DB_FILE) -> None:
    """Khởi tạo cấu trúc 2 bảng `orders` và `order_items`."""
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        
        # Bảng 1: orders
        cursor.execute("""
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
        """)

        # Bảng 2: order_items
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                product_id TEXT NOT NULL,
                product_name TEXT NOT NULL,
                price REAL NOT NULL,
                quantity INTEGER NOT NULL,
                subtotal REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
            );
        """)

        conn.commit()


def save_order(order_data: Dict[str, Any], db_path: str = DB_FILE) -> bool:
    """
    Lưu đơn hàng và các món ăn vào SQLite orders.db
    
    order_data structure:
    {
        "orderId": "KFC-123456",
        "customer": {
            "name": "Nguyễn Văn A",
            "phone": "0909123456",
            "address": "123 Lê Lợi, Q1",
            "note": "Giao nhanh"
        },
        "method": "Ví MoMo (Quét mã QR)",
        "total": 125000,
        "items": [
            {
                "id": "1",
                "name": "Gà Rán Giòn Cay",
                "price": 45000,
                "quantity": 2
            }
        ]
    }
    """
    init_database(db_path)

    order_id = order_data.get("orderId") or order_data.get("order_id")
    customer = order_data.get("customer", {})
    name = customer.get("name") or order_data.get("customer_name", "Khách hàng")
    phone = customer.get("phone") or order_data.get("customer_phone", "")
    address = customer.get("address") or order_data.get("customer_address", "")
    note = customer.get("note") or order_data.get("customer_note", "")
    method = order_data.get("method") or order_data.get("payment_method", "COD")
    total = float(order_data.get("total") or order_data.get("total_amount", 0))
    items = order_data.get("items", [])

    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()

        # 1. Chèn vào bảng orders
        cursor.execute("""
            INSERT OR REPLACE INTO orders (
                order_id, customer_name, customer_phone, customer_address, customer_note, payment_method, total_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?);
        """, (order_id, name, phone, address, note, method, total))

        # 2. Xóa các món cũ nếu là ghi đè
        cursor.execute("DELETE FROM order_items WHERE order_id = ?;", (order_id,))

        # 3. Chèn các món vào order_items
        for item in items:
            p_id = str(item.get("id") or item.get("product_id") or "0")
            p_name = item.get("name") or item.get("product_name") or "Món ăn"
            price = float(item.get("price", 0))
            qty = int(item.get("quantity", 1))
            subtotal = price * qty

            cursor.execute("""
                INSERT INTO order_items (
                    order_id, product_id, product_name, price, quantity, subtotal
                ) VALUES (?, ?, ?, ?, ?, ?);
            """, (order_id, p_id, p_name, price, qty, subtotal))

        conn.commit()
        return True


def get_all_orders(db_path: str = DB_FILE) -> List[Dict[str, Any]]:
    """Lấy danh sách tất cả các đơn hàng kèm chi tiết món ăn."""
    init_database(db_path)
    with get_db_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders ORDER BY created_at DESC;")
        orders_rows = cursor.fetchall()
        
        result = []
        for o_row in orders_rows:
            order_dict = dict(o_row)
            cursor.execute("SELECT * FROM order_items WHERE order_id = ?;", (order_dict["order_id"],))
            items_rows = cursor.fetchall()
            order_dict["items"] = [dict(i_row) for i_row in items_rows]
            result.append(order_dict)
            
        return result


SAMPLE_ORDERS = [
    {
        "orderId": "KFC-102941",
        "customer": {
            "name": "Nguyễn Văn Hùng",
            "phone": "0903123456",
            "address": "88 Đồng Khởi, P. Bến Nghé, Quận 1, TP.HCM",
            "note": "Giao giờ hành chính, gọi trước khi đến 5 phút",
        },
        "method": "Ví MoMo (Quét mã QR)",
        "total": 130000,
        "items": [
            {"id": "P002", "name": "Gà Rán Cay (Best Seller)", "price": 45000, "quantity": 2},
            {"id": "P003", "name": "Khoai Tây Chiên", "price": 20000, "quantity": 1},
            {"id": "P007", "name": "Pepsi (Ly)", "price": 10000, "quantity": 2},
        ],
    },
    {
        "orderId": "KFC-204859",
        "customer": {
            "name": "Trần Thị Mai Lan",
            "phone": "0918888999",
            "address": "Toà nhà Landmark 81, P. 22, Bình Thạnh, TP.HCM",
            "note": "Để tại quầy lễ tân tầng 1 giúp mình",
        },
        "method": "Thẻ ATM / Internet Banking (Vietcombank)",
        "total": 209000,
        "items": [
            {"id": "P010", "name": "Combo Xô Gà Gia Đình", "price": 189000, "quantity": 1},
            {"id": "P008", "name": "Coca Cola (Ly)", "price": 10000, "quantity": 2},
        ],
    },
    {
        "orderId": "KFC-385912",
        "customer": {
            "name": "Lê Hoàng Long",
            "phone": "0987654321",
            "address": "215 Nguyễn Văn Trỗi, Phường 10, Phú Nhuận, TP.HCM",
            "note": "Lấy thêm tương cà và tương ớt",
        },
        "method": "Tiền mặt khi nhận hàng (COD)",
        "total": 140000,
        "items": [
            {"id": "P005", "name": "Hamburger Bò", "price": 50000, "quantity": 1},
            {"id": "P006", "name": "Hamburger Tôm", "price": 50000, "quantity": 1},
            {"id": "P003", "name": "Khoai Tây Chiên", "price": 20000, "quantity": 1},
            {"id": "P009", "name": "7Up (Ly)", "price": 10000, "quantity": 2},
        ],
    },
    {
        "orderId": "KFC-492018",
        "customer": {
            "name": "Phạm Minh Quân",
            "phone": "0932456789",
            "address": "12 Đường số 7, KDC Him Lam, Tân Hưng, Quận 7, TP.HCM",
            "note": "Giao nóng giòn, không lấy đá nước ngọt",
        },
        "method": "Ví MoMo (Quét mã QR)",
        "total": 240000,
        "items": [
            {"id": "P001", "name": "Gà Rán Truyền Thống", "price": 40000, "quantity": 3},
            {"id": "P004", "name": "Hamburger Gà", "price": 50000, "quantity": 2},
            {"id": "P007", "name": "Pepsi (Ly)", "price": 10000, "quantity": 2},
        ],
    },
    {
        "orderId": "KFC-573920",
        "customer": {
            "name": "Đỗ Thu Trang",
            "phone": "0976112233",
            "address": "65 Lê Duẩn, P. Bến Nghé, Quận 1, TP.HCM",
            "note": "Giao lên phòng 402 lầu 4",
        },
        "method": "Thẻ ATM / Internet Banking (Techcombank)",
        "total": 203000,
        "items": [
            {"id": "P011", "name": "Combo Burger Tiết Kiệm", "price": 79000, "quantity": 2},
            {"id": "P002", "name": "Gà Rán Cay (Best Seller)", "price": 45000, "quantity": 1},
        ],
    },
]


def seed_sample_orders(db_path: str = DB_FILE) -> None:
    """Nạp 5 đơn hàng mẫu phong phú vào SQLite database."""
    init_database(db_path)
    for order in SAMPLE_ORDERS:
        save_order(order, db_path)


def print_database_summary(db_path: str = DB_FILE) -> None:
    """In tóm tắt cơ sở dữ liệu SQLite ra màn hình Terminal."""
    init_database(db_path)
    orders = get_all_orders(db_path)
    print("=" * 60)
    print(f"📦 CƠ SỞ DỮ LIỆU SQLITE: {db_path}")
    print(f"📊 Tổng số đơn hàng trong bảng 'orders': {len(orders)}")
    print("=" * 60)

    for idx, order in enumerate(orders, 1):
        print(f"\n[{idx}] Đơn hàng: #{order['order_id']} | Ngày: {order['created_at']} | TT: {order['status']}")
        print(f"    Khách hàng: {order['customer_name']} - SĐT: {order['customer_phone']}")
        print(f"    Địa chỉ: {order['customer_address']}")
        if order['customer_note']:
            print(f"    Ghi chú: {order['customer_note']}")
        print(f"    Thanh toán: {order['payment_method']} | Tổng tiền: {order['total_amount']:,.0f} ₫")
        print("    Chi tiết món ăn (bảng 'order_items'):")
        for item in order.get("items", []):
            print(f"      - {item['quantity']}x {item['product_name']} ({item['price']:,.0f} ₫) = {item['subtotal']:,.0f} ₫")
    print("\n" + "=" * 60)


if __name__ == "__main__":
    init_database()
    seed_sample_orders()
    print_database_summary()
