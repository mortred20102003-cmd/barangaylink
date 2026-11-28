'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    }
    init()

    // Real-time subscription
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return
    
    // For simplicity, we send to the first admin. In a real system, you'd have a recipient selector.
    const { data: adminData } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'super_admin')
      .single()

    if (adminData) {
      await supabase.from('messages').insert({
        sender_id: userId,
        receiver_id: adminData.id,
        content: newMessage
      })
      setNewMessage('')
    }
  }

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
              m.sender_id === userId 
                ? 'bg-[#0A3A2A] text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button onClick={sendMessage} className="bg-[#0A3A2A] text-white px-4 rounded-lg hover:bg-[#155A43]">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}