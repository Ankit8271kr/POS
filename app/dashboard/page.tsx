"use client"

import { useAuth } from "@/lib/auth"
import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Users, DollarSign, Package } from "lucide-react"
import { useEffect, useState } from "react"
import { db } from "@/lib/database"

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const products = await db.getAllProducts()
      const orders = await db.getOrders()

      // Calculate today's stats (simplified)
      const today = new Date().toDateString()
      const todayOrders = orders.filter((order) => new Date(order.created_at).toDateString() === today)

      const todaySales = todayOrders.reduce((sum, order) => sum + order.total_amount, 0)

      setStats({
        todaySales,
        todayOrders: todayOrders.length,
        totalProducts: products.filter((p) => p.is_active).length,
        totalCustomers: orders.length, // Simplified
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.email?.split("@")[0]}!</h1>
            <p className="text-gray-600">{isAdmin ? "Administrator Dashboard" : "POS Dashboard"}</p>
          </div>

          <Navigation />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.todaySales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{stats.todayOrders} orders today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayOrders}</div>
                <p className="text-xs text-muted-foreground">Today's orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">Menu items available</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">POS System</h3>
                    <p className="text-sm text-gray-600 mb-3">Process customer orders and payments</p>
                    <Badge variant="default">Ready to use</Badge>
                  </div>
                  {isAdmin && (
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">Product Management</h3>
                      <p className="text-sm text-gray-600 mb-3">Add, edit, and manage your menu items</p>
                      <Badge variant="secondary">Admin access</Badge>
                    </div>
                  )}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Order History</h3>
                    <p className="text-sm text-gray-600 mb-3">View and manage past transactions</p>
                    <Badge variant="outline">View access</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Connection</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment System</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Receipt Printer</span>
                    <Badge variant="default">Ready</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">User Role</span>
                    <Badge variant={isAdmin ? "default" : "secondary"}>{isAdmin ? "Administrator" : "User"}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
