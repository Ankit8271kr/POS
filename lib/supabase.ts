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
