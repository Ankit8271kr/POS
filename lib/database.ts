import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface Product {
  id: number
  name: string
  price: number
  category: string
  image_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url: string
}

export interface Order {
  id: number
  customer_name: string
  total_amount: number
  payment_method: string
  payment_status: string
  order_status: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

class Database {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from("products").select("*").eq("is_active", true).order("name")

    if (error) throw error
    return data || []
  }

  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from("products").select("*").order("name")

    if (error) throw error
    return data || []
  }

  async createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
    const { data, error } = await supabase.from("products").insert([product]).select().single()

    if (error) throw error
    return data
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) throw error
  }

  async createOrder(order: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order> {
    const { data, error } = await supabase.from("orders").insert([order]).select().single()

    if (error) throw error
    return data
  }

  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async createOrderItems(orderItems: Omit<OrderItem, "id" | "created_at">[]): Promise<OrderItem[]> {
    const { data, error } = await supabase.from("order_items").insert(orderItems).select()

    if (error) throw error
    return data || []
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const { data, error } = await supabase.from("order_items").select("*").eq("order_id", orderId)

    if (error) throw error
    return data || []
  }
}

export const db = new Database()
