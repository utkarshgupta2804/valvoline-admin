const { MongoClient } = require("mongodb")

const uri = "mongodb://localhost:27017/valvoline"

async function setupDatabase() {
    const client = new MongoClient(uri)

    try {
        await client.connect()
        console.log("Connected to MongoDB")

        const db = client.db("valvoline")

        // Create clients collection with indexes
        const clientsCollection = db.collection("clients")

        // Create unique index on partyCode
        await clientsCollection.createIndex({ partyCode: 1 }, { unique: true })

        // Create index on partyName for faster searches
        await clientsCollection.createIndex({ partyName: 1 })

        // Create index on city for filtering
        await clientsCollection.createIndex({ city: 1 })

        // Create index on username for authentication
        await clientsCollection.createIndex({ username: 1 }, { unique: true })

        // Create compound index for search functionality
        await clientsCollection.createIndex({
            partyName: "text",
            partyCode: "text",
            city: "text",
        })

        console.log("Database setup completed successfully!")
        console.log("Created indexes:")
        console.log("- Unique index on partyCode")
        console.log("- Index on partyName")
        console.log("- Index on city")
        console.log("- Unique index on username")
        console.log("- Text search index on partyName, partyCode, city")
    } catch (error) {
        console.error("Error setting up database:", error)
    } finally {
        await client.close()
    }
}

setupDatabase()
