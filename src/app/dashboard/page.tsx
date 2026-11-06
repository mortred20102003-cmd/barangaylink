'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string>('Resident')
  const [stats, setStats] = useState({
    active: 0,
    approved: 0,
    pending: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Get the logged in user
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email) {
        // Capitalize the first letter of the email for a nicer greeting
        const name = user.email.split('@')[0]
        setUserEmail(name.charAt(0).toUpperCase() + name.slice(1))
      }

      // 2. Fetch their requests
      const { data: requests } = await supabase.from('document_requests').select('*')
      
      if (requests) {
        setStats({
          active: requests.filter(r => r.status !== 'Released').length,
          approved: requests.filter(r => r.status === 'Approved' || r.status === 'Ready for Pickup').length,
          pending: requests.filter(r => r.status === 'Pending').length,
          total: requests.length
        })
      }
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userEmail}</h1>
        <p className="text-gray-500 mt-1">Here is an overview of your barangay requests.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active Requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : stats.active}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Approved Documents</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : stats.approved}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending Requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : stats.total}</p>
        </div>
      </div>

      {/* Bottom Section: Notifications & Quick Actions */}
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