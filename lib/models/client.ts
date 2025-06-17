import type { ObjectId } from "mongodb"

export interface Client {
    _id?: ObjectId
    partyName: string
    partyCode: string
    city: string
    username: string
    password: string
    status: "active" | "inactive"
    createdAt: Date
    updatedAt: Date
}

export interface ClientInput {
    partyName: string
    partyCode: string
    city: string
}

// Generate username and password based on party name and party code
export function generateCredentials(partyName: string, partyCode: string): { username: string; password: string } {
    // Clean party name (remove spaces, convert to lowercase)
    const cleanPartyName = partyName
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")

    // Clean party code (remove spaces, convert to uppercase)
    const cleanPartyCode = partyCode.toUpperCase().replace(/\s+/g, "")

    // Generate username: partyname_partycode
    const username = `${cleanPartyName}_${cleanPartyCode}`

    // Generate password: VL + year + # + random string
    const year = new Date().getFullYear()
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase()
    const password = `VL${year}#${randomString}`

    return { username, password }
}

// Validate client input
export function validateClientInput(input: ClientInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!input.partyName || input.partyName.trim().length === 0) {
        errors.push("Party name is required")
    }

    if (!input.partyCode || input.partyCode.trim().length === 0) {
        errors.push("Party code is required")
    }

    if (!input.city || input.city.trim().length === 0) {
        errors.push("City is required")
    }

    return {
        isValid: errors.length === 0,
        errors,
    }
}
