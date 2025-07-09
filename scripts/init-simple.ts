import { supabase } from "../lib/database"

async function initializeDatabase() {
  console.log("🚀 Initializing VARS BILL POS Database...")

  try {
    // Create products table
    const { error: productsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          category VARCHAR(100) NOT NULL,
          image_url TEXT DEFAULT '/placeholder.svg?height=200&width=200',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `,
    })

    if (productsError) {
      console.error("Error creating products table:", productsError)
    } else {
      console.log("✅ Products table created")
    }

    // Create orders table
    const { error: ordersError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
          total_amount DECIMAL(10,2) NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          payment_status VARCHAR(50) DEFAULT 'completed',
          order_status VARCHAR(50) DEFAULT 'fulfilled',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `,
    })

    if (ordersError) {
      console.error("Error creating orders table:", ordersError)
    } else {
      console.log("✅ Orders table created")
    }

    // Create order_items table
    const { error: orderItemsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          product_id INTEGER REFERENCES products(id),
          product_name VARCHAR(255) NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10,2) NOT NULL,
          total_price DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `,
    })

    if (orderItemsError) {
      console.error("Error creating order_items table:", orderItemsError)
    } else {
      console.log("✅ Order items table created")
    }

    // Insert sample products
    const sampleProducts = [
      { name: "Espresso", price: 45.0, category: "Coffee" },
      { name: "Cappuccino", price: 65.0, category: "Coffee" },
      { name: "Latte", price: 70.0, category: "Coffee" },
      { name: "Americano", price: 55.0, category: "Coffee" },
      { name: "Mocha", price: 80.0, category: "Coffee" },
      { name: "Green Tea", price: 40.0, category: "Tea" },
      { name: "Black Tea", price: 35.0, category: "Tea" },
      { name: "Chai Latte", price: 60.0, category: "Tea" },
      { name: "Croissant", price: 85.0, category: "Pastries" },
      { name: "Muffin", price: 75.0, category: "Pastries" },
      { name: "Sandwich", price: 120.0, category: "Food" },
      { name: "Bagel", price: 90.0, category: "Food" },
      { name: "Fresh Juice", price: 95.0, category: "Beverages" },
      { name: "Smoothie", price: 110.0, category: "Beverages" },
      { name: "Cheesecake", price: 150.0, category: "Desserts" },
      { name: "Brownie", price: 85.0, category: "Desserts" },
    ]

    const { error: insertError } = await supabase.from("products").insert(sampleProducts)

    if (insertError) {
      console.error("Error inserting sample products:", insertError)
    } else {
      console.log("✅ Sample products inserted")
    }

    console.log("🎉 Database initialization completed successfully!")
    console.log("📊 Created:")
    console.log("   - Products table with 16 sample items")
    console.log("   - Orders table for transaction history")
    console.log("   - Order items table for detailed tracking")
    console.log("")
    console.log("🚀 Your POS system is ready to use!")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
  }
}

// Run the initialization
initializeDatabase()
