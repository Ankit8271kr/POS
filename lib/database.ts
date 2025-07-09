import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: number
  name: string
  price: number
  category: string
  image_url: string
  is_active: boolean
  created_at: string
}

export type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
  image_url: string
}

export type Order = {
  id: number
  customer_name: string
  total_amount: number
  tax_amount: number
  discount_amount: number
  payment_method: string
  payment_status: string
  order_status: string
  created_at: string
}

export type OrderItem = {
  id: number
  order_id: number
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export const db = {
  async getProducts() {
    const { data, error } = await supabase.from("products").select("*").eq("is_active", true).order("name")

    if (error) throw error
    return data
  },

  async createOrder(orderData: {
    customer_name: string
    total_amount: number
    payment_method: string
    payment_status: string
    order_status: string
  }) {
    const { data, error } = await supabase.from("orders").insert(orderData).select().single()

    if (error) throw error
    return data
  },

  async createOrderItems(
    items: Array<{
      order_id: number
      product_id: number
      product_name: string
      quantity: number
      unit_price: number
      total_price: number
    }>,
  ) {
    const { data, error } = await supabase.from("order_items").insert(items).select()

    if (error) throw error
    return data
  },

  async getOrders() {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async getOrderById(id: number) {
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).single()

    if (error) throw error
    return data
  },

  async getOrderItems(orderId: number) {
    const { data, error } = await supabase.from("order_items").select("*").eq("order_id", orderId)

    if (error) throw error
    return data
  },
}
