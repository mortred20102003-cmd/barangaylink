'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AdminGuard from '@/components/AdminGuard'
import { Search, ChevronDown, Shield, User, AlertTriangle } from 'lucide-react'

export default function UserRolesPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('role', { ascending: true })

    if (!error && data) {
      setUsers(data)
    }
    setLoading(false)
  }

  const existingSuperAdmin = users.find(u => u.role === 'super_admin')

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    const targetUser = users.find(u => u.id === userId)

    // Rule 1: You cannot change your own role
    if (userId === user?.id) {
      alert("You cannot change your own role.")
      return
    }

    // Rule 2: There can only be ONE Super Admin
    if (newRole === 'super_admin' && existingSuperAdmin) {
      alert("Access Denied: There is already an active Barangay Captain in the system.")
      return
    }

    // Rule 3: Only VERIFIED residents can be promoted to staff/secretary/captain
    const isBeingPromoted = ['staff', 'secretary', 'super_admin'].includes(newRole)
    if (isBeingPromoted && targetUser?.verification_status !== 'Verified') {
      alert(`Access Denied: This user is currently "${targetUser?.verification_status || 'Pending'}". Only Verified residents can be promoted to Barangay Staff.`)
      return
    }

    setUpdatingId(userId)

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      alert("Error updating role: " + error.message)
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    }

    setUpdatingId(null)
  }

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-8 text-center">Loading users...</div>

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Roles</h1>
          <p className="text-gray-500 mt-1">Manage permissions and access levels for barangay staff.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">System Users ({filteredUsers.length})</h2>
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A3A2A] outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Verification</th>
                  <th className="px-6 py-4 font-semibold">Current Role</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isVerified = user.verification_status === 'Verified'
                  const isStaffRole = ['staff', 'secretary', 'super_admin', 'captain'].includes(user.role)

                  return (
                    <tr key={user.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                            {user.email?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
                          ${isVerified ? 'bg-green-100 text-green-700' :
                            user.verification_status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'}`}>
                          {user.verification_status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                          ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'secretary' ? 'bg-blue-100 text-blue-700' :
                            user.role === 'staff' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'}`}>
                          {user.role === 'super_admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {user.role === 'super_admin' ? 'Captain' :
                           user.role === 'secretary' ? 'Secretary' :
                           user.role === 'staff' ? 'Staff' : 'Resident'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block text-left">
                          <select
                            disabled={updatingId === user.id}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-[#0A3A2A] focus:border-[#0A3A2A] block w-48 p-2 pr-8 cursor-pointer hover:bg-gray-50 disabled:opacity-50"
                          >
                            <option value="resident">Resident</option>

                            {/* Only show Staff/Secretary options if VERIFIED */}
                            {isVerified ? (
                              <>
                                <option value="staff">Barangay Staff</option>
                                <option value="secretary">Secretary</option>
                              </>
                            ) : (
                              <option value="staff" disabled>Staff (Verify Resident First)</option>
                            )}

                            {/* Only show Captain option if user IS the captain OR no captain exists */}
                            {(user.role === 'super_admin' || !existingSuperAdmin) && isVerified && (
                              <option value="super_admin">Captain (Super Admin)</option>
                            )}
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Warning note */}
          <div className="p-4 bg-orange-50 border-t border-orange-100 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
            <p className="text-xs text-orange-700">
              Only <strong>Verified</strong> residents can be promoted to Staff, Secretary, or Captain. Go to <strong>Verifications</strong> to approve pending residents first.
            </p>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}