'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import AdminGuard from '@/components/AdminGuard'
import { Megaphone, Plus, Trash2, X } from 'lucide-react'

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('General')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setAnnouncements(data)
    setLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('announcements').insert({
      title,
      content,
      category,
      created_by: user?.email || 'Admin'
    })

    if (error) {
      alert("Error: " + error.message)
    } else {
      setTitle('')
      setContent('')
      setCategory('General')
      setIsCreating(false)
      fetchAnnouncements()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(announcements.filter(a => a.id !== id))
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <AdminGuard>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-500 mt-1">Post announcements for residents to see.</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-[#0A3A2A] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#155A43]"
          >
            <Plus className="w-4 h-4" /> Create Announcement
          </button>
        </div>

        {announcements.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No announcements yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(a => (
              <div key={a.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-[#0A3A2A] bg-[#E8F5F1] px-2 py-1 rounded">{a.category}</span>
                    <h2 className="text-xl font-bold text-gray-900 mt-2">{a.title}</h2>
                    <p className="text-sm text-gray-500">{new Date(a.created_at).toLocaleDateString()} • by {a.created_by}</p>
                  </div>
                  <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-700 mt-3 whitespace-pre-wrap">{a.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 relative">
            <button onClick={() => setIsCreating(false)} className="absolute top-4 right-4 text-gray-400">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Announcement</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A] outline-none">
                  <option>General</option>
                  <option>Event</option>
                  <option>Cleanup Drive</option>
                  <option>Health</option>
                  <option>Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Content</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} required rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#0A3A2A] outline-none" />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-[#0A3A2A] text-white py-2 rounded-lg font-semibold hover:bg-[#155A43] disabled:opacity-50">
                {saving ? 'Posting...' : 'Post Announcement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminGuard>
  )
}