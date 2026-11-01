'use client'

import { useState, useEffect } from 'react'
import { FileText, CheckCircle, Clock, Package, Printer } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { jsPDF } from 'jspdf'
import AdminGuard from '../../../components/AdminGuard' // Added the Guard

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAllRequests = async () => {
    const { data, error } = await supabase
      .from('document_requests')
      .select('*')
      .order('date_requested', { ascending: false })

    if (!error && data) {
      setRequests(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAllRequests()
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('document_requests')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert("Error updating: " + error.message)
    } else {
      fetchAllRequests()
    }
  }

  const generatePDF = (req: any) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(10)
    doc.text("Republic of the Philippines", 105, 15, { align: "center" })
    doc.text("Province of Tawi-Tawi", 105, 20, { align: "center" })
    doc.text("Municipality of Bongao", 105, 25, { align: "center" })
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("BARANGAY LAMION", 105, 32, { align: "center" })
    doc.text("OFFICE OF THE PUNONG BARANGAY", 105, 38, { align: "center" })
    
    // Title
    doc.setFontSize(18)
    doc.text("BARANGAY CLEARANCE", 105, 60, { align: "center" })
    
    // Body
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    
    const bodyText = `TO WHOM IT MAY CONCERN:\n\nThis is to certify that JUAN DELA CRUZ, a bonafide resident of Barangay Lamion, Bongao, Tawi-Tawi, is known to be of good moral character and has no derogatory record filed in this office.\n\nThis clearance is issued upon the request of the above-named person in connection with his/her purpose: "${req.purpose || 'General Purpose'}".\n\nIssued this ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at Barangay Lamion, Bongao, Tawi-Tawi.`
    
    const splitText = doc.splitTextToSize(bodyText, 160)
    doc.text(splitText, 25, 75, { lineHeightFactor: 1.5 })
    
    // Footer
    doc.setFont("helvetica", "bold")
    doc.text("HON. BARANGAY CAPTAIN", 140, 150, { align: "center" })
    doc.setFont("helvetica", "normal")
    doc.text("Punong Barangay", 140, 155, { align: "center" })
    
    // Reference
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Reference No: ${req.id.slice(0, 8).toUpperCase()}`, 105, 190, { align: "center" })
    doc.text(`Document Type: ${req.document_type}`, 105, 195, { align: "center" })
    
    doc.save(`Clearance_${req.id.slice(0, 4)}.pdf`)
  }

  if (loading) return <div className="p-8 text-center">Loading all requests...</div>

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage and approve resident document requests.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4 font-semibold">Request ID</th>
                <th className="p-4 font-semibold">Document Type</th>
                <th className="p-4 font-semibold">Purpose</th>
                <th className="p-4 font-semibold">Current Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No requests in the system yet.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-bold text-gray-900">{req.id.slice(0, 4).toUpperCase()}</td>
                    <td className="p-4 text-gray-700">{req.document_type}</td>
                    <td className="p-4 text-gray-500">{req.purpose || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        req.status === 'Ready for Pickup' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => generatePDF(req)}
                        className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-900 transition-colors"
                        title="Download PDF Clearance"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => updateStatus(req.id, 'Approved')}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateStatus(req.id, 'Ready for Pickup')}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                        title="Mark Ready for Pickup"
                      >
                        <Package className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </AdminGuard>
  )
}