'use client'

import { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle2, XCircle } from 'lucide-react'

// 1. Rename your original component to VerifyContent
function VerifyContent() {
  const params = useParams()
  const refNo = params.ref as string
  const [loading, setLoading] = useState(true)
  const [request, setRequest] = useState<any>(null)

  useEffect(() => {
    const verify = async () => {
      const { data } = await supabase
        .from('document_requests')
        .select('*, profiles(fullname)')
        .eq('reference_number', refNo)
        .single()
      
      if (data) setRequest(data)
      setLoading(false)
    }
    verify()
  }, [refNo])

  if (loading) return <div className="p-8 text-center">Verifying document...</div>

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
        {request && request.status === 'Released' ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Verified</h1>
            <p className="text-sm text-gray-500 mb-6">This document is authentic and was released by the barangay.</p>
            
            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Reference:</span>
                <span className="font-mono font-bold">{request.reference_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Resident:</span>
                <span className="font-bold">{request.profiles?.fullname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Document:</span>
                <span className="font-bold">{request.document_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Released:</span>
                <span className="font-bold">{new Date(request.date_processed).toLocaleDateString()}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Not Verified</h1>
            <p className="text-sm text-gray-500">
              {request ? `This document has not yet been released (Status: ${request.status}).` : 'No document found with this reference number.'}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// 2. Export the main page, wrapping VerifyContent in Suspense
export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading verification page...</div>}>
      <VerifyContent />
    </Suspense>
  )
}