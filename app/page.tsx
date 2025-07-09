"use client"

import { useState, useEffect } from "react"
import { db, type Product, type CartItem, type Order } from "@/lib/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone, Receipt } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { PaymentDialog } from "@/components/payment-dialog"
import { PaymentSuccessDialog } from "@/components/payment-success-dialog"
import { printReceipt, downloadReceipt } from "@/components/receipt-printer"

export default function POSSystem() {
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

  useEffect(() => {
    fetchProducts()
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading products...</div>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Cafe POS</h1>
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Type here or scan an item to add [F10]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredProducts.map((product) => (
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
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="w-96 bg-white border-l flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart
              </h2>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Yet to add items to the cart!</p>
                <p className="text-sm">Search or scan items to add them to your cart</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
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
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t">
              <Separator className="mb-4" />
              <div className="flex justify-between items-center mb-4">
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
                  Cash [F1]
                </Button>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" onClick={() => handlePaymentClick("card")} disabled={processing}>
                    <CreditCard className="h-4 w-4 mr-1" />
                    Card [F2]
                  </Button>
                  <Button variant="outline" onClick={() => handlePaymentClick("upi")} disabled={processing}>
                    <Smartphone className="h-4 w-4 mr-1" />
                    UPI [F3]
                  </Button>
                  <Button variant="outline" onClick={() => handlePaymentClick("credit")} disabled={processing}>
                    <Receipt className="h-4 w-4 mr-1" />
                    Credit [F4]
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
    </>
  )
}
