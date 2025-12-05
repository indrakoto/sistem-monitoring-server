'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ username: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/login')
    } else {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">
                🖥️ System Monitor
              </h1>
              <div className="hidden md:flex space-x-4">
                <Link 
                  href="/dashboard" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/servers" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
                >
                  Servers
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                Welcome, <span className="font-semibold">{user?.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}