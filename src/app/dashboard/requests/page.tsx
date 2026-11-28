'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { FileText, Plus, CheckCircle2, XCircle, MessageSquare } from 'lucide-react'
import QRCode from 'react-qr-code'

const WORKFLOW_STEPS = ['Pending', 'Approved', 'Ready for Pickup', 'Released']

export default function RequestsListPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)

    const fetchRequests = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('document_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('date_requested', { ascending: false })

      if (data) setRequests(data)
      setLoading(false)
    }
    fetchRequests()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-500 mt-1">Track your document requests.</p>
        </div>
        <Link
          href="/dashboard/requests/new"
          className="flex items-center gap-2 bg-[#0A3A2A] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#155A43]"
        >
          <Plus className="w-4 h-4" /> New Request
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No requests yet</h3>
          <p className="text-gray-500 mb-4">Start by requesting a document.</p>
          <Link href="/dashboard/requests/new" className="inline-flex items-center gap-2 bg-[#0A3A2A] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#155A43]">
            <Plus className="w-4 h-4" /> Request Document
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const currentStep = WORKFLOW_STEPS.indexOf(req.status)
            const isRejected = req.status === 'Rejected'
            const refNo = req.reference_number || `REF-2026-${req.id.slice(0, 6).toUpperCase()}`

            return (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 flex justify-between items-start border-b border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900">{req.document_type}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ref: <span className="font-mono font-semibold">{refNo}</span> • {new Date(req.date_requested).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                    ${isRejected ? 'bg-red-100 text-red-700' :
                      req.status === 'Released' ? 'bg-green-100 text-green-700' :
                      req.status === 'Ready for Pickup' ? 'bg-purple-100 text-purple-700' :
                      req.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'}`}>
                    {req.status}
                  </span>
                </div>

                {isRejected && req.remarks && (
                  <div className="bg-red-50 p-3 border-b border-red-100 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-red-800 uppercase">Reason for Rejection</p>
                      <p className="text-sm text-red-700">{req.remarks}</p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    {WORKFLOW_STEPS.map((step, idx) => {
                      const isDone = idx <= currentStep
                      const isCurrent = idx === currentStep
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold
                              ${isDone ? 'bg-[#0A3A2A] border-[#0A3A2A] text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className={`mt-1 text-[10px] font-semibold text-center
                              ${isCurrent ? 'text-[#0A3A2A]' : isDone ? 'text-gray-700' : 'text-gray-400'}`}>
                              {step}
                            </span>
                          </div>
                          {idx < WORKFLOW_STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-1 -mt-5 ${idx < currentStep ? 'bg-[#0A3A2A]' : 'bg-gray-300'}`} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* QR + Chat section - appears when released */}
                {req.status === 'Released' && (
                  <div className="p-4 bg-[#E8F5F1] border-t border-green-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 border border-gray-200 rounded">
                        <QRCode value={`${origin}/verify/${refNo}`} size={72} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0A3A2A]">Document Released</p>
                        <p className="text-xs text-[#155A43]">Scan to verify authenticity</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard/messages"
                      className="flex items-center gap-2 bg-white border border-[#0A3A2A]/20 text-[#0A3A2A] px-3 py-2 rounded-lg text-sm font-semibold hover:bg-white/80"
                    >
                      <MessageSquare className="w-4 h-4" /> Chat with Staff
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}