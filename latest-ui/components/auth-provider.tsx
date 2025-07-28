"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "teacher" | "module_leader"
  department: string
  employeeId: string
  designation: string
  mobile: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, role: string, department: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock users database
    const mockUsers: User[] = [
      {
        id: "1",
        name: "Dr. John Smith",
        email: "john.smith@university.edu",
        role: "teacher",
        department: "Computer Science",
        employeeId: "EMP001",
        designation: "Assistant Professor",
        mobile: "+1234567890",
      },
      {
        id: "2",
        name: "Dr. Alice Johnson",
        email: "alice.johnson@university.edu",
        role: "module_leader",
        department: "Computer Science",
        employeeId: "EMP002",
        designation: "Associate Professor",
        mobile: "+1234567891",
      },
      {
        id: "3",
        name: "Prof. Sarah Wilson",
        email: "sarah.wilson@university.edu",
        role: "teacher",
        department: "Computer Science",
        employeeId: "EMP003",
        designation: "Lecturer",
        mobile: "+1234567892",
      },
      {
        id: "4",
        name: "Dr. Bob Chen",
        email: "bob.chen@university.edu",
        role: "module_leader",
        department: "Computer Science",
        employeeId: "EMP004",
        designation: "Professor",
        mobile: "+1234567893",
      },
      {
        id: "5",
        name: "Dr. Carol White",
        email: "carol.white@university.edu",
        role: "module_leader",
        department: "Computer Science",
        employeeId: "EMP005",
        designation: "Associate Professor",
        mobile: "+1234567894",
      },
      {
        id: "6",
        name: "Dr. Mike Davis",
        email: "mike.davis@university.edu",
        role: "teacher",
        department: "Computer Science",
        employeeId: "EMP006",
        designation: "Assistant Professor",
        mobile: "+1234567895",
      },
      {
        id: "7",
        name: "Dr. Lisa Brown",
        email: "lisa.brown@university.edu",
        role: "teacher",
        department: "Electrical Engineering",
        employeeId: "EMP007",
        designation: "Associate Professor",
        mobile: "+1234567896",
      },
      {
        id: "8",
        name: "Prof. David Lee",
        email: "david.lee@university.edu",
        role: "module_leader",
        department: "Electrical Engineering",
        employeeId: "EMP008",
        designation: "Professor",
        mobile: "+1234567897",
      },
    ]

    // Find user by email
    const foundUser = mockUsers.find((user) => user.email === email)

    if (foundUser && password === "password123") {
      setUser(foundUser)
      localStorage.setItem("user", JSON.stringify(foundUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string,
    department: string,
  ): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock registration - in real app, this would be an API call
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: role as "teacher" | "module_leader",
      department,
      employeeId: `EMP${Date.now().toString().slice(-3)}`,
      designation: role === "module_leader" ? "Associate Professor" : "Assistant Professor",
      mobile: "+1234567890",
    }

    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
