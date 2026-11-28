'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, MessageSquare, Search, ArrowLeft } from 'lucide-react'

export default function MessagesPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState('resident')
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [threads, setThreads] = useState<any[]>([])         // admin: list of residents
  const [activeThread, setActiveThread] = useState<any>(null) // selected conversation
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const isAdmin = ['super_admin', 'admin', 'captain', 'secretary', 'staff'].includes(userRole)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const storedRole = localStorage.getItem('userRole')
      const role = user.email === 'mchaeldeleon@gmail.com' ? 'super_admin' : (storedRole || 'resident')
      setUserRole(role)

      if (['super_admin', 'admin', 'captain', 'secretary', 'staff'].includes(role)) {
        await loadThreads()
      } else {
        // Resident: find admin contact
        const { data: admin } = await supabase
          .from('profiles')
          .select('id, fullname, email, role')
          .in('role', ['super_admin', 'captain'])
          .limit(1)
          .single()
        
        if (admin) {
          setActiveThread(admin)
          await loadMessages(user.id, admin.id)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadThreads = async () => {
    // Group messages by the other party
    const { data } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, content, created_at')
      .order('created_at', { ascending: false })

    if (!data) return
    const seen = new Map()
    data.forEach(m => {
      const other = m.sender_id
      if (!seen.has(other)) seen.set(other, m)
    })

    const otherIds = Array.from(seen.keys())
    if (otherIds.length === 0) return

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, fullname, email')
      .in('id', otherIds)

    const threadList = (profiles || []).map(p => ({
      ...p,
      lastMessage: seen.get(p.id)?.content
    }))
    setThreads(threadList)
  }

  const loadMessages = async (a: string, b: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${a},receiver_id.eq.${b}),and(sender_id.eq.${b},receiver_id.eq.${a})`)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const openThread = async (profile: any) => {
    setActiveThread(profile)
    if (userId) await loadMessages(userId, profile.id)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !activeThread) return
    await supabase.from('messages').insert({
      sender_id: userId,
      receiver_id: activeThread.id,
      content: newMessage
    })
    setNewMessage('')
    await loadMessages(userId, activeThread.id)
  }

  if (loading) return <div className="p-8 text-center">Loading chat...</div>

  // --- ADMIN VIEW ---
  if (isAdmin) {
    const filteredThreads = threads.filter(t =>
      t.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] grid grid-cols-1 md:grid-cols-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Sidebar: threads */}
        <div className="border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900 mb-3">Conversations</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search resident..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No conversations yet.</p>
            ) : filteredThreads.map(t => (
              <button
                key={t.id}
                onClick={() => openThread(t)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 ${activeThread?.id === t.id ? 'bg-[#E8F5F1]' : ''}`}
              >
                <p className="font-semibold text-sm text-gray-900">{t.fullname || t.email}</p>
                <p className="text-xs text-gray-500 truncate">{t.lastMessage}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="md:col-span-2 flex flex-col">
          {activeThread ? (
            <>
              <div className="p-4 border-b flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0A3A2A]" />
                <h1 className="font-bold text-gray-900">{activeThread.fullname || activeThread.email}</h1>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-xl text-sm ${
                      m.sender_id === userId ? 'bg-[#0A3A2A] text-white' : 'bg-gray-100 text-gray-900'
                    }`}>{m.content}</div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="p-4 border-t flex gap-2">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Reply..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button onClick={sendMessage} className="bg-[#0A3A2A] text-white px-4 rounded-lg hover:bg-[#155A43]">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>Select a conversation to start replying</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- RESIDENT VIEW ---
  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-4 border-b flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#0A3A2A]" />
        <h1 className="text-lg font-bold text-gray-900">Barangay Chat</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-4 py-2 rounded-xl text-sm ${
              m.sender_id === userId ? 'bg-[#0A3A2A] text-white' : 'bg-gray-100 text-gray-900'
            }`}>{m.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-4 border-t flex gap-2">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button onClick={sendMessage} className="bg-[#0A3A2A] text-white px-4 rounded-lg hover:bg-[#155A43]">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}