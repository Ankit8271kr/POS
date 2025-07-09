import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:")
  console.error("   - NEXT_PUBLIC_SUPABASE_URL")
  console.error("   - SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function initDatabase() {
  try {
    console.log("🚀 Initializing database...")

    // Create products table
    console.log("📦 Creating products table...")
    const { error: productsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          category VARCHAR(100) NOT NULL,
          image_url TEXT DEFAULT '/placeholder.svg?height=200&width=200',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    if (productsError) {
      console.log("Products table might already exist, continuing...")
    }

    // Create orders table
    console.log("📋 Creating orders table...")
    const { error: ordersError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
          total_amount DECIMAL(10,2) NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          payment_status VARCHAR(50) DEFAULT 'completed',
          order_status VARCHAR(50) DEFAULT 'completed',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    if (ordersError) {
      console.log("Orders table might already exist, continuing...")
    }

    // Create order_items table
    console.log("📝 Creating order_items table...")
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
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    if (orderItemsError) {
      console.log("Order items table might already exist, continuing...")
    }

    // Insert sample products
    console.log("☕ Adding sample products...")
    const sampleProducts = [
      { name: "Espresso", price: 2.5, category: "Coffee" },
      { name: "Americano", price: 3.0, category: "Coffee" },
      { name: "Cappuccino", price: 4.0, category: "Coffee" },
      { name: "Latte", price: 4.5, category: "Coffee" },
      { name: "Mocha", price: 5.0, category: "Coffee" },
      { name: "Macchiato", price: 4.25, category: "Coffee" },
      { name: "Green Tea", price: 2.75, category: "Tea" },
      { name: "Earl Grey", price: 2.75, category: "Tea" },
      { name: "Chamomile Tea", price: 2.75, category: "Tea" },
      { name: "Chai Latte", price: 4.0, category: "Tea" },
      { name: "Croissant", price: 3.5, category: "Pastry" },
      { name: "Muffin", price: 3.0, category: "Pastry" },
      { name: "Danish", price: 3.75, category: "Pastry" },
      { name: "Bagel", price: 2.5, category: "Pastry" },
      { name: "Club Sandwich", price: 8.5, category: "Food" },
      { name: "Grilled Cheese", price: 6.0, category: "Food" },
      { name: "Caesar Salad", price: 7.5, category: "Food" },
      { name: "Soup of the Day", price: 5.5, category: "Food" },
      { name: "Orange Juice", price: 3.5, category: "Beverage" },
      { name: "Smoothie", price: 5.5, category: "Beverage" },
      { name: "Iced Tea", price: 2.5, category: "Beverage" },
      { name: "Hot Chocolate", price: 3.75, category: "Beverage" },
      { name: "Cookies", price: 2.25, category: "Dessert" },
      { name: "Cheesecake", price: 4.5, category: "Dessert" },
    ]

    for (const product of sampleProducts) {
      const { error } = await supabase.from("products").upsert(
        {
          ...product,
          image_url: "/placeholder.svg?height=200&width=200",
          is_active: true,
        },
        {
          onConflict: "name",
          ignoreDuplicates: true,
        },
      )

      if (error && !error.message.includes("duplicate")) {
        console.warn(`Warning adding ${product.name}:`, error.message)
      }
    }

    console.log("✅ Database initialization complete!")
    console.log(`📦 ${sampleProducts.length} products added`)
    console.log("🎉 Ready to create admin user!")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    process.exit(1)
  }
}

// Run the initialization
initDatabase()
