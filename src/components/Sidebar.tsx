'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  FileEdit, LayoutDashboard, FileText, Bell, LogOut, Anchor, 
  ShieldCheck, Users, UserCog, ShieldAlert, Megaphone, MessageSquare 
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

// Define all roles that should have access to Admin Tools
const STAFF_ROLES = ['super_admin', 'admin', 'captain', 'secretary', 'staff']

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string>('resident')
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setEmail(user.email || '')

        // 1. Check hardcoded super admin first (matches AdminGuard)
        if (user.email === 'mchaeldeleon@gmail.com') {
          setRole('super_admin')
          setLoading(false)
          return
        }

        // 2. Check localStorage (saved by AdminGuard)
        const storedRole = localStorage.getItem('userRole')
        if (storedRole) {
          setRole(storedRole)
          setLoading(false)
          return
        }

        // 3. Fallback to database
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
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    router.push('/login')
  }

  const isStaff = STAFF_ROLES.includes(role)

  // Format role for display
  const displayRole = role === 'super_admin' ? 'Barangay Captain' :
                      role === 'secretary' ? 'Barangay Secretary' :
                      role === 'staff' ? 'Barangay Staff' : 'Resident'

  // Base nav items (residents only)
  const navItems = isStaff ? [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'My Requests', href: '/dashboard/requests', icon: FileText },
    { name: 'Announcements', href: '/dashboard/announcements', icon: Megaphone },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  ]

  // Admin items with role-based access
  const adminItems = [
    { name: 'Residents', href: '/dashboard/residents', icon: Users, roles: ['super_admin', 'captain', 'secretary'] },
    { name: 'Processing', href: '/dashboard/admin/processing', icon: ShieldCheck, roles: ['super_admin', 'captain', 'secretary', 'staff'] },
    { name: 'Verifications', href: '/dashboard/admin/verifications', icon: ShieldAlert, roles: ['super_admin', 'captain', 'secretary'] },
    { name: 'Corrections', href: '/dashboard/admin/corrections', icon: FileEdit, roles: ['super_admin', 'captain', 'secretary'] },
    { name: 'Announcements', href: '/dashboard/admin/announcements', icon: Megaphone, roles: ['super_admin', 'captain', 'secretary'] },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, roles: ['super_admin', 'captain', 'secretary', 'staff'] },
    { name: 'User Roles', href: '/dashboard/admin/users', icon: UserCog, roles: ['super_admin', 'captain'] },
  ].filter(item => item.roles.includes(role))

  // Determine correct profile link based on role
  const profileLink = isStaff ? '/dashboard/admin/profile' : '/dashboard/profile'

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

      <nav className="flex-1 mt-4 px-4 space-y-2 overflow-y-auto">
        
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

        {/* Render Admin items if the user is ANY staff role */}
        {isStaff && (
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

      {/* Bottom Section: Profile + Sign Out */}
      <div className="border-t border-[#155A43]">
        
        {/* Profile Link - Dynamically points to Admin or Resident profile */}
        <Link
          href={profileLink}
          className={`flex items-center gap-3 px-4 py-3 transition-colors ${
            pathname === profileLink ? 'bg-[#155A43]' : 'hover:bg-[#155A43]'
          }`}
        >
          <div className="h-9 w-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shrink-0">
            {email.charAt(0).toUpperCase() || 'N'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white truncate">
              {email || 'Loading...'}
            </span>
            <span className="text-xs text-orange-300 font-semibold">
              {displayRole}
            </span>
          </div>
        </Link>

        {/* Sign Out Button */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-200 hover:bg-[#155A43] transition-colors border-t border-[#155A43]"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}