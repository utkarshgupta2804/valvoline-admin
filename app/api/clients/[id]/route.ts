import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import type { Client } from "@/lib/models/client"

// GET - Fetch single client
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const client = await clientPromise
        const db = client.db("valvoline")

        const clientData = await db.collection<Client>("clients").findOne({
            _id: new ObjectId(params.id),
        })

        if (!clientData) {
            return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: clientData })
    } catch (error) {
        console.error("Error fetching client:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch client" }, { status: 500 })
    }
}

// DELETE - Delete client
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const client = await clientPromise
        const db = client.db("valvoline")

        const result = await db.collection<Client>("clients").deleteOne({
            _id: new ObjectId(params.id),
        })

        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: "Client deleted successfully" })
    } catch (error) {
        console.error("Error deleting client:", error)
        return NextResponse.json({ success: false, error: "Failed to delete client" }, { status: 500 })
    }
}
