import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, FileText, ShoppingCart, TrendingUp, DollarSign } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Valvoline Admin Dashboard</h1>
        <p className="text-gray-600 mt-2 dark:text-gray-400">Manage your engine oil business operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/clients">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <Users className="h-5 w-5" />
                Client Management
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                View and manage your clients
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-orange-200 hover:border-orange-300 dark:border-orange-800 dark:hover:border-orange-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <Package className="h-5 w-5" />
                Product Catalog
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Manage your oil products</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/invoices">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <FileText className="h-5 w-5" />
                Invoices
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">View and generate invoices</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/purchases">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 hover:border-green-300 dark:border-green-800 dark:hover:border-green-700 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <TrendingUp className="h-5 w-5" />
                Purchase Orders
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Track product purchases</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
