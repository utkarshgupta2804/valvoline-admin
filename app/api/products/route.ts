import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { type Product, type ProductInput, validateProductInput } from "@/lib/models/product"

// GET - Fetch all products
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get("category")
        const status = searchParams.get("status")
        const search = searchParams.get("search")

        const client = await clientPromise
        const db = client.db("valvoline")

        // Build query filter
        const filter: any = {}

        if (category) {
            filter.category = category
        }

        if (status) {
            filter.status = status
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { viscosity: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ]
        }

        const products = await db.collection<Product>("products").find(filter).sort({ createdAt: -1 }).toArray()

        return NextResponse.json({ success: true, data: products })
    } catch (error) {
        console.error("Error fetching products:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
    }
}

// POST - Create new product
export async function POST(request: NextRequest) {
    try {
        const body: ProductInput = await request.json()

        // Validate input
        const validation = validateProductInput(body)
        if (!validation.isValid) {
            return NextResponse.json(
                { success: false, error: "Validation failed", details: validation.errors },
                { status: 400 },
            )
        }

        const client = await clientPromise
        const db = client.db("valvoline")

        // Check if product name already exists
        const existingProduct = await db.collection<Product>("products").findOne({
            name: { $regex: `^${body.name.trim()}$`, $options: "i" },
        })

        if (existingProduct) {
            return NextResponse.json({ success: false, error: "Product with this name already exists" }, { status: 409 })
        }

        // Create new product
        const newProduct: Omit<Product, "_id"> = {
            name: body.name.trim(),
            category: body.category.trim(),
            viscosity: body.viscosity?.trim() || "",
            price: Number(body.price),
            stock: Number(body.stock) || 0,
            description: body.description?.trim() || "",
            image: body.image || "",
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const result = await db.collection<Product>("products").insertOne(newProduct)
        const createdProduct = await db.collection<Product>("products").findOne({ _id: result.insertedId })

        return NextResponse.json({
            success: true,
            data: createdProduct,
        })
    } catch (error) {
        console.error("Error creating product:", error)
        return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 })
    }
}
