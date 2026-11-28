'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AdminGuard from '@/components/AdminGuard'
import { 
  Search, Eye, CheckCircle2, XCircle, Package, 
  Send, X, Clock, User, FileText, AlertCircle
} from 'lucide-react'

export default function ProcessingPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [remarks, setRemarks] = useState('')
  const [processingAction, setProcessingAction] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    // 1. Fetch ALL requests first
    const { data: requestsData, error: reqError } = await supabase
      .from('document_requests')
      .select('*')
      .order('date_requested', { ascending: false })

    if (reqError) {
      console.error("Error fetching requests:", reqError)
      setLoading(false)
      return
    }

    // 2. Fetch all profiles to map names manually (bypasses join errors)
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, fullname, email, contact')

    // 3. Merge them together in JS
    if (requestsData) {
      const merged = requestsData.map(req => {
        const profile = profilesData?.find(p => p.id === req.user_id)
        return {
          ...req,
          profiles: profile || { fullname: 'Unknown Resident', email: req.user_id, contact: 'N/A' }
        }
      })
      setRequests(merged)
    }
    
    setLoading(false)
  }

  const openModal = (request: any) => {
    setSelectedRequest(request)
    setRemarks(request.remarks || '')
    setIsModalOpen(true)
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedRequest) return
    if ((newStatus === 'Rejected' || newStatus === 'Approved') && !remarks) {
      alert("Please provide remarks for this action.")
      return
    }

    setProcessingAction(true)

    const { data: { user } } = await supabase.auth.getUser()
    let adminName = user?.email || 'Barangay Staff'
    if (user?.email === 'mchaeldeleon@gmail.com') adminName = 'Barangay Captain'

    const { error } = await supabase
      .from('document_requests')
      .update({
        status: newStatus,
        remarks: remarks || null,
        processed_by: adminName,
        date_processed: new Date().toISOString()
      })
      .eq('id', selectedRequest.id)

    if (error) {
      alert("Error updating status: " + error.message)
    } else {
      // Update UI without refetching
      setRequests(requests.map(r => 
        r.id === selectedRequest.id 
          ? { ...r, status: newStatus, remarks, processed_by: adminName, date_processed: new Date().toISOString() } 
          : r
      ))
      setIsModalOpen(false)
    }
    setProcessingAction(false)
  }

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.profiles?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'All' || req.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Approved': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Ready for Pickup': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Released': return 'bg-green-100 text-green-700 border-green-200'
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) return <div className="p-8 text-center">Loading requests...</div>

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Processing</h1>
          <p className="text-gray-500 mt-1">Review, approve, and release resident document requests.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Reference No, Name, or Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A3A2A] outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#0A3A2A]"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="Released">Released</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold">Ref No / Date</th>
                  <th className="px-6 py-4 font-semibold">Resident</th>
                  <th className="px-6 py-4 font-semibold">Document</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No requests found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-mono font-bold text-gray-900">{req.reference_number || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{new Date(req.date_requested).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{req.profiles?.fullname || 'Unknown Resident'}</p>
                        <p className="text-xs text-gray-500">{req.profiles?.email}</p>
                        {req.profiles?.contact && (
                          <p className="text-xs text-gray-500">{req.profiles.contact}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{req.document_type}</p>
                        <p className="text-xs text-gray-500 italic">"{req.purpose}"</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openModal(req)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-[#0A3A2A] bg-[#E8F5F1] border border-[#0A3A2A]/20 rounded-lg hover:bg-[#d0ebe1] transition-colors"
                        >
                          <Eye className="w-4 h-4" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-[#0A3A2A] p-4 flex justify-between items-center text-white">
              <div>
                <h2 className="text-lg font-bold">Request Details</h2>
                <p className="text-xs text-green-200 font-mono">{selectedRequest.reference_number}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><User className="w-3 h-3" /> Resident Name</p>
                  <p className="text-sm font-bold text-gray-900">{selectedRequest.profiles?.fullname || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><FileText className="w-3 h-3" /> Contact No.</p>
                  <p className="text-sm text-gray-900">{selectedRequest.profiles?.contact || 'Not provided'}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Document Requested</p>
                    <p className="text-base font-bold text-[#0A3A2A]">{selectedRequest.document_type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Purpose</p>
                  <p className="text-sm text-gray-900 italic">"{selectedRequest.purpose}"</p>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Requested: {new Date(selectedRequest.date_requested).toLocaleDateString()}</span>
                  {selectedRequest.attachment_name && (
                    <span className="flex items-center gap-1 text-blue-600"><FileText className="w-3 h-3" />{selectedRequest.attachment_name}</span>
                  )}
                </div>
              </div>

              {selectedRequest.processed_by && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex justify-between items-center text-sm">
                  <div>
                    <p className="text-xs font-bold text-blue-700 uppercase">Processed By</p>
                    <p className="font-semibold text-blue-900">{selectedRequest.processed_by}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-blue-700 uppercase">Date Processed</p>
                    <p className="font-semibold text-blue-900">{new Date(selectedRequest.date_processed).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-500" /> Remarks / Rejection Reason
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Approved after validation / Missing valid ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#0A3A2A] outline-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2 justify-end">
              {selectedRequest.status === 'Pending' && (
                <>
                  <button onClick={() => handleUpdateStatus('Rejected')} disabled={processingAction} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => handleUpdateStatus('Approved')} disabled={processingAction} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    <CheckCircle2 className="w-4 h-4" /> Approve Request
                  </button>
                </>
              )}

              {selectedRequest.status === 'Approved' && (
                <button onClick={() => handleUpdateStatus('Ready for Pickup')} disabled={processingAction} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700">
                  <Package className="w-4 h-4" /> Mark Ready for Pickup
                </button>
              )}

              {selectedRequest.status === 'Ready for Pickup' && (
                <button onClick={() => handleUpdateStatus('Released')} disabled={processingAction} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-white bg-[#0A3A2A] rounded-lg hover:bg-[#155A43]">
                  <Send className="w-4 h-4" /> Release to Resident
                </button>
              )}

              {(selectedRequest.status === 'Released' || selectedRequest.status === 'Rejected') && (
                <p className="text-sm text-gray-500 italic py-2">This request is already completed.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  )
}