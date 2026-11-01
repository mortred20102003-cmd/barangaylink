import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, Juan Dela Cruz</h1>
        <p className="text-gray-500 mt-1">Here is an overview of your barangay requests.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active Requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Approved Documents</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending Requests</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">1</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Notifications</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
        </div>
      </div>

      {/* Bottom Section: Notifications & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Recent Notifications */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent notifications</h2>
            <span className="text-sm font-semibold text-[#0A3A2A]">5 new</span>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
              <div>
                <p className="font-semibold text-gray-900">Certificate of Indigency is ready for pickup</p>
                <p className="text-sm text-gray-500">Request 003 · Bring a valid ID to the barangay hall</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
              <div>
                <p className="font-semibold text-gray-900">Barangay Clearance approved</p>
                <p className="text-sm text-gray-500">Request 001</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1.5 shrink-0"></div>
              <div>
                <p className="font-semibold text-gray-900">Certificate of Residency is being processed</p>
                <p className="text-sm text-gray-500">Request 002 · Staff are reviewing your documents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick actions</h2>
          <div className="space-y-4">
            
            {/* This is now a Link! */}
            <Link href="/dashboard/requests/new" className="w-full text-left bg-[#E8F5F1] hover:bg-[#D1EBE3] transition-colors p-4 rounded-lg font-semibold text-[#0A3A2A] flex justify-between items-center block">
              Request a document <span>→</span>
            </Link>
            
            <Link href="/dashboard/requests" className="w-full text-left bg-[#E8F5F1] hover:bg-[#D1EBE3] transition-colors p-4 rounded-lg font-semibold text-[#0A3A2A] flex justify-between items-center block">
              Track my requests <span>→</span>
            </Link>
            
            <Link href="/dashboard/profile" className="w-full text-left bg-[#E8F5F1] hover:bg-[#D1EBE3] transition-colors p-4 rounded-lg font-semibold text-[#0A3A2A] flex justify-between items-center block">
              Update my profile <span>→</span>
            </Link>

          </div>
        </div>

      </div>
    </div>
  )
}