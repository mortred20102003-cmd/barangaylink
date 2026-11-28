'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import {
  FileText, Clock, CheckCircle2, MessageSquare, Megaphone,
  AlertCircle, User, Plus, Phone, Mail, MapPin, ArrowRight,
  TrendingUp, Calendar, XCircle
} from 'lucide-react'

export default function ResidentDashboard() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [completionPercent, setCompletionPercent] = useState(0)
  const [missingFields, setMissingFields] = useState<string[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // 1. Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      // 2. Requests
      const { data: requestsData } = await supabase
        .from('document_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('date_requested', { ascending: false })
      setRequests(requestsData || [])

      // 3. Announcements (latest 3)
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
      setAnnouncements(announcementsData || [])

      // 4. Messages (unread)
      const { data: msgsData } = await supabase
        .from('messages')
        .select('*')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })

      if (msgsData) {
        const unread = msgsData.filter(m => !m.is_read).length
        setUnreadCount(unread)
        if (msgsData.length > 0) setLastMessage(msgsData[0])
      }

      // 5. Profile completion
      if (profileData) {
        const fields = [
          { key: 'fullname', label: 'Full Name' },
          { key: 'contact', label: 'Contact Number' },
          { key: 'address', label: 'Address' },
          { key: 'birthday', label: 'Birthday' },
          { key: 'civil_status', label: 'Civil Status' },
          { key: 'valid_id_uploaded', label: 'Valid ID' },
        ]
        const missing = fields.filter(f => !profileData[f.key]).map(f => f.label)
        setMissingFields(missing)
        setCompletionPercent(Math.round(((fields.length - missing.length) / fields.length) * 100))
      }

      setLoading(false)
    }
    init()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>

  const activeRequests = requests.filter(r => ['Pending', 'Approved', 'Ready for Pickup'].includes(r.status))
  const approvedDocs = requests.filter(r => r.status === 'Released')
  const pendingRequests = requests.filter(r => r.status === 'Pending')

  // Build activity feed from requests + announcements
  const activities = [
    ...requests.slice(0, 3).map(r => ({
      type: 'request',
      icon: r.status === 'Released' ? CheckCircle2 : r.status === 'Rejected' ? XCircle : Clock,
      color: r.status === 'Released' ? 'text-green-600 bg-green-100' : r.status === 'Rejected' ? 'text-red-600 bg-red-100' : 'text-yellow-600 bg-yellow-100',
      text: `${r.document_type} — ${r.status}`,
      date: new Date(r.date_requested)
    })),
    ...announcements.slice(0, 2).map(a => ({
      type: 'announcement',
      icon: Megaphone,
      color: 'text-[#0A3A2A] bg-[#E8F5F1]',
      text: `Announcement: ${a.title}`,
      date: new Date(a.created_at)
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-[#0A3A2A] to-[#155A43] rounded-xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-green-200">Welcome back,</p>
            <h1 className="text-3xl font-bold mt-1">{profile?.fullname || 'Resident'}</h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-green-100">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" /> ID: {userId?.slice(0, 8).toUpperCase()}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {profile?.verification_status || 'Pending'} Resident
              </span>
            </div>
          </div>
          <Link href="/dashboard/requests/new" className="bg-white text-[#0A3A2A] px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Request
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Requests" value={activeRequests.length} icon={Clock} color="text-blue-600 bg-blue-50" />
        <StatCard label="Approved Documents" value={approvedDocs.length} icon={CheckCircle2} color="text-green-600 bg-green-50" />
        <StatCard label="Pending Requests" value={pendingRequests.length} icon={AlertCircle} color="text-yellow-600 bg-yellow-50" />
        <StatCard label="Total Requests" value={requests.length} icon={TrendingUp} color="text-[#0A3A2A] bg-[#E8F5F1]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Current Request Status */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0A3A2A]" /> Current Requests
              </h2>
              <Link href="/dashboard/requests" className="text-sm font-semibold text-[#0A3A2A] hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {activeRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active requests.</p>
                <Link href="/dashboard/requests/new" className="text-sm font-semibold text-[#0A3A2A] hover:underline mt-2 inline-block">
                  Request a document
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeRequests.slice(0, 3).map(req => (
                  <Link key={req.id} href="/dashboard/requests" className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{req.document_type}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(req.date_requested).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        req.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'Ready for Pickup' ? 'bg-purple-100 text-purple-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{req.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#0A3A2A]" /> Recent Activity
            </h2>
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {activities.map((act, idx) => {
                  const Icon = act.icon
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${act.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 border-b border-gray-100 pb-3 last:border-0">
                        <p className="text-sm font-medium text-gray-900">{act.text}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {act.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Latest Announcements */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#0A3A2A]" /> Latest Announcements
              </h2>
              <Link href="/dashboard/announcements" className="text-sm font-semibold text-[#0A3A2A] hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No announcements yet.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map(a => (
                  <div key={a.id} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-sm text-gray-900">{a.title}</p>
                      <span className="text-xs bg-[#E8F5F1] text-[#0A3A2A] px-2 py-0.5 rounded font-semibold">{a.category}</span>
                    </div>
                    <p className="text-xs text-gray-500">{new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="space-y-6">
          
          {/* Messages Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-[#0A3A2A]" /> Messages
            </h2>
            {unreadCount > 0 && (
              <div className="bg-[#0A3A2A] text-white px-3 py-1 rounded-full text-xs font-bold inline-block mb-3">
                {unreadCount} unread
              </div>
            )}
            {lastMessage ? (
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Last Message</p>
                <p className="text-sm text-gray-700 italic">"{lastMessage.content}"</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-3">No messages yet.</p>
            )}
            <Link href="/dashboard/messages" className="block w-full text-center bg-[#E8F5F1] text-[#0A3A2A] py-2 rounded-lg font-semibold text-sm hover:bg-[#d0ebe1] transition-colors">
              Open Chat
            </Link>
          </div>

          {/* Profile Completion */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#0A3A2A]" /> Profile Completion
            </h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-[#0A3A2A]">{completionPercent}%</span>
              <Link href="/dashboard/profile" className="text-xs font-semibold text-[#0A3A2A] hover:underline">
                Update
              </Link>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div className={`h-2 rounded-full transition-all ${completionPercent === 100 ? 'bg-green-500' : 'bg-[#0A3A2A]'}`} style={{ width: `${completionPercent}%` }}></div>
            </div>
            {missingFields.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Missing:</p>
                <ul className="space-y-1">
                  {missingFields.map(f => (
                    <li key={f} className="text-xs text-orange-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction href="/dashboard/requests/new" icon={Plus} label="Request Document" color="text-blue-600 bg-blue-50" />
              <QuickAction href="/dashboard/requests" icon={FileText} label="Track Requests" color="text-yellow-600 bg-yellow-50" />
              <QuickAction href="/dashboard/profile" icon={User} label="Update Profile" color="text-green-600 bg-green-50" />
              <QuickAction href="/dashboard/messages" icon={MessageSquare} label="Contact Barangay" color="text-purple-600 bg-purple-50" />
            </div>
          </div>

          {/* Barangay Info Card */}
          <div className="bg-[#E8F5F1] p-6 rounded-xl border border-[#0A3A2A]/20">
            <h2 className="text-lg font-bold text-[#0A3A2A] flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5" /> Barangay Lamion
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-[#0A3A2A]" />
                <span>Mon-Fri, 8:00 AM - 5:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-[#0A3A2A]" />
                <span>0912-345-6789</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-[#0A3A2A]" />
                <span>lamion@barangay.gov.ph</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function QuickAction({ href, icon: Icon, label, color }: { href: string, icon: any, label: string, color: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium text-gray-900">{label}</span>
    </Link>
  )
}