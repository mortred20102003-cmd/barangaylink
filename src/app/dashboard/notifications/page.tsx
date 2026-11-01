import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 mt-1">Stay updated on your document requests.</p>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">No new notifications</h2>
        <p className="text-gray-500 mt-2">When your documents are approved or ready, they will appear here.</p>
      </div>
    </div>
  )
}