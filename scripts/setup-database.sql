-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    customer_name VARCHAR(255) DEFAULT 'Walk-in Customer',
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    order_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table (optional)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for products (readable by all authenticated users, writable by admins)
CREATE POLICY "Products are viewable by authenticated users" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Products are editable by admins" ON products
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Create policies for orders (readable by all authenticated users, writable by all)
CREATE POLICY "Orders are viewable by authenticated users" ON orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Orders are creatable by authenticated users" ON orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for order_items
CREATE POLICY "Order items are viewable by authenticated users" ON order_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Order items are creatable by authenticated users" ON order_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Insert sample products
INSERT INTO products (name, price, category, image_url, is_active) VALUES
('Espresso', 45.00, 'Coffee', '/placeholder.svg?height=100&width=100', true),
('Cappuccino', 65.00, 'Coffee', '/placeholder.svg?height=100&width=100', true),
('Latte', 70.00, 'Coffee', '/placeholder.svg?height=100&width=100', true),
('Americano', 55.00, 'Coffee', '/placeholder.svg?height=100&width=100', true),
('Mocha', 80.00, 'Coffee', '/placeholder.svg?height=100&width=100', true),
('Green Tea', 35.00, 'Tea', '/placeholder.svg?height=100&width=100', true),
('Black Tea', 30.00, 'Tea', '/placeholder.svg?height=100&width=100', true),
('Chai Latte', 60.00, 'Tea', '/placeholder.svg?height=100&width=100', true),
('Croissant', 85.00, 'Pastries', '/placeholder.svg?height=100&width=100', true),
('Muffin', 75.00, 'Pastries', '/placeholder.svg?height=100&width=100', true),
('Danish', 90.00, 'Pastries', '/placeholder.svg?height=100&width=100', true),
('Club Sandwich', 150.00, 'Sandwiches', '/placeholder.svg?height=100&width=100', true),
('Grilled Cheese', 120.00, 'Sandwiches', '/placeholder.svg?height=100&width=100', true),
('BLT', 140.00, 'Sandwiches', '/placeholder.svg?height=100&width=100', true),
('Fresh Orange Juice', 50.00, 'Beverages', '/placeholder.svg?height=100&width=100', true),
('Iced Tea', 40.00, 'Beverages', '/placeholder.svg?height=100&width=100', true),
('Smoothie', 95.00, 'Beverages', '/placeholder.svg?height=100&width=100', true),
('Cookies', 45.00, 'Snacks', '/placeholder.svg?height=100&width=100', true),
('Chips', 35.00, 'Snacks', '/placeholder.svg?height=100&width=100', true),
('Nuts', 65.00, 'Snacks', '/placeholder.svg?height=100&width=100', true),
('Cheesecake', 120.00, 'Desserts', '/placeholder.svg?height=100&width=100', true),
('Chocolate Cake', 110.00, 'Desserts', '/placeholder.svg?height=100&width=100', true),
('Ice Cream', 80.00, 'Desserts', '/placeholder.svg?height=100&width=100', true),
('Tiramisu', 130.00, 'Desserts', '/placeholder.svg?height=100&width=100', true)
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
