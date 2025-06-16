"use client"

import type React from "react"

import { useAuth } from "@/lib/auth"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole: "admin" | "manager" | "staff"
  fallback?: React.ReactNode
}

export function RoleGuard({ children, requiredRole, fallback }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) return null

  const roleHierarchy = { staff: 1, manager: 2, admin: 3 }
  const userLevel = roleHierarchy[user.role]
  const requiredLevel = roleHierarchy[requiredRole]

  if (userLevel < requiredLevel) {
    return fallback || null
  }

  return <>{children}</>
}
