import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = "valvoline"

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

interface InvoiceData {
    orderNumber: string
    invoiceNumber: string
    customerUsername: string
    items: Array<{
        productId: string
        productName: string
        productDescription: string
        productCategory: string
        productViscosity: string
        productImage: string
        quantity: number
        unitPrice: number
        totalPrice: number
    }>
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

// Global variable to cache the MongoDB client
let cachedClient: MongoClient | null = null

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient
    }

    try {
        const client = new MongoClient(MONGODB_URI as string)
        await client.connect()
        cachedClient = client
        console.log('Connected to MongoDB')
        return client
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error)
        throw error
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { invoiceNumber: string } }
) {
    try {
        const { invoiceNumber } = params

        if (!invoiceNumber) {
            return NextResponse.json({
                success: false,
                error: "Invoice number is required"
            }, { status: 400 })
        }

        // Connect to MongoDB
        const client = await connectToDatabase()
        const db = client.db(MONGODB_DB)
        const collection = db.collection('orders')

        // Query the database for the invoice
        // You can search by invoiceNumber or orderNumber depending on your data structure
        const invoice = await collection.findOne({
            $or: [
                { invoiceNumber: invoiceNumber },
                { orderNumber: invoiceNumber },
            ]
        })

        if (!invoice) {
            return NextResponse.json({
                success: false,
                error: "Invoice not found"
            }, { status: 404 })
        }

        // Transform the data if needed to match your interface
        // MongoDB returns _id by default, you might want to handle this
        const transformedInvoice = {
            ...invoice,
            // Remove MongoDB's _id if you don't want it in the response
            // _id: undefined
        }

        return NextResponse.json({
            success: true,
            data: transformedInvoice
        })

    } catch (error) {
        console.error('Error fetching invoice:', error)
        
        // Handle specific MongoDB errors
        if (error instanceof Error) {
            return NextResponse.json({
                success: false,
                error: `Database error: ${error.message}`
            }, { status: 500 })
        }

        return NextResponse.json({
            success: false,
            error: "Internal server error"
        }, { status: 500 })
    }
}

// Optional: Add other HTTP methods if needed
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        
        // Connect to MongoDB
        const client = await connectToDatabase()
        const db = client.db(MONGODB_DB)
        const collection = db.collection('orders')

        // Insert new order/invoice
        const result = await collection.insertOne({
            ...body,
            timestamps: {
                ...body.timestamps,
                createdAt: { $date: new Date().toISOString() },
                updatedAt: { $date: new Date().toISOString() }
            }
        })

        return NextResponse.json({
            success: true,
            data: { insertedId: result.insertedId }
        })

    } catch (error) {
        console.error('Error creating invoice:', error)
        return NextResponse.json({
            success: false,
            error: "Failed to create invoice"
        }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { invoiceNumber: string } }
) {
    try {
        const { invoiceNumber } = params
        const body = await request.json()

        // Connect to MongoDB
        const client = await connectToDatabase()
        const db = client.db(MONGODB_DB)
        const collection = db.collection('orders')

        // Update existing order/invoice
        const result = await collection.updateOne(
            {
                $or: [
                    { invoiceNumber: invoiceNumber },
                    { orderNumber: invoiceNumber }
                ]
            },
            {
                $set: {
                    ...body,
                    'timestamps.updatedAt': { $date: new Date().toISOString() }
                }
            }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({
                success: false,
                error: "Invoice not found"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: { modifiedCount: result.modifiedCount }
        })

    } catch (error) {
        console.error('Error updating invoice:', error)
        return NextResponse.json({
            success: false,
            error: "Failed to update invoice"
        }, { status: 500 })
    }
}