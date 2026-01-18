"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient, type AuthResponse } from "./api-client"

interface User {
  id: number
  name: string
  email: string
  role: "security" | "member" | "admin"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DUMMY_USERS: Record<string, { password: string; user: User }> = {
  "admin@gmail.com": {
    password: "Admin@123",
    user: {
      id: 1,
      name: "Admin User",
      email: "admin@gmail.com",
      role: "admin",
    },
  },
  "security@gmail.com": {
    password: "Security@123",
    user: {
      id: 2,
      name: "Security Guard",
      email: "security@gmail.com",
      role: "security",
    },
  },
  "member@gmail.com": {
    password: "Member@123",
    user: {
      id: 3,
      name: "Society Member",
      email: "member@gmail.com",
      role: "member",
    },
  },
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("dummy_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsLoading(false)
      return
    }

    const token = apiClient.getToken()
    if (token) {
      verifyToken()
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async () => {
    const storedUser = localStorage.getItem("dummy_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsLoading(false)
      return
    }

    const response = await apiClient.get<{ user: User }>("/auth/me")
    if (response.success && response.data) {
      setUser(response.data.user)
    } else {
      apiClient.clearToken()
    }
    setIsLoading(false)
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    const dummyUser = DUMMY_USERS[email.toLowerCase()]
    if (dummyUser && dummyUser.password === password) {
      localStorage.setItem("dummy_user", JSON.stringify(dummyUser.user))
      localStorage.setItem("auth_token", "dummy_token_" + dummyUser.user.role)
      setUser(dummyUser.user)

      const redirectMap: Record<string, string> = {
        security: "/security/dashboard",
        member: "/member/dashboard",
        admin: "/admin/dashboard",
      }

      setIsLoading(false)
      router.push(redirectMap[dummyUser.user.role] || "/")
      return
    }

    // Fall back to API login if not a dummy user
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    })

    if (response.success && response.data) {
      apiClient.setToken(response.data.token)
      setUser(response.data.user)

      const redirectMap: Record<string, string> = {
        security: "/security/dashboard",
        member: "/member/dashboard",
        admin: "/admin/dashboard",
      }

      router.push(redirectMap[response.data.user.role] || "/")
    } else {
      setIsLoading(false)
      throw new Error(response.message || "Invalid email or password")
    }
    setIsLoading(false)
  }

  const logout = () => {
    localStorage.removeItem("dummy_user")
    apiClient.clearToken()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
