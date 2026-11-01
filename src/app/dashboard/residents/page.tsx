'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, User } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function ResidentsPage() {
  const [residents, setResidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Form State
  const [fullname, setFullname] = useState('')
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')
  const [birthday, setBirthday] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Fetch residents
  const fetchResidents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('residents')
      .select('*')
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

    const { error } = await supabase
      .from('residents')
      .insert([{ fullname, address, contact, birthday }])

    setIsSaving(false)

    if (error) {
      alert("Error adding resident: " + error.message)
    } else {
      // Clear form, close modal, and refresh list
      setFullname('')
      setAddress('')
      setContact('')
      setBirthday('')
      setIsModalOpen(false)
      fetchResidents()
    }
  }

  // Delete a resident
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resident?")) return

    const { error } = await supabase.from('residents').delete().eq('id', id)
    
    if (error) {
      alert("Error deleting: " + error.message)
    } else {
      fetchResidents()
    }
  }

  // Filter residents based on search
  const filteredResidents = residents.filter(r => 
    r.fullname.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resident Management</h1>
          <p className="text-gray-500 mt-1">View and manage the residents of Barangay Lamion.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#0A3A2A] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#155A43] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Resident
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by full name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A3A2A] shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <th className="p-4 font-semibold">Full Name</th>
              <th className="p-4 font-semibold">Address</th>
              <th className="p-4 font-semibold">Contact</th>
              <th className="p-4 font-semibold">Birthday</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading residents...</td></tr>
            ) : filteredResidents.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No residents found. Click "Add Resident" to start.</td></tr>
            ) : (
              filteredResidents.map((resident) => (
                <tr key={resident.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                      {resident.fullname.charAt(0).toUpperCase()}
                    </div>
                    {resident.fullname}
                  </td>
                  <td className="p-4 text-gray-700">{resident.address || '-'}</td>
                  <td className="p-4 text-gray-700">{resident.contact || '-'}</td>
                  <td className="p-4 text-gray-700">{resident.birthday || '-'}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(resident.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete Resident"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Resident Modal */}
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
  )
}