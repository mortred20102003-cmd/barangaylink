'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Megaphone } from 'lucide-react'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setAnnouncements(data)
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Barangay Announcements</h1>
        <p className="text-gray-500 mt-1">Stay updated with events and news from your barangay.</p>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No announcements at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-[#0A3A2A] bg-[#E8F5F1] px-2 py-1 rounded">{a.category}</span>
              <h2 className="text-xl font-bold text-gray-900 mt-2">{a.title}</h2>
              <p className="text-sm text-gray-500">{new Date(a.created_at).toLocaleDateString()}</p>
              <p className="text-gray-700 mt-3 whitespace-pre-wrap">{a.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}