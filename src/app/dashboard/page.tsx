'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { CheckCircle2, Clock, ShieldCheck } from 'lucide-react'

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    active: 0,
    approved: 0,
    pending: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Get the logged-in user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Fetch their full name and details from the profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          
        setUserProfile(profile)

        // 2. Fetch their document requests
        const { data: requests } = await supabase
          .from('document_requests')
          .select('*')
          .eq('user_id', user.id)
        
        if (requests) {
          setStats({
            active: requests.filter(r => r.status !== 'Released').length,
            approved: requests.filter(r => r.status === 'Approved' || r.status === 'Ready for Pickup').length,
            pending: requests.filter(r => r.status === 'Pending').length,
            total: requests.length
          })
        }
      }
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>

  // Fallback name if they haven't set one in their profile yet
  const displayName = userProfile?.fullname || userProfile?.email?.split('@')[0] || 'Resident'
  
  // Generate a mock Resident ID based on their database ID
  const residentId = userProfile?.id ? `RES-2026-${userProfile.id.slice(0, 3).toUpperCase()}` : 'RES-2026-XXX'

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* --- USER INFORMATION CARD --- */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#E8F5F1] text-[#0A3A2A] rounded-full flex items-center justify-center text-2xl font-bold border-2 border-[#0A3A2A]">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {displayName}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-sm text-gray-600">
              <p><span className="font-semibold text-gray-800">Resident ID:</span> {residentId}</p>
              <p><span className="font-semibold text-gray-800">Barangay:</span> Lamion</p>
            </div>
          </div>
        </div>
        
                {/* Dynamic Verification Badge */}
        {userProfile?.verification_status === 'Verified' ? (
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 border border-green-200 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
            Verified Resident
          </div>
        ) : (
          <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 border border-yellow-200 shadow-sm">
            <Clock className="w-5 h-5" />
            Pending Verification
          </div>
        )}
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active Requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Approved Documents</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approved}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending Requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
      </div>

      {/* --- BOTTOM SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Recent Notifications */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent notifications</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
              <div>
                <p className="font-semibold text-gray-900">Welcome to LamionLink!</p>
                <p className="text-sm text-gray-500">Start by requesting a document below.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick actions</h2>
          <div className="space-y-4">
            <Link href="/dashboard/requests/new" className="w-full text-left bg-[#E8F5F1] hover:bg-[#D1EBE3] transition-colors p-4 rounded-lg font-semibold text-[#0A3A2A] flex justify-between items-center block">
              Request a document <span>→</span>
            </Link>
            <Link href="/dashboard/requests" className="w-full text-left bg-[#E8F5F1] hover:bg-[#D1EBE3] transition-colors p-4 rounded-lg font-semibold text-[#0A3A2A] flex justify-between items-center block">
              Track my requests <span>→</span>
            </Link>
            <Link href="/dashboard/profile" className="w-full text-left bg-[#E8F5F1] hover:bg-[#D1EBE3] transition-colors p-4 rounded-lg font-semibold text-[#0A3A2A] flex justify-between items-center block">
              Update my profile <span>→</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}