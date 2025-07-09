import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  // Product methods
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

  // Order methods
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async createOrder(order: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order> {
    const { data, error } = await supabase.from("orders").insert([order]).select().single()

    if (error) throw error
    return data
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const { data, error } = await supabase.from("order_items").select("*").eq("order_id", orderId)

    if (error) throw error
    return data || []
  }

  async createOrderItems(orderItems: Omit<OrderItem, "id" | "created_at">[]): Promise<OrderItem[]> {
    const { data, error } = await supabase.from("order_items").insert(orderItems).select()

    if (error) throw error
    return data || []
  }

  // Analytics methods
  async getDailySales(date: string): Promise<number> {
    const { data, error } = await supabase
      .from("orders")
      .select("total_amount")
      .gte("created_at", `${date}T00:00:00`)
      .lt("created_at", `${date}T23:59:59`)
      .eq("payment_status", "completed")

    if (error) throw error

    return data?.reduce((sum, order) => sum + order.total_amount, 0) || 0
  }

  async getOrderCount(date: string): Promise<number> {
    const { data, error } = await supabase
      .from("orders")
      .select("id", { count: "exact" })
      .gte("created_at", `${date}T00:00:00`)
      .lt("created_at", `${date}T23:59:59`)

    if (error) throw error
    return data?.length || 0
  }
}

export const db = new Database()
