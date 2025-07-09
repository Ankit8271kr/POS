import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:")
  console.error("   - NEXT_PUBLIC_SUPABASE_URL")
  console.error("   - SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function initDatabase() {
  try {
    console.log("🚀 Initializing database...")

    // Read and execute SQL setup script
    const sqlPath = path.join(__dirname, "setup-database.sql")
    const sqlContent = fs.readFileSync(sqlPath, "utf8")

    // Split SQL commands and execute them
    const commands = sqlContent
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0 && !cmd.startsWith("--"))

    for (const command of commands) {
      if (command.trim()) {
        const { error } = await supabase.rpc("exec_sql", { sql: command })
        if (error && !error.message.includes("already exists")) {
          console.warn("SQL Warning:", error.message)
        }
      }
    }

    console.log("✅ Database tables created successfully!")

    // Verify tables exist
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    if (tablesError) {
      console.warn("Could not verify tables:", tablesError.message)
    } else {
      console.log("📋 Created tables:", tables?.map((t) => t.table_name).join(", "))
    }

    // Check if products exist
    const { data: products, error: productsError } = await supabase.from("products").select("count(*)").single()

    if (!productsError && products) {
      console.log(`📦 Products in database: ${products.count || 0}`)
    }

    console.log("\n🎉 Database initialization complete!")
    console.log("Next steps:")
    console.log("1. Run: npm run setup-admin (or node scripts/setup-admin.ts)")
    console.log("2. Start your application: npm run dev")
    console.log("3. Login with admin@varsbill.com / admin123")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    process.exit(1)
  }
}

initDatabase()
