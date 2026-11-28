'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle2, Clock, FileText, Package } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch the user's requests to generate notifications
      const { data, error } = await supabase
        .from('document_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('date_requested', { ascending: false })

      if (!error && data) {
        // Filter out only the ones that have some action (optional, but good for realism)
        setNotifications(data)
      }
      setLoading(false)
    }

    fetchNotifications()

    // Optional: Listen for real-time updates to requests
    const channel = supabase
      .channel('realtime_notifications')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'document_requests' }, () => {
        fetchNotifications() // Refetch if any request is updated
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const getNotificationStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return { 
          icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, 
          bg: 'bg-green-50 border-green-200',
          text: 'has been approved.'
        }
      case 'Ready for Pickup':
        return { 
          icon: <Package className="w-5 h-5 text-blue-600" />, 
          bg: 'bg-blue-50 border-blue-200',
          text: 'is ready for pickup at the barangay hall.'
        }
      case 'Pending':
      default:
        return { 
          icon: <Clock className="w-5 h-5 text-yellow-600" />, 
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'is currently pending review.'
        }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 mt-1">Stay updated on the status of your document requests.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">No new notifications</h2>
            <p className="text-gray-500 mt-2">When you request a document, updates will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => {
              const style = getNotificationStyle(notif.status)
              
              return (
                <div key={notif.id} className={`flex items-start gap-4 p-4 rounded-xl border ${style.bg} transition-all`}>
                  <div className="mt-1 shrink-0 bg-white p-2 rounded-full shadow-sm">
                    {style.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Your request for <span className="text-[#0A3A2A]">{notif.document_type}</span> {style.text}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> 
                      Request ID: {notif.id.slice(0, 6).toUpperCase()}
                    </p>
                  </div>
                  <div className="text-xs font-medium text-gray-400">
                    {new Date(notif.date_requested).toLocaleDateString()}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}