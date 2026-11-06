'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { Shield, Mail, Eye, EyeOff } from 'lucide-react'

export default function StaffLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Try to log in with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // 2. SECURITY CHECK: Verify if this user is actually an Admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (profile?.role !== 'admin') {
      // If they are a resident, kick them out immediately!
      await supabase.auth.signOut()
      setError("Access Denied. This portal is for Barangay Staff only.")
      setLoading(false)
      return
    }

    // 3. Success! Redirect to the Admin Dashboard
    router.push('/dashboard/admin')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F3F4F6] overflow-hidden font-sans">
      
      {/* Different Background Colors to indicate Staff Portal */}
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-[#0A3A2A] opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[25rem] h-[25rem] bg-[#0A3A2A] opacity-10 rounded-full blur-2xl"></div>

      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md px-8 py-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white">
        
        {/* Floating Staff Icon */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-4 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.08)]">
          <div className="bg-[#0A3A2A] p-3 rounded-full">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="text-center mb-8 mt-4">
          <h2 className="text-3xl font-extrabold text-[#0A3A2A]">Staff Portal</h2>
          <p className="text-sm text-gray-500 mt-2">Authorized Barangay Personnel Only</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none text-gray-900 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0A3A2A] transition-all placeholder-gray-400"
              placeholder="Staff Email Address"
            />
          </div>

          <div className="relative">
            <Shield className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-none text-gray-900 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0A3A2A] transition-all placeholder-gray-400"
              placeholder="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-[#0A3A2A]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0A3A2A] text-white py-3.5 rounded-2xl font-bold text-lg shadow-lg hover:bg-[#155A43] hover:shadow-xl transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Verifying...' : 'Login as Staff'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <Link href="/login" className="text-[#0A3A2A] font-bold hover:underline">
            &larr; Back to Resident Login
          </Link>
        </div>
      </div>
    </div>
  )
}