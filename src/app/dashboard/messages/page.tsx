'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, MessageSquare, Search } from 'lucide-react'

export default function MessagesPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState('resident')
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [threads, setThreads] = useState<any[]>([])
  const [activeThread, setActiveThread] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const isAdmin = ['super_admin', 'admin', 'captain', 'secretary', 'staff'].includes(userRole)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // ALWAYS use user.id — not userId state
      const MY_ID = user.id
      setUserId(MY_ID)

      const storedRole = localStorage.getItem('userRole')
      const role = user.email === 'mchaeldeleon@gmail.com' ? 'super_admin' : (storedRole || 'resident')
      setUserRole(role)

      const adminRole = ['super_admin', 'admin', 'captain', 'secretary', 'staff'].includes(role)

      if (adminRole) {
        // ===== ADMIN: load every message, then group =====
        const { data: allMessages, error: fetchErr } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchErr) {
          console.error("Fetch messages error:", fetchErr)
          setLoading(false)
          return
        }

        if (allMessages && allMessages.length > 0) {
          const otherIds = new Set<string>()
          allMessages.forEach(m => {
            if (m.sender_id && m.sender_id !== MY_ID) otherIds.add(m.sender_id)
            if (m.receiver_id && m.receiver_id !== MY_ID) otherIds.add(m.receiver_id)
          })

          const ids = Array.from(otherIds)
          if (ids.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, fullname, email')
              .in('id', ids)

            const seenIds = new Set<string>()
            const threadList = (profiles || [])
              .filter(p => {
    // Skip profiles that don't actually have a message
              const hasMessage = allMessages.some(m =>
      ((m.sender_id === p.id && m.receiver_id === MY_ID) ||
       (m.receiver_id === p.id && m.sender_id === MY_ID)) && m.content
    )
    // Skip duplicates
    if (!hasMessage || seenIds.has(p.id)) return false
    seenIds.add(p.id)
    return true
  })
  .map(p => {
    const lastMsg = allMessages.find(m =>
      ((m.sender_id === p.id && m.receiver_id === MY_ID) ||
       (m.receiver_id === p.id && m.sender_id === MY_ID)) && m.content
    )
    return { ...p, lastMessage: lastMsg?.content || '' }
  })
setThreads(threadList)
          }
        }
      } else {
        // ===== RESIDENT: load admin, then messages =====
        const { data: admin } = await supabase
          .from('profiles')
          .select('id, fullname, email')
          .in('role', ['super_admin', 'captain'])
          .limit(1)
          .single()

        if (admin) {
          setActiveThread(admin)
          await loadThreadMessages(admin.id, MY_ID)
        }
      }

      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetches + marks as read. Always receives explicit IDs — never uses state.
  const loadThreadMessages = async (otherUserId: string, myId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${myId})`)
      .order('created_at', { ascending: true })

    if (error) {
      console.error("Fetch thread error:", error)
      return
    }

    if (data) {
      setMessages(data)

      const unreadIds = data
        .filter(m => m.receiver_id === myId && m.is_read === false)
        .map(m => m.id)

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadIds)
      }
    }
  }

  const openThread = async (profile: any) => {
    if (!userId) return
    setActiveThread(profile)
    await loadThreadMessages(profile.id, userId)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !activeThread) return

    const text = newMessage
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      sender_id: userId,
      receiver_id: activeThread.id,
      content: text,
      is_read: false
    })

    if (error) {
      alert("Error sending: " + error.message)
      setNewMessage(text)
      return
    }

    await loadThreadMessages(activeThread.id, userId)
  }

  if (loading) return <div className="p-8 text-center">Loading chat...</div>

  // ===== ADMIN VIEW =====
  if (isAdmin) {
    const filteredThreads = threads.filter(t =>
      t.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] grid grid-cols-1 md:grid-cols-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900 mb-3">Conversations ({threads.length})</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search resident..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400"
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
                <p className="text-xs text-gray-500 truncate">{t.lastMessage || 'No messages yet'}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col">
          {activeThread ? (
            <>
              <div className="p-4 border-b flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0A3A2A]" />
                <h1 className="font-bold text-gray-900">{activeThread.fullname || activeThread.email}</h1>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">No messages in this thread yet.</p>
                ) : messages.map(m => (
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"
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

  // ===== RESIDENT VIEW =====
  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-4 border-b flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#0A3A2A]" />
        <h1 className="text-lg font-bold text-gray-900">Barangay Chat</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">No messages yet. Say hello to your barangay!</p>
        ) : messages.map(m => (
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
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"
        />
        <button onClick={sendMessage} className="bg-[#0A3A2A] text-white px-4 rounded-lg hover:bg-[#155A43]">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}