'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, FileText } from 'lucide-react'
import { supabase } from '../../../lib/supabase' // FIXED: 3 dots instead of 4

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('document_requests')
        .select('*')
        .order('date_requested', { ascending: false })

      if (!error && data) {
        setRequests(data)
        if (data.length > 0) setSelectedRequest(data[0])
      }
      setLoading(false)
    }
    fetchRequests()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700'
      case 'Pending': return 'bg-yellow-100 text-yellow-700'
      case 'Ready for Pickup': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getProgress = (status: string) => {
    if (status === 'Pending') return 25
    if (status === 'Approved') return 75
    if (status === 'Released') return 100
    return 25
  }

  if (loading) return <div className="p-8 text-center">Loading requests...</div>
  if (requests.length === 0) return <div className="p-8 text-center text-gray-500">No requests found. Go request a document first!</div>

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
        <p className="text-gray-500 mt-1">Track the status of your document requests.</p>
      </div>

      {selectedRequest && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-[#0A3A2A]" />
              Request {selectedRequest.id.slice(0, 4).toUpperCase()} · {selectedRequest.document_type}
            </h2>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getStatusColor(selectedRequest.status)}`}>
              {selectedRequest.status}
            </span>
          </div>

          <div className="relative mb-8">
            <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-200">
              <div 
                style={{ width: `${getProgress(selectedRequest.status)}%` }} 
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#0A3A2A] transition-all duration-500"
              ></div>
            </div>
            
            <div className="flex justify-between text-sm font-semibold text-gray-500">
              {['Submitted', 'Under Review', 'Approved', 'Released'].map((step, index) => {
                const stepPercent = (index / 3) * 100
                const isActive = getProgress(selectedRequest.status) >= stepPercent
                return (
                  <span key={step} className={isActive ? 'text-[#0A3A2A]' : ''}>
                    {step}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <th className="p-4 font-semibold">Request ID</th>
              <th className="p-4 font-semibold">Document</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-900">{req.id.slice(0, 4).toUpperCase()}</td>
                <td className="p-4 text-gray-700">{req.document_type}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>
                    {req.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => setSelectedRequest(req)}
                    className="inline-flex items-center gap-1 border border-[#0A3A2A] text-[#0A3A2A] px-4 py-1.5 rounded-lg font-semibold hover:bg-[#E8F5F1] transition-colors"
                  >
                    View progress <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}