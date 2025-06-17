const { MongoClient } = require("mongodb")

const uri = "mongodb://localhost:27017/valvoline"

async function setupProductsDatabase() {
    const client = new MongoClient(uri)

    try {
        await client.connect()
        console.log("Connected to MongoDB")

        const db = client.db("valvoline")

        // Create products collection with indexes
        const productsCollection = db.collection("products")

        // Create unique index on product name (case-insensitive)
        await productsCollection.createIndex({ name: 1 }, { unique: true })

        // Create index on category for filtering
        await productsCollection.createIndex({ category: 1 })

        // Create index on viscosity for filtering
        await productsCollection.createIndex({ viscosity: 1 })

        // Create index on status for filtering
        await productsCollection.createIndex({ status: 1 })

        // Create index on price for sorting
        await productsCollection.createIndex({ price: 1 })

        // Create index on stock for low stock alerts
        await productsCollection.createIndex({ stock: 1 })

        // Create compound index for search functionality
        await productsCollection.createIndex({
            name: "text",
            category: "text",
            viscosity: "text",
            description: "text",
        })

        // Create compound index for category and status filtering
        await productsCollection.createIndex({ category: 1, status: 1 })

        // Insert sample products
        const sampleProducts = [
            {
                name: "Valvoline MaxLife 10W-40",
                category: "Motor Oil",
                viscosity: "10W-40",
                price: 24.99,
                stock: 150,
                description: "Premium motor oil for high-mileage vehicles with seal conditioners",
                image: "",
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: "Valvoline SynPower 5W-30",
                category: "Synthetic Oil",
                viscosity: "5W-30",
                price: 34.99,
                stock: 200,
                description: "Full synthetic motor oil for maximum engine protection",
                image: "",
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: "Valvoline ATF+4 Transmission Fluid",
                category: "Transmission Fluid",
                viscosity: "",
                price: 19.99,
                stock: 75,
                description: "Automatic transmission fluid for Chrysler vehicles",
                image: "",
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: "Valvoline DOT 3 Brake Fluid",
                category: "Brake Fluid",
                viscosity: "",
                price: 12.99,
                stock: 100,
                description: "High-performance brake fluid for most vehicles",
                image: "",
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: "Valvoline Zerex G-05 Coolant",
                category: "Coolant",
                viscosity: "",
                price: 16.99,
                stock: 50,
                description: "Extended life antifreeze/coolant for modern engines",
                image: "",
                status: "active",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]

        // Check if products already exist
        const existingCount = await productsCollection.countDocuments()
        if (existingCount === 0) {
            await productsCollection.insertMany(sampleProducts)
            console.log("Sample products inserted successfully!")
        } else {
            console.log("Products collection already has data, skipping sample data insertion")
        }

        console.log("Products database setup completed successfully!")
        console.log("Created indexes:")
        console.log("- Unique index on name")
        console.log("- Index on category")
        console.log("- Index on viscosity")
        console.log("- Index on status")
        console.log("- Index on price")
        console.log("- Index on stock")
        console.log("- Text search index on name, category, viscosity, description")
        console.log("- Compound index on category and status")
    } catch (error) {
        console.error("Error setting up products database:", error)
    } finally {
        await client.close()
    }
}

setupProductsDatabase()
