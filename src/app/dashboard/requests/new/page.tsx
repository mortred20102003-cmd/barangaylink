'use client'

import { useState } from 'react'
import { WifiOff, RefreshCw, CheckCircle2, FileText, Info, Save, Clock } from 'lucide-react'
import { supabase } from '../../../../lib/supabase' 

export default function NewRequestPage() {
  const [isOffline, setIsOffline] = useState(true) 
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const [documentType, setDocumentType] = useState('Barangay Clearance')
  const [purpose, setPurpose] = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('document_requests')
      .insert([
        { 
          document_type: documentType, 
          purpose: purpose,
          status: 'Pending'
        }
      ])

    setLoading(false)

    if (error) {
      alert("Error saving request: " + error.message)
    } else {
      setShowSuccess(true)
      setPurpose('') 
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setIsOffline(false)
    }, 2000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      <div className="bg-[#FFF3CD] border border-[#FFE69C] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <WifiOff className="text-orange-500 w-6 h-6 shrink-0" />
          <div>
            <p className="font-bold text-orange-800">You are currently offline</p>
            <p className="text-sm text-orange-700">You can still encode and save data. The changes will sync automatically once your internet connection is back.</p>
          </div>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 border border-[#0A3A2A] text-[#0A3A2A] px-4 py-2 rounded-lg font-semibold hover:bg-[#E8F5F1] transition-colors whitespace-nowrap"
        >
          {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-[#0A3A2A]" />
              Document Request
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isOffline ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {isOffline ? 'Offline Mode' : 'Online'}
            </span>
          </div>

          {isOffline && (
            <div className="bg-[#E8F5F1] text-[#0A3A2A] p-3 rounded-lg flex items-start gap-3 mb-6 text-sm">
              <Info className="w-5 h-5 shrink-0" />
              <p>Your request will be saved locally and synced later.</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Document Type</label>
              <select 
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A3A2A]"
              >
                <option>Barangay Clearance</option>
                <option>Certificate of Residency</option>
                <option>Certificate of Indigency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Purpose</label>
              <textarea 
                rows={4}
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A3A2A]"
                placeholder="e.g. Employment, scholarship, travel"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A3A2A] text-white font-semibold py-3 rounded-lg hover:bg-[#155A43] transition-colors flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Request'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          {showSuccess && (
            <div className="bg-[#E8F5F1] border border-green-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <p className="font-bold text-[#0A3A2A]">Request Saved!</p>
                <p className="text-sm text-[#155A43]">Your request has been securely saved to the database.</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-8">
              <RefreshCw className="text-[#0A3A2A]" />
              Sync Status
            </h2>

            <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
                <p className="text-gray-500">Your data is up to date with the server.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}