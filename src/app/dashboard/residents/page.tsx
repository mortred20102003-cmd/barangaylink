'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AdminGuard from '@/components/AdminGuard'
import { 
  Search, UserPlus, Eye, X, FileText, 
  CheckCircle2, XCircle, Clock, Phone, MapPin, 
  Home, Upload, User, ShieldCheck
} from 'lucide-react'

export default function ResidentsPage() {
  const [residents, setResidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [viewingResident, setViewingResident] = useState<any | null>(null)
  const [residentRequests, setResidentRequests] = useState<any[]>([])
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    contact: '',
    birthday: '',
    sex: '',
    civil_status: '',
    address: '',
    purok: 'Purok 1',
    category: 'Regular Resident',
    household_number: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    emergency_contact_relationship: '',
    valid_id_uploaded: false,
    verification_status: 'Pending'
  })

  useEffect(() => { fetchResidents() }, [])

  const fetchResidents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'resident')
      .order('fullname', { ascending: true })
    if (data) setResidents(data)
    setLoading(false)
  }

  const handleViewResident = async (resident: any) => {
    setViewingResident(resident)
    // Fetch requests for this resident
    const { data } = await supabase
      .from('document_requests')
      .select('*')
      .eq('user_id', resident.id)
      .order('date_requested', { ascending: false })
    if (data) setResidentRequests(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // For demo purposes, we bypass auth and insert directly into profiles
    // In production, you'd use supabase.auth.admin.createUser()
    const fakeId = crypto.randomUUID()
    
    const { error } = await supabase.from('profiles').insert({
      id: fakeId,
      email: formData.email,
      fullname: formData.fullname,
      contact: formData.contact,
      birthday: formData.birthday,
      sex: formData.sex,
      civil_status: formData.civil_status,
      address: formData.address,
      purok: formData.purok,
      category: formData.category,
      household_number: formData.household_number,
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_number: formData.emergency_contact_number,
      emergency_contact_relationship: formData.emergency_contact_relationship,
      valid_id_uploaded: formData.valid_id_uploaded,
      verification_status: 'Verified', // Admin-created records are auto-verified
      role: 'resident'
    })

    if (error) {
      alert("Error: " + error.message)
    } else {
      setIsAdding(false)
      setFormData({
        fullname: '', email: '', contact: '', birthday: '', sex: '', civil_status: '',
        address: '', purok: 'Purok 1', category: 'Regular Resident', household_number: '',
        emergency_contact_name: '', emergency_contact_number: '', emergency_contact_relationship: '',
        valid_id_uploaded: false, verification_status: 'Pending'
      })
      fetchResidents()
    }
  }

  const filtered = residents.filter(r =>
    r.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="p-8 text-center">Loading residents...</div>

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Residents</h1>
            <p className="text-gray-500 mt-1">Manage resident records and household assignments.</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-[#0A3A2A] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#155A43]">
            <UserPlus className="w-4 h-4" /> Add New Resident
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search residents by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Purok</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Household</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-sm text-gray-900">{r.fullname || 'Unnamed'}</p>
                      <p className="text-xs text-gray-500">{r.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{r.purok || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{r.category || 'Regular'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-700">{r.household_number || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        r.verification_status === 'Verified' ? 'bg-green-100 text-green-700' :
                        r.verification_status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {r.verification_status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleViewResident(r)} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-[#0A3A2A] bg-[#E8F5F1] border border-[#0A3A2A]/20 rounded-lg hover:bg-[#d0ebe1]">
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD RESIDENT MODAL */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Resident</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Full Name *</label>
                  <input type="text" required value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Email *</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Contact Number *</label>
                  <input type="tel" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Birthday</label>
                  <input type="date" value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Sex</label>
                  <select value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                    <option value="">Select...</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Civil Status</label>
                  <select value={formData.civil_status} onChange={e => setFormData({...formData, civil_status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                    <option value="">Select...</option>
                    <option>Single</option>
                    <option>Married</option>
                    <option>Widowed</option>
                    <option>Separated</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-1">Address</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Purok / Zone</label>
                  <select value={formData.purok} onChange={e => setFormData({...formData, purok: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                    <option>Purok 1</option>
                    <option>Purok 2</option>
                    <option>Purok 3</option>
                    <option>Purok 4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Resident Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                    <option>Regular Resident</option>
                    <option>Senior Citizen</option>
                    <option>PWD</option>
                    <option>Solo Parent</option>
                    <option>Student</option>
                    <option>Business Owner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-1">Household Number</label>
                  <input type="text" placeholder="e.g. HH-001" value={formData.household_number} onChange={e => setFormData({...formData, household_number: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Name" value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                  <input type="tel" placeholder="Number" value={formData.emergency_contact_number} onChange={e => setFormData({...formData, emergency_contact_number: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                  <input type="text" placeholder="Relationship" value={formData.emergency_contact_relationship} onChange={e => setFormData({...formData, emergency_contact_relationship: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
              </div>

              {/* Upload ID */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Upload Valid ID</label>
                {formData.valid_id_uploaded ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                    <span className="text-sm font-medium text-green-800 flex items-center gap-2"><FileText className="w-4 h-4" /> ID Uploaded</span>
                    <button type="button" onClick={() => setFormData({...formData, valid_id_uploaded: false})} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div onClick={() => setFormData({...formData, valid_id_uploaded: true})} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Click to upload ID (JPG, PNG, PDF)</p>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full bg-[#0A3A2A] text-white py-2.5 rounded-lg font-bold hover:bg-[#155A43]">
                Save Resident
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RESIDENT DETAILS DRAWER */}
      {viewingResident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className="bg-white h-full w-full max-w-xl shadow-2xl overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center bg-[#0A3A2A] text-white">
              <h2 className="text-lg font-bold">Resident Details</h2>
              <button onClick={() => setViewingResident(null)}><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-[#0A3A2A] flex items-center justify-center text-xl font-bold text-[#0A3A2A]">
                  {viewingResident.fullname?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{viewingResident.fullname}</h3>
                  <p className="text-sm text-gray-500">{viewingResident.email}</p>
                  <p className="text-xs font-mono text-gray-400 mt-1">ID: {viewingResident.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <InfoField icon={<Phone className="w-3 h-3" />} label="Contact" value={viewingResident.contact} />
                <InfoField icon={<MapPin className="w-3 h-3" />} label="Address" value={viewingResident.address} />
                <InfoField icon={<Home className="w-3 h-3" />} label="Purok" value={viewingResident.purok} />
                <InfoField icon={<Home className="w-3 h-3" />} label="Household" value={viewingResident.household_number} />
                <InfoField icon={<User className="w-3 h-3" />} label="Sex" value={viewingResident.sex} />
                <InfoField icon={<User className="w-3 h-3" />} label="Civil Status" value={viewingResident.civil_status} />
                <InfoField icon={<ShieldCheck className="w-3 h-3" />} label="Category" value={viewingResident.category} />
                <InfoField icon={<ShieldCheck className="w-3 h-3" />} label="Verification" value={viewingResident.verification_status} />
              </div>

              {/* Emergency Contact */}
              {viewingResident.emergency_contact_name && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Emergency Contact</h4>
                  <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-sm">
                    <p className="font-bold text-gray-900">{viewingResident.emergency_contact_name}</p>
                    <p className="text-gray-600">{viewingResident.emergency_contact_number} • {viewingResident.emergency_contact_relationship}</p>
                  </div>
                </div>
              )}

              {/* Requests */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Recent Requests ({residentRequests.length})
                </h4>
                {residentRequests.length === 0 ? (
                  <p className="text-xs text-gray-500">No requests yet.</p>
                ) : (
                  <div className="space-y-2">
                    {residentRequests.map((req: any) => (
                      <div key={req.id} className="flex justify-between items-center p-2 border border-gray-100 rounded text-sm">
                        <div>
                          <p className="font-semibold text-gray-900">{req.document_type}</p>
                          <p className="text-xs text-gray-500">{new Date(req.date_requested).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          req.status === 'Approved' || req.status === 'Released' ? 'bg-green-100 text-green-700' :
                          req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{req.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  )
}

function InfoField({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">{icon} {label}</p>
      <p className="text-sm font-medium text-gray-900">{value || '-'}</p>
    </div>
  )
}