'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Bell, User, LogOut, Anchor, ShieldCheck, Users, BarChart3 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string>('resident') // Default to resident
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Fetch their role from the profiles table
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          
        if (data) setRole(data.role)
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Base navigation for everyone
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Requests', href: '/dashboard/requests', icon: FileText },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ]

  // Admin-only navigation
  const adminItems = [
    { name: 'Residents', href: '/dashboard/residents', icon: Users },
    { name: 'Admin Panel', href: '/dashboard/admin', icon: ShieldCheck },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  ]

  if (loading) return <aside className="w-64 bg-[#0A3A2A] text-white min-h-screen"></aside>

  return (
    <aside className="w-64 bg-[#0A3A2A] text-white min-h-screen flex flex-col">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-white rounded-full p-2">
          <Anchor className="w-6 h-6 text-[#0A3A2A]" />
        </div>
        <h1 className="text-xl font-bold tracking-wide">LamionLink</h1>
      </div>

      <nav className="flex-1 mt-4 px-4 space-y-2">
        {/* Render base items */}
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-white text-[#0A3A2A] font-semibold' : 'text-gray-200 hover:bg-[#155A43]'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}

        {/* Render Admin items ONLY if role is admin */}
        {role === 'admin' && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Tools</p>
            </div>
            {adminItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-white text-[#0A3A2A] font-semibold' : 'text-gray-200 hover:bg-[#155A43]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-[#155A43]">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-200 hover:bg-[#155A43] rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}