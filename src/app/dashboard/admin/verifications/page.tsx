'use client'

import { useState, useEffect } from 'react'
import { 
  ShieldCheck, CheckCircle, XCircle, User, ClipboardCheck, 
  Eye, X, History, AlertTriangle
} from 'lucide-react'
import { supabase } from '../../../../lib/supabase'
import AdminGuard from '../../../../components/AdminGuard'

export default function VerificationsPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [historyLogs, setHistoryLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')
  
  // Notes State (per user)
  const [notes, setNotes] = useState<{ [key: string]: string }>({})
  
  // Interactive Checklist State (per user)
  // Format: { [userId]: { recordMatch: bool, householdFound: bool, idUploaded: bool, noDuplicate: bool } }
  const [checklists, setChecklists] = useState<{ [key: string]: any }>({})

  // Modal State for Viewing ID
  const [viewingIdUrl, setViewingIdUrl] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    
    // 1. Fetch Pending Users
    const { data: pending, error: pendingError } = await supabase
      .from('profiles')
      .select('*')
      .eq('verification_status', 'Pending')
      .eq('role', 'resident')

    if (!pendingError && pending) {
      setPendingUsers(pending)
      
      // Initialize checklists for new users
      const initialChecklists: any = {}
      pending.forEach(u => {
        initialChecklists[u.id] = { recordMatch: false, householdFound: false, idUploaded: false, noDuplicate: false }
      })
      setChecklists(initialChecklists)
    }

    // 2. Fetch History Logs (Joined with profiles to get names)
    // Note: This requires a foreign key relationship in Supabase. 
    // If the join fails, it will just fetch the raw log.
    const { data: history, error: historyError } = await supabase
      .from('verification_history')
      .select(`
        *,
        profiles:user_id (fullname, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!historyError && history) {
      setHistoryLogs(history)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleChecklistToggle = (userId: string, field: string) => {
    setChecklists(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: !prev[userId][field]
      }
    }))
  }

  const isChecklistComplete = (userId: string) => {
    const list = checklists[userId]
    if (!list) return false
    return list.recordMatch && list.householdFound && list.idUploaded && list.noDuplicate
  }

  const handleVerification = async (residentId: string, status: 'Verified' | 'Rejected') => {
    // Safety Check: Block approval if checklist is incomplete
    if (status === 'Verified' && !isChecklistComplete(residentId)) {
      alert("Please complete all 4 checklist items before approving.")
      return
    }

    if (!confirm(`Are you sure you want to mark this user as ${status}?`)) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const adminNotes = notes[residentId] || (status === 'Verified' ? "Resident information matched barangay records." : "Documents missing or invalid.")

    // 1. Update the Profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        verification_status: status,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        verification_notes: adminNotes
      })
      .eq('id', residentId)

    if (profileError) {
      alert("Error updating status: " + profileError.message)
      return
    }

    // 2. Insert into History Log
    await supabase.from('verification_history').insert([
      {
        user_id: residentId,
        admin_id: user.id,
        status: status,
        notes: adminNotes
      }
    ])

    // 3. Cleanup and Refresh
    const newNotes = { ...notes }
    delete newNotes[residentId]
    setNotes(newNotes)
    
    fetchData() 
  }

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto space-y-6 pb-10">
        
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resident Verification</h1>
            <p className="text-gray-500 mt-1">Review and approve new resident accounts.</p>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ClipboardCheck className="w-4 h-4" /> Pending ({pendingUsers.length})
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <History className="w-4 h-4" /> Verification History
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-8 text-gray-500">Loading data...</div>
        ) : activeTab === 'pending' ? (
          
          /* --- PENDING TAB --- */
          pendingUsers.length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900">All caught up!</h2>
              <p className="text-gray-500 mt-1">There are no pending resident verifications at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingUsers.map((user) => (
                <div key={user.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  {/* Profile Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-bold">
                        {user.fullname ? user.fullname.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{user.fullname || 'Name not provided'}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-2 mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p><span className="font-semibold text-gray-800">Address:</span> {user.address || 'N/A'}</p>
                    <p><span className="font-semibold text-gray-800">Birthday:</span> {user.birthday || 'N/A'}</p>
                  </div>

                  {/* Interactive Checklist */}
                  <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Verification Checklist</span>
                      <span className="text-xs font-medium text-gray-500">{Object.values(checklists[user.id] || {}).filter(Boolean).length}/4 Completed</span>
                    </div>
                    <div className="p-3 space-y-2">
                      {[
                        { id: 'recordMatch', label: 'Resident Record Match' },
                        { id: 'householdFound', label: 'Household Record Found' },
                        { id: 'idUploaded', label: 'Valid ID Uploaded' },
                        { id: 'noDuplicate', label: 'No Duplicate Record' },
                      ].map((item) => (
                        <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={checklists[user.id]?.[item.id] || false}
                            onChange={() => handleChecklistToggle(user.id, item.id)}
                            className="w-4 h-4 text-[#0A3A2A] rounded border-gray-300 focus:ring-[#0A3A2A]"
                          />
                          <span className="text-sm text-gray-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                    {/* View ID Button */}
                    <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                      <button 
                        onClick={() => setViewingIdUrl(user.id_url || 'https://via.placeholder.com/600x400?text=No+ID+Uploaded')}
                        className="w-full flex items-center justify-center gap-2 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" /> View Uploaded ID
                      </button>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div className="mb-4 flex-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Admin Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Reason for approval/rejection..."
                      value={notes[user.id] || ''}
                      onChange={(e) => setNotes({ ...notes, [user.id]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#0A3A2A]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => handleVerification(user.id, 'Verified')}
                      disabled={!isChecklistComplete(user.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button 
                      onClick={() => handleVerification(user.id, 'Rejected')}
                      className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )

        ) : (

          /* --- HISTORY TAB --- */
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                  <th className="p-4 font-semibold">Resident</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Date Verified</th>
                  <th className="p-4 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {historyLogs.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No verification history found.</td></tr>
                ) : (
                  historyLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">
                        {log.profiles?.fullname || 'Unknown User'}
                        <div className="text-xs text-gray-500 font-normal">{log.profiles?.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          log.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {log.status === 'Verified' ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(log.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm text-gray-600 max-w-xs truncate">
                        {log.notes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* --- VIEW ID LIGHTBOX MODAL --- */}
        {viewingIdUrl && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="relative max-w-3xl w-full bg-white rounded-xl overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" /> Uploaded Valid ID
                </h3>
                <button onClick={() => setViewingIdUrl(null)} className="text-gray-500 hover:text-gray-800 p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-4 bg-gray-100 flex justify-center items-center min-h-[300px]">
                {/* If you are using Supabase Storage, you might need to use getPublicUrl() before passing to img src */}
                <img 
                  src={viewingIdUrl} 
                  alt="Uploaded ID" 
                  className="max-h-[70vh] object-contain rounded"
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                  }}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminGuard>
  )
}