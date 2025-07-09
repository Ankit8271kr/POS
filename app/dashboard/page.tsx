"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/database"
import { useAuth } from "@/lib/auth"
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const today = new Date().toISOString().split("T")[0]

        // Get today's sales
        const orders = await db.getOrders()
        const todayOrders = orders.filter((order) => order.created_at.startsWith(today))

        const todaySales = todayOrders.reduce((sum, order) => sum + order.total_amount, 0)

        // Get product stats
        const allProducts = await db.getAllProducts()
        const activeProducts = allProducts.filter((p) => p.is_active)

        setStats({
          todaySales,
          todayOrders: todayOrders.length,
          totalProducts: allProducts.length,
          activeProducts: activeProducts.length,
        })
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Navigation />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.user_metadata?.name || user?.email}!
              </h1>
              <p className="mt-2 text-gray-600">Here's what's happening with your POS system today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${loading ? "..." : stats.todaySales.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.todayOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.activeProducts}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.totalProducts}</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Point of Sale</CardTitle>
                  <CardDescription>Process customer orders and payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/">
                    <Button className="w-full">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Open POS
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>View Orders</CardTitle>
                  <CardDescription>Check recent transactions and order history</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/orders">
                    <Button variant="outline" className="w-full bg-transparent">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Orders
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {isAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Products</CardTitle>
                    <CardDescription>Add, edit, or remove products from inventory</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/admin">
                      <Button variant="outline" className="w-full bg-transparent">
                        <Package className="mr-2 h-4 w-4" />
                        Manage Products
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
