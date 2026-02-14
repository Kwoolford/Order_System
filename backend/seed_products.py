#!/usr/bin/env python3
"""
Seed database with greeting card products
"""
import sys
import os
import random

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, init_db
from app.models import Product, ProductStatus

# Product data
CATEGORIES = [
    "Birthday",
    "Anniversary",
    "Holiday",
    "Sympathy",
    "Blank",
    "Humor",
    "Kids",
    "Thank You"
]

BRANDS = [
    "Hallmark",
    "Blue Mountain Arts",
    "Studio Ink"
]

PRODUCT_TEMPLATES = {
    "Birthday": [
        "Happy Birthday Card",
        "Birthday Wishes Card",
        "Another Year Wiser Card",
        "Celebrate Your Day Card",
        "Special Birthday Card",
        "Milestone Birthday Card"
    ],
    "Anniversary": [
        "Happy Anniversary Card",
        "Years Together Card",
        "Forever Love Card",
        "Celebrate Love Card"
    ],
    "Holiday": [
        "Happy Holidays Card",
        "Season's Greetings Card",
        "Warm Wishes Card",
        "Holiday Cheer Card",
        "Festive Greetings Card"
    ],
    "Sympathy": [
        "With Sympathy Card",
        "Thinking of You Card",
        "In Loving Memory Card",
        "Deepest Condolences Card"
    ],
    "Blank": [
        "Blank Note Card",
        "All Occasion Card",
        "Blank Greeting Card",
        "Elegant Note Card"
    ],
    "Humor": [
        "Funny Birthday Card",
        "Hilarious Greeting Card",
        "Comic Relief Card",
        "Laugh Out Loud Card"
    ],
    "Kids": [
        "Kids Birthday Card",
        "Children's Greeting Card",
        "Fun Kids Card",
        "Youth Birthday Card"
    ],
    "Thank You": [
        "Thank You Card",
        "Grateful Thanks Card",
        "Appreciation Card",
        "Many Thanks Card"
    ]
}


def generate_sku(brand_idx, category_idx, product_idx):
    """Generate SKU"""
    brand_code = ["HM", "BM", "SI"][brand_idx]
    category_code = category_idx + 1
    return f"{brand_code}-{category_code:02d}-{product_idx:04d}"


def generate_barcode(product_count):
    """Generate unique barcode"""
    # Simple barcode generation (13 digits)
    return f"{7000000000000 + product_count:013d}"


def seed_products():
    """Seed database with products"""
    print("Initializing database...")
    init_db()

    db = SessionLocal()
    try:
        # Check if products already exist
        existing_count = db.query(Product).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} products. Skipping seed.")
            return

        print("Seeding products...")
        product_count = 0

        for category_idx, category in enumerate(CATEGORIES):
            templates = PRODUCT_TEMPLATES[category]

            for template_idx, template in enumerate(templates):
                for brand_idx, brand in enumerate(BRANDS):
                    product_count += 1
                    sku = generate_sku(brand_idx, category_idx, product_count)
                    barcode = generate_barcode(product_count)

                    # Randomize price within brand tiers
                    if brand == "Hallmark":
                        price = round(random.uniform(6.99, 9.99), 2)
                        cost = round(price * 0.4, 2)
                    elif brand == "Blue Mountain Arts":
                        price = round(random.uniform(5.99, 8.99), 2)
                        cost = round(price * 0.42, 2)
                    else:  # Studio Ink
                        price = round(random.uniform(4.99, 7.99), 2)
                        cost = round(price * 0.45, 2)

                    # Randomize stock quantities
                    on_hand = random.randint(5, 100)

                    # Some items below reorder threshold
                    if random.random() < 0.2:  # 20% chance
                        on_hand = random.randint(1, 9)

                    # Create product
                    product = Product(
                        sku=sku,
                        barcode=barcode,
                        name=f"{brand} {template}",
                        description=f"Premium {category.lower()} card from {brand}",
                        category=category,
                        price=price,
                        cost=cost,
                        taxable=True,
                        reorder_threshold=10,
                        reorder_qty=50,
                        location=f"Aisle {category_idx + 1}",
                        status=ProductStatus.ACTIVE,
                        on_hand=on_hand
                    )
                    db.add(product)

                    if product_count >= 50:
                        break

                if product_count >= 50:
                    break

            if product_count >= 50:
                break

        db.commit()
        print(f"Successfully seeded {product_count} products!")

        # Print summary
        print("\nProduct summary by category:")
        for category in CATEGORIES:
            count = db.query(Product).filter(Product.category == category).count()
            if count > 0:
                print(f"  {category}: {count} products")

        # Print low stock items
        low_stock = db.query(Product).filter(Product.on_hand < Product.reorder_threshold).all()
        if low_stock:
            print(f"\nLow stock items ({len(low_stock)}):")
            for product in low_stock[:5]:
                print(f"  {product.sku}: {product.name} (Stock: {product.on_hand})")
            if len(low_stock) > 5:
                print(f"  ... and {len(low_stock) - 5} more")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_products()
