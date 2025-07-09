"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Home, ShoppingCart, Package, BarChart3 } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home, adminOnly: false },
  { name: "POS", href: "/", icon: ShoppingCart, adminOnly: false },
  { name: "Orders", href: "/orders", icon: BarChart3, adminOnly: false },
  { name: "Products", href: "/admin", icon: Package, adminOnly: true },
]

export function Navigation() {
  const pathname = usePathname()
  const { isAdmin } = useAuth()

  const filteredNavigation = navigation.filter((item) => !item.adminOnly || isAdmin)

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="text-white font-bold text-lg">
                VARS BILL
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {filteredNavigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        pathname === item.href
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
