import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import { type Product, type ProductInput, validateProductInput } from "@/lib/models/product"

// GET - Fetch single product
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const client = await clientPromise
        const db = client.db("valvoline")

        const product = await db.collection<Product>("products").findOne({
            _id: new ObjectId(params.id),
        })

        if (!product) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: product })
    } catch (error) {
        console.error("Error fetching product:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch product" }, { status: 500 })
    }
}

// PUT - Update product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

        // Check if product exists
        const existingProduct = await db.collection<Product>("products").findOne({
            _id: new ObjectId(params.id),
        })

        if (!existingProduct) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
        }

        // Check if another product with same name exists (excluding current product)
        const duplicateProduct = await db.collection<Product>("products").findOne({
            name: { $regex: `^${body.name.trim()}$`, $options: "i" },
            _id: { $ne: new ObjectId(params.id) },
        })

        if (duplicateProduct) {
            return NextResponse.json({ success: false, error: "Product with this name already exists" }, { status: 409 })
        }

        // Update product
        const updatedProduct = {
            name: body.name.trim(),
            category: body.category.trim(),
            viscosity: body.viscosity?.trim() || "",
            price: Number(body.price),
            stock: Number(body.stock) || 0,
            description: body.description?.trim() || "",
            image: body.image || "",
            updatedAt: new Date(),
        }

        await db.collection<Product>("products").updateOne({ _id: new ObjectId(params.id) }, { $set: updatedProduct })

        const product = await db.collection<Product>("products").findOne({ _id: new ObjectId(params.id) })

        return NextResponse.json({ success: true, data: product })
    } catch (error) {
        console.error("Error updating product:", error)
        return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 })
    }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const client = await clientPromise
        const db = client.db("valvoline")

        const result = await db.collection<Product>("products").deleteOne({
            _id: new ObjectId(params.id),
        })

        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: "Product deleted successfully" })
    } catch (error) {
        console.error("Error deleting product:", error)
        return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 })
    }
}
