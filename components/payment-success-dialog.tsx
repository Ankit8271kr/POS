"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Printer, Download } from "lucide-react"
import type { CartItem, Order } from "@/lib/database"

interface PaymentSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  order: Order
  orderItems: CartItem[]
  onPrint: (format: "2inch" | "3inch") => void
  onDownload: () => void
  onNewInvoice: () => void
}

export function PaymentSuccessDialog({
  isOpen,
  onClose,
  order,
  orderItems,
  onPrint,
  onDownload,
  onNewInvoice,
}: PaymentSuccessDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-600">Paid Successfully</h2>
          </div>

          <div className="space-y-4 text-left">
            <div className="flex justify-between">
              <span>Invoice Number</span>
              <span className="font-semibold">SI-{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Fulfillment Type</span>
              <span>Fulfilled at Checkout</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="capitalize">{order.payment_method}</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total amount paid</span>
                <span>₹{order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining amount to be paid</span>
                <span>₹0.00</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => onPrint("2inch")}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={onNewInvoice}>
              New Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
