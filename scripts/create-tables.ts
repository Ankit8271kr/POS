import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTables() {
  console.log("Creating tables...")

  // Create products table
  const { error: productsError } = await supabase.rpc("execute_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  })

  if (productsError) {
    console.error("Error creating products table:", productsError)
  } else {
    console.log("✅ Products table created/verified")
  }

  // Create customers table
  const { error: customersError } = await supabase.rpc("execute_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  })

  if (customersError) {
    console.error("Error creating customers table:", customersError)
  } else {
    console.log("✅ Customers table created/verified")
  }

  // Create orders table
  const { error: ordersError } = await supabase.rpc("execute_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
        total_amount DECIMAL(10, 2) NOT NULL,
        tax_amount DECIMAL(10, 2) DEFAULT 0,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'completed',
        order_status VARCHAR(50) DEFAULT 'fulfilled',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  })

  if (ordersError) {
    console.error("Error creating orders table:", ordersError)
  } else {
    console.log("✅ Orders table created/verified")
  }

  // Create order_items table
  const { error: orderItemsError } = await supabase.rpc("execute_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        product_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
  })

  if (orderItemsError) {
    console.error("Error creating order_items table:", orderItemsError)
  } else {
    console.log("✅ Order items table created/verified")
  }

  console.log("🎉 Database setup complete!")
}

createTables().catch(console.error)
