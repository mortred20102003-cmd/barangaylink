'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // --- 1. HARDCODE SUPER ADMIN EMAIL ---
      const SUPER_ADMIN_EMAIL = 'mchaeldeleon@gmail.com'
      
      let userRole = ''

      if (user.email === SUPER_ADMIN_EMAIL) {
        userRole = 'super_admin'
      } else {
        // Check database for other roles
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        userRole = data?.role || 'resident'
      }

      const authorizedRoles = ['super_admin', 'admin', 'captain', 'secretary', 'staff']
      
      if (authorizedRoles.includes(userRole)) {
        setIsAuthorized(true)
        // Save role to localStorage so the dashboard page can read it
        localStorage.setItem('userRole', userRole) 
      } else {
        router.push('/dashboard')
      }
      setLoading(false)
    }
    checkAdmin()
  }, [router])

  if (loading) return <div className="p-8 text-center text-gray-500">Checking permissions...</div>
  if (!isAuthorized) return null

  return <>{children}</>
}