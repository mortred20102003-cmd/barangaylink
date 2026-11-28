'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, Search, User, Mail, Archive, MoreVertical, 
  CheckCircle, Clock, Home, Users, Filter, Eye, Edit, Download
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import AdminGuard from '../../../components/AdminGuard'

export default function ResidentsPage() {
  const [residents, setResidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('All Residents')

  // Form State
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')
  const [birthday, setBirthday] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Fetch residents
  const fetchResidents = async () => {
    setLoading(true)
    // We only fetch non-archived residents for the main table
    const { data, error } = await supabase
      .from('residents')
      .select('*')
      .eq('is_archived', false) // Hide archived records
      .order('created_at', { ascending: false })

    if (!error && data) {
      setResidents(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchResidents()
  }, [])

  // Add a new resident
  const handleAddResident = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Auto-generate simple ID and default status/category for demo purposes
    const generatedId = `RES-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

    const { error } = await supabase
      .from('residents')
      .insert([{ 
        fullname, email, address, contact, birthday,
        resident_id: generatedId,
        status: 'Pending',
        category: 'Resident',
        is_archived: false
      }])

    setIsSaving(false)

    if (error) {
      alert("Error adding resident: " + error.message)
    } else {
      setFullname(''); setEmail(''); setAddress(''); setContact(''); setBirthday('')
      setIsModalOpen(false)
      fetchResidents()
    }
  }

  // Archive a resident (Soft Delete)
  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive ${name}? They will no longer appear in the main list, but records will be kept.`)) return

    const { error } = await supabase
      .from('residents')
      .update({ is_archived: true })
      .eq('id', id)
    
    if (error) {
      alert("Error archiving: " + error.message)
    } else {
      fetchResidents()
    }
  }

  // --- Dynamic Statistics ---
  const stats = useMemo(() => {
    return {
      total: residents.length,
      verified: residents.filter(r => r.status === 'Verified').length,
      pending: residents.filter(r => r.status === 'Pending').length,
      households: new Set(residents.map(r => r.household_id).filter(Boolean)).size // Counts unique households
    }
  }, [residents])

  // --- Filter & Search Logic ---
  const filteredResidents = residents.filter(r => {
    // 1. Search Logic
    const matchesSearch = r.fullname.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.resident_id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 2. Filter Logic
    let matchesFilter = true
    if (activeFilter === 'Verified') matchesFilter = r.status === 'Verified'
    if (activeFilter === 'Pending Verification') matchesFilter = r.status === 'Pending'
    if (activeFilter === 'Senior Citizens') matchesFilter = r.category?.includes('Senior')
    if (activeFilter === 'PWD') matchesFilter = r.category?.includes('PWD')
    if (activeFilter === 'Indigents') matchesFilter = r.category?.includes('Indigent')

    return matchesSearch && matchesFilter
  })

  const filters = ['All Residents', 'Verified', 'Pending Verification', 'Senior Citizens', 'PWD', 'Indigents']

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto space-y-6 relative pb-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resident Management</h1>
            <p className="text-gray-500 mt-1">View and manage the residents of Barangay Lamion.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0A3A2A] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#155A43] transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Resident
          </button>
        </div>

        {/* 1. Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Residents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-lg text-green-600"><CheckCircle className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verified.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-lg text-orange-600"><Clock className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Verification</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-lg text-purple-600"><Home className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Households</p>
              <p className="text-2xl font-bold text-gray-900">{stats.households.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* 2. Search & Filters Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or Resident ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A3A2A]"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                  activeFilter === filter 
                    ? 'bg-[#0A3A2A] text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-max">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4 font-semibold">Resident ID</th>
                <th className="p-4 font-semibold">Full Name</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Household ID</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton Loader Rows
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div></td>
                    <td className="p-4"><div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div></td>
                    <td className="p-4"><div className="h-8 bg-gray-200 rounded animate-pulse w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-lg font-medium text-gray-900">No residents found</p>
                    <p>Try adjusting your search or filters, or add a new resident.</p>
                  </td>
                </tr>
              ) : (
                filteredResidents.map((resident) => (
                  <tr key={resident.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-gray-600 font-mono text-sm">{resident.resident_id || 'N/A'}</td>
                    <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {resident.fullname.charAt(0).toUpperCase()}
                      </div>
                      {resident.fullname}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        resident.status === 'Verified' ? 'bg-green-100 text-green-800' :
                        resident.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {resident.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{resident.household_id || '-'}</td>
                    <td className="p-4 text-gray-700">{resident.contact || '-'}</td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                        {resident.category || 'Resident'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {/* Dropdown Action Menu */}
                      <div className="relative inline-block text-left group/menu">
                        <button className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {/* Dropdown Content (Shows on hover for simplicity) */}
                        <div className="hidden group-hover/menu:block absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                            <Eye className="w-4 h-4" /> View Profile
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                            <Edit className="w-4 h-4" /> Edit Details
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                            <Download className="w-4 h-4" /> Generate ID
                          </button>
                          <div className="border-t border-gray-100 my-1"></div>
                          <button 
                            onClick={() => handleArchive(resident.id, resident.fullname)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Archive className="w-4 h-4" /> Archive
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Resident Modal (Unchanged logic, just kept here) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="text-[#0A3A2A]" /> Add New Resident
              </h2>
              
              <form onSubmit={handleAddResident} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" required
                    value={fullname} onChange={(e) => setFullname(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A]"
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input 
                      type="email"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A]"
                      placeholder="juan@gmail.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                  <input 
                    type="text"
                    value={address} onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A]"
                    placeholder="Purok 1, Barangay Lamion"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Contact</label>
                    <input 
                      type="text"
                      value={contact} onChange={(e) => setContact(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A]"
                      placeholder="09XX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Birthday</label>
                    <input 
                      type="date"
                      value={birthday} onChange={(e) => setBirthday(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button 
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" disabled={isSaving}
                    className="bg-[#0A3A2A] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#155A43] disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Resident'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminGuard>
  )
}