"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Download, Calendar, User, CreditCard, Package, Loader2 } from "lucide-react"

interface InvoiceItem {
    productId: string
    productName: string
    productDescription: string
    productCategory: string
    productViscosity: string
    productImage: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

interface InvoiceData {
    orderNumber: string
    invoiceNumber: string
    customerUsername: string
    items: InvoiceItem[]
    pricing: {
        subtotal: number
        taxRate: number
        taxAmount: number
        total: number
    }
    orderStatus: string
    paymentStatus: string
    paymentMethod: string
    paymentDetails: {
        paidAmount: number
        remainingBalance: number
        lastPaymentDate: string | null
        paymentHistory: any[]
    }
    dueDate: { $date: string }
    notes: string
    timestamps: {
        createdAt: { $date: string }
        updatedAt: { $date: string }
        paidAt: { $date: string } | null
        sentAt: { $date: string }
        viewedAt: { $date: string }
        shippedAt: { $date: string } | null
        deliveredAt: { $date: string } | null
    }
    invoiceDetails: {
        invoiceGenerated: boolean
        invoiceStatus: string
    }
    metadata: {
        source: string
        generatedBy: string
        version: number
        tags: any[]
    }
}

interface InvoiceDialogProps {
    isOpen: boolean
    onClose: () => void
    invoiceNumber: string
}

export default function InvoiceDialog({ isOpen, onClose, invoiceNumber }: InvoiceDialogProps) {
    const [invoice, setInvoice] = useState<InvoiceData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && invoiceNumber) {
            fetchInvoice()
        }
    }, [isOpen, invoiceNumber])

    const fetchInvoice = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/purchases/${invoiceNumber}`)
            const result = await response.json()

            if (result.success) {
                setInvoice(result.data)
            } else {
                setError(result.error || 'Failed to fetch invoice')
            }
        } catch (err) {
            setError('Network error: Failed to fetch invoice')
            console.error('Fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateObj: { $date: string }) => {
        return new Date(dateObj.$date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
            case "processing":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
            case "shipped":
                return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
            case "delivered":
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            case "paid":
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            case "unpaid":
                return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = () => {
        // Implement PDF download logic here
        console.log("Download invoice as PDF")
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Details</DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                            Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                        </Button>
                    </div>
                </DialogHeader>

                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin mr-2 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Loading invoice...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {invoice && !loading && (
                    <div className="space-y-6">
                        {/* Invoice Header */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Invoice Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Invoice #:</span>
                                            <span className="text-gray-900 dark:text-white">{invoice.invoiceNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Order #:</span>
                                            <span className="text-gray-900 dark:text-white">{invoice.orderNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Order Date:</span>
                                            <span className="text-gray-900 dark:text-white">{formatDate(invoice.timestamps.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Due Date:</span>
                                            <span className="text-gray-900 dark:text-white">{formatDate(invoice.dueDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Customer Information</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Customer:</span>
                                            <span className="text-gray-900 dark:text-white">{invoice.customerUsername}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <span className="font-medium text-gray-700 dark:text-gray-300">Payment Method:</span>
                                            <span className="capitalize text-gray-900 dark:text-white">{invoice.paymentMethod}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex gap-3 mt-4">
                                <Badge className={getStatusColor(invoice.orderStatus)}>
                                    Order: {invoice.orderStatus.toUpperCase()}
                                </Badge>
                                <Badge className={getStatusColor(invoice.paymentStatus)}>
                                    Payment: {invoice.paymentStatus.toUpperCase()}
                                </Badge>
                                <Badge className={getStatusColor(invoice.invoiceDetails.invoiceStatus)}>
                                    Invoice: {invoice.invoiceDetails.invoiceStatus.toUpperCase()}
                                </Badge>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Items</h3>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Product</th>
                                            <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Category</th>
                                            <th className="text-center p-4 font-medium text-gray-900 dark:text-white">Qty</th>
                                            <th className="text-right p-4 font-medium text-gray-900 dark:text-white">Unit Price</th>
                                            <th className="text-right p-4 font-medium text-gray-900 dark:text-white">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items.map((item, index) => (
                                            <tr key={item.productId} className={index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}>
                                                <td className="p-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">{item.productName}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.productDescription}</div>
                                                        {item.productViscosity && (
                                                            <div className="text-xs text-gray-400 dark:text-gray-500">Viscosity: {item.productViscosity}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-900 dark:text-white">{item.productCategory}</td>
                                                <td className="p-4 text-center text-gray-900 dark:text-white">{item.quantity}</td>
                                                <td className="p-4 text-right font-medium text-gray-900 dark:text-white">${item.unitPrice.toFixed(2)}</td>
                                                <td className="p-4 text-right font-medium text-gray-900 dark:text-white">${item.totalPrice.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pricing Summary */}
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="max-w-sm ml-auto space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                                    <span className="text-gray-900 dark:text-white">${invoice.pricing.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-700 dark:text-gray-300">Tax ({(invoice.pricing.taxRate * 100).toFixed(1)}%):</span>
                                    <span className="text-gray-900 dark:text-white">${invoice.pricing.taxAmount.toFixed(2)}</span>
                                </div>
                                <Separator className="bg-gray-200 dark:bg-gray-600" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-gray-900 dark:text-white">Total:</span>
                                    <span className="text-gray-900 dark:text-white">${invoice.pricing.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Payment Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Amount Paid:</span>
                                    <span className="ml-2 text-green-600 dark:text-green-400 font-bold">
                                        ${invoice.paymentDetails.paidAmount.toFixed(2)}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Remaining Balance:</span>
                                    <span className="ml-2 text-red-600 dark:text-red-400 font-bold">
                                        ${invoice.paymentDetails.remainingBalance.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Notes</h3>
                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{invoice.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}