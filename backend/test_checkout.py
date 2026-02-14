#!/usr/bin/env python3
"""
Test checkout flow end-to-end
"""
import sys
import os
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "cashier@example.com"
TEST_PASSWORD = "password123"


def print_section(title):
    """Print section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


def print_json(data):
    """Pretty print JSON"""
    print(json.dumps(data, indent=2))


def test_checkout_flow():
    """Test complete checkout flow"""
    session = requests.Session()

    # Step 1: Register/Login
    print_section("Step 1: Authentication")

    # Try to register
    register_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "role": "cashier"
    }
    response = session.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code == 201:
        print("✓ User registered successfully")
    elif response.status_code == 400 and "already registered" in response.text:
        print("✓ User already exists, proceeding to login")
    else:
        print(f"✗ Registration failed: {response.status_code}")
        print_json(response.json())
        return False

    # Login
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    response = session.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"✗ Login failed: {response.status_code}")
        print_json(response.json())
        return False

    auth_data = response.json()
    token = auth_data["access_token"]
    user = auth_data["user"]
    print(f"✓ Logged in as: {user['email']} (ID: {user['id']})")

    # Set authorization header
    headers = {"Authorization": f"Bearer {token}"}

    # Step 2: Get current user
    print_section("Step 2: Get Current User")
    response = session.get(f"{BASE_URL}/users/me", headers=headers)
    if response.status_code != 200:
        print(f"✗ Failed to get current user: {response.status_code}")
        return False
    current_user = response.json()
    print(f"✓ Current user: {current_user['email']}")

    # Step 3: Get tax config
    print_section("Step 3: Get Tax Configuration")
    response = session.get(f"{BASE_URL}/config/tax")
    if response.status_code != 200:
        print(f"✗ Failed to get tax config: {response.status_code}")
        return False
    tax_config = response.json()
    print(f"✓ Tax rate: {tax_config['tax_rate_percent']}%")

    # Step 4: List products
    print_section("Step 4: List Products")
    response = session.get(f"{BASE_URL}/products?limit=5")
    if response.status_code != 200:
        print(f"✗ Failed to list products: {response.status_code}")
        return False
    products = response.json()
    print(f"✓ Found {len(products)} products")
    if products:
        print(f"  First product: {products[0]['name']} (${products[0]['price']}, Stock: {products[0]['on_hand']})")

    # Step 5: Search for a product
    print_section("Step 5: Search Products")
    if products:
        search_term = products[0]['sku'][:5]
        response = session.get(f"{BASE_URL}/products/search?q={search_term}&limit=3")
        if response.status_code != 200:
            print(f"✗ Failed to search products: {response.status_code}")
            return False
        search_results = response.json()
        print(f"✓ Search for '{search_term}' returned {len(search_results)} results")

    # Step 6: Get specific product
    print_section("Step 6: Get Product Details")
    if products:
        product_id = products[0]['id']
        response = session.get(f"{BASE_URL}/products/{product_id}")
        if response.status_code != 200:
            print(f"✗ Failed to get product: {response.status_code}")
            return False
        product = response.json()
        print(f"✓ Product: {product['name']}")
        print(f"  SKU: {product['sku']}")
        print(f"  Price: ${product['price']}")
        print(f"  Stock: {product['on_hand']}")

    # Step 7: Validate cart
    print_section("Step 7: Validate Cart")
    if products and len(products) >= 2:
        cart_items = [
            {"product_id": products[0]['id'], "qty": 2},
            {"product_id": products[1]['id'], "qty": 1}
        ]
        cart_data = {"items": cart_items}
        response = session.post(f"{BASE_URL}/cart/validate", json=cart_data, headers=headers)
        if response.status_code != 200:
            print(f"✗ Failed to validate cart: {response.status_code}")
            return False
        validation = response.json()
        print(f"✓ Cart validation: {'Valid' if validation['valid'] else 'Invalid'}")
        print(f"  Subtotal: ${validation['totals']['subtotal']}")
        print(f"  Tax: ${validation['totals']['tax']}")
        print(f"  Total: ${validation['totals']['total']}")
        if validation['errors']:
            print(f"  Errors: {validation['errors']}")

    # Step 8: Create order (checkout)
    print_section("Step 8: Create Order (Checkout)")
    if products and len(products) >= 2:
        # Record initial inventory
        initial_stock_1 = products[0]['on_hand']
        initial_stock_2 = products[1]['on_hand']

        # Prepare order
        item1_qty = 2
        item2_qty = 1
        item1_total = products[0]['price'] * item1_qty
        item2_total = products[1]['price'] * item2_qty
        subtotal = item1_total + item2_total
        tax = round(subtotal * 0.085, 2)
        total = subtotal + tax

        order_data = {
            "customer_id": None,
            "items": [
                {
                    "product_id": products[0]['id'],
                    "qty": item1_qty,
                    "unit_price": products[0]['price'],
                    "discount": 0.0
                },
                {
                    "product_id": products[1]['id'],
                    "qty": item2_qty,
                    "unit_price": products[1]['price'],
                    "discount": 0.0
                }
            ],
            "subtotal": subtotal,
            "discount_total": 0.0,
            "tax_total": tax,
            "total": total,
            "payment_details": {
                "method": "cash",
                "amount_tendered": total + 10,
                "change": 10
            }
        }

        response = session.post(f"{BASE_URL}/orders", json=order_data, headers=headers)
        if response.status_code != 201:
            print(f"✗ Failed to create order: {response.status_code}")
            print_json(response.json())
            return False

        order = response.json()
        print(f"✓ Order created: {order['order_number']}")
        print(f"  Total: ${order['total']}")
        print(f"  Items: {len(order['items'])}")

        # Step 9: Verify inventory decremented
        print_section("Step 9: Verify Inventory Decremented")
        response = session.get(f"{BASE_URL}/products/{products[0]['id']}")
        product1_after = response.json()
        response = session.get(f"{BASE_URL}/products/{products[1]['id']}")
        product2_after = response.json()

        expected_stock_1 = initial_stock_1 - item1_qty
        expected_stock_2 = initial_stock_2 - item2_qty

        if product1_after['on_hand'] == expected_stock_1:
            print(f"✓ Product 1 inventory: {initial_stock_1} → {product1_after['on_hand']} (correct)")
        else:
            print(f"✗ Product 1 inventory: Expected {expected_stock_1}, got {product1_after['on_hand']}")

        if product2_after['on_hand'] == expected_stock_2:
            print(f"✓ Product 2 inventory: {initial_stock_2} → {product2_after['on_hand']} (correct)")
        else:
            print(f"✗ Product 2 inventory: Expected {expected_stock_2}, got {product2_after['on_hand']}")

        # Step 10: Generate receipt
        print_section("Step 10: Generate Receipt")
        response = session.post(f"{BASE_URL}/orders/{order['id']}/receipt", headers=headers)
        if response.status_code != 200:
            print(f"✗ Failed to generate receipt: {response.status_code}")
            return False

        receipt = response.json()
        print(f"✓ Receipt generated for order: {receipt['order_number']}")
        print(f"  Date: {receipt['date']}")
        print(f"  Cashier: {receipt['cashier']}")
        print(f"  Items:")
        for item in receipt['items']:
            print(f"    - {item['name']} x{item['qty']} @ ${item['unit_price']} = ${item['line_total']}")
        print(f"  Subtotal: ${receipt['subtotal']}")
        print(f"  Tax: ${receipt['tax_total']}")
        print(f"  Total: ${receipt['total']}")
        print(f"  Payment: {receipt['payment_method']}")

    # Step 11: List orders
    print_section("Step 11: List Orders")
    response = session.get(f"{BASE_URL}/orders?limit=5", headers=headers)
    if response.status_code != 200:
        print(f"✗ Failed to list orders: {response.status_code}")
        return False
    orders = response.json()
    print(f"✓ Found {len(orders)} recent orders")

    print_section("All Tests Passed!")
    return True


if __name__ == "__main__":
    try:
        success = test_checkout_flow()
        sys.exit(0 if success else 1)
    except requests.exceptions.ConnectionError:
        print("\n✗ ERROR: Could not connect to the server.")
        print("  Make sure the backend is running at http://localhost:8000")
        print("  Run: cd backend && make dev")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
