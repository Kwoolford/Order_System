#!/usr/bin/env python3
"""
Database initialization script

Creates all tables and optionally seeds initial data
"""
import sys
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import init_db, SessionLocal
from app.models import User, Product, Supplier
from app.auth import get_password_hash
from app.models import UserRole, ProductStatus


def create_sample_data():
    """Create sample data for development/testing"""
    db = SessionLocal()
    try:
        # Check if data already exists
        user_count = db.query(User).count()
        if user_count > 0:
            print("Database already contains data. Skipping sample data creation.")
            return

        print("Creating sample data...")

        # Create admin user
        admin = User(
            email="admin@pos.com",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        db.add(admin)

        # Create cashier user
        cashier = User(
            email="cashier@pos.com",
            hashed_password=get_password_hash("cashier123"),
            role=UserRole.CASHIER
        )
        db.add(cashier)

        # Create manager user
        manager = User(
            email="manager@pos.com",
            hashed_password=get_password_hash("manager123"),
            role=UserRole.MANAGER
        )
        db.add(manager)

        # Create sample products
        products = [
            Product(
                sku="GC001",
                barcode="1234567890001",
                name="Birthday Card - Flowers",
                description="Beautiful floral birthday card",
                category="Birthday",
                price=4.99,
                cost=2.50,
                taxable=True,
                on_hand=25,
                reorder_threshold=10,
                reorder_qty=50,
                location="A1",
                status=ProductStatus.ACTIVE
            ),
            Product(
                sku="GC002",
                barcode="1234567890002",
                name="Thank You Card - Classic",
                description="Classic thank you card with gold trim",
                category="Thank You",
                price=3.99,
                cost=1.75,
                taxable=True,
                on_hand=30,
                reorder_threshold=10,
                reorder_qty=50,
                location="A2",
                status=ProductStatus.ACTIVE
            ),
            Product(
                sku="GC003",
                barcode="1234567890003",
                name="Congratulations Card - Graduate",
                description="Graduation congratulations card",
                category="Congratulations",
                price=5.99,
                cost=3.00,
                taxable=True,
                on_hand=15,
                reorder_threshold=10,
                reorder_qty=30,
                location="B1",
                status=ProductStatus.ACTIVE
            ),
        ]
        for product in products:
            db.add(product)

        # Create sample supplier
        supplier = Supplier(
            name="Greeting Cards Wholesale Inc.",
            email="orders@gcwholesale.com",
            phone="555-0123"
        )
        db.add(supplier)

        db.commit()
        print("Sample data created successfully!")
        print("\nSample users created:")
        print("  Admin:   admin@pos.com / admin123")
        print("  Cashier: cashier@pos.com / cashier123")
        print("  Manager: manager@pos.com / manager123")
        print("\nSample products: 3 greeting cards")
        print("Sample supplier: 1 wholesaler")

    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def main():
    """Main initialization function"""
    print("Initializing database...")

    try:
        # Create tables
        init_db()
        print("Database tables created successfully!")

        # Create sample data
        create_sample_data()

        print("\nDatabase initialization complete!")

    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
