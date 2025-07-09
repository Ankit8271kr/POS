import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:")
  console.error("   - NEXT_PUBLIC_SUPABASE_URL")
  console.error("   - SUPABASE_SERVICE_ROLE_KEY")
  console.log("\n💡 Get these from your Supabase project dashboard:")
  console.log("   1. Go to https://supabase.com/dashboard")
  console.log("   2. Select your project")
  console.log("   3. Go to Settings > API")
  console.log("   4. Copy the URL and service_role key")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupAdmin() {
  try {
    console.log("🔐 Setting up admin user...")

    const adminEmail = "admin@varsbill.com"
    const adminPassword = "admin123"

    // First, check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers.users.find((user) => user.email === adminEmail)

    if (existingUser) {
      console.log("👤 Admin user already exists, updating...")

      // Update existing user
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: adminPassword,
        user_metadata: {
          role: "admin",
          name: "Administrator",
        },
        app_metadata: {
          role: "admin",
        },
      })

      if (updateError) {
        throw updateError
      }

      console.log("✅ Admin user updated successfully")
    } else {
      // Create new admin user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          role: "admin",
          name: "Administrator",
        },
        app_metadata: {
          role: "admin",
        },
      })

      if (authError) {
        throw authError
      }

      console.log("✅ Admin user created successfully")
      console.log(`👤 User ID: ${authData.user.id}`)
    }

    // Test the login
    console.log("🧪 Testing admin login...")
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    })

    if (loginError) {
      console.warn("⚠️  Login test failed:", loginError.message)
      console.log("This might be normal if email confirmation is required")
    } else {
      console.log("✅ Login test successful")
      await supabase.auth.signOut()
    }

    console.log("\n🎉 Admin setup complete!")
    console.log("\n📋 Login Credentials:")
    console.log(`   📧 Email: ${adminEmail}`)
    console.log(`   🔑 Password: ${adminPassword}`)
    console.log("\n🚀 Next Steps:")
    console.log("   1. Start your app: npm run dev")
    console.log("   2. Visit: http://localhost:3000/login")
    console.log("   3. Login with the credentials above")
  } catch (error) {
    console.error("❌ Admin setup failed:", error)

    if (error.message?.includes("Invalid API key")) {
      console.log("\n💡 Make sure you're using the service_role key, not the anon key")
    }

    process.exit(1)
  }
}

// Run the setup
setupAdmin()
