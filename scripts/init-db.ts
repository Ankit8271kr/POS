import { neon } from "@neondatabase/serverless"

// The POSTGRES_URL variable is already available in this workspace.
const sql = neon(process.env.POSTGRES_URL!)

async function main() {
  // 1. Products ------------------------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id           SERIAL PRIMARY KEY,
      name         VARCHAR(255) NOT NULL,
      price        NUMERIC(10,2) NOT NULL,
      category     VARCHAR(100),
      image_url    TEXT,
      is_active    BOOLEAN DEFAULT TRUE,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );
  `

  // 2. Customers -----------------------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255),
      phone      VARCHAR(20),
      email      VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `

  // 3. Orders & Order Items -----------------------------------------------
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id              SERIAL PRIMARY KEY,
      customer_id     INTEGER REFERENCES customers(id),
      customer_name   VARCHAR(255) DEFAULT 'Walk-in Customer',
      total_amount    NUMERIC(10,2) NOT NULL,
      tax_amount      NUMERIC(10,2) DEFAULT 0,
      discount_amount NUMERIC(10,2) DEFAULT 0,
      payment_method  VARCHAR(50)  NOT NULL,
      payment_status  VARCHAR(50)  DEFAULT 'completed',
      order_status    VARCHAR(50)  DEFAULT 'fulfilled',
      created_at      TIMESTAMPTZ  DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id            SERIAL PRIMARY KEY,
      order_id      INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id    INTEGER REFERENCES products(id),
      product_name  VARCHAR(255) NOT NULL,
      quantity      INTEGER      NOT NULL,
      unit_price    NUMERIC(10,2) NOT NULL,
      total_price   NUMERIC(10,2) NOT NULL,
      created_at    TIMESTAMPTZ  DEFAULT NOW()
    );
  `

  // 4. Seed sample café products (runs only if table is empty) -------------
  const [{ count }] = await sql`SELECT COUNT(*)::int FROM products`
  if (count === 0) {
    await sql`
      INSERT INTO products (name, price, category, image_url)
      VALUES
        ('Espresso',      2.50, 'Coffee', '/placeholder.svg?height=150&width=150'),
        ('Cappuccino',    3.50, 'Coffee', '/placeholder.svg?height=150&width=150'),
        ('Latte',         4.00, 'Coffee', '/placeholder.svg?height=150&width=150'),
        ('Americano',     3.00, 'Coffee', '/placeholder.svg?height=150&width=150'),
        ('Muffin',        2.50, 'Pastries', '/placeholder.svg?height=150&width=150'),
        ('Croissant',     3.00, 'Pastries', '/placeholder.svg?height=150&width=150'),
        ('Iced Coffee',   3.50, 'Cold Drinks', '/placeholder.svg?height=150&width=150'),
        ('Smoothie',      4.50, 'Cold Drinks', '/placeholder.svg?height=150&width=150');
    `
    console.log("🌱  Sample café products seeded")
  } else {
    console.log("✅  Tables already exist – skipping seed")
  }

  console.log("🎉  Database initialised")
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
