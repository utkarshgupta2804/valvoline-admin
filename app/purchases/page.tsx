"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// Using HTML table elements instead of shadcn/ui table components
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Truck, Package, RefreshCw, Loader2 } from "lucide-react"

interface Purchase {
  id: string
  orderNumber: string
  invoiceNumber: string
  clientName: string
  products: {
    name: string
    quantity: number
    price: number
  }[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  orderDate: string
  deliveryDate?: string
}

interface ApiResponse {
  success: boolean
  data: Purchase[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  error?: string
  details?: string
}

export default function PurchasesPage() {
  const router = useRouter()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle view button click - Navigate to purchases/[invoiceNumber]/page.tsx
  const handleViewPurchase = (invoiceNumber: string) => {
    router.push(`/purchases/${invoiceNumber}`)
  }

  // Fetch purchases from API
  const fetchPurchases = async (search: string = "") => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      params.append('limit', '100') // Adjust as needed
      
      const response = await fetch(`/api/purchases?${params.toString()}`)
      const result: ApiResponse = await response.json()
      
      if (result.success) {
        setPurchases(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to fetch purchases')
        console.error('API Error:', result.details)
      }
    } catch (err) {
      setError('Network error: Failed to fetch purchases')
      console.error('Fetch error:', err)
    }
  }

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await fetchPurchases()
      setLoading(false)
    }
    loadData()
  }, [])

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== "") {
        fetchPurchases(searchTerm)
      } else {
        fetchPurchases()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPurchases(searchTerm)
    setRefreshing(false)
  }

  // Filter purchases based on search term (client-side filtering as backup)
  const filteredPurchases = purchases.filter(
    (purchase) =>
      purchase.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.clientName.toLowerCase().includes(searchTerm.toLowerCase())  ||
      purchase.orderDate.toLowerCase().includes(searchTerm.toLowerCase()) 
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading purchases...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Purchase Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage all product purchases</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

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
              placeholder="Search orders or client names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Order #</th>
                  <th className="text-left p-4 font-medium">Client</th>
                  <th className="text-left p-4 font-medium">Products</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Order Date</th>
                  <th className="text-left p-4 font-medium">Delivery Date</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No purchases found matching your search.' : 'No purchases found.'}
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <td className="p-4 font-medium">{purchase.orderNumber}</td>
                      <td className="p-4">{purchase.clientName}</td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {purchase.products.map((product, index) => (
                            <div key={index} className="text-sm">
                              {product.name} (x{product.quantity})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-medium">${purchase.total.toFixed(2)}</td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(purchase.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(purchase.status)}
                          {purchase.status}
                        </Badge>
                      </td>
                      <td className="p-4">{purchase.orderDate}</td>
                      <td className="p-4">
                        {purchase.deliveryDate ? (
                          <span>{purchase.deliveryDate}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewPurchase(purchase.invoiceNumber)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}