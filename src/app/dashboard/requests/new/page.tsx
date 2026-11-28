'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  FileText, Upload, CheckCircle2, Clock, Info,
  ArrowLeft, X, Calendar, ShieldCheck, CreditCard, Plus, Trash2
} from 'lucide-react'

const DOCUMENT_TYPES = {
  'Barangay Clearance': {
    fee: 50,
    processingDays: 2,
    requirements: ['Valid ID', 'Verified Account'],
    description: 'For employment, business, or general purposes.'
  },
  'Certificate of Residency': {
    fee: 30,
    processingDays: 1,
    requirements: ['Valid ID', 'Verified Account'],
    description: 'Proof that you reside in this barangay.'
  },
  'Certificate of Indigency': {
    fee: 0,
    processingDays: 1,
    requirements: ['Valid ID', 'Verified Account'],
    description: 'For medical, educational, or financial assistance.'
  },
  'Business Permit': {
    fee: 500,
    processingDays: 5,
    requirements: ['Valid ID', 'DTI Registration', 'Lease Contract'],
    description: 'For operating a business within the barangay.'
  }
}

type CartItem = {
  id: string
  documentType: string
  purpose: string
}

export default function NewRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  
  const [formattedReleaseDate, setFormattedReleaseDate] = useState('Calculating...')
  
  const [cart, setCart] = useState<CartItem[]>([])
  
  const [selectedDoc, setSelectedDoc] = useState<string>('Barangay Clearance')
  const [purpose, setPurpose] = useState('')
  const [attachmentName, setAttachmentName] = useState('')
  const [notifyMethod, setNotifyMethod] = useState('email')
  const [agreed, setAgreed] = useState(false)
  
  const [showSuccess, setShowSuccess] = useState(false)
  const [generatedRefNos, setGeneratedRefNos] = useState<string[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('document_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('date_requested', { ascending: false })
        .limit(5)

      if (data) setRecentRequests(data)
      setLoading(false)
    }
    init()
  }, [])

  const docInfo = DOCUMENT_TYPES[selectedDoc as keyof typeof DOCUMENT_TYPES]

  useEffect(() => {
    const expectedDate = new Date()
    expectedDate.setDate(expectedDate.getDate() + docInfo.processingDays)
    setFormattedReleaseDate(expectedDate.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    }))
  }, [selectedDoc, docInfo.processingDays])

  const generateRefNo = () => {
    const year = new Date().getFullYear()
    const random = Math.floor(100000 + Math.random() * 900000)
    return `REF-${year}-${random}`
  }

  const handleAddToCart = () => {
    if (!purpose) {
      alert("Please enter a purpose for this document.")
      return
    }
    
    if (cart.find(item => item.documentType === selectedDoc)) {
      alert("You already added this document to your cart.")
      return
    }

    setCart([...cart, {
      id: Math.random().toString(36).substr(2, 9),
      documentType: selectedDoc,
      purpose: purpose
    }])
    
    setPurpose('')
    setAttachmentName('')
  }

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed || !userId) return
    if (cart.length === 0) {
      alert("Please add at least one document to your request.")
      return
    }
    
    setSubmitting(true)
    const newRefNos: string[] = []

    const requestsToInsert = cart.map(item => {
      const refNo = generateRefNo()
      newRefNos.push(refNo)
      return {
        user_id: userId,
        document_type: item.documentType,
        purpose: item.purpose,
        status: 'Pending',
        date_requested: new Date().toISOString(),
        reference_number: refNo,
        notify_method: notifyMethod,
        attachment_name: attachmentName || null
      }
    })

    const { error } = await supabase.from('document_requests').insert(requestsToInsert)

    if (error) {
      alert("Error: " + error.message)
    } else {
      setGeneratedRefNos(newRefNos)
      setShowSuccess(true)
      setCart([])
      setAgreed(false)

      const { data } = await supabase
        .from('document_requests')
        .select('*')
        .eq('user_id', userId)
        .order('date_requested', { ascending: false })
        .limit(5)
      if (data) setRecentRequests(data)
    }
    setSubmitting(false)
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <Link href="/dashboard/requests" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back to Requests
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Request Documents</h1>
        <p className="text-gray-500 mt-1">You can request multiple documents in one transaction.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: FORM BUILDER */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">1. Select Document & Details</h2>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Document Type</label>
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-[#0A3A2A] outline-none"
              >
                {Object.keys(DOCUMENT_TYPES).map(doc => (
                  <option key={doc} value={doc}>{doc}</option>
                ))}
              </select>
            </div>

            <div className="bg-[#E8F5F1] p-4 rounded-lg border border-[#0A3A2A]/20">
              <p className="text-sm text-[#155A43] mb-3">{docInfo.description}</p>
              <div className="flex gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0A3A2A]">
                  <CreditCard className="w-4 h-4" /> ₱{docInfo.fee}.00
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#0A3A2A]">
                  <Clock className="w-4 h-4" /> {docInfo.processingDays} Days
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {docInfo.requirements.map(req => (
                  <span key={req} className="text-xs bg-white px-2 py-1 rounded border border-green-200 text-green-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {req}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Purpose</label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. For employment, scholarship, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A] outline-none min-h-[80px]"
              />
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 py-2 rounded-lg font-bold hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add to Request List
            </button>
          </div>

          {/* SHOPPING CART / SUMMARY */}
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex justify-between items-center">
              2. Review Your Request List
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{cart.length} Items</span>
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No documents added yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{item.documentType}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Purpose: {item.purpose}</p>
                    </div>
                    <button type="button" onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Total Fee:</span>
                  <span className="font-bold text-[#0A3A2A] text-lg">
                    ₱{cart.reduce((total, item) => total + DOCUMENT_TYPES[item.documentType as keyof typeof DOCUMENT_TYPES].fee, 0)}.00
                  </span>
                </div>
              </div>
            )}

            {/* Notification & Upload */}
            <div className="pt-4 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Preferred Notification (For all)</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  {['email', 'sms', 'app'].map(method => (
                    <label 
                      key={method} 
                      className={`flex-1 flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        notifyMethod === method 
                          ? 'border-[#0A3A2A] bg-[#E8F5F1]' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="notify" 
                        value={method} 
                        checked={notifyMethod === method} 
                        onChange={() => setNotifyMethod(method)} 
                        className="w-4 h-4 accent-[#0A3A2A] cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-gray-900 capitalize">
                        {method === 'app' ? 'In-App' : method}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Supporting Document (Optional)</label>
                {attachmentName ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-2 rounded-lg text-sm">
                    <span className="text-green-800 font-medium flex items-center gap-2"><FileText className="w-4 h-4" />{attachmentName}</span>
                    <button type="button" onClick={() => setAttachmentName('')} className="text-gray-500 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div onClick={() => setAttachmentName('combined-requirements.pdf')} className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Upload className="w-4 h-4" /> Click to attach file
                  </div>
                )}
              </div>
            </div>

            {/* Date & Declaration */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-700 uppercase">Expected Release</p>
                <p className="text-sm font-bold text-gray-900">{formattedReleaseDate}</p>
                <p className="text-[10px] text-gray-500">Based on the longest processing time in your list.</p>
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${agreed ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-5 h-5" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Certification</p>
                  <p className="text-xs text-gray-600 mt-0.5">I certify that the information provided is true and correct.</p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={!agreed || submitting || cart.length === 0}
              className="w-full bg-[#0A3A2A] text-white py-3 rounded-lg font-bold hover:bg-[#155A43] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              {submitting ? 'Submitting...' : `Submit ${cart.length} Request(s)`}
            </button>
          </form>
        </div>

        {/* RIGHT: SIDEBAR */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0A3A2A]" /> Recent Requests
            </h2>
            {recentRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No requests yet.</p>
            ) : (
              <div className="space-y-3">
                {recentRequests.map(req => (
                  <div key={req.id} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-gray-900">{req.document_type}</p>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                        ${req.status === 'Approved' || req.status === 'Ready for Pickup' || req.status === 'Released' ? 'bg-green-100 text-green-700' :
                          req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'}`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(req.date_requested).toLocaleDateString()}
                      {req.reference_number && ` • ${req.reference_number}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl w-full max-w-md text-center relative">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Requests Submitted!</h2>
            <p className="text-sm text-gray-500 mb-6">Your {generatedRefNos.length} request(s) have been received.</p>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 max-h-40 overflow-y-auto space-y-2 text-left">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Reference Numbers</p>
              {generatedRefNos.map((ref, idx) => (
                <p key={idx} className="text-sm font-mono font-bold text-[#0A3A2A] bg-white p-2 rounded border border-gray-200">
                  {ref}
                </p>
              ))}
            </div>

            <button
              onClick={() => router.push('/dashboard/requests')}
              className="w-full bg-[#0A3A2A] text-white py-2 rounded-lg font-semibold hover:bg-[#155A43]"
            >
              View My Requests
            </button>
          </div>
        </div>
      )}
    </div>
  )
}