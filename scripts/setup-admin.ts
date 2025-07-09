import { createClient } from "@supabase/supabase-js"

// Use environment variables or provide them directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "your-supabase-url"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key"

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupAdmin() {
  try {
    console.log("Setting up admin user...")

    // Create admin user with service role key
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "admin@varsbill.com",
      password: "admin123",
      email_confirm: true,
      user_metadata: {
        role: "admin",
        name: "Administrator",
      },
    })

    if (authError) {
      console.error("Error creating admin user:", authError)

      // If user already exists, try to update
      if (authError.message.includes("already registered")) {
        console.log("Admin user already exists, updating metadata...")

        const { data: users, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) {
          console.error("Error listing users:", listError)
          return
        }

        const adminUser = users.users.find((user) => user.email === "admin@varsbill.com")
        if (adminUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
            user_metadata: {
              role: "admin",
              name: "Administrator",
            },
          })

          if (updateError) {
            console.error("Error updating admin user:", updateError)
          } else {
            console.log("Admin user metadata updated successfully!")
          }
        }
      }
      return
    }

    console.log("✅ Admin user created successfully!")
    console.log("📧 Email: admin@varsbill.com")
    console.log("🔑 Password: admin123")
    console.log("👤 User ID:", authData.user.id)

    // Optionally create a profile record
    const { error: profileError } = await supabase.from("user_profiles").insert([
      {
        id: authData.user.id,
        email: "admin@varsbill.com",
        role: "admin",
        name: "Administrator",
        created_at: new Date().toISOString(),
      },
    ])

    if (profileError && !profileError.message.includes("already exists")) {
      console.warn("Could not create profile (table might not exist):", profileError.message)
    }

    console.log("\n🎉 Setup complete! You can now login with:")
    console.log("   Email: admin@varsbill.com")
    console.log("   Password: admin123")
  } catch (error) {
    console.error("Unexpected error:", error)
  }
}

// Alternative setup for development without service key
async function setupAdminDev() {
  console.log("🔧 Development setup - Manual admin creation")
  console.log("Since we don't have service role key, please:")
  console.log("1. Go to your Supabase dashboard")
  console.log("2. Navigate to Authentication > Users")
  console.log('3. Click "Add user"')
  console.log("4. Create user with:")
  console.log("   - Email: admin@varsbill.com")
  console.log("   - Password: admin123")
  console.log("   - Confirm email: Yes")
  console.log('5. In user metadata, add: {"role": "admin"}')
}

// Check if we have the required environment variables
if (!supabaseUrl || supabaseUrl === "your-supabase-url") {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL environment variable is required")
  process.exit(1)
}

if (!supabaseServiceKey || supabaseServiceKey === "your-service-role-key") {
  console.log("⚠️  SUPABASE_SERVICE_ROLE_KEY not found, using development setup")
  setupAdminDev()
} else {
  setupAdmin()
}
