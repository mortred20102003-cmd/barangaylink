'use client'

import { User, MapPin, Phone, Calendar, Home } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resident Profile</h1>
        <p className="text-gray-500 mt-1">Keep your details current so documents are issued correctly.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        
        {/* Avatar Section */}
        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100">
          <div className="w-20 h-20 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-2xl font-bold">
            JD
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Juan Dela Cruz</h2>
            <p className="text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" /> Resident · Barangay Lamion
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <form className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                defaultValue="Juan Dela Cruz"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A3A2A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                defaultValue="Purok / Street, Barangay Lamion, Bongao, Tawi-Tawi"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A3A2A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="09XX XXX XXXX"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A3A2A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="date" 
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A3A2A]"
                />
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Household Number</label>
            <div className="relative">
              <Home className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="e.g. HH-0000"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A3A2A]"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="button"
              className="bg-[#0A3A2A] text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-[#155A43] transition-colors"
            >
              Update Profile
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}