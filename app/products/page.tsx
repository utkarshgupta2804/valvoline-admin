"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import { RoleGuard } from "@/components/role-guard"
import { PRODUCT_CATEGORIES, VISCOSITY_OPTIONS } from "@/lib/models/product"

interface Product {
  _id: string
  name: string
  category: string
  viscosity?: string
  price: number
  stock: number
  description?: string
  image?: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

interface ProductInput {
  name: string
  category: string
  viscosity?: string
  price: string
  stock: string
  description?: string
  image?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newProduct, setNewProduct] = useState<ProductInput>({
    name: "",
    category: "",
    viscosity: "",
    price: "",
    stock: "",
    description: "",
    image: "",
  })

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/products")
      const result = await response.json()

      if (result.success) {
        setProducts(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.viscosity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newProduct,
          price: Number.parseFloat(newProduct.price),
          stock: Number.parseInt(newProduct.stock) || 0,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setProducts([result.data, ...products])
        setNewProduct({
          name: "",
          category: "",
          viscosity: "",
          price: "",
          stock: "",
          description: "",
          image: "",
        })
        setIsAddDialogOpen(false)

        toast({
          title: "Product Added Successfully",
          description: `${result.data.name} has been added to the catalog`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add product",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setProducts(products.filter((product) => product._id !== productId))
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete product",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Catalog</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your Valvoline product inventory</p>
        </div>
        <RoleGuard requiredRole="manager">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>Add a new product to your Valvoline catalog</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g., Valvoline MaxLife 10W-40"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="viscosity">Viscosity</Label>
                  <Select
                    value={newProduct.viscosity}
                    onValueChange={(value) => setNewProduct({ ...newProduct, viscosity: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select viscosity" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISCOSITY_OPTIONS.map((viscosity) => (
                        <SelectItem key={viscosity} value={viscosity}>
                          {viscosity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="24.99"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="100"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="image">Product Image</Label>
                  <div className="mt-2 space-y-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                      disabled={isSubmitting}
                    />
                    {newProduct.image && (
                      <div className="flex items-center space-x-4">
                        <img
                          src={newProduct.image || "/placeholder.svg"}
                          alt="Product preview"
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setNewProduct({ ...newProduct, image: "" })}
                          disabled={isSubmitting}
                        >
                          Remove Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Product description..."
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-span-2 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddProduct}
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Product"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </RoleGuard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">All Products</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            View and manage all products in your catalog
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search products..."
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
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Viscosity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm
                      ? "No products found matching your search."
                      : "No products found. Add your first product to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-lg"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.viscosity || "N/A"}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={product.stock > 50 ? "default" : product.stock > 10 ? "secondary" : "destructive"}
                      >
                        {product.stock} units
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.status === "active" ? "default" : "secondary"}>{product.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <RoleGuard requiredRole="manager">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </RoleGuard>
                        <RoleGuard requiredRole="admin">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </RoleGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
