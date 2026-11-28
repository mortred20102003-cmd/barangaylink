'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Send, MessageSquare, X } from 'lucide-react'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [adminId, setAdminId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUser(user)

      // Find the Captain (or first admin) to route the message to
      const { data: admin } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['super_admin', 'captain'])
        .limit(1)
        .single()
      
      if (admin) setAdminId(admin.id)

      // Load messages between this user and the admin
      if (admin) {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${admin.id}),and(sender_id.eq.${admin.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true })
        if (data) setMessages(data)
      }
    }
    init()

    // Realtime subscription
    const channel = supabase
      .channel('chat_widget')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
        setMessages((prev) => {
          if (prev.find(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || !adminId) return

    const messageText = newMessage
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: adminId,
      content: messageText
    })

    if (error) {
      alert("Error sending: " + error.message)
      setNewMessage(messageText)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen && (
        <div className="bg-white w-[350px] h-[500px] mb-4 rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-[#0A3A2A] text-white p-4 flex justify-between items-center">
            <div>
              <h2 className="font-bold">Barangay Support</h2>
              <p className="text-xs text-teal-100">We typically reply quickly.</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-[#155A43] p-1 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-10">No messages yet. Say hello!</p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-[#0A3A2A] text-white rounded-br-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0A3A2A]"
            />
            <button type="submit" className="bg-[#0A3A2A] text-white p-2.5 rounded-full hover:bg-[#155A43] transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#0A3A2A] text-white p-4 rounded-full shadow-2xl hover:bg-[#155A43] transition-transform transform hover:scale-105 flex items-center justify-center"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  )
}