import type { ObjectId } from "mongodb"

export interface Product {
    _id?: ObjectId
    name: string
    category: string
    viscosity?: string
    price: number
    stock: number
    description?: string
    image?: string
    status: "active" | "inactive"
    createdAt: Date
    updatedAt: Date
}

export interface ProductInput {
    name: string
    category: string
    viscosity?: string
    price: number
    stock: number
    description?: string
    image?: string
}

// Validate product input
export function validateProductInput(input: ProductInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!input.name || input.name.trim().length === 0) {
        errors.push("Product name is required")
    }

    if (!input.category || input.category.trim().length === 0) {
        errors.push("Category is required")
    }

    if (!input.price || input.price <= 0) {
        errors.push("Price must be greater than 0")
    }

    if (input.stock < 0) {
        errors.push("Stock cannot be negative")
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}

// Product categories
export const PRODUCT_CATEGORIES = [
    "Motor Oil",
    "Synthetic Oil",
    "Transmission Fluid",
    "Brake Fluid",
    "Coolant",
    "Gear Oil",
    "Hydraulic Fluid",
    "Grease",
]

// Viscosity options
export const VISCOSITY_OPTIONS = ["0W-20", "5W-20", "5W-30", "10W-30", "10W-40", "15W-40", "20W-50"]
