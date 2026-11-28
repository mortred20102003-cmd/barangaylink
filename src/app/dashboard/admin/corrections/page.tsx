'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AdminGuard from '@/components/AdminGuard'
import { CheckCircle2, XCircle, FileEdit, Clock } from 'lucide-react'

export default function CorrectionsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    // Fetch correction requests AND join the profile data
    // We need the actual current fullname from the profile, not just the email
    const { data, error } = await supabase
      .from('correction_requests')
      .select(`
        *,
        profiles (
          fullname,
          email
        )
      `)
      .eq('status', 'pending') // Only show pending requests
      .order('created_at', { ascending: false })

    if (!error && data) {
      setRequests(data)
    }
    setLoading(false)
  }

  const handleAction = async (requestId: string, action: 'approve' | 'reject', request: any) => {
    setProcessingId(requestId)

    if (action === 'approve') {
      // 1. Update the actual profile with the new value
      const updateData: any = {}
      updateData[request.field_name] = request.requested_value

      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', request.user_id)

      if (profileError) {
        alert("Error updating profile: " + profileError.message)
        setProcessingId(null)
        return
      }

      // 2. Mark the request as 'approved'
      await supabase
        .from('correction_requests')
        .update({ status: 'approved' })
        .eq('id', requestId)

    } else {
      // Just mark as rejected
      await supabase
        .from('correction_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
    }

    // Remove from UI immediately
    setRequests(requests.filter(r => r.id !== requestId))
    setProcessingId(null)
  }

  if (loading) return <div className="p-8 text-center">Loading requests...</div>

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Corrections</h1>
          <p className="text-gray-500 mt-1">Review requests from residents to update their locked information.</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
            <FileEdit className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No pending requests</h3>
            <p className="text-gray-500">All correction requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                
                {/* Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">{req.profiles?.fullname || req.profiles?.email}</p>
                    <p className="text-xs text-gray-500">{req.profiles?.email}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(req.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Field to Update</p>
                    <p className="text-sm font-semibold text-[#0A3A2A] uppercase">{req.field_name.replace('_', ' ')}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current Value */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                      <p className="text-xs font-bold text-red-700 uppercase mb-1">Current Value</p>
                      <p className="text-sm text-gray-900">
                        {/* Show the ACTUAL current name, not the email fallback */}
                        {req.profiles?.[req.field_name] || 'Not set'}
                      </p>
                    </div>

                    {/* Requested Value */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                      <p className="text-xs font-bold text-green-700 uppercase mb-1">Requested Value</p>
                      <p className="text-sm font-bold text-gray-900">{req.requested_value}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Resident's Reason</p>
                    <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded border border-gray-100">
                      "{req.reason || 'No reason provided.'}"
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => handleAction(req.id, 'reject', req)}
                    disabled={processingId === req.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'approve', req)}
                    disabled={processingId === req.id}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0A3A2A] rounded-lg hover:bg-[#155A43] transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Update Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  )
}