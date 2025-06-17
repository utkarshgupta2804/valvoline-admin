import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Product } from "@/lib/models/product"

// GET - Fetch product categories with counts
export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db("valvoline")

        const categories = await db
            .collection<Product>("products")
            .aggregate([
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 },
                        totalStock: { $sum: "$stock" },
                        avgPrice: { $avg: "$price" },
                    },
                },
                {
                    $sort: { count: -1 },
                },
            ])
            .toArray()

        return NextResponse.json({ success: true, data: categories })
    } catch (error) {
        console.error("Error fetching categories:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 })
    }
}
