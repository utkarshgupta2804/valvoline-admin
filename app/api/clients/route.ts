import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { type Client, type ClientInput, generateCredentials, validateClientInput } from "@/lib/models/client"

// GET - Fetch all clients
export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db("valvoline")
        const clients = await db.collection<Client>("clients").find({}).sort({ createdAt: -1 }).toArray()

        return NextResponse.json({ success: true, data: clients })
    } catch (error) {
        console.error("Error fetching clients:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch clients" }, { status: 500 })
    }
}

// POST - Create new client
export async function POST(request: NextRequest) {
    try {
        const body: ClientInput = await request.json()

        // Validate input
        const validation = validateClientInput(body)
        if (!validation.isValid) {
            return NextResponse.json(
                { success: false, error: "Validation failed", details: validation.errors },
                { status: 400 },
            )
        }

        const client = await clientPromise
        const db = client.db("valvoline")

        // Check if party code already exists
        const existingClient = await db.collection<Client>("clients").findOne({
            partyCode: body.partyCode.toUpperCase().replace(/\s+/g, ""),
        })

        if (existingClient) {
            return NextResponse.json({ success: false, error: "Party code already exists" }, { status: 409 })
        }

        // Generate credentials
        const credentials = generateCredentials(body.partyName, body.partyCode)

        // Create new client
        const newClient: Omit<Client, "_id"> = {
            partyName: body.partyName.trim(),
            partyCode: body.partyCode.toUpperCase().replace(/\s+/g, ""),
            city: body.city.trim(),
            username: credentials.username,
            password: credentials.password,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const result = await db.collection<Client>("clients").insertOne(newClient)

        const createdClient = await db.collection<Client>("clients").findOne({ _id: result.insertedId })

        return NextResponse.json({
            success: true,
            data: createdClient,
            credentials: credentials,
        })
    } catch (error) {
        console.error("Error creating client:", error)
        return NextResponse.json({ success: false, error: "Failed to create client" }, { status: 500 })
    }
}
