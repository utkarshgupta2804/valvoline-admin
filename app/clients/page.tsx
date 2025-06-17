"use client"

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
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { RoleGuard } from "@/components/role-guard"

interface Client {
  _id: string
  partyName: string
  partyCode: string
  city: string
  username: string
  password: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

interface ClientInput {
  partyName: string
  partyCode: string
  city: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newClient, setNewClient] = useState<ClientInput>({
    partyName: "",
    partyCode: "",
    city: "",
  })

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/clients")
      const result = await response.json()

      if (result.success) {
        setClients(result.data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch clients",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const filteredClients = clients.filter(
    (client) =>
      client.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.partyCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.username.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddClient = async () => {
    if (!newClient.partyName || !newClient.partyCode || !newClient.city) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newClient),
      })

      const result = await response.json()

      if (result.success) {
        setClients([result.data, ...clients])
        setNewClient({ partyName: "", partyCode: "", city: "" })
        setIsAddDialogOpen(false)

        toast({
          title: "Client Added Successfully",
          description: `Username: ${result.credentials.username}, Password: ${result.credentials.password}`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add client",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding client:", error)
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) {
      return
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setClients(clients.filter((client) => client._id !== clientId))
        toast({
          title: "Success",
          description: "Client deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete client",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting client:", error)
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Client Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your Valvoline clients and their accounts</p>
        </div>
        <RoleGuard requiredRole="manager">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Create a new client account. Username and password will be automatically generated using party name
                  and party code.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="partyName">Party Name *</Label>
                  <Input
                    id="partyName"
                    value={newClient.partyName}
                    onChange={(e) => setNewClient({ ...newClient, partyName: e.target.value })}
                    placeholder="Enter party name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="partyCode">Party Code *</Label>
                  <Input
                    id="partyCode"
                    value={newClient.partyCode}
                    onChange={(e) => setNewClient({ ...newClient, partyCode: e.target.value })}
                    placeholder="Enter party code"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={newClient.city}
                    onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                    placeholder="Enter city"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddClient} className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Client"
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
          <CardTitle className="text-gray-900 dark:text-white">All Clients </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            View and manage all registered clients
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
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
                <TableHead>Party Name</TableHead>
                <TableHead>Party Code</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    {searchTerm
                      ? "No clients found matching your search."
                      : "No clients found. Add your first client to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell className="font-medium">{client.partyName}</TableCell>
                    <TableCell className="font-mono text-sm">{client.partyCode}</TableCell>
                    <TableCell>{client.city}</TableCell>
                    <TableCell className="font-mono text-sm">{client.username}</TableCell>
                    <TableCell className="font-mono text-sm">{client.password}</TableCell>
                    <TableCell>
                      <Badge variant={client.status === "active" ? "default" : "secondary"}>{client.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
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
                            onClick={() => handleDeleteClient(client._id)}
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
