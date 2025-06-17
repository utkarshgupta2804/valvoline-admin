"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Truck, Package } from "lucide-react"

interface Purchase {
  id: string
  orderNumber: string
  clientName: string
  clientCompany: string
  products: {
    name: string
    quantity: number
    price: number
  }[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  orderDate: string
  deliveryDate?: string
  trackingNumber?: string
}

const initialPurchases: Purchase[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    clientName: "John Smith",
    clientCompany: "Smith Auto Service",
    products: [
      { name: "Valvoline MaxLife 10W-40", quantity: 12, price: 24.99 },
      { name: "Valvoline SynPower 5W-30", quantity: 6, price: 34.99 },
    ],
    total: 550.61,
    status: "delivered",
    orderDate: "2024-01-15",
    deliveryDate: "2024-01-18",
    trackingNumber: "VLV123456789",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    clientName: "Sarah Johnson",
    clientCompany: "Quick Lube Express",
    products: [{ name: "Valvoline MaxLife 10W-40", quantity: 24, price: 24.99 }],
    total: 647.74,
    status: "shipped",
    orderDate: "2024-01-20",
    trackingNumber: "VLV987654321",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    clientName: "Mike Wilson",
    clientCompany: "Wilson's Garage",
    products: [
      { name: "Valvoline SynPower 5W-30", quantity: 18, price: 34.99 },
      { name: "Valvoline Transmission Fluid", quantity: 8, price: 19.99 },
    ],
    total: 789.74,
    status: "processing",
    orderDate: "2024-01-22",
  },
]

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.clientCompany.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "processing":
        return "default"
      case "shipped":
        return "default"
      case "delivered":
        return "default"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Package className="w-4 h-4" />
      case "processing":
        return <Package className="w-4 h-4" />
      case "shipped":
        return <Truck className="w-4 h-4" />
      case "delivered":
        return <Truck className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Purchase Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage all product purchases</p>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.filter((p) => p.status === "pending").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.filter((p) => p.status === "processing").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.filter((p) => p.status === "shipped").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.filter((p) => p.status === "delivered").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">All Purchase Orders</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            View and track all product purchases and deliveries
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.orderNumber}</TableCell>
                  <TableCell>{purchase.clientName}</TableCell>
                  <TableCell>{purchase.clientCompany}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {purchase.products.map((product, index) => (
                        <div key={index} className="text-sm">
                          {product.name} (x{product.quantity})
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">${purchase.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(purchase.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(purchase.status)}
                      {purchase.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{purchase.orderDate}</TableCell>
                  <TableCell>
                    {purchase.trackingNumber ? (
                      <span className="font-mono text-sm">{purchase.trackingNumber}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
