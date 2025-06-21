import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI ;

interface DbPurchase {
    _id?: string;
    orderNumber: string;
    invoiceNumber: string;
    customerUsername: string;
    items: {
        productId: string;
        productName: string;
        productDescription: string;
        productCategory: string;
        productViscosity: string;
        productImage: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    pricing: {
        subtotal: number;
        taxRate: number;
        taxAmount: number;
        total: number;
    };
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    paymentDetails: {
        paidAmount: number;
        remainingBalance: number;
        lastPaymentDate: Date | null;
        paymentHistory: any[];
    };
    dueDate: { $date: string } | Date;
    notes: string;
    timestamps: {
        createdAt: { $date: string } | Date;
        updatedAt: { $date: string } | Date;
        paidAt: Date | null;
        sentAt: { $date: string } | Date;
        viewedAt: { $date: string } | Date | null;
        shippedAt: Date | null;
        deliveredAt: Date | null;
    };
    invoiceDetails: {
        invoiceGenerated: boolean;
        invoiceStatus: string;
    };
    metadata: {
        source: string;
        generatedBy: string;
        version: number;
        tags: string[];
    };
}

// Transform database data to match frontend interface
function transformPurchaseData(dbPurchase: DbPurchase) {
    // Helper function to extract date from MongoDB date object
    const extractDate = (dateObj: any): string => {
        if (!dateObj) return '';
        if (dateObj.$date) {
            return new Date(dateObj.$date).toISOString().split('T')[0];
        }
        if (dateObj instanceof Date) {
            return dateObj.toISOString().split('T')[0];
        }
        return new Date(dateObj).toISOString().split('T')[0];
    };

    // Map order status to match frontend expectations
    const mapStatus = (orderStatus: string, paymentStatus: string, timestamps: any): string => {
        if (timestamps.deliveredAt) return 'delivered';
        if (timestamps.shippedAt) return 'shipped';
        if (orderStatus === 'processing' || paymentStatus === 'paid') return 'processing';
        return 'pending';
    };

    return {
        id: dbPurchase._id?.toString() || '',
        orderNumber: dbPurchase.orderNumber,
        clientName: dbPurchase.customerUsername, // Using username as client name
        products: dbPurchase.items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.unitPrice
        })),
        total: dbPurchase.pricing.total,
        status: mapStatus(dbPurchase.orderStatus, dbPurchase.paymentStatus, dbPurchase.timestamps),
        orderDate: extractDate(dbPurchase.timestamps.createdAt),
        deliveryDate: dbPurchase.timestamps.deliveredAt ? extractDate(dbPurchase.timestamps.deliveredAt) : undefined
    };
}

export async function GET(request: NextRequest) {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db('valvoline'); // Replace with your actual database name
        const collection = db.collection('orders'); // Replace with your actual collection name

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build search query
        const searchQuery = search ? {
            $or: [
                { orderNumber: { $regex: search, $options: 'i' } },
                { customerUsername: { $regex: search, $options: 'i' } },
                { invoiceNumber: { $regex: search, $options: 'i' } }
            ]
        } : {};

        // Fetch purchases with pagination
        const purchases = await collection
            .find(searchQuery)
            .sort({ 'timestamps.createdAt': -1 }) // Sort by creation date, newest first
            .skip(offset)
            .limit(limit)
            .toArray();

        // Get total count for pagination
        const totalCount = await collection.countDocuments(searchQuery);

        await client.close();

        // Transform data to match frontend interface
        const transformedPurchases = purchases.map(transformPurchaseData);

        return NextResponse.json({
            success: true,
            data: transformedPurchases,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: offset + limit < totalCount
            }
        });

    } catch (error) {
        console.error('Error fetching purchases:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch purchases',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db('valvoline'); // Replace with your actual database name
        const collection = db.collection('orders'); // Replace with your actual collection name

        // Add timestamps
        const now = new Date();
        const purchaseData = {
            ...body,
            timestamps: {
                ...body.timestamps,
                createdAt: now,
                updatedAt: now
            }
        };

        const result = await collection.insertOne(purchaseData);

        await client.close();

        return NextResponse.json({
            success: true,
            data: { ...purchaseData, _id: result.insertedId }
        });

    } catch (error) {
        console.error('Error creating purchase:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create purchase',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}