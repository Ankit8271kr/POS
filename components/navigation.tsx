"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Package, Receipt, Shield, BarChart3 } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()
  const { isAdmin } = useAuth()

  const navItems = [
    {
      href: "/",
      label: "POS System",
      icon: Home,
      description: "Process sales and manage cart",
      public: true,
    },
    {
      href: "/orders",
      label: "Orders",
      icon: Receipt,
      description: "View transaction history",
      public: true,
    },
    {
      href: "/admin",
      label: "Product Management",
      icon: Package,
      description: "Add, edit, and manage menu items",
      adminOnly: true,
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: BarChart3,
      description: "Sales reports and insights",
      adminOnly: true,
    },
  ]

  const filteredNavItems = navItems.filter((item) => item.public || (item.adminOnly && isAdmin))

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "outline"}
                  className="w-full h-auto p-4 flex flex-col items-center gap-2 relative"
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold flex items-center gap-2">
                      {item.label}
                      {item.adminOnly && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
