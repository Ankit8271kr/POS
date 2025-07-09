import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedProducts() {
  // Check if products already exist
  const { count, error: countError } = await supabase.from("products").select("*", { count: "exact", head: true })

  if (countError) {
    console.error("Error checking products:", countError)
    return
  }

  if (count === 0) {
    const products = [
      {
        name: "Espresso",
        price: 2.5,
        category: "Coffee",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Cappuccino",
        price: 3.5,
        category: "Coffee",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Latte",
        price: 4.0,
        category: "Coffee",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Americano",
        price: 3.0,
        category: "Coffee",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Mocha",
        price: 4.5,
        category: "Coffee",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Hot Chocolate",
        price: 3.5,
        category: "Beverages",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Green Tea",
        price: 2.0,
        category: "Tea",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Earl Grey",
        price: 2.5,
        category: "Tea",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Croissant",
        price: 3.0,
        category: "Pastries",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Muffin",
        price: 2.5,
        category: "Pastries",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Sandwich",
        price: 6.5,
        category: "Food",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Bagel",
        price: 4.0,
        category: "Food",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Cheesecake",
        price: 5.0,
        category: "Desserts",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Tiramisu",
        price: 5.5,
        category: "Desserts",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Iced Coffee",
        price: 3.5,
        category: "Cold Drinks",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
      {
        name: "Smoothie",
        price: 4.5,
        category: "Cold Drinks",
        image_url: "/placeholder.svg?height=150&width=150",
        is_active: true,
      },
    ]

    const { error } = await supabase.from("products").insert(products)

    if (error) {
      console.error("Error seeding products:", error)
      return
    }

    console.log("✅ Sample cafe products seeded successfully!")
  } else {
    console.log("ℹ️ Products already exist, skipping seed")
  }
}

seedProducts().catch(console.error)
