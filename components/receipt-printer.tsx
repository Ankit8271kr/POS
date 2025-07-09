"use client"

import type { CartItem, Order } from "@/lib/database"

interface ReceiptData {
  order: Order
  orderItems: CartItem[]
  businessName?: string
  businessAddress?: string
  businessPhone?: string
}

export function generateReceiptHTML(data: ReceiptData, format: "2inch" | "3inch") {
  const {
    order,
    orderItems,
    businessName = "Jaya Tiffin",
    businessAddress = "Chhattisgarh",
    businessPhone = "7564004398",
  } = data

  const width = format === "2inch" ? "58mm" : "80mm"
  const fontSize = format === "2inch" ? "10px" : "12px"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt</title>
      <style>
        @page {
          size: ${width} auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: ${fontSize};
          line-height: 1.2;
          margin: 0;
          padding: 5px;
          width: ${width};
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-bottom: 1px dashed #000; margin: 5px 0; }
        .row { display: flex; justify-content: space-between; }
        .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
        .total { font-size: 14px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="center bold">
        <div>${businessName}</div>
        <div>${businessAddress}</div>
        <div>${businessPhone}</div>
      </div>
      
      <div class="line"></div>
      
      <div class="center bold">Print Preview</div>
      
      <div class="line"></div>
      
      <div class="row">
        <span>Bill#</span>
        <span>SI-${order.id}</span>
      </div>
      <div class="row">
        <span>Date</span>
        <span>${new Date(order.created_at).toLocaleString()}</span>
      </div>
      
      <div class="line"></div>
      
      <div class="row bold">
        <span>Item</span>
        <span>Rate Qty Amount</span>
      </div>
      <div class="line"></div>
      
      ${orderItems
        .map(
          (item) => `
        <div class="item-row">
          <span>${item.name}</span>
          <span>${item.price.toFixed(2)} ${item.quantity} ${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      `,
        )
        .join("")}
      
      <div class="line"></div>
      
      <div class="row">
        <span>Sub Total</span>
        <span>₹${order.total_amount.toFixed(2)}</span>
      </div>
      <div class="line"></div>
      
      <div class="row total">
        <span>TOTAL</span>
        <span>₹${order.total_amount.toFixed(2)}</span>
      </div>
      <div class="line"></div>
      
      <div class="center">
        No of Items: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}, 
        Total Quantity: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}
      </div>
      
      <div class="center bold" style="margin-top: 10px;">
        Thank you for your visit!
      </div>
    </body>
    </html>
  `
}

export function printReceipt(data: ReceiptData, format: "2inch" | "3inch" = "2inch") {
  const receiptHTML = generateReceiptHTML(data, format)
  const printWindow = window.open("", "_blank")

  if (printWindow) {
    printWindow.document.write(receiptHTML)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
}

export function downloadReceipt(data: ReceiptData, format: "2inch" | "3inch" = "2inch") {
  const receiptHTML = generateReceiptHTML(data, format)
  const blob = new Blob([receiptHTML], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `receipt-SI-${data.order.id}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
