"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CartItem } from "@/lib/database"

interface PaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  paymentMethod: string
  totalAmount: number
  cart: CartItem[]
  onPaymentComplete: (amountReceived: number, note: string) => void
}

export function PaymentDialog({
  isOpen,
  onClose,
  paymentMethod,
  totalAmount,
  cart,
  onPaymentComplete,
}: PaymentDialogProps) {
  const [amountReceived, setAmountReceived] = useState(totalAmount)
  const [note, setNote] = useState("")

  const quickAmounts = [
    totalAmount,
    Math.ceil(totalAmount / 10) * 10,
    Math.ceil(totalAmount / 50) * 50,
    Math.ceil(totalAmount / 100) * 100,
  ]

  const remainingAmount = Math.max(0, totalAmount - amountReceived)

  const handlePayment = () => {
    if (amountReceived >= totalAmount) {
      onPaymentComplete(amountReceived, note)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} - Amount to be paid: ₹
            {totalAmount.toFixed(2)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="amount">Amount Received (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amountReceived}
              onChange={(e) => setAmountReceived(Number(e.target.value))}
              className="text-lg font-semibold"
              step="0.01"
            />
            <div className="grid grid-cols-4 gap-2 mt-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmountReceived(amount)}
                  className="text-sm"
                >
                  ₹{amount.toFixed(2)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Add note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg">
              Still remaining: <span className="font-semibold">₹{remainingAmount.toFixed(2)}</span>
            </div>
            <Button
              onClick={handlePayment}
              disabled={amountReceived < totalAmount}
              className="bg-blue-500 hover:bg-blue-600 px-8"
            >
              Record Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
