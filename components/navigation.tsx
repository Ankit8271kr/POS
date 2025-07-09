import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Receipt } from "lucide-react"

export function Navigation() {
  return (
    <nav className="bg-white border-b p-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Cafe POS
        </Link>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              POS
            </Button>
          </Link>
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              <Receipt className="h-4 w-4 mr-2" />
              Orders
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
