'use client'

import { useState, useEffect } from 'react'
import { 
  MapPin, AlertCircle, IdCard, History, CheckCircle2, 
  Upload, Lock, AlertTriangle, ShieldCheck, Home
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function ProfilePage() {
  // --- 1. ALL STATE HOOKS ---
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [requestHistory, setRequestHistory] = useState<any[]>([])
  const [completionPercent, setCompletionPercent] = useState(0)
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false)
  const [correctionField, setCorrectionField] = useState('fullname')
  const [correctionValue, setCorrectionValue] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')

  const [profile, setProfile] = useState({
    fullname: '',
    birthday: '',
    address: '',
    contact: '',
    civil_status: '',
    occupation: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    emergency_contact_relationship: '',
    valid_id_uploaded: false,
    household_id: 'HH-2026-045',
    household_head: '',
    household_members: 1,
    verification_status: 'Pending',
    verification_notes: '',
    verified_at: '',
    verified_by_name: ''
  })

  // --- 2. FETCH DATA EFFECT ---
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserEmail(user.email || '')

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      
      if (data) {
        let adminName = '';
        if (data.verified_by) {
          const { data: adminData } = await supabase
            .from('profiles')
            .select('fullname, email')
            .eq('id', data.verified_by)
            .single()
            
          if (adminData) {
            adminName = adminData.fullname || adminData.email || 'Barangay Staff';
          }
        }

        setProfile({
          fullname: data.fullname || '',
          birthday: data.birthday || '',
          address: data.address || '',
          contact: data.contact || '',
          civil_status: data.civil_status || '',
          occupation: data.occupation || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_number: data.emergency_contact_number || '',
          emergency_contact_relationship: data.emergency_contact_relationship || '',
          valid_id_uploaded: data.valid_id_uploaded || false,
          household_id: data.household_id || 'HH-2026-045',
          household_head: data.household_head || '',
          household_members: data.household_members || 1,
          verification_status: data.verification_status || 'Pending',
          verification_notes: data.verification_notes || '',
          verified_at: data.verified_at || '',
          verified_by_name: adminName,
        })

        const fields = [
          data.fullname, data.birthday, data.address, data.contact, 
          data.civil_status, data.occupation, data.emergency_contact_name, 
          data.emergency_contact_number, data.valid_id_uploaded
        ]
        const filledFields = fields.filter(f => f !== null && f !== '' && f !== false).length
        setCompletionPercent(Math.round((filledFields / fields.length) * 100))
      }

      const { data: requests } = await supabase
        .from('document_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('date_requested', { ascending: false })
        .limit(3)
      
      if (requests) setRequestHistory(requests)

      setLoading(false)
    }
    fetchData()
  }, [])

  // --- 3. HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          address: profile.address,
          contact: profile.contact,
          civil_status: profile.civil_status,
          occupation: profile.occupation,
          emergency_contact_name: profile.emergency_contact_name,
          emergency_contact_number: profile.emergency_contact_number,
          emergency_contact_relationship: profile.emergency_contact_relationship,
          household_head: profile.household_head,
          household_members: profile.household_members
        })
        .eq('id', user.id)

      if (error) {
        alert("Error updating profile: " + error.message)
      } else {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    }
    setSaving(false)
  }

  const simulateUploadID = async () => {
    alert("Valid ID uploaded successfully! (Simulation)")
    setProfile({ ...profile, valid_id_uploaded: true })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ valid_id_uploaded: true }).eq('id', user.id)
    }
    setCompletionPercent(prev => Math.min(prev + 15, 100))
  }

  const submitCorrection = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('correction_requests').insert([
      { 
        user_id: user.id, 
        field_name: correctionField, 
        requested_value: correctionValue, 
        reason: correctionReason 
      }
    ])

    if (error) {
      alert("Error submitting request: " + error.message)
    } else {
      alert("Correction request submitted to Barangay Staff for review.")
      setIsCorrectionModalOpen(false)
      setCorrectionValue('')
      setCorrectionReason('')
    }
  }

  // --- 4. RENDER ---
  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>

  const residentId = `RES-2026-001`

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Profile Completion Indicator */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Profile Completeness</h2>
            <p className="text-sm text-gray-500">Complete your profile to avoid delays in document requests.</p>
          </div>
          <span className="text-2xl font-bold text-[#0A3A2A]">{completionPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${completionPercent === 100 ? 'bg-green-500' : 'bg-[#0A3A2A]'}`} 
            style={{ width: `${completionPercent}%` }}
          ></div>
        </div>
        {completionPercent < 100 && (
          <p className="text-xs text-orange-500 font-medium mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Missing some information. Please complete your profile.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Resident Information Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-[#E8F5F1] text-[#0A3A2A] rounded-full flex items-center justify-center text-xl font-bold border border-[#0A3A2A]">
                {profile.fullname ? profile.fullname.charAt(0).toUpperCase() : 'R'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Resident Information</h2>
                <p className="text-sm text-gray-500">
                  ID: {residentId} • Status: 
                  {profile.verification_status === 'Verified' && <span className="text-green-600 font-semibold ml-1">Verified Resident</span>}
                  {profile.verification_status === 'Pending' && <span className="text-yellow-600 font-semibold ml-1">Pending Verification</span>}
                  {profile.verification_status === 'Rejected' && <span className="text-red-600 font-semibold ml-1">Verification Failed</span>}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-gray-400" /> Full Name
                  </label>
                  <input type="text" value={profile.fullname} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-gray-400" /> Date of Birth
                  </label>
                  <input type="text" value={profile.birthday} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
                </div>
              </div>
              
             <div className="bg-orange-50 p-2 rounded text-xs text-orange-600 flex justify-between items-center">
                <span>Need to update your name or birth date?</span>
                <button type="button" onClick={() => setIsCorrectionModalOpen(true)} className="font-bold underline">
                  Submit Correction Request
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                  <input type="text" name="address" value={profile.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                  <input type="text" name="contact" value={profile.contact} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Civil Status</label>
                  <select name="civil_status" value={profile.civil_status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A]">
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Occupation</label>
                  <input type="text" name="occupation" value={profile.occupation} onChange={handleChange} placeholder="e.g. Student, Teacher, Fisherman" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A]" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={saving} className="bg-[#0A3A2A] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#155A43] transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Household Information */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-[#0A3A2A]" /> Household Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Household ID</label>
                <input type="text" value={profile.household_id} disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Head of Household</label>
                <input type="text" name="household_head" value={profile.household_head} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Total Members</label>
                <input type="number" name="household_members" value={profile.household_members} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Account Information */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#0A3A2A]" /> Account Info
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Email Address</label>
                <p className="text-sm font-medium text-gray-900">{userEmail}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Account Status</label>
                <span className="inline-block mt-1 bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-md border border-green-200">
                  {profile.verification_status}
                </span>
              </div>
              <button onClick={() => alert("Password reset link sent to email!")} className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                Change Password
              </button>
            </div>
          </div>

          {/* Valid ID */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <IdCard className="w-5 h-5 text-[#0A3A2A]" /> Valid ID
            </h2>
            {profile.valid_id_uploaded ? (
              <div className="bg-[#E8F5F1] border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-[#0A3A2A]">ID Uploaded</p>
                <p className="text-xs text-[#155A43] mt-1">Your identity is verified.</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={simulateUploadID}>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-700">Upload ID</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF</p>
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> Emergency Contact
            </h2>
            <div className="space-y-3">
              <input type="text" name="emergency_contact_name" placeholder="Contact Person" value={profile.emergency_contact_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900" />
              <input type="text" name="emergency_contact_number" placeholder="Contact Number" value={profile.emergency_contact_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900" />
              <input type="text" name="emergency_contact_relationship" placeholder="Relationship (e.g. Spouse)" value={profile.emergency_contact_relationship} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900" />
            </div>
          </div>

          {/* Verification Audit Trail */}
          {profile.verification_status === 'Verified' && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" /> Verification Info
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Verified By</p>
                  <p className="font-medium text-gray-900">{profile.verified_by_name || 'Barangay Staff'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Date Verified</p>
                  <p className="font-medium text-gray-900">
                    {profile.verified_at ? new Date(profile.verified_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Notes</p>
                  <p className="text-gray-700 italic bg-gray-50 p-2 rounded border border-gray-100">
                    "{profile.verification_notes || 'No notes provided.'}"
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Request History */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-[#0A3A2A]" /> Recent Transactions
        </h2>
        {requestHistory.length === 0 ? (
          <p className="text-sm text-gray-500">No previous transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                  <th className="py-3 font-semibold">Document</th>
                  <th className="py-3 font-semibold">Date</th>
                  <th className="py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {requestHistory.map((req) => (
                  <tr key={req.id} className="border-b border-gray-100 last:border-0 text-sm">
                    <td className="py-3 font-medium text-gray-900">{req.document_type}</td>
                    <td className="py-3 text-gray-500">{new Date(req.date_requested).toLocaleDateString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        req.status === 'Ready for Pickup' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Correction Request Modal */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative">
            <button onClick={() => setIsCorrectionModalOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              ✕
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Submit Correction Request</h2>
            <form onSubmit={submitCorrection} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Field to Update</label>
                <select value={correctionField} onChange={(e) => setCorrectionField(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A]">
                  <option value="fullname">Full Name</option>
                  <option value="birthday">Date of Birth</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Requested Value</label>
                <input type="text" value={correctionValue} onChange={(e) => setCorrectionValue(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Change</label>
                <textarea value={correctionReason} onChange={(e) => setCorrectionReason(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A]" />
              </div>
              <button type="submit" className="w-full bg-[#0A3A2A] text-white py-2 rounded-lg font-semibold hover:bg-[#155A43] transition-colors">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}