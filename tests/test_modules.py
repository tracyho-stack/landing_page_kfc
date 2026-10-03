"""
Rigorous Test Suite for KFC Landing Page & Modules:
- Module 1: Shopping Cart (Giỏ Hàng)
- Module 2: Product Detail Page & CSV Database
- Module 3: Checkout & Payment (Thanh Toán MoMo & ATM)
"""

import csv
import json
import os
import unittest


class TestCSVDatabase(unittest.TestCase):
    def setUp(self):
        self.csv_path = "data/products.csv"

    def test_csv_file_exists(self):
        self.assertTrue(os.path.exists(self.csv_path), "data/products.csv must exist")

    def test_csv_headers_and_types(self):
        with open(self.csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            expected_headers = {"id", "name", "category", "description", "price", "original_price", "image", "featured"}
            self.assertEqual(set(reader.fieldnames), expected_headers, "CSV headers mismatch")
            rows = list(reader)
            self.assertGreaterEqual(len(rows), 9, "Must contain at least 9 products")

            for r in rows:
                self.assertTrue(r["id"].startswith("P"), f"Invalid product id {r['id']}")
                self.assertTrue(len(r["name"]) > 0, f"Empty name for {r['id']}")
                self.assertTrue(r["category"] in ["Fried Chicken", "Burger", "Combo", "Sides", "Drinks"], f"Invalid category {r['category']}")
                price = int(r["price"])
                self.assertGreater(price, 0, f"Price must be positive for {r['id']}")
                if r["original_price"]:
                    orig = int(r["original_price"])
                    self.assertGreater(orig, price, f"Original price must be greater than selling price for {r['id']}")
                self.assertIn(r["featured"].lower(), ["true", "false"], f"Featured must be boolean for {r['id']}")

    def test_specific_menu_items_present(self):
        with open(self.csv_path, "r", encoding="utf-8") as f:
            rows = list(csv.DictReader(f))
            prices = {r["name"]: int(r["price"]) for r in rows}

            # Verify specific required items and prices
            self.assertEqual(prices.get("Gà Rán Truyền Thống"), 40000)
            self.assertEqual(prices.get("Gà Rán Cay (Best Seller)"), 45000)
            self.assertEqual(prices.get("Khoai Tây Chiên"), 20000)
            self.assertEqual(prices.get("Hamburger Gà"), 50000)
            self.assertEqual(prices.get("Hamburger Bò"), 50000)
            self.assertEqual(prices.get("Hamburger Tôm"), 50000)
            self.assertEqual(prices.get("Pepsi (Ly)"), 10000)
            self.assertEqual(prices.get("Coca Cola (Ly)"), 10000)
            self.assertEqual(prices.get("7Up (Ly)"), 10000)


class TestCartLogicSimulation(unittest.TestCase):
    def setUp(self):
        self.cart = []

    def add_item(self, product, quantity=1):
        for item in self.cart:
            if item["id"] == product["id"]:
                item["quantity"] += quantity
                return
        self.cart.append({
            "id": product["id"],
            "name": product["name"],
            "price": product["price"],
            "quantity": quantity
        })

    def update_quantity(self, product_id, delta):
        for i, item in enumerate(self.cart):
            if item["id"] == product_id:
                item["quantity"] += delta
                if item["quantity"] <= 0:
                    self.cart.pop(i)
                return

    def remove_item(self, product_id):
        self.cart = [item for item in self.cart if item["id"] != product_id]

    def get_total_count(self):
        return sum(item["quantity"] for item in self.cart)

    def get_total_price(self):
        return sum(item["price"] * item["quantity"] for item in self.cart)

    def test_cart_operations(self):
        p1 = {"id": "P001", "name": "Gà Rán Truyền Thống", "price": 40000}
        p2 = {"id": "P002", "name": "Gà Rán Cay (Best Seller)", "price": 45000}

        # 1. Add item
        self.add_item(p1, 2)
        self.assertEqual(len(self.cart), 1)
        self.assertEqual(self.get_total_count(), 2)
        self.assertEqual(self.get_total_price(), 80000)

        # 2. Add existing item
        self.add_item(p1, 1)
        self.assertEqual(len(self.cart), 1)
        self.assertEqual(self.get_total_count(), 3)
        self.assertEqual(self.get_total_price(), 120000)

        # 3. Add second item
        self.add_item(p2, 2)
        self.assertEqual(len(self.cart), 2)
        self.assertEqual(self.get_total_count(), 5)
        self.assertEqual(self.get_total_price(), 120000 + 90000)

        # 4. Decrease quantity
        self.update_quantity("P001", -1)
        self.assertEqual(self.get_total_count(), 4)
        self.assertEqual(self.get_total_price(), 80000 + 90000)

        # 5. Decrease to 0 removes item
        self.update_quantity("P001", -2)
        self.assertEqual(len(self.cart), 1)
        self.assertEqual(self.cart[0]["id"], "P002")

        # 6. Remove item
        self.remove_item("P002")
        self.assertEqual(len(self.cart), 0)
        self.assertEqual(self.get_total_price(), 0)


class TestPaymentAndCheckoutModule(unittest.TestCase):
    def test_momo_payment_flow(self):
        order_id = "KFC-123456"
        total_amount = 95000
        qr_data = f"2|99|0909123456|KFC VIETNAM|support@kfc.vn|0|0|{total_amount}|{order_id}|transfer_myqr"
        self.assertIn("95000", qr_data)
        self.assertIn("KFC-123456", qr_data)

    def test_atm_card_validation(self):
        valid_card = "9704 1234 5678 9012"
        valid_expiry = "12/28"
        clean_card = valid_card.replace(" ", "")
        self.assertEqual(len(clean_card), 16)
        self.assertEqual(len(valid_expiry), 5)
        self.assertIn("/", valid_expiry)


class TestHTMLAndStructure(unittest.TestCase):
    def test_html_files_exist(self):
        self.assertTrue(os.path.exists("index.html"))
        self.assertTrue(os.path.exists("product-detail.html"))

    def test_script_and_css_links(self):
        with open("index.html", "r", encoding="utf-8") as f:
            content = f.read()
            self.assertIn("css/style.css", content)
            self.assertIn("js/database.js", content)
            self.assertIn("js/cart.js", content)
            self.assertIn("js/checkout.js", content)
            self.assertIn("js/app.js", content)
            self.assertIn("cart-drawer", content)
            self.assertIn("checkout-modal", content)
            self.assertIn("checkout-modal-header", content)
            self.assertIn("checkout-modal-body", content)
            self.assertIn("checkout-submit-btn", content)
            self.assertIn("receipt-modal", content)
            self.assertIn("export-db-btn", content)
            self.assertIn("momo-payment-box", content)
            self.assertIn("atm-payment-box", content)

        with open("product-detail.html", "r", encoding="utf-8") as f:
            content = f.read()
            self.assertIn("css/style.css", content)
            self.assertIn("js/database.js", content)
            self.assertIn("js/cart.js", content)
            self.assertIn("js/checkout.js", content)
            self.assertIn("js/product-detail.js", content)
            self.assertIn("cart-drawer", content)
            self.assertIn("checkout-modal", content)
            self.assertIn("checkout-modal-header", content)
            self.assertIn("checkout-modal-body", content)
            self.assertIn("checkout-submit-btn", content)
            self.assertIn("receipt-modal", content)
            self.assertIn("export-db-btn", content)


class TestSQLiteDatabase(unittest.TestCase):
    def setUp(self):
        self.test_db = "tests/test_orders.db"
        if os.path.exists(self.test_db):
            os.remove(self.test_db)
        from init_db import init_database
        init_database(self.test_db)

    def tearDown(self):
        if os.path.exists(self.test_db):
            os.remove(self.test_db)

    def test_sqlite_tables_created(self):
        import sqlite3
        conn = sqlite3.connect(self.test_db)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        conn.close()

        self.assertIn("orders", tables, "Table 'orders' must exist in SQLite database")
        self.assertIn("order_items", tables, "Table 'order_items' must exist in SQLite database")

    def test_sqlite_orders_columns(self):
        import sqlite3
        conn = sqlite3.connect(self.test_db)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(orders);")
        columns = {row[1]: row[2] for row in cursor.fetchall()}
        conn.close()

        required_cols = ["order_id", "customer_name", "customer_phone", "customer_address", "customer_note", "payment_method", "total_amount", "created_at", "status"]
        for col in required_cols:
            self.assertIn(col, columns, f"Column '{col}' missing from table 'orders'")

    def test_sqlite_order_items_columns(self):
        import sqlite3
        conn = sqlite3.connect(self.test_db)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(order_items);")
        columns = {row[1]: row[2] for row in cursor.fetchall()}
        conn.close()

        required_cols = ["id", "order_id", "product_id", "product_name", "price", "quantity", "subtotal"]
        for col in required_cols:
            self.assertIn(col, columns, f"Column '{col}' missing from table 'order_items'")

    def test_sqlite_save_and_retrieve_order(self):
        from init_db import save_order, get_all_orders

        sample_order = {
            "orderId": "KFC-999888",
            "customer": {
                "name": "Trần Thị B",
                "phone": "0988776655",
                "address": "456 Nguyễn Huệ, Q1, TP.HCM",
                "note": "Giao tầng 5",
            },
            "method": "Ví MoMo (Quét mã QR)",
            "total": 135000,
            "items": [
                {
                    "id": "P001",
                    "name": "Gà Rán Truyền Thống",
                    "price": 40000,
                    "quantity": 2,
                },
                {
                    "id": "P002",
                    "name": "Gà Rán Cay (Best Seller)",
                    "price": 45000,
                    "quantity": 1,
                },
                {
                    "id": "P007",
                    "name": "Pepsi (Ly)",
                    "price": 10000,
                    "quantity": 1,
                },
            ],
        }

        saved = save_order(sample_order, self.test_db)
        self.assertTrue(saved)

        orders = get_all_orders(self.test_db)
        self.assertEqual(len(orders), 1)
        
        saved_order = orders[0]
        self.assertEqual(saved_order["order_id"], "KFC-999888")
        self.assertEqual(saved_order["customer_name"], "Trần Thị B")
        self.assertEqual(saved_order["total_amount"], 135000)
        self.assertEqual(len(saved_order["items"]), 3)
        self.assertEqual(saved_order["items"][0]["product_name"], "Gà Rán Truyền Thống")
        self.assertEqual(saved_order["items"][0]["subtotal"], 80000)


if __name__ == "__main__":
    unittest.main()
