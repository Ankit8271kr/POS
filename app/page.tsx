"use client"

import { useState, useEffect } from "react"
import { db, type Product, type CartItem, type Order } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  Package,
  BarChart3,
  Home,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { PaymentDialog } from "@/components/payment-dialog"
import { PaymentSuccessDialog } from "@/components/payment-success-dialog"
import { printReceipt, downloadReceipt } from "@/components/receipt-printer"

export default function HomePage() {
  const [currentView, setCurrentView] = useState<"dashboard" | "pos" | "admin" | "orders">("dashboard")
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  // Payment dialog states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)

  // Stats
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
  })

  useEffect(() => {
    fetchProducts()
    fetchStats()
  }, [])

  const fetchProducts = async () => {
    try {
      const data = await db.getProducts()
      setProducts(data as Product[])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const orders = await db.getOrders()
      const allProducts = await db.getAllProducts()

      const todayOrders = orders.filter((order) => order.created_at.startsWith(today))
      const todaySales = todayOrders.reduce((sum, order) => sum + order.total_amount, 0)
      const activeProducts = allProducts.filter((p) => p.is_active)

      setStats({
        todaySales,
        todayOrders: todayOrders.length,
        totalProducts: allProducts.length,
        activeProducts: activeProducts.length,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image_url: product.image_url,
          },
        ]
      }
    })
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handlePaymentClick = (paymentMethod: string) => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive",
      })
      return
    }
    setSelectedPaymentMethod(paymentMethod)
    setPaymentDialogOpen(true)
  }

  const processPayment = async (amountReceived: number, note: string) => {
    setProcessing(true)
    try {
      const total = calculateTotal()

      // Create order
      const order = await db.createOrder({
        customer_name: "Walk-in Customer",
        total_amount: total,
        payment_method: selectedPaymentMethod,
        payment_status: "completed",
        order_status: "fulfilled",
      })

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      await db.createOrderItems(orderItems)

      setCurrentOrder(order as Order)
      setSuccessDialogOpen(true)
      fetchStats() // Refresh stats

      toast({
        title: "Success",
        description: `Payment completed! Total: ₹${total.toFixed(2)}`,
      })
    } catch (error) {
      console.error("Error processing payment:", error)
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handlePrint = (format: "2inch" | "3inch") => {
    if (currentOrder) {
      printReceipt(
        {
          order: currentOrder,
          orderItems: cart,
        },
        format,
      )
    }
  }

  const handleDownload = () => {
    if (currentOrder) {
      downloadReceipt({
        order: currentOrder,
        orderItems: cart,
      })
    }
  }

  const handleNewInvoice = () => {
    clearCart()
    setCurrentOrder(null)
    setSuccessDialogOpen(false)
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Navigation
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "pos", label: "POS System", icon: ShoppingCart },
    { id: "admin", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">VARS BILL POS</h1>
            <div className="text-sm text-gray-600">Complete Point of Sale System</div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as any)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                    currentView === item.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentView === "dashboard" && <DashboardView stats={stats} />}
          {currentView === "pos" && (
            <POSView
              products={filteredProducts}
              cart={cart}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              addToCart={addToCart}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
              calculateTotal={calculateTotal}
              handlePaymentClick={handlePaymentClick}
              processing={processing}
              loading={loading}
            />
          )}
          {currentView === "admin" && <AdminView />}
          {currentView === "orders" && <OrdersView />}
        </div>
      </main>

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        paymentMethod={selectedPaymentMethod}
        totalAmount={calculateTotal()}
        cart={cart}
        onPaymentComplete={processPayment}
      />

      {/* Payment Success Dialog */}
      {currentOrder && (
        <PaymentSuccessDialog
          isOpen={successDialogOpen}
          onClose={() => setSuccessDialogOpen(false)}
          order={currentOrder}
          orderItems={cart}
          onPrint={handlePrint}
          onDownload={handleDownload}
          onNewInvoice={handleNewInvoice}
        />
      )}
    </div>
  )
}

// Dashboard View Component
function DashboardView({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-2 text-gray-600">Welcome to your POS system dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.todaySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{stats.todayOrders} orders today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">Completed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">Available for sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-green-600" />
              Start Selling
            </CardTitle>
            <CardDescription>Open the POS system to process customer orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 mb-4">
              Process sales, manage cart, and handle payments efficiently
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Ready to use
            </Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="mr-2 h-5 w-5 text-blue-600" />
              Manage Products
            </CardTitle>
            <CardDescription>Add, edit, and organize your product inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 mb-4">Update prices, categories, and product information</div>
            <Badge variant="secondary">Admin access</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
              View Reports
            </CardTitle>
            <CardDescription>Check sales history and order analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 mb-4">Track performance and view transaction history</div>
            <Badge variant="outline">Analytics</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// POS View Component
function POSView({
  products,
  cart,
  searchTerm,
  setSearchTerm,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  calculateTotal,
  handlePaymentClick,
  processing,
  loading,
}: any) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Products Section */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Select items to add to cart</CardDescription>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product: Product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="aspect-square mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="rounded-lg"
                      />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{product.name}</h3>
                    <p className="text-lg font-bold text-green-600">₹{product.price.toFixed(2)}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {product.category}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart Section */}
      <div className="w-96">
        <Card className="sticky top-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart
              </CardTitle>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Cart is empty</p>
                <p className="text-sm">Add items to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Image
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-green-600 font-semibold">₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-bold text-green-600">₹{calculateTotal().toFixed(2)}</span>
                </div>

                {/* Payment Buttons */}
                <div className="space-y-2">
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={() => handlePaymentClick("cash")}
                    disabled={processing}
                  >
                    <Banknote className="h-4 w-4 mr-2" />
                    Cash Payment
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handlePaymentClick("card")} disabled={processing}>
                      <CreditCard className="h-4 w-4 mr-1" />
                      Card
                    </Button>
                    <Button variant="outline" onClick={() => handlePaymentClick("upi")} disabled={processing}>
                      <Smartphone className="h-4 w-4 mr-1" />
                      UPI
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Admin View Component (simplified)
function AdminView() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Product Management</h2>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Product management features will be available here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">This section will allow you to add, edit, and manage your product inventory.</p>
        </CardContent>
      </Card>
    </div>
  )
}

// Orders View Component (simplified)
function OrdersView() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Order History</h2>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>View your transaction history and order details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Order history and analytics will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
